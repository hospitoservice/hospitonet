import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookedAppointment, AppointmentMedicine, AppointmentTestReport } from '../../types';
import UserService from '../service/UserService';
import AppointmentService from '../service/AppointmentService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Derived records ───────────────────────────────────────────────────────────

interface PrescriptionEntry {
  appointmentId: string;
  appointment: BookedAppointment;
  medicines: AppointmentMedicine[];
}

interface LabEntry {
  appointmentId: string;
  appointment: BookedAppointment;
  test: AppointmentTestReport;
}

function buildRecords(appointments: BookedAppointment[]): {
  prescriptions: PrescriptionEntry[];
  labs: LabEntry[];
} {
  const prescriptions: PrescriptionEntry[] = [];
  const labs: LabEntry[] = [];

  for (const appt of appointments) {
    if (appt.medicine?.length) {
      prescriptions.push({ appointmentId: appt.id, appointment: appt, medicines: appt.medicine });
    }
    for (const test of appt.testsAndReports ?? []) {
      labs.push({ appointmentId: appt.id, appointment: appt, test });
    }
  }
  return { prescriptions, labs };
}

// ── Sub-components ────────────────────────────────────────────────────────────

const TEST_STATUS_STYLE: Record<string, string> = {
  Pending:       'bg-amber-50 text-amber-600',
  'In Progress': 'bg-blue-50 text-blue-600',
  Completed:     'bg-green-50 text-green-600',
};

const Skeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-20 animate-pulse border border-gray-100 dark:border-gray-700" />
    ))}
  </div>
);

const EmptySection: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center py-8 text-center">
    <span className="material-icons-round text-gray-200 dark:text-gray-700 text-4xl mb-2">{icon}</span>
    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{label}</p>
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

type RecordsTab = 'prescriptions' | 'labs';

const RecordsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordsTab>('prescriptions');
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientIdMissing, setPatientIdMissing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const phone = UserService.getPhoneFromSession();
        if (!phone) { setPatientIdMissing(true); setLoading(false); return; }

        const user = await UserService.getUserByPhone(phone);
        if (!user?.patientId) { setPatientIdMissing(true); setLoading(false); return; }

        const data = await AppointmentService.getAppointmentsByPatientId(user.patientId);
        data.sort((a, b) => (b.appointmentDate ?? '').localeCompare(a.appointmentDate ?? ''));
        setAppointments(data);
      } catch {
        setError('Failed to load records. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { prescriptions, labs } = buildRecords(appointments);

  const openDetail = (appt: BookedAppointment, initialTab?: 'Medicines' | 'Reports') => {
    navigate(`/appointment/${appt.id}`, { state: { appointment: appt, initialTab } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <header className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 transition-transform active:scale-90"
          >
            <span className="material-icons-round text-primary text-2xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Medical Records</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your health history</p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
          {([
            { key: 'prescriptions', icon: 'medication',   label: 'Prescriptions', count: prescriptions.length },
            { key: 'labs',          icon: 'science',       label: 'Lab Tests',     count: labs.length },
          ] as const).map(({ key, icon, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className="material-icons-round text-base">{icon}</span>
              {label}
              {count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-3">
        {/* Loading */}
        {loading && <Skeleton />}

        {/* No patient profile */}
        {!loading && patientIdMissing && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-gray-100 dark:bg-gray-700/40 flex items-center justify-center mb-4">
              <span className="material-icons-round text-gray-300 dark:text-gray-600 text-4xl">description</span>
            </div>
            <h3 className="text-base font-bold text-gray-600 dark:text-gray-300 mb-1">No Records Yet</h3>
            <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
              Book an appointment to start building your medical history.
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

        {/* Prescriptions tab */}
        {!loading && !error && !patientIdMissing && activeTab === 'prescriptions' && (
          prescriptions.length === 0
            ? <EmptySection icon="medication" label="No prescriptions yet" />
            : prescriptions.map((entry) => (
              <button
                key={entry.appointmentId}
                onClick={() => openDetail(entry.appointment, 'Medicines')}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-green-500 text-2xl">medication</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {entry.appointment.doctor ?? 'Doctor'} — Prescription
                  </p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">
                    {entry.appointment.department}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-400 font-bold">
                      📅 {formatDate(entry.appointment.appointmentDate)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      💊 {entry.medicines.length} medicine{entry.medicines.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {entry.medicines.slice(0, 3).map((m, i) => (
                      <span key={i} className="text-[9px] bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-lg font-bold">
                        {m.medicineName}
                      </span>
                    ))}
                    {entry.medicines.length > 3 && (
                      <span className="text-[9px] text-gray-400 font-bold">+{entry.medicines.length - 3} more</span>
                    )}
                  </div>
                </div>
                <span className="material-icons-round text-gray-300 dark:text-gray-600 self-center">chevron_right</span>
              </button>
            ))
        )}

        {/* Labs tab */}
        {!loading && !error && !patientIdMissing && activeTab === 'labs' && (
          labs.length === 0
            ? <EmptySection icon="science" label="No lab tests yet" />
            : labs.map((entry, idx) => {
              const statusStyle = TEST_STATUS_STYLE[entry.test.testStatus ?? ''] ?? 'bg-gray-50 text-gray-500';
              return (
                <button
                  key={`${entry.appointmentId}-${idx}`}
                  onClick={() => openDetail(entry.appointment, 'Reports')}
                  className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3 active:scale-[0.98] transition-transform"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-round text-indigo-500 text-2xl">science</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate flex-1">
                        {entry.test.testName ?? 'Lab Test'}
                      </p>
                      {entry.test.testStatus && (
                        <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${statusStyle}`}>
                          {entry.test.testStatus}
                        </span>
                      )}
                    </div>
                    {entry.test.testCategory && (
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{entry.test.testCategory}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-gray-400 font-bold">
                        📅 {formatDate(entry.test.testAssignedDate ?? entry.appointment.appointmentDate)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        🏥 {entry.appointment.hospital?.hospitalName ?? entry.appointment.department}
                      </span>
                    </div>
                    {entry.test.report && (
                      <p className="text-[10px] text-green-600 font-bold mt-1">✓ Report available</p>
                    )}
                  </div>
                  <span className="material-icons-round text-gray-300 dark:text-gray-600 self-center">chevron_right</span>
                </button>
              );
            })
        )}
      </div>
    </div>
  );
};

export default RecordsScreen;