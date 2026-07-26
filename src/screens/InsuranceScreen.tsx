import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService, { InsurancePolicy } from '../service/UserService';
import InsurancePlanService, { InsurancePlan } from '../service/InsurancePlanService';

const TYPE_ICON: Record<string, string> = {
  Health: 'health_and_safety',
  Life: 'shield',
  Accident: 'emergency',
  Travel: 'flight_takeoff',
};

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  Expired: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

const InsuranceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'mine' | 'explore'>('mine');

  const [userId, setUserId] = useState<string | null>(null);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [policiesError, setPoliciesError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState('');
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState('');

  const loadMine = async () => {
    setPoliciesLoading(true);
    setPoliciesError('');
    try {
      const phone = UserService.getPhoneFromSession();
      if (!phone) { setPoliciesError('Unable to identify your account. Please log in again.'); return; }

      const user = await UserService.getUserByPhone(phone);
      if (!user?.id) { setPoliciesError('Unable to identify your account. Please log in again.'); return; }

      setUserId(user.id);
      setPolicies(user.insurancePolicies ?? []);
    } catch (err) {
      console.error('Failed to load insurance policies:', err);
      setPoliciesError('Failed to load your insurance information. Please try again.');
    } finally {
      setPoliciesLoading(false);
    }
  };

  useEffect(() => { loadMine(); }, []);

  const loadPlans = async () => {
    setPlansLoading(true);
    setPlansError('');
    try {
      const data = await InsurancePlanService.getPlans();
      setPlans(data);
      setPlansLoaded(true);
    } catch (err) {
      console.error('Failed to load insurance plans:', err);
      setPlansError('Failed to load insurance plans. Please try again.');
    } finally {
      setPlansLoading(false);
    }
  };

  const openExplore = () => {
    setTab('explore');
    if (!plansLoaded) loadPlans();
  };

  const handleRemove = async (policyId: string) => {
    if (!userId) return;
    setRemovingId(policyId);
    try {
      const updated = await UserService.removeInsurancePolicy(userId, policyId);
      setPolicies(updated.insurancePolicies ?? []);
    } catch (err) {
      console.error('Failed to remove insurance policy:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleEnroll = async (plan: InsurancePlan) => {
    if (!userId) return;
    setEnrollingId(plan.id);
    setEnrollSuccess('');
    try {
      const updated = await UserService.addInsurancePolicy(userId, {
        planId: plan.id,
        provider: plan.provider,
        planName: plan.planName,
        type: plan.type,
        coverageAmount: plan.coverageAmount,
        premium: plan.premiumPerYear,
        status: 'Pending',
        startDate: new Date().toISOString().slice(0, 10),
      });
      setPolicies(updated.insurancePolicies ?? []);
      setEnrollSuccess(`${plan.planName} application submitted!`);
      setTimeout(() => setEnrollSuccess(''), 3000);
      setTab('mine');
    } catch (err) {
      console.error('Failed to enroll in plan:', err);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      {/* Success toast */}
      {enrollSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold">
          <span className="material-icons-round text-base">check_circle</span>
          {enrollSuccess}
        </div>
      )}

      <header className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-transform"
          >
            <span className="material-icons-round text-white">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Insurance</h1>
        </div>
      </header>

      <div className="px-5 pt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('mine')}
            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === 'mine'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'
            }`}
          >
            My Insurance{policies.length > 0 ? ` (${policies.length})` : ''}
          </button>
          <button
            onClick={openExplore}
            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === 'explore'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'
            }`}
          >
            Explore Plans
          </button>
        </div>
      </div>

      {/* ── My Insurance ─────────────────────────────────────────── */}
      {tab === 'mine' && (
        <div className="px-5 pt-5 space-y-3">
          {policiesLoading && (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-4 h-28 animate-pulse border border-gray-100 dark:border-gray-700" />)}
            </div>
          )}

          {!policiesLoading && policiesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-bold">{policiesError}</p>
              <button onClick={loadMine} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
            </div>
          )}

          {!policiesLoading && !policiesError && policies.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="material-icons-round text-gray-300 dark:text-gray-600 text-5xl mb-3">health_and_safety</span>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No insurance policies yet.</p>
              <p className="text-xs text-gray-400 mt-1">Explore plans to get covered.</p>
              <button
                onClick={openExplore}
                className="mt-5 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                Explore Plans
              </button>
            </div>
          )}

          {!policiesLoading && !policiesError && policies.length > 0 && (
            <div className="space-y-3">
              {policies.map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-round text-cyan-500 text-xl">{TYPE_ICON[p.type] ?? 'health_and_safety'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.planName}</p>
                        <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${STATUS_STYLE[p.status] ?? STATUS_STYLE.Pending}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{p.provider} · {p.type}</p>
                      {p.policyNumber && (
                        <p className="text-[10px] text-gray-400 mt-1">Policy No: {p.policyNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Coverage</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(p.coverageAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Premium / yr</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(p.premium)}</p>
                    </div>
                    <button
                      onClick={() => p.id && handleRemove(p.id)}
                      disabled={removingId === p.id}
                      className="p-2 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      {removingId === p.id
                        ? <span className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin block" />
                        : <span className="material-icons-round text-lg">delete_outline</span>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Explore Plans ─────────────────────────────────────────── */}
      {tab === 'explore' && (
        <div className="px-5 pt-5 space-y-3">
          {plansLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-4 h-36 animate-pulse border border-gray-100 dark:border-gray-700" />)}
            </div>
          )}

          {!plansLoading && plansError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-bold">{plansError}</p>
              <button onClick={loadPlans} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
            </div>
          )}

          {!plansLoading && !plansError && plans.length === 0 && plansLoaded && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="material-icons-round text-gray-300 dark:text-gray-600 text-5xl mb-3">search_off</span>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No plans available right now.</p>
            </div>
          )}

          {!plansLoading && !plansError && plans.length > 0 && (
            <div className="space-y-3">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-round text-blue-500 text-xl">{plan.icon || TYPE_ICON[plan.type] || 'health_and_safety'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.planName}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{plan.provider} · {plan.type}</p>
                      {plan.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{plan.description}</p>
                      )}
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Coverage</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(plan.coverageAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Premium / yr</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(plan.premiumPerYear)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(plan)}
                      disabled={enrollingId === plan.id}
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-cyan-500/20 disabled:opacity-60 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
                    >
                      {enrollingId === plan.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Enroll'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsuranceScreen;
