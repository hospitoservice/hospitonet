// src/screens/AppointmentBookingScreen.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEPARTMENTS, DOCTORS, TIME_SLOTS } from '../resources/AppointmentBooking';
import { motion, AnimatePresence } from "framer-motion";
import AppointmentService, { AppointmentInput } from '../service/AppointmentService';

const AppointmentBookingScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hospital } = location.state || {};

    const [formData, setFormData] = useState({
        date: '',
        timeSlot: '',
        department: '',
        doctor: '',
        symptoms: '',
        patientName: '',
        phoneNumber: '',
        email: '',
        notes: ''
    });

    const [availableDoctors, setAvailableDoctors] = useState<typeof DOCTORS>({});
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData(prev => ({
            ...prev,
            date: tomorrow.toISOString().split('T')[0]
        }));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Update available doctors when department changes
            if (name === 'department') {
                const department = DEPARTMENTS.find(dept => dept.id === value);
                const doctors = department ? department.doctors.reduce((acc, docId) => {
                    if (DOCTORS[docId]) acc[docId] = DOCTORS[docId];
                    return acc;
                }, {} as typeof DOCTORS) : {};
                setAvailableDoctors(doctors);
                newData.doctor = ''; // Reset doctor when department changes
            }

            // Update available time slots when doctor changes
            if (name === 'doctor' && value) {
                const doctor = DOCTORS[value];
                setAvailableTimeSlots(doctor?.availableSlots || []);
                newData.timeSlot = ''; // Reset time slot when doctor changes
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Split patient name into first and last name
            const nameParts = formData.patientName.trim().split(' ');
            const patientFirstName = nameParts[0] || '';
            const patientLastName = nameParts.slice(1).join(' ') || '';

            // Get doctor details
            const selectedDoctor = formData.doctor ? DOCTORS[formData.doctor] : null;
            const departmentName = DEPARTMENTS.find(dept => dept.id === formData.department)?.name || formData.department;

            // Construct the appointment input
            const appointmentInput: AppointmentInput = {
                patientId: 'PATIENT_' + Date.now(), // Generate a temporary patient ID
                patientFirstName,
                patientLastName,
                patientGender: 'Not Specified', // You may want to add a gender field to the form
                patientMobile: formData.phoneNumber,
                patientEmail: formData.email,
                patientDOB: '1990-01-01', // You may want to add a DOB field to the form
                department: departmentName,
                doctor: selectedDoctor?.name,
                doctorFees: selectedDoctor ? 500 : 0, // Default fee, you may want to make this configurable
                appointmentDate: formData.date,
                slot: formData.timeSlot,
                status: 'Scheduled',
                message: formData.notes || 'Appointment booking',
                symptoms: formData.symptoms ? {
                    symptomsPresent: true,
                    otherSymptoms: formData.symptoms
                } : undefined,
                hospital: hospital ? {
                    hospitalName: hospital.name,
                    hospitalLocation: {
                        city: hospital.location || 'Unknown'
                    }
                } : undefined
            };

            // Call the service to create appointment
            const appointment = await AppointmentService.createAppointment(appointmentInput);
            console.log('Appointment created successfully:', appointment);

            // Show confirmation
            setShowConfirmation(true);
            
            // After 2 seconds, navigate to home
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Error creating appointment:', err);
            setError('Failed to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                {/* Hospital Info */}
                {hospital && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{hospital.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{hospital.location}</p>
                    </div>
                )}

                {/* Appointment Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date Picker */}
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

                    {/* Department Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Department
                        </label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        >
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Doctor Selection */}
                    {formData.department && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Doctor
                            </label>
                            <select
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select Doctor</option>
                                {Object.values(availableDoctors).map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.name} - {doc.specialization} ({doc.experience} years)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Time Slot Selection */}
                    {formData.doctor && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Available Time Slots
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableTimeSlots.map((slot, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                                        className={`py-2 px-3 rounded-xl text-sm font-medium ${
                                            formData.timeSlot === slot
                                                ? 'bg-primary text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Patient Details */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Patient Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone Number
                                    </label>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
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

                    {/* Symptoms */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Symptoms (Optional)
                        </label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Describe your symptoms..."
                        />
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Any other information we should know..."
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Booking Appointment...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
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
                    transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <motion.svg
                        className="w-12 h-12 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Appointment Booked!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Your appointment has been scheduled successfully.
                </p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6"
                >
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                </motion.div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
        </div>
    );
};

export default AppointmentBookingScreen;