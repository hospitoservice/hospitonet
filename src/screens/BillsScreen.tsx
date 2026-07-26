import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService, { UserProfile } from '../service/UserService';
import BillingService, { Bill } from '../service/BillingService';
import { downloadBill, downloadAllBills } from '../service/BillPdfService';

const STATUS_STYLE: Record<string, { pill: string; dot: string }> = {
  Paid:     { pill: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  Pending:  { pill: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  Refunded: { pill: 'bg-red-50 text-red-600',     dot: 'bg-red-500' },
};

const CATEGORY_ICON: Record<string, string> = {
  Appointment: 'calendar_today',
  Item: 'medication',
  Test: 'science',
};

function formatDate(raw?: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const BillsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const phone = UserService.getPhoneFromSession();
      if (!phone) { setError('Unable to identify your account. Please log in again.'); return; }
      const fetchedUser = await UserService.getUserByPhone(phone);
      if (!fetchedUser) { setError('Unable to identify your account. Please log in again.'); return; }
      setUser(fetchedUser);
      setBills(await BillingService.getBillsForUser(fetchedUser));
    } catch (err) {
      console.error('Failed to load bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const hospitalNameFor = (bill: Bill): string | undefined =>
    user?.patientLinks?.find(l => l.hospitalId === bill.hospitalId)?.hospitalName;

  const handleDownload = (bill: Bill) => {
    setDownloadingId(bill.id);
    try {
      downloadBill(bill, hospitalNameFor(bill));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = () => {
    setDownloadingAll(true);
    try {
      downloadAllBills(bills, hospitalNameFor);
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      <header className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-transform"
            >
              <span className="material-icons-round text-white">arrow_back</span>
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">Bills & Receipts</h1>
          </div>
          {bills.length > 0 && (
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              className="px-4 py-2.5 bg-white text-cyan-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-60 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-icons-round text-base">download</span>
              {downloadingAll ? '…' : 'All'}
            </button>
          )}
        </div>
      </header>

      <div className="px-5 pt-6 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="rounded-3xl h-24 bg-white dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-700" />)}
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
            <button onClick={load} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
          </div>
        )}

        {!loading && !error && bills.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-icons-round text-gray-300 dark:text-gray-700 text-5xl mb-3">receipt_long</span>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No bills yet.</p>
            <p className="text-xs text-gray-400 mt-1">Bills from your appointments and purchases will show up here.</p>
          </div>
        )}

        {!loading && !error && bills.map(bill => {
          const statusStyle = STATUS_STYLE[bill.status ?? ''] ?? STATUS_STYLE.Pending;
          const hospitalName = hospitalNameFor(bill);
          return (
            <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-cyan-500 text-xl">
                    {CATEGORY_ICON[bill.billCategory ?? ''] ?? 'receipt_long'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {bill.billNumber ?? bill.id}
                    </p>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusStyle.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {bill.status ?? 'Pending'}
                    </span>
                  </div>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">
                    {bill.billCategory ?? 'Bill'}{hospitalName ? ` · ${hospitalName}` : ''}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-400 font-bold">📅 {formatDate(bill.billDate)}</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">₹{(bill.total ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(bill)}
                disabled={downloadingId === bill.id}
                className="w-full mt-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <span className="material-icons-round text-sm">download</span>
                {downloadingId === bill.id ? 'Preparing…' : 'Download Receipt'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BillsScreen;
