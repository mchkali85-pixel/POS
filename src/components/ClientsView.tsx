import React, { useMemo, useState } from 'react';
import {
  UserPlus,
  Phone,
  MapPin,
  Trophy,
  Edit3,
  ImagePlus,
  Search,
  X,
} from 'lucide-react';
import { Client, Order } from '../types/pos';
import { formatRs } from '../data/visualMeta';
import { formatUdhaarElapsed } from '../utils/timeAgo';
import { readAndResizeImage } from '../utils/imageUpload';

interface ClientsViewProps {
  clients: Client[];
  orders: Order[];
  onAddClient: (client: Omit<Client, 'id' | 'serialNo' | 'createdAt'>) => void;
  onUpdateClient: (client: Client) => void;
}

type PeriodFilter = 'all' | 'week' | 'month';

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  orders,
  onAddClient,
  onUpdateClient,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [sortByTop, setSortByTop] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [udhaarBalance, setUdhaarBalance] = useState('0');
  const [avatarUrl, setAvatarUrl] = useState('');

  const enrichedClients = useMemo(() => {
    const now = Date.now();
    const cutoff =
      period === 'week'
        ? now - 7 * 24 * 3600 * 1000
        : period === 'month'
        ? now - 30 * 24 * 3600 * 1000
        : 0;

    return clients.map((c) => {
      const clientOrders = orders.filter(
        (o) => o.clientId === c.id && o.createdAt >= cutoff
      );
      const totalSpent = clientOrders.reduce((s, o) => s + o.total, 0);
      const totalItems = clientOrders.reduce(
        (s, o) => s + o.items.reduce((is, it) => is + it.qty, 0),
        0
      );
      const allTimeSpent = orders
        .filter((o) => o.clientId === c.id)
        .reduce((s, o) => s + o.total, 0);

      return {
        ...c,
        periodSpent: totalSpent,
        periodItems: totalItems,
        periodOrders: clientOrders.length,
        allTimeSpent,
      };
    });
  }, [clients, orders, period]);

  const displayedClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = enrichedClients.filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.urduName.includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    });
    if (sortByTop || period !== 'all') {
      return [...list].sort((a, b) => b.periodSpent - a.periodSpent);
    }
    return [...list].sort((a, b) => a.serialNo - b.serialNo);
  }, [enrichedClients, search, sortByTop, period]);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setUrduName('');
    setPhone('');
    setAddress('');
    setUdhaarBalance('0');
    setAvatarUrl('');
    setModalOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditing(c);
    setName(c.name);
    setUrduName(c.urduName);
    setPhone(c.phone);
    setAddress(c.address);
    setUdhaarBalance(String(c.udhaarBalance));
    setAvatarUrl(c.avatarUrl || '');
    setModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await readAndResizeImage(file, 300);
      setAvatarUrl(url);
    } catch {
      // ignore
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !urduName.trim()) return;
    const cleanName = name.trim() || urduName.trim();
    const cleanUrdu = urduName.trim() || name.trim();
    const nextBal = Math.max(0, Number(udhaarBalance) || 0);

    if (editing) {
      onUpdateClient({
        ...editing,
        name: cleanName,
        urduName: cleanUrdu,
        phone: phone.trim() || '0300-0000000',
        address: address.trim() || 'Local Area',
        udhaarBalance: nextBal,
        udhaarSince: nextBal > 0 ? editing.udhaarSince || Date.now() : null,
        avatarUrl: avatarUrl || undefined,
      });
    } else {
      onAddClient({
        name: cleanName,
        urduName: cleanUrdu,
        phone: phone.trim() || '0300-0000000',
        address: address.trim() || 'Local Area',
        udhaarBalance: nextBal,
        udhaarSince: nextBal > 0 ? Date.now() : null,
        color: 'bg-emerald-600',
        avatarUrl: avatarUrl || undefined,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top Controls: Week/Month/Total Top Buyers + Search + Add */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80">
          {(
            [
              { id: 'all', label: 'Sab · کل' },
              { id: 'week', label: 'Is Hafte · اس ہفتے' },
              { id: 'month', label: 'Is Mahine · اس مہینے' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPeriod(id)}
              className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                period === id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSortByTop((s) => !s)}
            className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              sortByTop || period !== 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Top Buyers · زیادہ خریداری</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name / Phone / Address..."
              className="w-full min-h-[44px] pl-9 pr-3 rounded-2xl bg-white border border-slate-200/80 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="min-h-[44px] px-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Client · نیا گاہک</span>
          </button>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayedClients.map((c, idx) => {
          const elapsed = formatUdhaarElapsed(c.udhaarSince);
          const isTopThree = (sortByTop || period !== 'all') && idx < 3 && c.periodSpent > 0;

          return (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {c.avatarUrl ? (
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-2xl ${c.color} text-white font-extrabold text-base flex items-center justify-center`}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-bold">
                      #{String(c.serialNo).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 font-urdu truncate">
                        {c.urduName}
                      </span>
                      {isTopThree && (
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 truncate">
                      {c.name}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  aria-label="Edit client"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Phone & Address */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 rounded-2xl p-3">
                <div className="flex items-center gap-2 font-mono font-semibold text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{c.address}</span>
                </div>
              </div>

              {/* Purchasing Stats + Udhaar */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 rounded-2xl p-2.5">
                  <div className="text-[10px] font-bold text-emerald-700">
                    {period === 'week'
                      ? 'Week · ہفتہ'
                      : period === 'month'
                      ? 'Month · مہینہ'
                      : 'Total · کل'}
                  </div>
                  <div className="text-sm font-extrabold font-mono text-emerald-900 tabular-nums mt-0.5">
                    {formatRs(c.periodSpent)}
                  </div>
                </div>

                <div className="bg-sky-50 rounded-2xl p-2.5">
                  <div className="text-[10px] font-bold text-sky-700">Items · سامان</div>
                  <div className="text-sm font-extrabold font-mono text-sky-900 tabular-nums mt-0.5">
                    {c.periodItems} ({c.periodOrders})
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-2.5 ${
                    c.udhaarBalance > 0 ? 'bg-rose-50' : 'bg-slate-100'
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold ${
                      c.udhaarBalance > 0 ? 'text-rose-700' : 'text-slate-500'
                    }`}
                  >
                    Udhaar · ادھار
                  </div>
                  <div
                    className={`text-sm font-extrabold font-mono tabular-nums mt-0.5 ${
                      c.udhaarBalance > 0 ? 'text-rose-700' : 'text-slate-600'
                    }`}
                  >
                    {c.udhaarBalance > 0 ? formatRs(c.udhaarBalance) : '0'}
                  </div>
                </div>
              </div>

              {c.udhaarBalance > 0 && (
                <div className="text-[11px] font-semibold text-rose-600 text-right font-urdu">
                  {elapsed.urdu} · {elapsed.roman}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSave}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                {editing ? 'Edit Client · ترمیم' : 'New Client · نیا گاہک'}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Client"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserPlus className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <label className="flex-1 min-h-[44px] px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                <span>Photo · تصویر لگائیں</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
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
              placeholder="Address · پتہ (Gali, Mohalla)"
              className="w-full min-h-[46px] px-4 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Udhaar · ادھار رقم (Rs)
              </label>
              <input
                type="number"
                min="0"
                value={udhaarBalance}
                onChange={(e) => setUdhaarBalance(e.target.value)}
                className="w-full min-h-[46px] px-4 rounded-2xl bg-slate-100 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-[0.98]"
            >
              Save · محفوظ کریں
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
