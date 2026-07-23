import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserService from '../service/UserService';
import ComplaintService from '../service/ComplaintService';

interface LocationState {
  appointmentId?: string;
  patientId?: string;
  hospitalId?: string;
  doctor?: string;
}

const RaiseComplaintScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };

  const [subject, setSubject]         = useState('');
  const [against, setAgainst]         = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }
    if (!against.trim()) {
      setError('Please enter who this complaint is against.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe your complaint.');
      return;
    }

    const userId = UserService.getUserIdFromSession();
    if (!userId) {
      setError('Unable to identify your account. Please log in again.');
      return;
    }

    setSubmitting(true);
    try {
      await ComplaintService.fileComplaint({
        hospitalId: state?.hospitalId,
        userId,
        patientId: state?.patientId,
        appointmentId: state?.appointmentId,
        subject: subject.trim(),
        against: against.trim(),
        description: description.trim(),
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-28">
      {/* Header */}
      <header className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-transform"
          >
            <span className="material-icons-round text-white">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Raise Complaint</h1>
            {state?.doctor && (
              <p className="text-white/70 text-xs font-bold mt-0.5">Regarding your appointment with {state.doctor}</p>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 px-5 pt-6 space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="material-icons-round text-red-500 text-base">error_outline</span>
            <p className="text-xs text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly summarize your complaint"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Against</label>
            <input
              type="text"
              value={against}
              onChange={(e) => setAgainst(e.target.value)}
              placeholder="Name of the person this complaint concerns"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened in detail..."
              rows={6}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Submit footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-5 py-4 safe-area-inset-bottom shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <span className="material-icons-round text-lg">send</span>
              Submit Complaint
            </>
          )}
        </button>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-round text-3xl text-green-500">check_circle</span>
            </div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-1">Complaint Registered</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              Your complaint has been submitted and will be reviewed shortly.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black active:scale-[0.98] transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaiseComplaintScreen;
