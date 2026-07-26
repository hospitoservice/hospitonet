import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../service/UserService';
import FamilyMemberService, { FamilyMember } from '../service/FamilyMemberService';

const RELATIONS     = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];
const GENDERS        = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS   = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const BLANK_FORM = {
  firstName: '', lastName: '', relation: '', dateOfBirth: '',
  gender: '', bloodGroup: '', mobile: '', email: '',
};

const inputClass = 'w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 transition-all';
const labelClass = 'block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1';

const RELATION_ICON: Record<string, string> = {
  Spouse: 'favorite', Parent: 'elderly', Child: 'child_care',
  Sibling: 'group', Friend: 'sentiment_satisfied', Other: 'person',
};

const FamilyMembersScreen: React.FC = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [view, setView] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const phone = UserService.getPhoneFromSession();
        if (!phone) { setError('Unable to identify your account. Please log in again.'); setLoading(false); return; }

        const user = await UserService.getUserByPhone(phone);
        if (!user?.id) { setError('Unable to identify your account. Please log in again.'); setLoading(false); return; }

        setUserId(user.id);
        const data = await FamilyMemberService.getFamilyMembers(user.id);
        setMembers(data);
      } catch (err) {
        console.error('Failed to load family members:', err);
        setError('Failed to load family members. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setF = (key: keyof typeof BLANK_FORM, val: string) => setForm(f => ({ ...f, [key]: val }));

  const openAdd = () => {
    setForm(BLANK_FORM);
    setFormError('');
    setView('add');
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!form.firstName.trim()) { setFormError('Please enter a first name.'); return; }
    if (!form.relation) { setFormError('Please select a relation.'); return; }
    if (!userId) { setFormError('Unable to identify your account. Please log in again.'); return; }

    setSubmitting(true);
    try {
      const created = await FamilyMemberService.addFamilyMember(userId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        relation: form.relation,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
        mobile: form.mobile.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      setMembers(prev => [...prev, created]);
      setView('list');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add family member. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!userId) return;
    setDeletingId(memberId);
    try {
      await FamilyMemberService.deleteFamilyMember(userId, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Failed to delete family member:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Add view ─────────────────────────────────────────────────────────────
  if (view === 'add') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-28">
        <header className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('list')}
              className="p-2 bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-transform"
            >
              <span className="material-icons-round text-white">arrow_back</span>
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">Add Family Member</h1>
          </div>
        </header>

        <div className="flex-1 px-5 pt-6 space-y-4">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="material-icons-round text-red-500 text-base">error_outline</span>
              <p className="text-xs text-red-600 dark:text-red-400 font-bold">{formError}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input className={inputClass} value={form.firstName} onChange={e => setF('firstName', e.target.value)} placeholder="First" />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input className={inputClass} value={form.lastName} onChange={e => setF('lastName', e.target.value)} placeholder="Last" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Relation</label>
              <select className={inputClass} value={form.relation} onChange={e => setF('relation', e.target.value)}>
                <option value="">— Select —</option>
                {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input className={inputClass} type="date" value={form.dateOfBirth} onChange={e => setF('dateOfBirth', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select className={inputClass} value={form.gender} onChange={e => setF('gender', e.target.value)}>
                  <option value="">— Select —</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Blood Group</label>
              <select className={inputClass} value={form.bloodGroup} onChange={e => setF('bloodGroup', e.target.value)}>
                <option value="">— Select —</option>
                {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Mobile</label>
              <input className={inputClass} type="tel" value={form.mobile} onChange={e => setF('mobile', e.target.value)} placeholder="10-digit mobile" maxLength={10} />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="member@email.com" />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-5 py-4 safe-area-inset-bottom shadow-lg">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><span className="material-icons-round text-lg">check_circle</span> Save Family Member</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      <header className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-transform"
          >
            <span className="material-icons-round text-white">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Family Members</h1>
        </div>
      </header>

      <div className="px-5 pt-6 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-4 h-20 animate-pulse border border-gray-100 dark:border-gray-700" />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && members.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-icons-round text-gray-300 dark:text-gray-600 text-5xl mb-3">people</span>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No family members added yet.</p>
            <p className="text-xs text-gray-400 mt-1">Add your family so you can manage their care too.</p>
          </div>
        )}

        {!loading && !error && members.length > 0 && (
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-purple-500 text-xl">{RELATION_ICON[m.relation ?? ''] ?? 'person'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {[m.firstName, m.lastName].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{m.relation}</p>
                  {(m.mobile || m.bloodGroup) && (
                    <div className="flex items-center gap-3 mt-1">
                      {m.mobile && <span className="text-[10px] text-gray-400 font-bold">📞 {m.mobile}</span>}
                      {m.bloodGroup && <span className="text-[10px] text-gray-400 font-bold">🩸 {m.bloodGroup}</span>}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => m.id && handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="p-2 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === m.id
                    ? <span className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin block" />
                    : <span className="material-icons-round text-lg">delete_outline</span>}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={openAdd}
          className="w-full mt-2 py-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span className="material-icons-round text-lg">add_circle_outline</span>
          Add Family Member
        </button>
      </div>
    </div>
  );
};

export default FamilyMembersScreen;
