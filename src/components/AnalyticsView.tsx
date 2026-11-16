import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Receipt,
  PackageCheck,
  Wallet,
  Store,
  Globe,
  ShoppingBag,
  MessageCircle,
  Plus,
  Trophy,
} from 'lucide-react';
import { CategoryNode, Client, Order, PlatformId, Product } from '../types/pos';
import { formatRs, getRootCategory, PLATFORM_META } from '../data/visualMeta';
import { ProductVisual } from './ProductVisual';

interface AnalyticsViewProps {
  categories: CategoryNode[];
  products: Product[];
  orders: Order[];
  clients: Client[];
  onQuickRestock: (productId: string, delta: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  categories,
  products,
  orders,
  clients,
  onQuickRestock,
}) => {
  const [buyerPeriod, setBuyerPeriod] = useState<'week' | 'month' | 'all'>('week');

  const rootCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories]
  );

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const totalUnits = orders.reduce(
      (s, o) => s + o.items.reduce((is, it) => is + it.qty, 0),
      0
    );
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

    const byRootCat: Record<string, number> = {};
    rootCategories.forEach((c) => {
      byRootCat[c.id] = 0;
    });

    const byPlatform: Record<PlatformId, { revenue: number; count: number }> = {
      store: { revenue: 0, count: 0 },
      web: { revenue: 0, count: 0 },
      market: { revenue: 0, count: 0 },
      whatsapp: { revenue: 0, count: 0 },
    };

    const itemSales: Record<
      string,
      { name: string; urduName: string; qty: number; rev: number; product?: Product }
    > = {};

    orders.forEach((o) => {
      byPlatform[o.platform].revenue += o.total;
      byPlatform[o.platform].count += 1;

      o.items.forEach((it) => {
        const root = getRootCategory(it.categoryId, categories);
        if (root) {
          byRootCat[root.id] = (byRootCat[root.id] || 0) + it.qty * it.price;
        }
        if (!itemSales[it.productId]) {
          itemSales[it.productId] = {
            name: it.name,
            urduName: it.urduName || it.name,
            qty: 0,
            rev: 0,
            product: products.find((p) => p.id === it.productId),
          };
        }
        itemSales[it.productId].qty += it.qty;
        itemSales[it.productId].rev += it.qty * it.price;
      });
    });

    const topSellers = Object.entries(itemSales)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 4);

    return {
      totalRevenue,
      totalOrders,
      totalUnits,
      inventoryValue,
      byRootCat,
      byPlatform,
      topSellers,
    };
  }, [categories, rootCategories, products, orders]);

  // Top Buyers Leaderboard by Week / Month / All-Time
  const topBuyers = useMemo(() => {
    const now = Date.now();
    const cutoff =
      buyerPeriod === 'week'
        ? now - 7 * 24 * 3600 * 1000
        : buyerPeriod === 'month'
        ? now - 30 * 24 * 3600 * 1000
        : 0;

    return clients
      .map((c) => {
        const cOrders = orders.filter(
          (o) => o.clientId === c.id && o.createdAt >= cutoff
        );
        const spent = cOrders.reduce((s, o) => s + o.total, 0);
        const items = cOrders.reduce(
          (s, o) => s + o.items.reduce((is, it) => is + it.qty, 0),
          0
        );
        return { client: c, spent, items, bills: cOrders.length };
      })
      .filter((row) => row.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [clients, orders, buyerPeriod]);

  const donutTotal = Math.max(
    1,
    Object.values(stats.byRootCat).reduce((sum, v) => sum + v, 0)
  );
  const r = 46;
  const C = 2 * Math.PI * r;
  let cumulativeOffset = 0;

  const barOrders = [...orders].slice(0, 8).reverse();
  const maxBar = Math.max(100, ...barOrders.map((o) => o.total));
  const lowStock = products.filter((p) => p.stock <= 10).slice(0, 4);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-5">
      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Kul Sale · کل سیل',
            value: formatRs(stats.totalRevenue),
            Icon: TrendingUp,
            iconBg: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Bills · بل',
            value: String(stats.totalOrders),
            Icon: Receipt,
            iconBg: 'bg-indigo-50 text-indigo-600',
          },
          {
            label: 'Sold · بکا مال',
            value: String(stats.totalUnits),
            Icon: PackageCheck,
            iconBg: 'bg-orange-50 text-orange-600',
          },
          {
            label: 'Stock · مال قیمت',
            value: formatRs(stats.inventoryValue),
            Icon: Wallet,
            iconBg: 'bg-amber-50 text-amber-600',
          },
        ].map(({ label, value, Icon, iconBg }) => (
          <div
            key={label}
            className="bg-white rounded-3xl border border-slate-200/80 p-4 flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-xs font-bold text-slate-500">{label}</div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums mt-1">
                {value}
              </div>
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Top Buyers Leaderboard (Week / Month / Total) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-base font-extrabold text-slate-900">
              Top Customers · <span className="font-urdu">زیادہ خریداری کرنے والے گاہک</span>
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start">
            {(
              [
                { id: 'week', label: 'Week · ہفتہ' },
                { id: 'month', label: 'Month · مہینہ' },
                { id: 'all', label: 'Total · کل' },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setBuyerPeriod(id)}
                className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold transition-colors ${
                  buyerPeriod === id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {topBuyers.length === 0 ? (
          <div className="py-6 text-center text-xs font-bold text-slate-400">
            Is waqt koi kharidari nahi · اس وقت کوئی خریداری نہیں
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topBuyers.map(({ client, spent, items, bills }, idx) => (
              <div
                key={client.id}
                className="bg-slate-50 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 border border-slate-100"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${client.color} text-white text-xs font-extrabold flex items-center justify-center shrink-0`}
                    >
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 font-urdu truncate">
                        {client.urduName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {client.phone}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-amber-600">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {items} items · {bills} bills
                  </span>
                  <span className="text-sm font-extrabold font-mono text-emerald-700 tabular-nums">
                    {formatRs(spent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between gap-4">
          <div className="text-sm font-extrabold text-slate-900">
            Category · <span className="font-urdu">کیٹیگری</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#F1F5F9" strokeWidth="14" />
                {rootCategories.map((cat) => {
                  const val = stats.byRootCat[cat.id] || 0;
                  const pct = val / donutTotal;
                  const dash = pct * C;
                  const offset = -cumulativeOffset;
                  cumulativeOffset += dash;
                  if (val <= 0) return null;
                  return (
                    <circle
                      key={cat.id}
                      cx="60"
                      cy="60"
                      r={r}
                      fill="none"
                      stroke={cat.colorHex}
                      strokeWidth="14"
                      strokeDasharray={`${dash} ${C}`}
                      strokeDashoffset={offset}
                    />
                  );
                })}
              </svg>
              <div className="absolute text-center">
                <div className="text-xs font-mono font-extrabold text-slate-900 tabular-nums">
                  {formatRs(stats.totalRevenue)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {rootCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  <span className="font-urdu">{cat.urduName}</span>
                  <span className="text-slate-400">· {cat.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatRs(stats.byRootCat[cat.id] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900">
              Taza Bills · <span className="font-urdu">تازہ بل</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 tabular-nums">
              {barOrders.length} live
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4">
            {barOrders.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Abhi koi bill nahi · ابھی کوئی بل نہیں
              </div>
            ) : (
              barOrders.map((o) => {
                const heightPct = Math.max(12, Math.round((o.total / maxBar) * 100));
                return (
                  <div
                    key={o.id}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {formatRs(o.total)}
                    </span>
                    <div className="w-full max-w-[28px] bg-slate-100 rounded-xl h-full flex items-end overflow-hidden">
                      <div
                        className="w-full rounded-xl bg-emerald-600 transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {o.orderNumber.replace('#', '')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between gap-4">
          <div className="text-sm font-extrabold text-slate-900">
            Platforms · <span className="font-urdu">پلیٹ فارم</span>
          </div>
          <div className="space-y-3">
            {(
              [
                { id: 'store', Icon: Store },
                { id: 'web', Icon: Globe },
                { id: 'market', Icon: ShoppingBag },
                { id: 'whatsapp', Icon: MessageCircle },
              ] as const
            ).map(({ id, Icon }) => {
              const data = stats.byPlatform[id];
              const pct = Math.round((data.revenue / Math.max(1, stats.totalRevenue)) * 100);
              return (
                <div key={id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${PLATFORM_META[id].colorClass}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-urdu">{PLATFORM_META[id].urduLabel}</span>
                      <span className="text-slate-400">· {PLATFORM_META[id].label}</span>
                      <span className="font-mono text-slate-400 tabular-nums">
                        ({data.count})
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatRs(data.revenue)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: PLATFORM_META[id].barHex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
          <div className="text-sm font-extrabold text-slate-900">
            Top Items · <span className="font-urdu">زیادہ بکنے والا</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.topSellers.map(([id, info]) => (
              <div key={id} className="bg-slate-50 rounded-2xl p-2.5 space-y-1.5">
                <ProductVisual
                  imageUrl={info.product?.imageUrl}
                  artKey={info.product?.artKey || 'atta'}
                  alt={info.name}
                  className="w-full aspect-square rounded-xl"
                />
                <div className="text-xs font-bold text-slate-900 font-urdu truncate">
                  {info.urduName}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                  <span className="text-slate-500">{info.qty}×</span>
                  <span className="font-bold text-slate-900">{formatRs(info.rev)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
          <div className="text-sm font-extrabold text-slate-900">
            Kam Stock · <span className="font-urdu">کم اسٹاک</span>
          </div>
          {lowStock.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-emerald-600">
              Sab Stock Poora Hai · سب اسٹاک پورا ہے
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProductVisual
                      imageUrl={item.imageUrl}
                      artKey={item.artKey}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 font-urdu truncate">
                        {item.urduName}
                      </div>
                      <div className="text-xs font-mono font-bold text-rose-600 tabular-nums">
                        {item.stock} باقی
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onQuickRestock(item.id, 10)}
                    className="min-h-[40px] px-3 rounded-xl bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-0.5 hover:bg-slate-800 active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    10
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
