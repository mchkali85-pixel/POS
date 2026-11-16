import React, { useMemo, useState } from 'react';
import { Plus, CheckCircle2, UserPlus, X, Phone, Clock, MapPin } from 'lucide-react';
import { Client } from '../types/pos';
import { formatRs } from '../data/visualMeta';
import { formatUdhaarElapsed } from '../utils/timeAgo';

interface KhataViewProps {
  clients: Client[];
  onAdjustBalance: (clientId: string, delta: number) => void;
  onClearBalance: (clientId: string) => void;
  onAddClient: (client: Omit<Client, 'id' | 'serialNo' | 'createdAt'>) => void;
}

export const KhataView: React.FC<KhataViewProps> = ({
  clients,
  onAdjustBalance,
  onClearBalance,
  onAddClient,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showOnlyUdhaar, setShowOnlyUdhaar] = useState(true);
  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('500');

  const totalDue = clients.reduce((s, c) => s + c.udhaarBalance, 0);

  const list = useMemo(() => {
    const filtered = showOnlyUdhaar
      ? clients.filter((c) => c.udhaarBalance > 0)
      : clients;
    return [...filtered].sort((a, b) => a.serialNo - b.serialNo);
  }, [clients, showOnlyUdhaar]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !urduName.trim()) return;
    const cleanName = name.trim() || urduName.trim();
    const cleanUrdu = urduName.trim() || name.trim();
    const bal = Math.max(0, Number(amount) || 0);
    onAddClient({
      name: cleanName,
      urduName: cleanUrdu,
      phone: phone.trim() || '0300-0000000',
      address: address.trim() || 'Local Mohalla',
      udhaarBalance: bal,
      udhaarSince: bal > 0 ? Date.now() : null,
      color: 'bg-purple-600',
    });
    setName('');
    setUrduName('');
    setPhone('');
    setAddress('');
    setAmount('500');
    setShowAdd(false);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top Total Due Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-500">
            Kul Udhaar · <span className="font-urdu">کل ادھار لسٹ</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
            {formatRs(totalDue)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setShowOnlyUdhaar(true)}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold transition-colors ${
                showOnlyUdhaar ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Udhaar Walay · ادھار والے
            </button>
            <button
              type="button"
              onClick={() => setShowOnlyUdhaar(false)}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold transition-colors ${
                !showOnlyUdhaar ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Sab · سب
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="min-h-[46px] px-5 rounded-2xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 hover:bg-slate-800 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add · نیا کھاتہ</span>
          </button>
        </div>
      </div>

      {/* Serial-Numbered Udhaar List */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-sm font-bold text-emerald-600">
            Koi Udhaar Baqi Nahi · کوئی ادھار باقی نہیں
          </div>
        ) : (
          list.map((c, index) => {
            const cleared = c.udhaarBalance <= 0;
            const elapsed = formatUdhaarElapsed(c.udhaarSince);

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Serial Number + Avatar + Name + Phone + Time Elapsed */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="min-w-[44px] h-11 px-2 rounded-2xl bg-slate-900 text-white font-mono text-sm font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                    #{String(index + 1).padStart(2, '0')}
                  </div>

                  <div
                    className={`w-12 h-12 rounded-2xl ${c.color} text-white font-extrabold text-sm flex items-center justify-center shrink-0`}
                  >
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900 font-urdu">
                        {c.urduName}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        · {c.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        (Sr #{String(c.serialNo).padStart(2, '0')})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-mono font-bold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {c.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.address}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          cleared ? 'text-emerald-600' : 'text-amber-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-urdu">{elapsed.urdu}</span>
                        <span>· {elapsed.roman}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Balance + Quick Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                  <div
                    className={`text-xl font-extrabold font-mono tabular-nums sm:text-right min-w-[120px] ${
                      cleared ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {cleared ? 'وصول · Paid' : formatRs(c.udhaarBalance)}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => onAdjustBalance(c.id, 100)}
                      className="min-h-[44px] px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-mono text-xs font-bold flex items-center justify-center gap-0.5 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      100
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustBalance(c.id, 500)}
                      className="min-h-[44px] px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-mono text-xs font-bold flex items-center justify-center gap-0.5 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      500
                    </button>
                    <button
                      type="button"
                      disabled={cleared}
                      onClick={() => onAdjustBalance(c.id, -500)}
                      className={`min-h-[44px] px-3 rounded-xl font-mono text-xs font-bold active:scale-95 ${
                        cleared
                          ? 'bg-slate-100 text-slate-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      -500
                    </button>
                    <button
                      type="button"
                      disabled={cleared}
                      onClick={() => onClearBalance(c.id)}
                      className={`min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 ${
                        cleared
                          ? 'bg-slate-100 text-slate-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="font-urdu">وصول</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Udhaar Customer Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                Naya Khata · <span className="font-urdu">نیا کھاتہ</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Roman Name"
                className="min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                type="text"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                placeholder="اردو نام"
                dir="rtl"
                className="min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-bold font-urdu text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone · فون نمبر (0300-...)"
              className="w-full min-h-[46px] px-4 rounded-2xl bg-slate-100 font-mono text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address · پتہ"
              className="w-full min-h-[46px] px-4 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Udhaar Raqam · ادھار رقم (Rs)
              </label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full min-h-[46px] px-4 rounded-2xl bg-slate-100 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.98]"
            >
              Save · محفوظ کریں
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
