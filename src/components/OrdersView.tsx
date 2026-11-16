import React, { useMemo, useState } from 'react';
import {
  Store,
  Globe,
  ShoppingBag,
  MessageCircle,
  Banknote,
  CreditCard,
  QrCode,
  BookOpen,
  X,
  Receipt,
  User,
} from 'lucide-react';
import { Client, Order } from '../types/pos';
import { formatRs, PLATFORM_META } from '../data/visualMeta';
import { ProductVisual } from './ProductVisual';

interface OrdersViewProps {
  orders: Order[];
  clients: Client[];
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, clients }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  const PlatformIcon = (p: Order['platform']) =>
    p === 'web'
      ? Globe
      : p === 'market'
      ? ShoppingBag
      : p === 'whatsapp'
      ? MessageCircle
      : Store;

  const PaymentIcon = (pay: Order['payment']) =>
    pay === 'cash'
      ? Banknote
      : pay === 'qr'
      ? QrCode
      : pay === 'udhaar'
      ? BookOpen
      : CreditCard;

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' · ' +
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const selectedClient = selectedOrder?.clientId
    ? clientMap.get(selectedOrder.clientId)
    : undefined;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-3">
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-sm font-bold text-slate-400">
          Abhi koi bill nahi · ابھی کوئی بل نہیں
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((ord) => {
            const PIcon = PlatformIcon(ord.platform);
            const PayIcon = PaymentIcon(ord.payment);
            const itemCount = ord.items.reduce((s, i) => s + i.qty, 0);
            const linkedClient = ord.clientId ? clientMap.get(ord.clientId) : undefined;

            return (
              <button
                key={ord.id}
                type="button"
                onClick={() => setSelectedOrder(ord)}
                className="text-left bg-white rounded-3xl border border-slate-200/80 p-4 hover:border-slate-300 transition-transform active:scale-[0.99] space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 ${
                        ord.payment === 'udhaar' ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-mono font-extrabold text-slate-900">
                        {ord.orderNumber}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 tabular-nums truncate">
                        {formatTime(ord.createdAt)} · {itemCount} items
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-extrabold font-mono text-slate-900 tabular-nums shrink-0">
                    {formatRs(ord.total)}
                  </div>
                </div>

                {linkedClient && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-500">
                      #{String(linkedClient.serialNo).padStart(2, '0')}
                    </span>
                    <span className="font-urdu truncate">{linkedClient.urduName}</span>
                    {ord.payment === 'udhaar' && (
                      <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-urdu">
                        ادھار
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {ord.items.slice(0, 4).map((it) => (
                      <ProductVisual
                        key={it.productId}
                        imageUrl={it.imageUrl}
                        artKey={it.artKey}
                        alt={it.name}
                        className="w-9 h-9 rounded-xl ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <PIcon className="w-3.5 h-3.5" />
                      <span className="font-urdu">{PLATFORM_META[ord.platform].urduLabel}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <PayIcon
                      className={`w-4 h-4 ${
                        ord.payment === 'udhaar' ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">
                  Nazim Dukan · ناظم دکان
                </div>
                <div className="text-base font-mono font-extrabold text-slate-900">
                  Bill {selectedOrder.orderNumber}
                </div>
                {selectedClient && (
                  <div className="text-xs font-bold text-emerald-700 font-urdu mt-0.5">
                    #{String(selectedClient.serialNo).padStart(2, '0')} · {selectedClient.urduName} (
                    {selectedClient.name})
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 space-y-2.5 max-h-64 overflow-y-auto">
              {selectedOrder.items.map((it) => (
                <div key={it.productId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProductVisual
                      imageUrl={it.imageUrl}
                      artKey={it.artKey}
                      alt={it.name}
                      className="w-9 h-9 rounded-xl shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 font-urdu truncate">
                        {it.urduName || it.name}
                      </div>
                      <div className="font-mono text-slate-500 tabular-nums">
                        {it.qty} × {formatRs(it.price)}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatRs(it.qty * it.price)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Kul · کل</span>
              <span className="font-mono tabular-nums">{formatRs(selectedOrder.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
