// src/screens/AppointmentBookingScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HospitalDepartment,
    EmployeeDoctor,
    AvailableSlot,
} from '../resources/AppointmentBooking';
import AppointmentService, { AppointmentInput } from '../service/AppointmentService';
import DepartmentService from '../service/DepartmentService';
import UserService, { UserProfile } from '../service/UserService';
import { ensurePatientForHospital } from '../service/PatientService';

// ── Helper ────────────────────────────────────────────────────────────────────

/** Format a 24h "HH:mm" time string to "9:00 AM" display form. */
function fmt24(time: string): string {
    const [hStr, m] = time.split(':');
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${period}`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

const InlineLoader: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-2 py-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
        {label}
    </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const AppointmentBookingScreen: React.FC = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { hospital } = (location.state || {}) as { hospital?: { id: string; hospitalId?: string; name: string; location?: string } };

    // ── Form data ──────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        date:        '',
        department:  '',
        doctor:      '',
        symptoms:    '',
        patientName: '',
        gender:      '',
        dob:         '',
        phoneNumber: '',
        email:       '',
        notes:       '',
    });

    // ── Cascade data ───────────────────────────────────────────────────────────
    const [departments, setDepartments]     = useState<HospitalDepartment[]>([]);
    const [doctors, setDoctors]             = useState<EmployeeDoctor[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [selectedSlot, setSelectedSlot]   = useState<AvailableSlot | null>(null);

    // ── Loading flags ──────────────────────────────────────────────────────────
    const [loadingDepts, setLoadingDepts]   = useState(false);
    const [loadingDocs, setLoadingDocs]     = useState(false);
    const [loadingSlots, setLoadingSlots]   = useState(false);

    // ── Logged-in user ─────────────────────────────────────────────────────────
    const [currentUser, setCurrentUser]     = useState<UserProfile | null>(null);

    // ── Submission state ───────────────────────────────────────────────────────
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting]   = useState(false);
    const [error, setError]                 = useState<string | null>(null);

    // ── Step 1: default date + fetch departments + load logged-in user ──────────
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData(prev => ({ ...prev, date: tomorrow.toISOString().split('T')[0] }));

        // Load the logged-in user and pre-fill patient details
        const phone = UserService.getPhoneFromSession();
        if (phone) {
            UserService.getUserByPhone(phone).then(user => {
                if (!user) return;
                setCurrentUser(user);
                setFormData(prev => ({
                    ...prev,
                    patientName: [user.firstName, user.lastName].filter(Boolean).join(' '),
                    gender:      user.gender      ?? prev.gender,
                    dob:         user.dateOfBirth ?? prev.dob,
                    phoneNumber: user.phone       ?? prev.phoneNumber,
                    email:       user.email       ?? prev.email,
                }));
            }).catch(() => { /* session may not yet exist — user fills manually */ });
        }

        if (!hospital?.id) return;
        setLoadingDepts(true);
        DepartmentService.getDepartmentsByHospital(hospital.id)
            .then(setDepartments)
            .catch(() => setDepartments([]))
            .finally(() => setLoadingDepts(false));
    }, [hospital?.id]);

    // ── Step 2: fetch doctors when department changes ──────────────────────────
    const fetchDoctors = useCallback(async (deptId: string) => {
        if (!hospital?.id || !deptId) { setDoctors([]); return; }
        setLoadingDocs(true);
        setDoctors([]);
        try {
            const list = await DepartmentService.getDoctorsByDepartment(hospital.id, deptId);
            setDoctors(list);
        } catch {
            setDoctors([]);
        } finally {
            setLoadingDocs(false);
        }
    }, [hospital?.id]);

    // ── Step 3: fetch slots when doctor + date are both set ────────────────────
    const fetchSlots = useCallback(async (staffId: string, date: string) => {
        if (!staffId || !date) { setAvailableSlots([]); return; }
        setLoadingSlots(true);
        setAvailableSlots([]);
        setSelectedSlot(null);
        try {
            const slots = await DepartmentService.getAvailableSlots(staffId, date);
            setAvailableSlots(slots);
        } catch {
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    // ── Input handler ──────────────────────────────────────────────────────────
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };

            if (name === 'department') {
                next.doctor = '';
                setDoctors([]);
                setAvailableSlots([]);
                setSelectedSlot(null);
                if (value) fetchDoctors(value);
            }

            if (name === 'doctor') {
                setAvailableSlots([]);
                setSelectedSlot(null);
                if (value && prev.date) fetchSlots(value, prev.date);
            }

            if (name === 'date') {
                setAvailableSlots([]);
                setSelectedSlot(null);
                if (prev.doctor) fetchSlots(prev.doctor, value);
            }

            return next;
        });
    };

    // ── Derive selected doctor object ──────────────────────────────────────────
    const selectedDoctor = doctors.find(d => d.employeeId === formData.doctor) ?? null;
    const selectedDept   = departments.find(d => d.id === formData.department) ?? null;

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) { setError('Please select a time slot.'); return; }
        setIsSubmitting(true);
        setError(null);

        try {
            const nameParts        = formData.patientName.trim().split(' ');
            const patientFirstName = nameParts[0] ?? '';
            const patientLastName  = nameParts.slice(1).join(' ') ?? '';

            // Build a user profile from current form data (fallback if not logged in)
            const userForPatient: UserProfile = currentUser ?? {
                firstName:   patientFirstName,
                lastName:    patientLastName,
                phone:       formData.phoneNumber,
                email:       formData.email,
                dateOfBirth: formData.dob,
                gender:      formData.gender,
            };

            // Resolve or create a patient record.  Use the formatted hospitalId ("H00012")
            // so the lookup key is stable; the global fallback inside ensurePatientForHospital
            // handles users whose prior record was created with a different format.
            const patientRecord = await ensurePatientForHospital(
                userForPatient,
                hospital?.hospitalId ?? hospital?.id ?? '',
            );
            const patientId = patientRecord.patientId;

            // Keep user.patientId pointing to the resolved patient record.
            // Awaited so the link is committed before we show the confirmation,
            // ensuring RecordsScreen can find appointments on the next visit.
            if (currentUser?.id && patientRecord.patientId) {
                try {
                    const updated = await UserService.linkPatient(currentUser.id, patientRecord.patientId);
                    setCurrentUser(updated);
                } catch (err) {
                    console.warn('Failed to link patient to user:', err);
                }
            }

            const appointmentInput: AppointmentInput = {
                patientId,
                patientFirstName,
                patientLastName,
                patientGender:   formData.gender,
                patientMobile:   formData.phoneNumber,
                patientEmail:    formData.email,
                patientDOB:      formData.dob,
                department:      selectedDept?.name ?? formData.department,
                doctor:          selectedDoctor?.fullName,
                doctorFees:      500,
                appointmentDate: formData.date,
                slot:            selectedSlot.startTime,
                liveConsultant:  '',
                status:          'Scheduled',
                message:         formData.notes || 'Appointment booking',
                symptoms:        formData.symptoms ? { otherSymptoms: formData.symptoms } : undefined,
                hospital:        hospital
                    ? { hospitalId: hospital.hospitalId ?? hospital.id, hospitalName: hospital.name, hospitalLocation: { city: hospital.location ?? '' } }
                    : undefined,
            };

            const appointment = await AppointmentService.createAppointment(appointmentInput);

            // Mark the slot as BOOKED in employee-service (best-effort, non-blocking)
            if (selectedSlot.slotId && !selectedSlot.slotId.startsWith('fallback-')) {
                fetch(`/api/employees/${formData.doctor}/schedule/book`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date:          formData.date,
                        slotId:        selectedSlot.slotId,
                        patientId,
                        appointmentId: appointment.id ?? '',
                    }),
                }).catch(err => console.warn('Slot booking sync failed:', err));
            }

            setShowConfirmation(true);
            setTimeout(() => navigate('/'), 2500);
        } catch (err) {
            console.error('Error creating appointment:', err);
            setError('Failed to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
            {/* Header */}
            <header className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center transition-transform active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <span className="material-icons-round text-primary text-2xl">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">Book Appointment</h1>
                </div>
            </header>

            <div className="px-6 mt-4">
                {/* Hospital info banner */}
                {hospital && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">{hospital.name}</h2>
                        {hospital.location && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{hospital.location}</p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── Date ────────────────────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date of Appointment
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>

                    {/* ── Department ──────────────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Department
                        </label>
                        {loadingDepts ? (
                            <InlineLoader label="Loading departments…" />
                        ) : (
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* ── Doctor ──────────────────────────────────────────── */}
                    {formData.department && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Doctor
                            </label>
                            {loadingDocs ? (
                                <InlineLoader label="Loading doctors…" />
                            ) : (
                                <>
                                    {doctors.length === 0 && !loadingDocs && (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 py-1">
                                            No doctors available in this department.
                                        </p>
                                    )}
                                    {doctors.length > 0 && (
                                        <div className="space-y-2">
                                            {doctors.map(doc => (
                                                <button
                                                    key={doc.employeeId}
                                                    type="button"
                                                    onClick={() =>
                                                        handleInputChange({
                                                            target: { name: 'doctor', value: doc.employeeId },
                                                        } as React.ChangeEvent<HTMLSelectElement>)
                                                    }
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                                        formData.doctor === doc.employeeId
                                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                                                    }`}
                                                >
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {doc.profileImageUrl ? (
                                                            <img src={doc.profileImageUrl} alt={doc.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-icons-round text-primary text-xl">person</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doc.fullName}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{doc.designation}</p>
                                                    </div>
                                                    {formData.doctor === doc.employeeId && (
                                                        <span className="material-icons-round text-primary text-xl flex-shrink-0">check_circle</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Available Slots ─────────────────────────────────── */}
                    {formData.doctor && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Available Time Slots
                            </label>
                            {loadingSlots ? (
                                <InlineLoader label="Loading available slots…" />
                            ) : availableSlots.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-gray-500 py-1">
                                    No slots available on this date. Try a different date.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {availableSlots.map(slot => (
                                        <button
                                            key={slot.slotId}
                                            type="button"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                                                selectedSlot?.slotId === slot.slotId
                                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                                            }`}
                                        >
                                            {fmt24(slot.startTime)}
                                            <span className="block text-[10px] opacity-70">
                                                – {fmt24(slot.endTime)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Patient Details ─────────────────────────────────── */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Patient Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    value={formData.patientName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Symptoms ─────────────────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Symptoms <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Describe your symptoms…"
                        />
                    </div>

                    {/* ── Notes ────────────────────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Additional Notes <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Any other information we should know…"
                        />
                    </div>

                    {/* ── Booking summary chip ──────────────────────────────── */}
                    {selectedSlot && selectedDoctor && (
                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                            <span className="material-icons-round text-primary">event_available</span>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {selectedDoctor.fullName} · {fmt24(selectedSlot.startTime)} – {fmt24(selectedSlot.endTime)}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    {formData.date} · {selectedDept?.name}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Error ────────────────────────────────────────────── */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* ── Submit ───────────────────────────────────────────── */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedSlot}
                        className="w-full mt-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Booking…' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>

            {/* ── Confirmation overlay ──────────────────────────────────────── */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                                className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <motion.svg
                                    className="w-12 h-12 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <motion.path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                    />
                                </motion.svg>
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointment Booked!</h3>
                            {selectedDoctor && selectedSlot && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                    {selectedDoctor.fullName} · {fmt24(selectedSlot.startTime)} on {formData.date}
                                </p>
                            )}
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Redirecting you home…</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AppointmentBookingScreen;
