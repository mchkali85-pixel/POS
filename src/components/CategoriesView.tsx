import React, { useMemo, useState } from 'react';
import {
  FolderPlus,
  ChevronRight,
  FolderOpen,
  ImagePlus,
  Trash2,
  Edit3,
  ShoppingCart,
  X,
} from 'lucide-react';
import { CategoryNode, Product } from '../types/pos';
import { getCategoryTrail, getDescendantIds } from '../data/visualMeta';
import { readAndResizeImage } from '../utils/imageUpload';

interface CategoriesViewProps {
  categories: CategoryNode[];
  products: Product[];
  onAddCategory: (cat: Omit<CategoryNode, 'id'>) => void;
  onUpdateCategory: (cat: CategoryNode) => void;
  onDeleteCategory: (catId: string) => void;
  onOpenPosCategory: (categoryId: string) => void;
}

const COLOR_OPTIONS = [
  '#D97706',
  '#F97316',
  '#0284C7',
  '#F43F5E',
  '#059669',
  '#4F46E5',
  '#9333EA',
  '#0F172A',
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onOpenPosCategory,
}) => {
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryNode | null>(null);

  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [colorHex, setColorHex] = useState(COLOR_OPTIONS[0]);
  const [imageUrl, setImageUrl] = useState('');

  const trail = useMemo(
    () => (currentParentId ? getCategoryTrail(currentParentId, categories) : []),
    [currentParentId, categories]
  );

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.parentId === currentParentId),
    [categories, currentParentId]
  );

  const openAddModal = () => {
    setEditingCat(null);
    setName('');
    setUrduName('');
    setColorHex(COLOR_OPTIONS[visibleCategories.length % COLOR_OPTIONS.length]);
    setImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryNode) => {
    setEditingCat(cat);
    setName(cat.name);
    setUrduName(cat.urduName);
    setColorHex(cat.colorHex);
    setImageUrl(cat.imageUrl || '');
    setModalOpen(true);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAndResizeImage(file, 360);
      setImageUrl(dataUrl);
    } catch {
      // ignore invalid image
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !urduName.trim()) return;
    const cleanName = name.trim() || urduName.trim();
    const cleanUrdu = urduName.trim() || name.trim();

    if (editingCat) {
      onUpdateCategory({
        ...editingCat,
        name: cleanName,
        urduName: cleanUrdu,
        colorHex,
        imageUrl: imageUrl.trim() || undefined,
      });
    } else {
      onAddCategory({
        name: cleanName,
        urduName: cleanUrdu,
        parentId: currentParentId,
        colorHex,
        imageUrl: imageUrl.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  const currentLevelLabel =
    trail.length === 0
      ? 'Main Categories · مین کیٹیگری'
      : trail.length === 1
      ? 'Sub-Categories · سب کیٹیگری'
      : `Level ${trail.length + 1} · مزید سب کیٹیگری`;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top Breadcrumb + Add Category Button */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-500">{currentLevelLabel}</div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
            <button
              type="button"
              onClick={() => setCurrentParentId(null)}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                currentParentId === null
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sab · سب
            </button>
            {trail.map((node, idx) => {
              const isLast = idx === trail.length - 1;
              return (
                <React.Fragment key={node.id}>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <button
                    type="button"
                    onClick={() => setCurrentParentId(node.id)}
                    className={`px-3 py-1.5 rounded-xl font-urdu transition-colors ${
                      isLast
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {node.urduName} · {node.name}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="min-h-[46px] px-5 rounded-2xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>
            {currentParentId ? 'Add Sub-Category · نئی سب کیٹیگری' : 'Add Category · نئی کیٹیگری'}
          </span>
        </button>
      </div>

      {/* Categories Grid */}
      {visibleCategories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-500">
            Is ke andar koi sub-category nahi · اس کے اندر کوئی سب کیٹیگری نہیں
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="min-h-[44px] px-5 rounded-2xl bg-slate-900 text-white text-xs font-bold"
          >
            + Add Sub-Category · شامل کریں
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleCategories.map((cat) => {
            const subCount = categories.filter((c) => c.parentId === cat.id).length;
            const descendantIds = getDescendantIds(cat.id, categories);
            const itemCount = products.filter((p) => descendantIds.has(p.categoryId)).length;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Visual Top Clickable to Drill Down */}
                <button
                  type="button"
                  onClick={() => setCurrentParentId(cat.id)}
                  className="text-left group focus:outline-none"
                >
                  <div
                    className="h-32 w-full relative overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: cat.imageUrl ? '#F1F5F9' : cat.colorHex }}
                  >
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <span className="text-3xl font-extrabold font-urdu text-white/95 drop-shadow-sm">
                        {cat.urduName}
                      </span>
                    )}
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/55 text-white text-[11px] font-mono font-bold backdrop-blur-xs tabular-nums">
                      {subCount} sub · {itemCount} items
                    </span>
                  </div>

                  <div className="p-4 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-slate-900 font-urdu truncate">
                        {cat.urduName}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    <div className="text-xs font-semibold text-slate-500 truncate">{cat.name}</div>
                  </div>
                </button>

                {/* Actions Row */}
                <div className="px-4 pb-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenPosCategory(cat.id)}
                    className="flex-1 min-h-[40px] rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>POS · بل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    aria-label="Edit category"
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    aria-label="Delete category"
                    className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSave}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                {editingCat ? 'Edit · ترمیم' : 'New Category · نئی کیٹیگری'}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Image Upload + Preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200"
                style={{ backgroundColor: imageUrl ? '#F1F5F9' : colorHex }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold font-urdu text-white">
                    {urduName || 'تصویر'}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
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
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs font-bold text-rose-600"
                  >
                    Remove Photo · تصویر ہٹائیں
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
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

            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColorHex(hex)}
                  className={`w-9 h-9 rounded-full transition-transform ${
                    colorHex === hex ? 'ring-3 ring-slate-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={hex}
                />
              ))}
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
