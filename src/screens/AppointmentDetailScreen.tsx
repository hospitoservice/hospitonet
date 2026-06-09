import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookedAppointment,
  AppointmentVitals,
  AppointmentSymptoms,
  AppointmentMedicine,
  AppointmentTestReport,
} from '../../types';

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

const STATUS_STYLE: Record<string, { pill: string; dot: string; label: string }> = {
  Scheduled:    { pill: 'bg-blue-50 text-blue-600 border border-blue-100',   dot: 'bg-blue-500',   label: 'Scheduled' },
  'In Progress':{ pill: 'bg-amber-50 text-amber-600 border border-amber-100',dot: 'bg-amber-500',  label: 'In Progress' },
  Completed:    { pill: 'bg-green-50 text-green-600 border border-green-100',dot: 'bg-green-500',  label: 'Completed' },
  Cancelled:    { pill: 'bg-red-50 text-red-600 border border-red-100',      dot: 'bg-red-500',    label: 'Cancelled' },
};

const DEPT_ICON: Record<string, string> = {
  Cardiology: 'favorite', Neurology: 'psychology', Orthopedics: 'accessibility_new',
  Ophthalmology: 'visibility', Dermatology: 'spa', Pediatrics: 'child_care',
  Gynecology: 'female', ENT: 'hearing', Gastroenterology: 'restaurant_menu',
  'General Medicine': 'medical_services', General: 'medical_services',
};

function deptIcon(dept: string): string {
  return DEPT_ICON[dept] ?? 'local_hospital';
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const AwaitingVisit: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
      <span className="material-icons-round text-blue-400 text-4xl">event_upcoming</span>
    </div>
    <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1">Awaiting Your Visit</h3>
    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[220px] leading-relaxed">
      {message ?? 'This information will be available after your appointment.'}
    </p>
  </div>
);

const EmptyState: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 dark:bg-gray-700/40 flex items-center justify-center mb-3">
      <span className="material-icons-round text-gray-300 dark:text-gray-600 text-3xl">{icon}</span>
    </div>
    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{label}</p>
  </div>
);

// ── Tab content ───────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ appt: BookedAppointment }> = ({ appt }) => {
  const statusStyle = STATUS_STYLE[appt.status] ?? STATUS_STYLE.Scheduled;
  return (
    <div className="space-y-4 py-2">
      {/* Status + ID */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${statusStyle.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {appt.id?.slice(-8).toUpperCase()}</span>
      </div>

      {/* Info rows */}
      {[
        { icon: 'person',          label: 'Doctor',     value: appt.doctor ?? '—' },
        { icon: 'category',        label: 'Department', value: appt.department },
        { icon: 'local_hospital',  label: 'Hospital',   value: appt.hospital?.hospitalName ?? '—' },
        { icon: 'location_on',     label: 'Location',   value: [appt.hospital?.hospitalLocation?.city, appt.hospital?.hospitalLocation?.state].filter(Boolean).join(', ') || '—' },
        { icon: 'calendar_today',  label: 'Date',       value: formatDate(appt.appointmentDate) },
        { icon: 'schedule',        label: 'Time',       value: formatTime(appt.slot) },
        { icon: 'payment',         label: 'Fees',       value: appt.doctorFees ? `₹${appt.doctorFees}` : '—' },
        { icon: 'chat_bubble',     label: 'Message',    value: appt.message ?? '—' },
      ].map(({ icon, label, value }) => (
        <div key={label} className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-round text-primary text-lg">{icon}</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const VitalsTab: React.FC<{ vitals?: AppointmentVitals; isScheduled: boolean }> = ({ vitals, isScheduled }) => {
  if (isScheduled) return <AwaitingVisit message="Vitals will be recorded when you arrive at the hospital." />;

  const hasData = vitals && Object.values(vitals).some(v => v && v !== false);
  if (!hasData) return <EmptyState icon="monitor_heart" label="No vitals recorded" />;

  const metrics = [
    { icon: 'thermostat',      label: 'Temp',         value: vitals?.temperature,  unit: '°F',  color: 'bg-red-50 text-red-500' },
    { icon: 'favorite',        label: 'Heart Rate',   value: vitals?.heartRate,    unit: 'bpm', color: 'bg-pink-50 text-pink-500' },
    { icon: 'air',             label: 'SpO₂',         value: vitals?.spo2,         unit: '%',   color: 'bg-cyan-50 text-cyan-500' },
    { icon: 'water_drop',      label: 'BP',           value: vitals?.bloodPressure,unit: 'mmHg',color: 'bg-blue-50 text-blue-500' },
    { icon: 'height',          label: 'Height',       value: vitals?.height,       unit: 'cm',  color: 'bg-green-50 text-green-500' },
    { icon: 'monitor_weight',  label: 'Weight',       value: vitals?.weight,       unit: 'kg',  color: 'bg-amber-50 text-amber-500' },
    { icon: 'calculate',       label: 'BMI',          value: vitals?.bmi,          unit: '',    color: 'bg-purple-50 text-purple-500' },
    { icon: 'bloodtype',       label: 'Blood Group',  value: vitals?.bloodGroup,   unit: '',    color: 'bg-rose-50 text-rose-500' },
  ];

  return (
    <div className="py-2 space-y-3">
      {vitals?.condition && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl px-4 py-3">
          <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Condition</p>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mt-0.5">{vitals.condition}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ icon, label, value, unit, color }) =>
          value ? (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2`}>
                <span className="material-icons-round text-lg">{icon}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
              <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                {value}<span className="text-xs font-bold text-gray-400 ml-0.5">{unit}</span>
              </p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

const SymptomsTab: React.FC<{ symptoms?: AppointmentSymptoms; isScheduled: boolean }> = ({ symptoms, isScheduled }) => {
  if (isScheduled) return <AwaitingVisit message="Symptoms will be recorded by the nurse on arrival." />;

  const SYMPTOM_LABELS: Record<keyof AppointmentSymptoms, string> = {
    fever: 'Fever', cough: 'Cough', headache: 'Headache', fatigue: 'Fatigue',
    jointPain: 'Joint Pain', chestPain: 'Chest Pain', bodyPain: 'Body Pain',
    abdominalPain: 'Abdominal Pain', hairloss: 'Hair Loss', breathingProblem: 'Breathing Problem',
    nightSweats: 'Night Sweats', infection: 'Infection', vomiting: 'Vomiting',
    diarrhea: 'Diarrhea', constipation: 'Constipation', dizziness: 'Dizziness',
    skinrash: 'Skin Rash', nausea: 'Nausea', otherSymptoms: 'Other',
  };

  const active = symptoms
    ? Object.entries(symptoms)
        .filter(([k, v]) => k !== 'otherSymptoms' && v === true)
        .map(([k]) => SYMPTOM_LABELS[k as keyof AppointmentSymptoms])
    : [];

  const hasData = active.length > 0 || symptoms?.otherSymptoms;
  if (!hasData) return <EmptyState icon="sick" label="No symptoms recorded" />;

  return (
    <div className="py-2 space-y-4">
      {active.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Reported Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {active.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-800">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {symptoms?.otherSymptoms && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Additional Details</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{symptoms.otherSymptoms}</p>
        </div>
      )}
    </div>
  );
};

const ConsultationTab: React.FC<{ comments?: string; isScheduled: boolean }> = ({ comments, isScheduled }) => {
  if (isScheduled) return <AwaitingVisit message="Doctor's notes will appear here after your consultation." />;
  if (!comments?.trim()) return <EmptyState icon="sticky_note_2" label="No consultation notes yet" />;
  return (
    <div className="py-2">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-icons-round text-primary text-lg">sticky_note_2</span>
          <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Doctor's Notes</p>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{comments}</p>
      </div>
    </div>
  );
};

const MedicinesTab: React.FC<{ medicine?: AppointmentMedicine[]; isScheduled: boolean }> = ({ medicine, isScheduled }) => {
  if (isScheduled) return <AwaitingVisit message="Prescriptions will be issued after your consultation." />;
  if (!medicine?.length) return <EmptyState icon="medication" label="No prescription issued" />;
  return (
    <div className="py-2 space-y-3">
      {medicine.map((med, i) => (
        <div key={med.id ?? i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <span className="material-icons-round text-green-500 text-xl">medication</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{med.medicineName ?? '—'}</p>
              {med.medicineCategory && (
                <span className="text-[10px] text-primary font-black uppercase tracking-widest">{med.medicineCategory}</span>
              )}
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { label: 'Dosage',    value: med.medicineDosage },
                  { label: 'Frequency', value: med.medicineFrequency },
                  { label: 'Duration',  value: med.medicineDuration },
                ].map(({ label, value }) =>
                  value ? (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-2 py-1.5">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{value}</p>
                    </div>
                  ) : null
                )}
              </div>
              {med.description && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 italic">{med.description}</p>
              )}
            </div>
            {med.price && (
              <span className="text-xs font-black text-gray-500 flex-shrink-0">₹{med.price}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const TEST_STATUS_STYLE: Record<string, string> = {
  Pending:    'bg-amber-50 text-amber-600 border-amber-100',
  'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
  Completed:  'bg-green-50 text-green-600 border-green-100',
};

const ReportsTab: React.FC<{ tests?: AppointmentTestReport[]; isScheduled: boolean }> = ({ tests, isScheduled }) => {
  if (isScheduled) return <AwaitingVisit message="Lab tests will be assigned after your consultation." />;
  if (!tests?.length) return <EmptyState icon="science" label="No tests assigned" />;
  return (
    <div className="py-2 space-y-3">
      {tests.map((test, i) => {
        const statusStyle = TEST_STATUS_STYLE[test.testStatus ?? ''] ?? 'bg-gray-50 text-gray-500 border-gray-100';
        return (
          <div key={test.id ?? i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-indigo-500 text-lg">science</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{test.testName ?? '—'}</p>
                  {test.testCategory && (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{test.testCategory}</p>
                  )}
                </div>
              </div>
              {test.testStatus && (
                <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${statusStyle}`}>
                  {test.testStatus}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {test.testAssignedDate && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Assigned</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{formatDate(test.testAssignedDate)}</p>
                </div>
              )}
              {test.testPerformedDate && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Performed</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{formatDate(test.testPerformedDate)}</p>
                </div>
              )}
            </div>

            {test.report && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl px-3 py-2">
                <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-0.5">Report</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">{test.report}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

type TabName = 'Overview' | 'Vitals' | 'Symptoms' | 'Consultation' | 'Medicines' | 'Reports';
const TABS: TabName[] = ['Overview', 'Vitals', 'Symptoms', 'Consultation', 'Medicines', 'Reports'];

const TAB_ICONS: Record<TabName, string> = {
  Overview:     'info',
  Vitals:       'monitor_heart',
  Symptoms:     'sick',
  Consultation: 'sticky_note_2',
  Medicines:    'medication',
  Reports:      'science',
};

interface LocationState {
  appointment: BookedAppointment;
  initialTab?: TabName;
}

const AppointmentDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };
  const appt = state?.appointment;

  const [activeTab, setActiveTab] = useState<TabName>(state?.initialTab ?? 'Overview');

  if (!appt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center px-6">
          <span className="material-icons-round text-gray-300 text-5xl mb-3 block">error_outline</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Appointment not found.</p>
          <button onClick={() => navigate(-1)} className="text-primary font-bold text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const isScheduled = appt.status === 'Scheduled';
  const statusStyle = STATUS_STYLE[appt.status] ?? STATUS_STYLE.Scheduled;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center transition-transform active:scale-90 border border-gray-100 dark:border-gray-600"
          >
            <span className="material-icons-round text-gray-600 dark:text-gray-300 text-xl">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Appointment Details</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {formatDate(appt.appointmentDate)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
        </div>

        {/* Doctor + hospital pill */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/60 rounded-2xl px-3 py-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-round text-primary text-xl">{deptIcon(appt.department)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{appt.doctor ?? 'Doctor'}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{appt.department} · {formatTime(appt.slot)}</p>
          </div>
          {appt.hospital?.hospitalName && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold flex-shrink-0">
              <span className="material-icons-round text-sm">local_hospital</span>
              <span className="max-w-[80px] truncate">{appt.hospital.hospitalName}</span>
            </div>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-2">
        <div className="flex overflow-x-auto hide-scrollbar gap-1 py-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/40'
              }`}
            >
              <span className="material-icons-round text-sm">{TAB_ICONS[tab]}</span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4">
        {activeTab === 'Overview'     && <OverviewTab     appt={appt} />}
        {activeTab === 'Vitals'       && <VitalsTab       vitals={appt.vitals}      isScheduled={isScheduled} />}
        {activeTab === 'Symptoms'     && <SymptomsTab     symptoms={appt.symptoms}  isScheduled={isScheduled} />}
        {activeTab === 'Consultation' && <ConsultationTab comments={appt.doctorComments} isScheduled={isScheduled} />}
        {activeTab === 'Medicines'    && <MedicinesTab    medicine={appt.medicine}  isScheduled={isScheduled} />}
        {activeTab === 'Reports'      && <ReportsTab      tests={appt.testsAndReports} isScheduled={isScheduled} />}
      </div>
    </div>
  );
};

export default AppointmentDetailScreen;
