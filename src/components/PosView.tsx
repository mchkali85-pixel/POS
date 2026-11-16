import React, { useEffect, useMemo, useState } from 'react';
import {
  Store,
  ShoppingBag,
  ScanBarcode,
  Minus,
  Plus,
  Trash2,
  Banknote,
  CreditCard,
  QrCode,
  BookOpen,
  CheckCircle2,
  Globe,
  MessageCircle,
  X,
  ChevronUp,
  Search,
  ChevronRight,
  Edit3,
  User,
} from 'lucide-react';
import {
  CartItem,
  CategoryNode,
  Client,
  Order,
  PaymentMethod,
  PlatformId,
  Product,
} from '../types/pos';
import {
  formatRs,
  getCategoryTrail,
  getDescendantIds,
  PLATFORM_META,
} from '../data/visualMeta';
import { ProductVisual } from './ProductVisual';

interface PosViewProps {
  categories: CategoryNode[];
  products: Product[];
  clients: Client[];
  selectedCategoryId: string | 'All';
  onSelectCategoryId: (catId: string | 'All') => void;
  scanPulse: number;
  onCompleteOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  onQuickUpdatePrice: (productId: string, nextPrice: number) => void;
}

export const PosView: React.FC<PosViewProps> = ({
  categories,
  products,
  clients,
  selectedCategoryId,
  onSelectCategoryId,
  scanPulse,
  onCompleteOrder,
  onQuickUpdatePrice,
}) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [platform, setPlatform] = useState<PlatformId>('store');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [scannedSkuFeedback, setScannedSkuFeedback] = useState<string | null>(null);

  // Quick Price Edit state
  const [editingPriceProduct, setEditingPriceProduct] = useState<Product | null>(null);
  const [priceDraft, setPriceDraft] = useState('');

  const trail = useMemo(
    () =>
      selectedCategoryId === 'All'
        ? []
        : getCategoryTrail(selectedCategoryId, categories),
    [selectedCategoryId, categories]
  );

  const rootCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories]
  );

  const childCategories = useMemo(() => {
    if (selectedCategoryId === 'All') return [];
    return categories.filter((c) => c.parentId === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    const allowedCats =
      selectedCategoryId === 'All'
        ? null
        : getDescendantIds(selectedCategoryId, categories);

    return products.filter((p) => {
      if (allowedCats && !allowedCats.has(p.categoryId)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.urduName.includes(q) &&
          !p.sku.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [products, categories, selectedCategoryId, search]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, qty: item.qty + 1, price: product.price }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          urduName: product.urduName,
          unit: product.unit,
          price: product.price,
          qty: 1,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl,
          artKey: product.artKey,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.qty + delta;
          if (product && nextQty > product.stock) return item;
          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handleBarcodeTap = () => {
    const available = products.filter((p) => p.stock > 0);
    if (available.length === 0) return;
    const randomPick = available[Math.floor(Math.random() * available.length)];
    addToCart(randomPick);
    setScannedSkuFeedback(randomPick.sku);
    window.setTimeout(() => setScannedSkuFeedback(null), 1400);
  };

  useEffect(() => {
    if (scanPulse > 0) {
      handleBarcodeTap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanPulse]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const effectiveClientId =
      payment === 'udhaar' && !selectedClientId && clients[0]
        ? clients[0].id
        : selectedClientId || undefined;

    const created = onCompleteOrder({
      platform,
      payment,
      clientId: effectiveClientId,
      items: cart,
      subtotal: total,
      total,
    });
    setCart([]);
    setMobileSheetOpen(false);
    setLastCompletedOrder(created);
  };

  const handleSaveQuickPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceProduct) return;
    const val = Math.max(1, Number(priceDraft) || editingPriceProduct.price);
    onQuickUpdatePrice(editingPriceProduct.id, val);
    setCart((prev) =>
      prev.map((it) =>
        it.productId === editingPriceProduct.id ? { ...it, price: val } : it
      )
    );
    setEditingPriceProduct(null);
  };

  const registerContent = (
    <div className="flex flex-col h-full">
      {/* Platform Channel Selector */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-500">Order · آرڈر</span>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: 'store', Icon: Store },
              { id: 'web', Icon: Globe },
              { id: 'market', Icon: ShoppingBag },
              { id: 'whatsapp', Icon: MessageCircle },
            ] as const
          ).map(({ id, Icon }) => {
            const active = platform === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlatform(id)}
                title={`${PLATFORM_META[id].label} · ${PLATFORM_META[id].urduLabel}`}
                className={`min-h-[38px] min-w-[44px] px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
                  active
                    ? PLATFORM_META[id].colorClass
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline whitespace-nowrap">
                  {PLATFORM_META[id].urduLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Client Picker */}
      <div className="pt-2.5 pb-2 border-b border-slate-100 flex items-center gap-2">
        <User className="w-4 h-4 text-slate-400 shrink-0" />
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          aria-label="Select Client"
          className="flex-1 min-h-[38px] px-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">Walk-in · عام گاہک</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              #{String(c.serialNo).padStart(2, '0')} {c.urduName} · {c.name} ({c.phone})
            </option>
          ))}
        </select>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[150px] max-h-[40vh] lg:max-h-[340px]">
        {cart.length === 0 ? (
          <div className="h-full min-h-[150px] flex flex-col items-center justify-center gap-1.5 text-slate-400">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs font-bold font-urdu">سامان منتخب کریں</span>
            <span className="text-[11px] font-semibold">Tap item to add</span>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-slate-50"
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
                    {item.urduName} · {item.name}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-500 tabular-nums">
                    {formatRs(item.price)} · {item.unit}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => updateCartQty(item.productId, -1)}
                  aria-label="Decrease"
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
                >
                  {item.qty === 1 ? (
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="w-7 text-center text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => updateCartQty(item.productId, 1)}
                  aria-label="Increase"
                  className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total + Payment + Pay CTA */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">
            Total · <span className="font-urdu">کل بل</span>
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {formatRs(total)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: 'cash', label: 'نقد', Icon: Banknote },
              { id: 'qr', label: 'آن لائن', Icon: QrCode },
              { id: 'card', label: 'کارڈ', Icon: CreditCard },
              { id: 'udhaar', label: 'ادھار', Icon: BookOpen },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = payment === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPayment(id);
                  if (id === 'udhaar' && !selectedClientId && clients[0]) {
                    setSelectedClientId(clients[0].id);
                  }
                }}
                className={`min-h-[46px] px-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold font-urdu transition-all active:scale-95 ${
                  active
                    ? id === 'udhaar'
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={cart.length === 0}
          onClick={handleCheckout}
          className={`w-full min-h-[52px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            cart.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : payment === 'udhaar'
              ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/20 hover:bg-purple-800'
              : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700'
          }`}
        >
          <span>
            {payment === 'udhaar' ? 'Khata Mein Likhen · کھاتہ' : 'Bill Banayen · بل بنائیں'}
          </span>
          {cart.length > 0 && (
            <span className="font-mono tabular-nums">{formatRs(total)}</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Level 1 Category Bar + Search + Scan */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-white rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => onSelectCategoryId('All')}
            className={`min-h-[42px] px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
              selectedCategoryId === 'All'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sab · سب
          </button>
          {rootCategories.map((cat) => {
            const isSelected = trail[0]?.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategoryId(cat.id)}
                className={`min-h-[42px] px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                style={isSelected ? { backgroundColor: cat.colorHex } : undefined}
              >
                <span className="font-urdu">{cat.urduName}</span>
                <span className="opacity-80">· {cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Talash · تلاش کریں"
              aria-label="Search Karyana items"
              className="w-full min-h-[44px] pl-9 pr-3 rounded-2xl bg-white border border-slate-200/80 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={handleBarcodeTap}
            className="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white flex items-center gap-1.5 text-xs font-bold hover:bg-slate-800 active:scale-95 transition-transform whitespace-nowrap shrink-0"
          >
            <ScanBarcode className="w-4 h-4" />
            <span>{scannedSkuFeedback || 'Scan · اسکین'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Category & Sub-Sub-Category Breadcrumb + Children Drill-down */}
      {trail.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => onSelectCategoryId('All')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Sab · سب
            </button>
            {trail.map((node, idx) => (
              <React.Fragment key={node.id}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => onSelectCategoryId(node.id)}
                  className={`px-2.5 py-1.5 rounded-xl font-urdu ${
                    idx === trail.length - 1
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {node.urduName} · {node.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {childCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {childCategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectCategoryId(sub.id)}
                  className="min-h-[36px] px-3 rounded-xl text-xs font-bold text-white shadow-xs active:scale-95 transition-transform font-urdu"
                  style={{ backgroundColor: sub.colorHex }}
                >
                  {sub.urduName} · {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Grid + Desktop Counter Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Search className="w-10 h-10" />
              <button
                type="button"
                onClick={() => {
                  onSelectCategoryId('All');
                  setSearch('');
                }}
                className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Sab Dikhayen · سب دکھائیں
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredProducts.map((product) => {
                const inCart = cart.find((c) => c.productId === product.id);
                const outOfStock = product.stock <= 0;
                const lowStock = product.stock > 0 && product.stock <= 10;

                return (
                  <div
                    key={product.id}
                    className={`group relative bg-white rounded-3xl border transition-all overflow-hidden flex flex-col ${
                      inCart
                        ? 'border-emerald-600 ring-2 ring-emerald-600/15'
                        : 'border-slate-200/80 hover:border-slate-300'
                    } ${outOfStock ? 'opacity-50' : ''}`}
                  >
                    {/* Quick Price Edit Pencil */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPriceProduct(product);
                        setPriceDraft(String(product.price));
                      }}
                      title="Edit Price · قیمت تبدیل کریں"
                      className="absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => addToCart(product)}
                      className="text-left flex-1 flex flex-col focus:outline-none active:scale-[0.98] transition-transform"
                    >
                      <div className="relative w-full aspect-square">
                        <ProductVisual
                          imageUrl={product.imageUrl}
                          artKey={product.artKey}
                          alt={product.name}
                          className="w-full h-full"
                        />
                        {inCart && (
                          <span className="absolute top-2.5 right-2.5 min-w-[30px] h-[30px] px-2 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center shadow-md tabular-nums">
                            {inCart.qty}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 sm:p-4 space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-base font-bold text-slate-900 font-urdu truncate">
                            {product.urduName}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-500 shrink-0">
                            {product.unit}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-500 truncate">
                          {product.name}
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <span className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                            {formatRs(product.price)}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold tabular-nums ${
                              outOfStock
                                ? 'text-rose-600'
                                : lowStock
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {outOfStock ? 'ختم 0' : `${product.stock}`}
                          </span>
                        </div>
                      </div>
                    </button>

                    {inCart && (
                      <div className="px-3 pb-3 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, -1)}
                          aria-label="Remove one"
                          className="flex-1 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, 1)}
                          aria-label="Add one"
                          className="flex-1 min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Register */}
        <aside className="hidden lg:block lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="text-base font-extrabold text-slate-900">
              Counter Bill · <span className="font-urdu">کاؤنٹر بل</span>
            </span>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 min-h-[32px] px-2"
              >
                Saaf · صاف
              </button>
            )}
          </div>
          {registerContent}
        </aside>
      </div>

      {/* Mobile Floating Bill Bar */}
      {totalQty > 0 && (
        <div className="lg:hidden fixed bottom-[72px] left-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setMobileSheetOpen(true)}
            className="w-full min-h-[54px] px-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-900/20 flex items-center justify-between active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="min-w-[28px] h-7 px-2 rounded-xl bg-white/20 font-mono text-xs font-bold flex items-center justify-center tabular-nums">
                {totalQty}
              </span>
              <span className="text-sm font-bold">Bill · بل دیکھیں</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-base font-extrabold tabular-nums">
              <span>{formatRs(total)}</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Bottom Sheet Bill */}
      {mobileSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] flex flex-col">
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <span className="text-base font-extrabold text-slate-900">
                Counter Bill · <span className="font-urdu">کاؤنٹر بل</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {registerContent}
          </div>
        </div>
      )}

      {/* Quick Price Edit Modal */}
      {editingPriceProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveQuickPrice}
            className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900 font-urdu">
                {editingPriceProduct.urduName} · قیمت
              </span>
              <button
                type="button"
                onClick={() => setEditingPriceProduct(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              min="1"
              autoFocus
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-slate-100 font-mono text-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="w-full min-h-[46px] rounded-2xl bg-emerald-600 text-white font-bold text-sm"
            >
              Save · محفوظ کریں
            </button>
          </form>
        </div>
      )}

      {/* Instant Receipt Modal */}
      {lastCompletedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">
                Nazim Dukan · ناظم دکان
              </div>
              <div className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                {lastCompletedOrder.orderNumber} · {PLATFORM_META[lastCompletedOrder.platform].urduLabel}
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums mt-1">
                {formatRs(lastCompletedOrder.total)}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 space-y-2 max-h-40 overflow-y-auto">
              {lastCompletedOrder.items.map((it) => (
                <div key={it.productId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <ProductVisual
                      imageUrl={it.imageUrl}
                      artKey={it.artKey}
                      alt={it.name}
                      className="w-7 h-7 rounded-lg shrink-0"
                    />
                    <span className="font-semibold text-slate-800 truncate">
                      {it.qty}× {it.urduName}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatRs(it.price * it.qty)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLastCompletedOrder(null)}
              className="w-full min-h-[48px] rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.98]"
            >
              Theek Hai · ٹھیک ہے
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
