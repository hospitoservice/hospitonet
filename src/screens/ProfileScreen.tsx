import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookedAppointment } from '../../types';
import UserService, { UserProfile } from '../service/UserService';
import AppointmentService from '../service/AppointmentService';
import ImageUploadService from '../service/ImageUploadService';
import ComplaintService, { Complaint } from '../service/ComplaintService';

interface ProfileScreenProps {
  onLogout: () => void;
}

interface EditForm {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  aadhar: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string;
  imageUrl: string;
  location: { address: string; city: string; state: string; pincode: string };
  immediateContact: { firstName: string; lastName: string; mobile: string; email: string; relation: string };
}

const BLANK_FORM: EditForm = {
  firstName: '', middleName: '', lastName: '', email: '', aadhar: '',
  dateOfBirth: '', gender: '', bloodGroup: '', height: '', weight: '',
  allergies: '', imageUrl: '',
  location: { address: '', city: '', state: '', pincode: '' },
  immediateContact: { firstName: '', lastName: '', mobile: '', email: '', relation: '' },
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS      = ['Male', 'Female', 'Other'];
const RELATIONS    = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(slot?: string): string {
  if (!slot) return '—';
  const [hStr, m] = slot.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
}

function computeBmi(height: string, weight: string): string {
  const h = parseFloat(height);
  const w = parseFloat(weight);
  if (h > 0 && w > 0) return (w / ((h / 100) ** 2)).toFixed(1);
  return '';
}

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

const STATUS_STYLE: Record<string, { pill: string; dot: string }> = {
  Scheduled:     { pill: 'bg-blue-50 text-blue-600',   dot: 'bg-blue-500' },
  Confirmed:     { pill: 'bg-blue-50 text-blue-600',   dot: 'bg-blue-500' },
  'In Progress': { pill: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  Completed:     { pill: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  Cancelled:     { pill: 'bg-red-50 text-red-600',     dot: 'bg-red-500' },
};

const COMPLAINT_STATUS_STYLE: Record<string, { pill: string; dot: string }> = {
  PENDING:  { pill: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  REVIEWED: { pill: 'bg-blue-50 text-blue-600',   dot: 'bg-blue-500' },
  RESOLVED: { pill: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
};

const DEPT_ICON: Record<string, string> = {
  Cardiology: 'favorite', Neurology: 'psychology', Orthopedics: 'accessibility_new',
  Ophthalmology: 'visibility', Dermatology: 'spa', Pediatrics: 'child_care',
  Gynecology: 'female', ENT: 'hearing', 'General Medicine': 'medical_services',
  General: 'medical_services', Gastroenterology: 'restaurant_menu',
};
const DEPT_COLOR: Record<string, string> = {
  Cardiology: 'bg-red-100 text-red-600', Neurology: 'bg-purple-100 text-purple-600',
  Orthopedics: 'bg-orange-100 text-orange-600', Ophthalmology: 'bg-cyan-100 text-cyan-600',
  Dermatology: 'bg-pink-100 text-pink-600', Pediatrics: 'bg-yellow-100 text-yellow-600',
};

function deptStyle(dept: string) {
  return {
    icon:  DEPT_ICON[dept]  ?? 'local_hospital',
    color: DEPT_COLOR[dept] ?? 'bg-primary/10 text-primary',
  };
}

// ── Small reusable form widgets ───────────────────────────────────────────────

const Field: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean; maxLength?: number;
}> = ({ label, value, onChange, type = 'text', placeholder, readOnly, maxLength }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      maxLength={maxLength}
      className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all
        ${readOnly
          ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
          : 'bg-white text-gray-800 border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
        }`}
    />
  </div>
);

const SelectField: React.FC<{
  label: string; value: string; onChange: (v: string) => void; options: string[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 appearance-none transition-all"
    >
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const SectionHeader: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-3 mt-6">
    <span className="material-icons-round text-primary text-lg">{icon}</span>
    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">{title}</h4>
  </div>
);

// ── Appointment card ──────────────────────────────────────────────────────────

const AppointmentCard: React.FC<{ appt: BookedAppointment; onPress: () => void }> = ({ appt, onPress }) => {
  const { icon, color } = deptStyle(appt.department);
  const statusStyle = STATUS_STYLE[appt.status] ?? STATUS_STYLE.Scheduled;

  return (
    <button
      onClick={onPress}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3 active:scale-[0.98] transition-transform"
    >
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
        <span className="material-icons-round text-2xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">
              {appt.doctor ?? 'Doctor'}
            </h4>
            <p className="text-[10px] text-primary font-black uppercase tracking-tighter mt-0.5">{appt.department}</p>
          </div>
          <span className={`ml-2 flex-shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusStyle.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {appt.status}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            <span className="material-icons-round text-xs">calendar_today</span>
            {formatDate(appt.appointmentDate)}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            <span className="material-icons-round text-xs">schedule</span>
            {formatTime(appt.slot)}
          </div>
        </div>
        {appt.hospital?.hospitalName && (
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            🏥 {appt.hospital.hospitalName}
          </p>
        )}
      </div>
      <span className="material-icons-round text-gray-300 dark:text-gray-600 self-center">chevron_right</span>
    </button>
  );
};

// ── Complaint card ────────────────────────────────────────────────────────────

const ComplaintCard: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
  const statusStyle = COMPLAINT_STATUS_STYLE[complaint.status?.toUpperCase()] ?? COMPLAINT_STATUS_STYLE.PENDING;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{complaint.subject}</h4>
          <p className="text-[10px] text-primary font-black uppercase tracking-tighter mt-0.5">Against: {complaint.against}</p>
        </div>
        <span className={`ml-2 flex-shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusStyle.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {complaint.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-3">{complaint.description}</p>
      {complaint.comment && (
        <div className="mt-2 px-3 py-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
          <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Admin Response</p>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">{complaint.comment}</p>
        </div>
      )}
      <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-3">
        <span className="material-icons-round text-xs">calendar_today</span>
        {formatDate(complaint.createdAt?.split('T')[0])}
      </div>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<'profile' | 'appointments' | 'complaints' | 'edit'>('profile');
  const [activeTab, setActiveTab]   = useState<'upcoming' | 'past'>('upcoming');

  const [user,        setUser]        = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);
  const [apptLoading,  setApptLoading]  = useState(false);
  const [apptError,    setApptError]    = useState<string | null>(null);
  const [apptLoaded,   setApptLoaded]   = useState(false);

  const [complaints,        setComplaints]        = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading]  = useState(false);
  const [complaintsError,   setComplaintsError]    = useState<string | null>(null);
  const [complaintsLoaded,  setComplaintsLoaded]   = useState(false);

  // Edit form state
  const [form,          setForm]          = useState<EditForm>(BLANK_FORM);
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState<string | null>(null);
  const [saveSuccess,   setSaveSuccess]   = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // ── Fetch user on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    const phone = UserService.getPhoneFromSession();
    if (!phone) { setUserLoading(false); return; }
    UserService.getUserByPhone(phone)
      .then(data => {
        setUser(data);
        if (data?.id) UserService.saveUserIdToSession(data.id);
      })
      .catch(err => console.error('Failed to load user profile:', err))
      .finally(() => setUserLoading(false));
  }, []);

  // ── Appointments ─────────────────────────────────────────────────────────────

  // Plain async function — no caching, always fetches fresh data.
  const loadAppointments = async (mobile: string) => {
    setApptLoading(true);
    setApptError(null);
    try {
      const data = await AppointmentService.getAppointmentsByMobile(mobile);
      data.sort((a, b) => (b.appointmentDate ?? '').localeCompare(a.appointmentDate ?? ''));
      setAppointments(data);
      setApptLoaded(true);
    } catch (err) {
      console.error('loadAppointments failed:', err);
      setApptError('Failed to load appointments. Please try again.');
    } finally {
      setApptLoading(false);
    }
  };

  // Fetches all appointments for this user by their mobile number — works across
  // all hospitals regardless of which patientId is currently linked on the user record.
  const handleOpenAppointments = async () => {
    setActiveView('appointments');
    setApptLoaded(false);
    setAppointments([]);
    setApptError(null);
    setApptLoading(true);

    const phone = UserService.getPhoneFromSession();

    // Re-fetch user to keep the profile state fresh
    if (phone) {
      try {
        const freshUser = await UserService.getUserByPhone(phone);
        if (freshUser) {
          setUser(freshUser);
          if (freshUser.id) UserService.saveUserIdToSession(freshUser.id);
        }
      } catch { /* non-fatal */ }
    }

    if (phone) {
      loadAppointments(phone); // pass mobile — backend query spans all hospitals
    } else {
      setApptLoading(false);
    }
  };

  // ── Complaints ───────────────────────────────────────────────────────────────

  const handleOpenComplaints = async () => {
    setActiveView('complaints');
    setComplaintsLoaded(false);
    setComplaints([]);
    setComplaintsError(null);
    setComplaintsLoading(true);

    const userId = UserService.getUserIdFromSession();
    if (!userId) {
      setComplaintsLoading(false);
      setComplaintsError('Unable to identify your account. Please log in again.');
      return;
    }

    try {
      const data = await ComplaintService.getMyComplaints(userId);
      data.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
      setComplaints(data);
      setComplaintsLoaded(true);
    } catch (err) {
      console.error('loadComplaints failed:', err);
      setComplaintsError('Failed to load complaints. Please try again.');
    } finally {
      setComplaintsLoading(false);
    }
  };

  // ── Edit helpers ─────────────────────────────────────────────────────────────
  const openEdit = () => {
    setForm({
      firstName:  user?.firstName  ?? '',
      middleName: user?.middleName ?? '',
      lastName:   user?.lastName   ?? '',
      email:      user?.email      ?? '',
      aadhar:     user?.aadhar     ?? '',
      dateOfBirth: user?.dateOfBirth ?? '',
      gender:     user?.gender     ?? '',
      bloodGroup: user?.bloodGroup ?? '',
      height:     user?.height     ?? '',
      weight:     user?.weight     ?? '',
      allergies:  user?.allergies  ?? '',
      imageUrl:   user?.imageUrl   ?? '',
      location: {
        address: user?.location?.address ?? '',
        city:    user?.location?.city    ?? '',
        state:   user?.location?.state   ?? '',
        pincode: user?.location?.pincode ?? '',
      },
      immediateContact: {
        firstName: user?.immediateContact?.firstName ?? '',
        lastName:  user?.immediateContact?.lastName  ?? '',
        mobile:    user?.immediateContact?.mobile    ?? '',
        email:     user?.immediateContact?.email     ?? '',
        relation:  user?.immediateContact?.relation  ?? '',
      },
    });
    setSaveError(null);
    setActiveView('edit');
  };

  const setF = (key: keyof Omit<EditForm, 'location' | 'immediateContact'>, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const setLoc = (key: keyof EditForm['location'], val: string) =>
    setForm(f => ({ ...f, location: { ...f.location, [key]: val } }));

  const setContact = (key: keyof EditForm['immediateContact'], val: string) =>
    setForm(f => ({ ...f, immediateContact: { ...f.immediateContact, [key]: val } }));

  // ── Camera / photo upload ────────────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const url = await ImageUploadService.uploadProfileImage(file);
      setF('imageUrl', url);
    } catch (err) {
      console.error('Photo upload failed:', err);
      setSaveError('Photo upload failed. Please try again.');
    } finally {
      setPhotoUploading(false);
      // Reset so the same file can be picked again if needed
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    // Resolve user record — re-fetch or create if id is missing (e.g. first-time
    // users whose record wasn't yet created when the screen first loaded).
    let resolvedUser = user;
    let resolvedId   = user?.id;

    if (!resolvedId) {
      const phone = UserService.getPhoneFromSession();
      if (!phone) {
        setSaveError('Session expired. Please re-login.');
        setSaving(false);
        return;
      }
      try {
        let fetched = await UserService.getUserByPhone(phone);
        if (!fetched) {
          fetched = await UserService.createUser({ phone });
        }
        resolvedUser = fetched;
        resolvedId   = fetched?.id;
        setUser(fetched);
        if (fetched?.id) UserService.saveUserIdToSession(fetched.id);
      } catch {
        setSaveError('Could not initialize user record. Please try again.');
        setSaving(false);
        return;
      }
    }

    if (!resolvedId) {
      setSaveError('User record unavailable. Please re-login.');
      setSaving(false);
      return;
    }

    try {
      const bmi = computeBmi(form.height, form.weight) || resolvedUser?.bmi || '';
      const age  = form.dateOfBirth ? calculateAge(form.dateOfBirth) : (resolvedUser?.age ?? 0);

      const payload: Partial<UserProfile> = {
        ...(resolvedUser ?? {}),
        firstName:   form.firstName   || undefined,
        middleName:  form.middleName  || undefined,
        lastName:    form.lastName    || undefined,
        email:       form.email       || undefined,
        aadhar:      form.aadhar      || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        age,
        gender:      form.gender      || undefined,
        bloodGroup:  form.bloodGroup  || undefined,
        height:      form.height      || undefined,
        weight:      form.weight      || undefined,
        bmi:         bmi              || undefined,
        allergies:   form.allergies   || undefined,
        imageUrl:    form.imageUrl    || undefined,
        location:    form.location,
        immediateContact: form.immediateContact,
      };

      const updated = await UserService.updateUser(resolvedId, payload);
      setUser(updated);
      if (updated.id) UserService.saveUserIdToSession(updated.id);
      setActiveView('profile');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const upcomingAppts = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'In Progress');
  const pastAppts     = appointments.filter(a => a.status === 'Completed'  || a.status === 'Cancelled');
  const displayed     = activeTab === 'upcoming' ? upcomingAppts : pastAppts;

  const fullName = user
    ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')
    : 'Guest User';

  const menuItems = [
    { icon: 'calendar_today', label: 'My Appointments', color: 'text-blue-500',   action: handleOpenAppointments },
    { icon: 'shopping_bag',   label: 'Orders',          color: 'text-red-500',    action: () => navigate('/orders') },
    { icon: 'report',         label: 'My Complaints',   color: 'text-orange-500', action: handleOpenComplaints },
    { icon: 'people',         label: 'Family Members',  color: 'text-purple-500', action: undefined },
    { icon: 'payment',        label: 'Payment Methods', color: 'text-green-500',  action: undefined },
    { icon: 'help_outline',   label: 'Help & Support',  color: 'text-cyan-500',   action: undefined },
    { icon: 'settings',       label: 'App Settings',    color: 'text-gray-500',   action: undefined },
  ];

  // ── Appointments view ─────────────────────────────────────────────────────────
  if (activeView === 'appointments') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
        <header className="bg-primary pt-14 pb-8 px-6 rounded-b-[3rem] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('profile')} className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-xl font-black tracking-tight">My Appointments</h2>
          </div>
        </header>

        <div className="px-6 py-6 space-y-4">
          <div className="flex gap-2">
            {(['upcoming', 'past'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'
                }`}
              >
                {tab === 'upcoming' ? `Upcoming${upcomingAppts.length > 0 ? ` (${upcomingAppts.length})` : ''}` : `Past${pastAppts.length > 0 ? ` (${pastAppts.length})` : ''}`}
              </button>
            ))}
          </div>

          {/* Skeleton — shown while user record or appointments are loading */}
          {apptLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-3xl p-4 h-24 animate-pulse border border-gray-100" />)}
            </div>
          )}

          {/* Error state */}
          {!apptLoading && apptError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 font-bold">{apptError}</p>
              <button onClick={handleOpenAppointments} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
            </div>
          )}

          {/* No appointments at all (after successful fetch returned 0 results) */}
          {!apptLoading && !apptError && apptLoaded && appointments.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="material-icons-round text-gray-300 text-5xl mb-3">calendar_today</span>
              <p className="text-sm font-bold text-gray-500">No appointments booked yet.</p>
              <p className="text-xs text-gray-400 mt-1">Book an appointment to get started.</p>
            </div>
          )}

          {/* Current tab has no items but other tab may have some */}
          {!apptLoading && !apptError && apptLoaded && appointments.length > 0 && displayed.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="material-icons-round text-gray-300 text-5xl mb-3">{activeTab === 'upcoming' ? 'event_available' : 'history'}</span>
              <p className="text-sm font-bold text-gray-500">{activeTab === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments.'}</p>
            </div>
          )}

          {/* Appointment list */}
          {!apptLoading && !apptError && displayed.length > 0 && (
            <div className="space-y-3">
              {displayed.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} onPress={() => navigate(`/appointment/${appt.id}`, { state: { appointment: appt } })} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Complaints view ───────────────────────────────────────────────────────────
  if (activeView === 'complaints') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
        <header className="bg-primary pt-14 pb-8 px-6 rounded-b-[3rem] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('profile')} className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-xl font-black tracking-tight">My Complaints</h2>
          </div>
        </header>

        <div className="px-6 py-6 space-y-4">
          {/* Skeleton */}
          {complaintsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-3xl p-4 h-24 animate-pulse border border-gray-100" />)}
            </div>
          )}

          {/* Error state */}
          {!complaintsLoading && complaintsError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 font-bold">{complaintsError}</p>
              <button onClick={handleOpenComplaints} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
            </div>
          )}

          {/* Empty state */}
          {!complaintsLoading && !complaintsError && complaintsLoaded && complaints.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="material-icons-round text-gray-300 text-5xl mb-3">report</span>
              <p className="text-sm font-bold text-gray-500">No complaints filed yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complaints can be raised from an appointment's detail screen.</p>
            </div>
          )}

          {/* Complaint list */}
          {!complaintsLoading && !complaintsError && complaints.length > 0 && (
            <div className="space-y-3">
              {complaints.map(c => <ComplaintCard key={c.id} complaint={c} />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Edit view ─────────────────────────────────────────────────────────────────
  if (activeView === 'edit') {
    const previewBmi = computeBmi(form.height, form.weight);

    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-28">
        {/* Header */}
        <header className="bg-gradient-to-r from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveView('profile')} className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
                <span className="material-icons-round">arrow_back</span>
              </button>
              <h2 className="text-xl font-black tracking-tight">Edit Profile</h2>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || photoUploading}
              className="px-5 py-2.5 bg-white text-cyan-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-60 active:scale-95 transition-all"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </header>

        <div className="px-5 pt-6 pb-10 space-y-1">

          {/* Feedback banners */}
          {saveError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-2 mb-2">
              <span className="material-icons-round text-red-500 text-base">error_outline</span>
              <p className="text-xs text-red-600 font-bold">{saveError}</p>
            </div>
          )}

          {/* Profile photo */}
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] bg-gray-200 overflow-hidden shadow-lg">
                {photoUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <img
                    src={form.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white active:scale-90 transition-all"
              >
                <span className="material-icons-round text-base">camera_alt</span>
              </button>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tap camera to change photo</p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* ── Personal Info ─────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <SectionHeader icon="person" title="Personal Info" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name"  value={form.firstName}  onChange={v => setF('firstName', v)}  placeholder="First" />
                <Field label="Middle Name" value={form.middleName} onChange={v => setF('middleName', v)} placeholder="Middle" />
              </div>
              <Field label="Last Name" value={form.lastName} onChange={v => setF('lastName', v)} placeholder="Last name" />
              <Field label="Email" value={form.email} onChange={v => setF('email', v)} type="email" placeholder="you@example.com" />
              <Field label="Phone" value={user?.phone ?? ''} onChange={() => {}} readOnly placeholder="Verified phone" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth" value={form.dateOfBirth} onChange={v => setF('dateOfBirth', v)} type="date" />
                <SelectField label="Gender" value={form.gender} onChange={v => setF('gender', v)} options={GENDERS} />
              </div>
              <Field label="Aadhar Number" value={form.aadhar} onChange={v => setF('aadhar', v)} type="tel" placeholder="12-digit Aadhar" maxLength={12} />
            </div>
          </div>

          {/* ── Health Stats ──────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <SectionHeader icon="monitor_heart" title="Health Stats" />
            <div className="space-y-4">
              <SelectField label="Blood Group" value={form.bloodGroup} onChange={v => setF('bloodGroup', v)} options={BLOOD_GROUPS} />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Height (cm)" value={form.height} onChange={v => setF('height', v)} type="number" placeholder="e.g. 170" />
                <Field label="Weight (kg)" value={form.weight} onChange={v => setF('weight', v)} type="number" placeholder="e.g. 65" />
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">BMI</label>
                  <div className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-black text-center text-gray-500">
                    {previewBmi || '—'}
                  </div>
                  {previewBmi && (
                    <p className="text-[9px] text-center text-gray-400 mt-0.5">auto-calculated</p>
                  )}
                </div>
              </div>
              <Field label="Allergies" value={form.allergies} onChange={v => setF('allergies', v)} placeholder="e.g. Penicillin, Pollen (or None)" />
            </div>
          </div>

          {/* ── Address ───────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <SectionHeader icon="location_on" title="Address" />
            <div className="space-y-4">
              <Field label="Address Line" value={form.location.address} onChange={v => setLoc('address', v)} placeholder="House/Flat, Street" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City"   value={form.location.city}    onChange={v => setLoc('city', v)}    placeholder="City" />
                <Field label="State"  value={form.location.state}   onChange={v => setLoc('state', v)}   placeholder="State" />
              </div>
              <Field label="Pincode" value={form.location.pincode} onChange={v => setLoc('pincode', v)} type="tel" placeholder="6-digit PIN" maxLength={6} />
            </div>
          </div>

          {/* ── Emergency Contact ─────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <SectionHeader icon="emergency" title="Emergency Contact" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" value={form.immediateContact.firstName} onChange={v => setContact('firstName', v)} placeholder="First" />
                <Field label="Last Name"  value={form.immediateContact.lastName}  onChange={v => setContact('lastName', v)}  placeholder="Last" />
              </div>
              <Field label="Mobile" value={form.immediateContact.mobile} onChange={v => setContact('mobile', v)} type="tel" placeholder="10-digit mobile" maxLength={10} />
              <Field label="Email"  value={form.immediateContact.email}  onChange={v => setContact('email', v)}  type="email" placeholder="contact@email.com" />
              <SelectField label="Relation" value={form.immediateContact.relation} onChange={v => setContact('relation', v)} options={RELATIONS} />
            </div>
          </div>

          {/* Save button (bottom) */}
          <button
            onClick={handleSave}
            disabled={saving || photoUploading}
            className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><span className="material-icons-round text-lg">check_circle</span> Save Changes</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Profile view ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      {/* Success toast */}
      {saveSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold">
          <span className="material-icons-round text-base">check_circle</span>
          Profile updated successfully!
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-16 pb-12 px-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />

        <div className="flex flex-col items-center relative z-10">
          <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl mb-4 relative">
            {userLoading ? (
              <div className="w-full h-full rounded-[1.8rem] bg-gray-200 animate-pulse" />
            ) : (
              <img
                src={user?.imageUrl ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={fullName}
                className="w-full h-full object-cover rounded-[1.8rem]"
              />
            )}
            {/* Edit shortcut on avatar */}
            {!userLoading && (
              <button
                onClick={openEdit}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
              >
                <span className="material-icons-round text-cyan-500 text-sm">edit</span>
              </button>
            )}
          </div>

          {userLoading ? (
            <div className="h-7 w-40 bg-white/30 rounded-lg animate-pulse mb-2" />
          ) : (
            <h2 className="text-2xl font-black text-white tracking-tight">{fullName}</h2>
          )}
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">
            USER ID: #{user?.userId ?? 'HN-XXXX-XX'}
          </p>

          <div className="mt-8 flex gap-6 w-full justify-center">
            {[
              { label: 'Blood',  value: user?.bloodGroup ?? '—' },
              { label: 'Height', value: user?.height ? `${user.height}` : '—', unit: user?.height ? 'cm' : '' },
              { label: 'Weight', value: user?.weight ? `${user.weight}` : '—', unit: user?.weight ? 'kg' : '' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-white/60 font-black uppercase mb-1">{label}</span>
                {userLoading ? (
                  <div className="h-6 w-8 bg-white/30 rounded animate-pulse" />
                ) : (
                  <span className="text-lg font-black text-white">
                    {value}{unit && <span className="text-[10px]">{unit}</span>}
                  </span>
                )}
              </div>
            ))}
          </div>

          {!userLoading && user && (
            <div className="mt-4 flex gap-4 w-full justify-center flex-wrap">
              {user.age ? (
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex flex-col items-center">
                  <span className="text-[9px] text-white/60 font-black uppercase">Age</span>
                  <span className="text-sm font-black text-white">{user.age}y</span>
                </div>
              ) : null}
              {user.gender ? (
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex flex-col items-center">
                  <span className="text-[9px] text-white/60 font-black uppercase">Gender</span>
                  <span className="text-sm font-black text-white">{user.gender}</span>
                </div>
              ) : null}
              {user.allergies && user.allergies !== 'None' ? (
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex flex-col items-center">
                  <span className="text-[9px] text-white/60 font-black uppercase">Allergy</span>
                  <span className="text-sm font-black text-white truncate max-w-[80px]">{user.allergies}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="px-6 mt-8">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 ml-2">Account Dashboard</h3>
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-soft border-2 border-gray-50 dark:border-gray-800 overflow-hidden">
          {/* Edit Profile row */}
          <button
            onClick={openEdit}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-50 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-500">
                <span className="material-icons-round">manage_accounts</span>
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Edit Profile</span>
            </div>
            <span className="material-icons-round text-gray-300 dark:text-gray-600">chevron_right</span>
          </button>

          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              disabled={!item.action}
              className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors disabled:opacity-50 ${
                idx !== menuItems.length - 1 ? 'border-b border-gray-50 dark:border-gray-700' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${item.color}`}>
                  <span className="material-icons-round">{item.icon}</span>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.label}</span>
              </div>
              <span className="material-icons-round text-gray-300 dark:text-gray-600">chevron_right</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { UserService.clearSession(); onLogout(); }}
          className="mt-10 w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/20 active:scale-[0.98] transition-all"
        >
          <span className="material-icons-round text-lg">logout</span>
          Logout from Hospitonet
        </button>

        <p className="text-center mt-8 text-[9px] text-gray-400 font-bold uppercase tracking-widest pb-10">
          Hospitonet v3.1.2 (Beta)
        </p>
      </div>
    </div>
  );
};

export default ProfileScreen;
