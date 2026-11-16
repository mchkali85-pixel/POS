import React, { useEffect, useMemo, useState } from 'react';
import {
  Store,
  Globe,
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  X,
  Edit3,
  ImagePlus,
} from 'lucide-react';
import { CategoryNode, PlatformId, Product, VisualArtKey } from '../types/pos';
import {
  formatRs,
  getCategoryTrail,
  getDescendantIds,
  PLATFORM_META,
} from '../data/visualMeta';
import { ProductVisual } from './ProductVisual';
import { readAndResizeImage } from '../utils/imageUpload';

interface InventoryViewProps {
  categories: CategoryNode[];
  products: Product[];
  openAddPulse: number;
  onAdjustStock: (productId: string, delta: number) => void;
  onTogglePlatform: (productId: string, platform: PlatformId) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
}

const ART_CHOICES: VisualArtKey[] = [
  'atta',
  'rice',
  'daal',
  'oil',
  'tea',
  'sugar',
  'spices',
  'milk',
  'eggs',
  'butter',
  'biscuits',
  'soda',
  'chips',
  'detergent',
  'soap',
  'salt',
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  categories,
  products,
  openAddPulse,
  onAdjustStock,
  onTogglePlatform,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformId>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newName, setNewName] = useState('');
  const [newUrduName, setNewUrduName] = useState('');
  const [newUnit, setNewUnit] = useState('1kg');
  const [newCategoryId, setNewCategoryId] = useState<string>(categories[0]?.id || 'cat-grains');
  const [newPrice, setNewPrice] = useState('250');
  const [newStock, setNewStock] = useState('25');
  const [newArt, setNewArt] = useState<VisualArtKey>('atta');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newPlatforms, setNewPlatforms] = useState<PlatformId[]>(['store', 'whatsapp']);

  const openAddModal = () => {
    setEditingProduct(null);
    setNewName('');
    setNewUrduName('');
    setNewUnit('1kg');
    setNewCategoryId(categories[0]?.id || 'cat-grains');
    setNewPrice('250');
    setNewStock('25');
    setNewArt('atta');
    setNewImageUrl('');
    setNewPlatforms(['store', 'whatsapp']);
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setNewName(prod.name);
    setNewUrduName(prod.urduName);
    setNewUnit(prod.unit);
    setNewCategoryId(prod.categoryId);
    setNewPrice(String(prod.price));
    setNewStock(String(prod.stock));
    setNewArt(prod.artKey);
    setNewImageUrl(prod.imageUrl || '');
    setNewPlatforms(prod.platforms);
    setModalOpen(true);
  };

  useEffect(() => {
    if (openAddPulse > 0) {
      openAddModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAddPulse]);

  const rootCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories]
  );

  const filtered = useMemo(() => {
    const allowedCats =
      categoryFilter === 'all' ? null : getDescendantIds(categoryFilter, categories);

    return products.filter((p) => {
      if (platformFilter !== 'all' && !p.platforms.includes(platformFilter)) return false;
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
  }, [products, categories, platformFilter, categoryFilter, search]);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAndResizeImage(file, 420);
      setNewImageUrl(dataUrl);
    } catch {
      // ignore
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() && !newUrduName.trim()) return;
    const stockNum = Math.max(0, parseInt(newStock, 10) || 10);
    const priceNum = Math.max(1, parseFloat(newPrice) || 100);
    const cleanName = newName.trim() || newUrduName.trim();
    const cleanUrdu = newUrduName.trim() || newName.trim();

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: cleanName,
        urduName: cleanUrdu,
        unit: newUnit.trim() || '1kg',
        categoryId: newCategoryId,
        price: priceNum,
        stock: stockNum,
        maxStock: Math.max(editingProduct.maxStock, stockNum),
        artKey: newArt,
        imageUrl: newImageUrl.trim() || undefined,
        platforms: newPlatforms.length > 0 ? newPlatforms : ['store'],
      });
    } else {
      onAddProduct({
        name: cleanName,
        urduName: cleanUrdu,
        unit: newUnit.trim() || '1kg',
        categoryId: newCategoryId,
        price: priceNum,
        stock: stockNum,
        maxStock: Math.max(40, stockNum),
        sku: `KR-${Math.floor(600 + Math.random() * 350)}`,
        artKey: newArt,
        imageUrl: newImageUrl.trim() || undefined,
        platforms: newPlatforms.length > 0 ? newPlatforms : ['store'],
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Platform Filter Strip + Add Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-white rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setPlatformFilter('all')}
            className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              platformFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sab · سب ({products.length})
          </button>
          {(
            [
              { id: 'store', Icon: Store },
              { id: 'web', Icon: Globe },
              { id: 'market', Icon: ShoppingBag },
              { id: 'whatsapp', Icon: MessageCircle },
            ] as const
          ).map(({ id, Icon }) => {
            const count = products.filter((p) => p.platforms.includes(id)).length;
            const active = platformFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlatformFilter(id)}
                className={`min-h-[42px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? PLATFORM_META[id].colorClass
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{PLATFORM_META[id].urduLabel}</span>
                <span className="font-mono opacity-80 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Talash · تلاش"
              aria-label="Search Karyana inventory"
              className="w-full min-h-[44px] pl-9 pr-3 rounded-2xl bg-white border border-slate-200/80 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 active:scale-95 transition-transform whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add · نیا</span>
          </button>
        </div>
      </div>

      {/* Category Filter Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap ${
            categoryFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Sab · سب
        </button>
        {rootCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap ${
              categoryFilter === cat.id
                ? 'text-white'
                : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
            style={categoryFilter === cat.id ? { backgroundColor: cat.colorHex } : undefined}
          >
            <span className="font-urdu">{cat.urduName}</span> · {cat.name}
          </button>
        ))}
      </div>

      {/* Stock Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="text-sm font-bold text-slate-500">Koi item nahi · کوئی سامان نہیں</div>
          <button
            type="button"
            onClick={() => {
              setPlatformFilter('all');
              setCategoryFilter('all');
              setSearch('');
            }}
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Reset · دوبارہ دیکھیں
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const pct = Math.min(100, Math.round((item.stock / Math.max(1, item.maxStock)) * 100));
            const isOut = item.stock <= 0;
            const isLow = item.stock > 0 && item.stock <= 10;
            const catTrail = getCategoryTrail(item.categoryId, categories);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 flex flex-col justify-between gap-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductVisual
                      imageUrl={item.imageUrl}
                      artKey={item.artKey}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-base font-bold text-slate-900 font-urdu truncate">
                        {item.urduName}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 truncate">
                        {item.name} · {item.unit}
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="mt-0.5 inline-flex items-center gap-1 text-sm font-mono font-extrabold text-emerald-700 hover:text-emerald-800 tabular-nums"
                      >
                        <span>{formatRs(item.price)}</span>
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onAdjustStock(item.id, -1)}
                      aria-label="Decrease stock"
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-extrabold text-slate-900 tabular-nums">
                      {item.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdjustStock(item.id, 1)}
                      aria-label="Increase stock"
                      className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 truncate font-urdu">
                  {catTrail.map((c) => c.urduName).join(' › ')}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span
                      className={`flex items-center gap-1.5 ${
                        isOut
                          ? 'text-rose-600'
                          : isLow
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isOut ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : isLow ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isOut ? 'Khatam · ختم' : isLow ? 'Kam · کم' : 'Theek · ٹھیک'}
                      </span>
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {item.stock}/{item.maxStock}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        isOut
                          ? 'bg-rose-500'
                          : isLow
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {(
                    [
                      { id: 'store', Icon: Store },
                      { id: 'web', Icon: Globe },
                      { id: 'market', Icon: ShoppingBag },
                      { id: 'whatsapp', Icon: MessageCircle },
                    ] as const
                  ).map(({ id, Icon }) => {
                    const synced = item.platforms.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onTogglePlatform(item.id, id)}
                        className={`min-h-[38px] rounded-xl flex items-center justify-center gap-1 text-[10px] font-bold transition-all active:scale-95 ${
                          synced
                            ? PLATFORM_META[id].colorClass
                            : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-urdu truncate">{PLATFORM_META[id].urduLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal with Custom Image Upload & Price Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSave}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                {editingProduct ? 'Edit Item · ترمیم' : 'Naya Saman · نیا سامان'}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Image Upload */}
            <div className="flex items-center gap-3">
              <ProductVisual
                imageUrl={newImageUrl || undefined}
                artKey={newArt}
                alt="Preview"
                className="w-18 h-18 rounded-2xl shrink-0 border border-slate-200"
              />
              <div className="flex-1 space-y-1.5">
                <label className="min-h-[42px] px-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800">
                  <ImagePlus className="w-4 h-4" />
                  <span>Upload Image · تصویر لگائیں</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                </label>
                {newImageUrl && (
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('')}
                    className="text-xs font-bold text-rose-600"
                  >
                    Use Default Icon · ہٹائیں
                  </button>
                )}
              </div>
            </div>

            {/* Preset Art Picker */}
            <div className="grid grid-cols-8 gap-1.5">
              {ART_CHOICES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setNewArt(key);
                    setNewImageUrl('');
                  }}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-transform active:scale-95 ${
                    !newImageUrl && newArt === key
                      ? 'border-slate-900 scale-105'
                      : 'border-transparent'
                  }`}
                >
                  <ProductVisual artKey={key} alt={key} className="w-full h-full" />
                </button>
              ))}
            </div>

            {/* Category / Sub-Category Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Category · کیٹیگری
              </label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-bold text-slate-900"
              >
                {categories.map((c) => {
                  const trailText = getCategoryTrail(c.id, categories)
                    .map((n) => n.urduName)
                    .join(' › ');
                  return (
                    <option key={c.id} value={c.id}>
                      {trailText} ({c.name})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Roman Name"
                className="min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                type="text"
                value={newUrduName}
                onChange={(e) => setNewUrduName(e.target.value)}
                placeholder="اردو نام"
                dir="rtl"
                className="min-h-[46px] px-3.5 rounded-2xl bg-slate-100 text-sm font-bold font-urdu text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Wazan · وزن
                </label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="1kg"
                  className="w-full min-h-[46px] px-3 rounded-2xl bg-slate-100 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Qeemat · قیمت
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-2xl bg-slate-100 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Stock · تعداد
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-2xl bg-slate-100 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'store', Icon: Store },
                  { id: 'web', Icon: Globe },
                  { id: 'market', Icon: ShoppingBag },
                  { id: 'whatsapp', Icon: MessageCircle },
                ] as const
              ).map(({ id, Icon }) => {
                const active = newPlatforms.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setNewPlatforms((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                      )
                    }
                    className={`min-h-[42px] rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold ${
                      active ? PLATFORM_META[id].colorClass : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="font-urdu">{PLATFORM_META[id].urduLabel}</span>
                  </button>
                );
              })}
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
