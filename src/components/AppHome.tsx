import React, { useEffect, useState } from 'react';
import {
  Store,
  Globe,
  ShoppingBag,
  MessageCircle,
  TrendingUp,
  BookOpen,
  Plus,
  ImagePlus,
  X,
  Trash2,
} from 'lucide-react';
import {
  AppTab,
  CategoryNode,
  Client,
  CustomHomeShortcut,
  Order,
  PlatformId,
  Product,
} from '../types/pos';
import { formatRs, PLATFORM_META } from '../data/visualMeta';
import { SmartAppIcon, SmartAppIconType } from './AppIcons';
import { readAndResizeImage } from '../utils/imageUpload';

interface AppHomeProps {
  categories: CategoryNode[];
  products: Product[];
  orders: Order[];
  clients: Client[];
  customShortcuts: CustomHomeShortcut[];
  onOpenPosCategory: (categoryId: string | 'All', autoScan?: boolean) => void;
  onNavigate: (tab: AppTab) => void;
  onOpenAddStock: () => void;
  onAddShortcut: (shortcut: Omit<CustomHomeShortcut, 'id'>) => void;
  onRemoveShortcut: (id: string) => void;
}

const SHORTCUT_COLORS = ['#059669', '#0284C7', '#D97706', '#E11D48', '#7C3AED', '#0F172A'];

export const AppHome: React.FC<AppHomeProps> = ({
  categories,
  products,
  orders,
  clients,
  customShortcuts,
  onOpenPosCategory,
  onNavigate,
  onOpenAddStock,
  onAddShortcut,
  onRemoveShortcut,
}) => {
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [scLabel, setScLabel] = useState('');
  const [scUrdu, setScUrdu] = useState('');
  const [scTarget, setScTarget] = useState<AppTab>('pos');
  const [scCategoryId, setScCategoryId] = useState<string>('');
  const [scColor, setScColor] = useState(SHORTCUT_COLORS[0]);
  const [scImage, setScImage] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;
  const totalKhataDue = clients.reduce((sum, c) => sum + c.udhaarBalance, 0);

  const salesGoal = 20000;
  const salesRatio = Math.min(1, totalSales / salesGoal);
  const ringCircumference = 2 * Math.PI * 30;
  const ringOffset = ringCircumference * (1 - salesRatio);

  const platformCounts: Record<PlatformId, number> = {
    store: products.filter((p) => p.platforms.includes('store')).length,
    web: products.filter((p) => p.platforms.includes('web')).length,
    market: products.filter((p) => p.platforms.includes('market')).length,
    whatsapp: products.filter((p) => p.platforms.includes('whatsapp')).length,
  };

  const smartApps: Array<{
    id: SmartAppIconType;
    label: string;
    urduLabel: string;
    badge?: string | number;
    onClick: () => void;
  }> = [
    {
      id: 'pos',
      label: 'Bill POS',
      urduLabel: 'بل کاؤنٹر',
      onClick: () => onOpenPosCategory('All'),
    },
    {
      id: 'scan',
      label: 'Scan',
      urduLabel: 'اسکین',
      onClick: () => onOpenPosCategory('All', true),
    },
    {
      id: 'grains',
      label: 'Atta Daal',
      urduLabel: 'آٹا دال',
      onClick: () => onOpenPosCategory('cat-grains'),
    },
    {
      id: 'oil',
      label: 'Oil Chai',
      urduLabel: 'تیل چائے',
      onClick: () => onOpenPosCategory('cat-oil'),
    },
    {
      id: 'dairy',
      label: 'Doodh',
      urduLabel: 'دودھ انڈے',
      onClick: () => onOpenPosCategory('cat-dairy'),
    },
    {
      id: 'snacks',
      label: 'Snacks',
      urduLabel: 'بسکٹ چپس',
      onClick: () => onOpenPosCategory('cat-snacks'),
    },
    {
      id: 'homecare',
      label: 'Sabun',
      urduLabel: 'صابن سرف',
      onClick: () => onOpenPosCategory('cat-home'),
    },
    {
      id: 'categories',
      label: 'Categories',
      urduLabel: 'کیٹیگری',
      badge: categories.length,
      onClick: () => onNavigate('categories'),
    },
    {
      id: 'stock',
      label: 'Stock',
      urduLabel: 'اسٹاک',
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      onClick: () => onNavigate('stock'),
    },
    {
      id: 'khata',
      label: 'Khata',
      urduLabel: 'کھاتہ',
      badge: clients.filter((c) => c.udhaarBalance > 0).length || undefined,
      onClick: () => onNavigate('khata'),
    },
    {
      id: 'clients',
      label: 'Clients',
      urduLabel: 'گاہک ڈیٹا',
      badge: clients.length,
      onClick: () => onNavigate('clients'),
    },
    {
      id: 'charts',
      label: 'Report',
      urduLabel: 'رپورٹ',
      onClick: () => onNavigate('charts'),
    },
    {
      id: 'orders',
      label: 'Bills',
      urduLabel: 'پرانے بل',
      badge: orders.length,
      onClick: () => onNavigate('orders'),
    },
    {
      id: 'add',
      label: 'Naya Item',
      urduLabel: 'نیا سامان',
      onClick: onOpenAddStock,
    },
  ];

  const dockApps: Array<{
    id: SmartAppIconType;
    label: string;
    onClick: () => void;
  }> = [
    { id: 'pos', label: 'Bill POS', onClick: () => onOpenPosCategory('All') },
    { id: 'categories', label: 'Categories', onClick: () => onNavigate('categories') },
    { id: 'clients', label: 'Clients', onClick: () => onNavigate('clients') },
    { id: 'khata', label: 'Khata', onClick: () => onNavigate('khata') },
    { id: 'charts', label: 'Report', onClick: () => onNavigate('charts') },
  ];

  const handleShortcutPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await readAndResizeImage(file, 256);
      setScImage(url);
    } catch {
      // ignore
    }
  };

  const handleSaveShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scLabel.trim() && !scUrdu.trim()) return;
    onAddShortcut({
      label: scLabel.trim() || scUrdu.trim(),
      urduLabel: scUrdu.trim() || scLabel.trim(),
      targetTab: scTarget,
      categoryId: scTarget === 'pos' && scCategoryId ? scCategoryId : undefined,
      colorHex: scColor,
      imageUrl: scImage || undefined,
    });
    setScLabel('');
    setScUrdu('');
    setScImage('');
    setShowAddShortcut(false);
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0D211C] via-[#132A2E] to-[#1A243B] border border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-7">
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl" />

        {/* Smart Mobile Header Strip */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2">
          <div className="flex items-baseline gap-3.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight tabular-nums">
              {clock}
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-200 font-urdu">
              Nazim Dukan · ناظم دکان
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddShortcut(true)}
            className="min-h-[40px] px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Icon · نیا آئیکن</span>
          </button>
        </div>

        {/* Crisp Glass Home Widgets */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <button
            type="button"
            onClick={() => onNavigate('charts')}
            className="text-left bg-white/95 backdrop-blur-xl rounded-[26px] p-4 border border-white/60 flex items-center justify-between gap-3 shadow-lg shadow-black/15 hover:bg-white transition-all active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <TrendingUp className="w-4 h-4" />
                <span>Kul Sale ·</span>
                <span className="font-urdu">کل سیل</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums mt-1">
                {formatRs(totalSales)}
              </div>
              <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                {orders.length} bills · بل
              </div>
            </div>
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 76 76">
                <circle cx="38" cy="38" r="30" fill="none" stroke="#E2E8F0" strokeWidth="7" />
                <circle
                  cx="38"
                  cy="38"
                  r="30"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-extrabold text-slate-800 tabular-nums">
                {Math.round(salesRatio * 100)}%
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('stock')}
            className="text-left bg-white/95 backdrop-blur-xl rounded-[26px] p-4 border border-white/60 flex flex-col justify-between gap-3 shadow-lg shadow-black/15 hover:bg-white transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Platforms · <span className="font-urdu">پلیٹ فارم</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-rose-600 tabular-nums">
                {lowStockCount} کم
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'store', Icon: Store },
                  { id: 'web', Icon: Globe },
                  { id: 'market', Icon: ShoppingBag },
                  { id: 'whatsapp', Icon: MessageCircle },
                ] as const
              ).map(({ id, Icon }) => (
                <div key={id} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${PLATFORM_META[id].colorClass}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 font-urdu">
                    {PLATFORM_META[id].urduLabel}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-900 tabular-nums leading-none">
                    {platformCounts[id]}
                  </span>
                </div>
              ))}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('khata')}
            className="text-left bg-white/95 backdrop-blur-xl rounded-[26px] p-4 border border-white/60 flex items-center justify-between gap-3 shadow-lg shadow-black/15 hover:bg-white transition-all active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                <BookOpen className="w-4 h-4" />
                <span>Khata Udhaar ·</span>
                <span className="font-urdu">کھاتہ ادھار</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums mt-1">
                {formatRs(totalKhataDue)}
              </div>
              <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                {clients.filter((c) => c.udhaarBalance > 0).length} gahak · گاہک
              </div>
            </div>
            <div className="flex -space-x-2">
              {clients.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className={`w-10 h-10 rounded-full ${c.color} text-white text-xs font-extrabold flex items-center justify-center ring-2 ring-white`}
                >
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Full-Width Mobile App Icons Grid + Custom Shortcuts */}
        <section aria-label="Nazim Dukan Apps" className="relative pt-2 pb-1">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-x-4 gap-y-6 sm:gap-7">
            {smartApps.map(({ id, label, urduLabel, badge, onClick }) => (
              <button
                key={id}
                type="button"
                onClick={onClick}
                className="group flex flex-col items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-2xl py-1.5 active:scale-90 transition-transform duration-150"
              >
                <div className="relative">
                  <div className="w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] lg:w-[92px] lg:h-[92px] rounded-[22px] sm:rounded-[26px] shadow-xl shadow-black/35 ring-1 ring-white/25 overflow-hidden transition-transform duration-150 group-hover:-translate-y-1.5 group-hover:scale-[1.03]">
                    <SmartAppIcon type={id} />
                  </div>
                  {badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[24px] h-[24px] px-1.5 rounded-full bg-rose-500 text-white text-xs font-mono font-bold flex items-center justify-center ring-2 ring-[#112523] tabular-nums shadow-md">
                      {badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center leading-snug max-w-full">
                  <span className="text-xs sm:text-sm font-bold text-white font-urdu whitespace-nowrap truncate max-w-full drop-shadow-xs">
                    {urduLabel}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-200 whitespace-nowrap truncate max-w-full">
                    {label}
                  </span>
                </div>
              </button>
            ))}

            {/* Admin-Added Custom Shortcuts */}
            {customShortcuts.map((sc) => (
              <div key={sc.id} className="relative group flex flex-col items-center gap-2.5 py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (sc.categoryId) {
                      onOpenPosCategory(sc.categoryId);
                    } else {
                      onNavigate(sc.targetTab);
                    }
                  }}
                  className="flex flex-col items-center gap-2.5 focus:outline-none active:scale-90 transition-transform"
                >
                  <div
                    className="w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] lg:w-[92px] lg:h-[92px] rounded-[22px] sm:rounded-[26px] shadow-xl shadow-black/35 ring-1 ring-white/25 overflow-hidden flex items-center justify-center transition-transform duration-150 group-hover:-translate-y-1.5"
                    style={{ backgroundColor: sc.imageUrl ? '#0F172A' : sc.colorHex }}
                  >
                    {sc.imageUrl ? (
                      <img
                        src={sc.imageUrl}
                        alt={sc.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base sm:text-lg font-extrabold font-urdu text-white px-2 text-center">
                        {sc.urduLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center leading-snug max-w-full">
                    <span className="text-xs sm:text-sm font-bold text-white font-urdu whitespace-nowrap truncate max-w-full">
                      {sc.urduLabel}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-200 whitespace-nowrap truncate max-w-full">
                      {sc.label}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveShortcut(sc.id)}
                  aria-label="Remove shortcut"
                  className="absolute top-0 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Quick "+ Add to Home" Icon Tile */}
            <button
              type="button"
              onClick={() => setShowAddShortcut(true)}
              className="group flex flex-col items-center gap-2.5 py-1.5 active:scale-90 transition-transform"
            >
              <div className="w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] lg:w-[92px] lg:h-[92px] rounded-[22px] sm:rounded-[26px] border-2 border-dashed border-white/40 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col items-center leading-snug">
                <span className="text-xs sm:text-sm font-bold text-white font-urdu">
                  مزید شامل
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
                  Add App
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Translucent Smartphone Glass Dock (Tablet/Desktop) */}
        <div className="relative hidden md:flex items-center justify-center pt-1">
          <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-[28px] px-5 py-3 flex items-center gap-4 shadow-xl shadow-black/25">
            {dockApps.map(({ id, label, onClick }) => (
              <button
                key={id}
                type="button"
                onClick={onClick}
                title={label}
                className="w-13 h-13 rounded-[18px] overflow-hidden shadow-lg shadow-black/30 ring-1 ring-white/30 hover:-translate-y-1.5 active:scale-95 transition-transform"
              >
                <SmartAppIcon type={id} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Shortcut to Home Modal */}
      {showAddShortcut && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSaveShortcut}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                Home Icon · <span className="font-urdu">ہوم پر آئیکن لگائیں</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddShortcut(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 text-white font-bold font-urdu text-sm"
                style={{ backgroundColor: scImage ? '#0F172A' : scColor }}
              >
                {scImage ? (
                  <img src={scImage} alt="Icon" className="w-full h-full object-cover" />
                ) : (
                  scUrdu || 'آئیکن'
                )}
              </div>
              <label className="flex-1 min-h-[44px] px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                <span>Upload Photo · تصویر لگائیں</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleShortcutPhoto}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={scLabel}
                onChange={(e) => setScLabel(e.target.value)}
                placeholder="Roman Label"
                className="min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                type="text"
                value={scUrdu}
                onChange={(e) => setScUrdu(e.target.value)}
                placeholder="اردو نام"
                dir="rtl"
                className="min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-bold font-urdu text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500">
                Kahan Khulay · کہاں کھلے؟
              </label>
              <select
                value={scTarget}
                onChange={(e) => setScTarget(e.target.value as AppTab)}
                className="w-full min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-bold text-slate-900"
              >
                <option value="pos">Counter POS · بل کاؤنٹر</option>
                <option value="categories">Categories · کیٹیگری</option>
                <option value="stock">Stock · اسٹاک</option>
                <option value="clients">Clients · گاہک</option>
                <option value="khata">Khata · کھاتہ</option>
                <option value="charts">Report · رپورٹ</option>
              </select>
            </div>

            {scTarget === 'pos' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500">
                  Category · کیٹیگری منتخب کریں
                </label>
                <select
                  value={scCategoryId}
                  onChange={(e) => setScCategoryId(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-bold text-slate-900"
                >
                  <option value="">All · سب</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.urduName} · {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {SHORTCUT_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setScColor(hex)}
                  className={`w-8 h-8 rounded-full ${
                    scColor === hex ? 'ring-3 ring-slate-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={hex}
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
            >
              Add to Home · شامل کریں
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
