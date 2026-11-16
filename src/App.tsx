import React, { useEffect, useState } from 'react';
import {
  LayoutGrid,
  ShoppingCart,
  Boxes,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import {
  AppTab,
  CategoryNode,
  Client,
  CustomHomeShortcut,
  Order,
  PlatformId,
  Product,
} from './types/pos';
import {
  INITIAL_CATEGORIES,
  INITIAL_CLIENTS,
  INITIAL_CUSTOM_SHORTCUTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
} from './data/initialData';
import { getDescendantIds } from './data/visualMeta';
import { AppHome } from './components/AppHome';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { CategoriesView } from './components/CategoriesView';
import { ClientsView } from './components/ClientsView';
import { AnalyticsView } from './components/AnalyticsView';
import { OrdersView } from './components/OrdersView';
import { KhataView } from './components/KhataView';

const STORAGE_CATEGORIES_KEY = 'nazim_dukan_categories_v3';
const STORAGE_PRODUCTS_KEY = 'nazim_dukan_products_v3';
const STORAGE_ORDERS_KEY = 'nazim_dukan_orders_v3';
const STORAGE_CLIENTS_KEY = 'nazim_dukan_clients_v3';
const STORAGE_SHORTCUTS_KEY = 'nazim_dukan_shortcuts_v3';

const CLIENT_COLORS = [
  'bg-amber-500',
  'bg-emerald-600',
  'bg-sky-600',
  'bg-violet-600',
  'bg-rose-500',
];

function loadSavedArray<T>(key: string, fallback: T[], requireNonEmpty = false): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && (!requireNonEmpty || parsed.length > 0)) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return fallback;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [posCategoryId, setPosCategoryId] = useState<string | 'All'>('All');
  const [scanPulse, setScanPulse] = useState(0);
  const [openAddPulse, setOpenAddPulse] = useState(0);

  const [categories, setCategories] = useState<CategoryNode[]>(() =>
    loadSavedArray(STORAGE_CATEGORIES_KEY, INITIAL_CATEGORIES, true)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadSavedArray(STORAGE_PRODUCTS_KEY, INITIAL_PRODUCTS, true)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadSavedArray(STORAGE_ORDERS_KEY, INITIAL_ORDERS)
  );
  const [clients, setClients] = useState<Client[]>(() =>
    loadSavedArray(STORAGE_CLIENTS_KEY, INITIAL_CLIENTS, true)
  );
  const [customShortcuts, setCustomShortcuts] = useState<CustomHomeShortcut[]>(() =>
    loadSavedArray(STORAGE_SHORTCUTS_KEY, INITIAL_CUSTOM_SHORTCUTS)
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));
    } catch {
      // ignore
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SHORTCUTS_KEY, JSON.stringify(customShortcuts));
    } catch {
      // ignore
    }
  }, [customShortcuts]);

  const handleOpenPosCategory = (categoryId: string | 'All', autoScan?: boolean) => {
    setPosCategoryId(categoryId);
    setActiveTab('pos');
    if (autoScan) {
      setScanPulse((p) => p + 1);
    }
  };

  const handleOpenAddStock = () => {
    setActiveTab('stock');
    setOpenAddPulse((p) => p + 1);
  };

  const handleCompleteOrder = (
    draft: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>
  ): Order => {
    const nextNum = 401 + orders.length;
    const now = Date.now();
    const newOrder: Order = {
      ...draft,
      id: `ord-${now}`,
      orderNumber: `#${nextNum}`,
      createdAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);

    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = draft.items.find((it) => it.productId === prod.id);
        if (!soldItem) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - soldItem.qty),
        };
      })
    );

    if (draft.payment === 'udhaar' && draft.clientId) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== draft.clientId) return c;
          return {
            ...c,
            udhaarBalance: c.udhaarBalance + draft.total,
            udhaarSince: c.udhaarSince ?? now,
          };
        })
      );
    }

    return newOrder;
  };

  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const nextStock = Math.max(0, prod.stock + delta);
        return {
          ...prod,
          stock: nextStock,
          maxStock: Math.max(prod.maxStock, nextStock),
        };
      })
    );
  };

  const handleQuickUpdatePrice = (productId: string, nextPrice: number) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === productId ? { ...prod, price: Math.max(1, nextPrice) } : prod
      )
    );
  };

  const handleTogglePlatform = (productId: string, platform: PlatformId) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const exists = prod.platforms.includes(platform);
        const nextPlatforms = exists
          ? prod.platforms.filter((p) => p !== platform)
          : [...prod.platforms, platform];
        return {
          ...prod,
          platforms: nextPlatforms,
        };
      })
    );
  };

  const handleAddProduct = (draft: Omit<Product, 'id'>) => {
    const created: Product = {
      ...draft,
      id: `kar-${Date.now()}`,
    };
    setProducts((prev) => [created, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleAddCategory = (draft: Omit<CategoryNode, 'id'>) => {
    const created: CategoryNode = {
      ...draft,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, created]);
  };

  const handleUpdateCategory = (updated: CategoryNode) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteCategory = (catId: string) => {
    const target = categories.find((c) => c.id === catId);
    const toRemove = getDescendantIds(catId, categories);
    const remaining = categories.filter((c) => !toRemove.has(c.id));
    const fallbackCategoryId =
      (target?.parentId && !toRemove.has(target.parentId) ? target.parentId : null) ||
      remaining[0]?.id ||
      '';

    setCategories(remaining);
    if (fallbackCategoryId) {
      setProducts((prev) =>
        prev.map((p) =>
          toRemove.has(p.categoryId) ? { ...p, categoryId: fallbackCategoryId } : p
        )
      );
    }
    if (posCategoryId !== 'All' && toRemove.has(posCategoryId)) {
      setPosCategoryId('All');
    }
  };

  const handleAddClient = (
    draft: Omit<Client, 'id' | 'serialNo' | 'createdAt'>
  ) => {
    const maxSerial = clients.reduce((m, c) => Math.max(m, c.serialNo), 0);
    const now = Date.now();
    const created: Client = {
      ...draft,
      id: `cl-${now}`,
      serialNo: maxSerial + 1,
      color: draft.color || CLIENT_COLORS[clients.length % CLIENT_COLORS.length],
      udhaarSince: draft.udhaarBalance > 0 ? draft.udhaarSince ?? now : null,
      createdAt: now,
    };
    setClients((prev) => [...prev, created]);
  };

  const handleUpdateClient = (updated: Client) => {
    const now = Date.now();
    setClients((prev) =>
      prev.map((c) =>
        c.id === updated.id
          ? {
              ...updated,
              udhaarSince:
                updated.udhaarBalance > 0
                  ? updated.udhaarSince ?? c.udhaarSince ?? now
                  : null,
            }
          : c
      )
    );
  };

  const handleAdjustKhata = (clientId: string, delta: number) => {
    const now = Date.now();
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const nextBalance = Math.max(0, c.udhaarBalance + delta);
        return {
          ...c,
          udhaarBalance: nextBalance,
          udhaarSince:
            nextBalance === 0
              ? null
              : c.udhaarBalance === 0
              ? now
              : c.udhaarSince ?? now,
        };
      })
    );
  };

  const handleClearKhata = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, udhaarBalance: 0, udhaarSince: null }
          : c
      )
    );
  };

  const handleAddShortcut = (draft: Omit<CustomHomeShortcut, 'id'>) => {
    const created: CustomHomeShortcut = {
      ...draft,
      id: `sc-${Date.now()}`,
    };
    setCustomShortcuts((prev) => [...prev, created]);
  };

  const handleRemoveShortcut = (id: string) => {
    setCustomShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  const topNavItems: Array<{ id: AppTab; label: string }> = [
    { id: 'home', label: 'Home · ہوم' },
    { id: 'pos', label: 'Bill · بل' },
    { id: 'categories', label: 'Categories · کیٹیگری' },
    { id: 'stock', label: 'Stock · اسٹاک' },
    { id: 'clients', label: 'Clients · گاہک' },
    { id: 'khata', label: 'Khata · کھاتہ' },
    { id: 'charts', label: 'Report · رپورٹ' },
  ];

  const mobileDockItems: Array<{ id: AppTab; label: string; Icon: React.ElementType }> = [
    { id: 'home', label: 'ہوم', Icon: LayoutGrid },
    { id: 'pos', label: 'بل POS', Icon: ShoppingCart },
    { id: 'stock', label: 'اسٹاک', Icon: Boxes },
    { id: 'khata', label: 'کھاتہ', Icon: BookOpen },
    { id: 'charts', label: 'رپورٹ', Icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F6] text-slate-900 pb-20 md:pb-6">
      {/* Clean 3-Zone Full-Width Top Bar */}
      <header className="md:sticky md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg"
          >
            Nazim Dukan
          </button>

          <nav className="hidden md:flex items-center gap-5 overflow-x-auto no-scrollbar">
            {topNavItems.map(({ id, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? 'text-emerald-700 border-emerald-600'
                      : 'text-slate-500 border-transparent hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => handleOpenPosCategory('All')}
            className="min-h-[38px] px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 active:scale-95"
          >
            Naya Bill · نیا بل
          </button>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'home' && (
          <AppHome
            categories={categories}
            products={products}
            orders={orders}
            clients={clients}
            customShortcuts={customShortcuts}
            onOpenPosCategory={handleOpenPosCategory}
            onNavigate={setActiveTab}
            onOpenAddStock={handleOpenAddStock}
            onAddShortcut={handleAddShortcut}
            onRemoveShortcut={handleRemoveShortcut}
          />
        )}

        {activeTab === 'pos' && (
          <PosView
            categories={categories}
            products={products}
            clients={clients}
            selectedCategoryId={posCategoryId}
            onSelectCategoryId={setPosCategoryId}
            scanPulse={scanPulse}
            onCompleteOrder={handleCompleteOrder}
            onQuickUpdatePrice={handleQuickUpdatePrice}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            products={products}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onOpenPosCategory={(categoryId) => handleOpenPosCategory(categoryId)}
          />
        )}

        {activeTab === 'stock' && (
          <InventoryView
            categories={categories}
            products={products}
            openAddPulse={openAddPulse}
            onAdjustStock={handleAdjustStock}
            onTogglePlatform={handleTogglePlatform}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            orders={orders}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {activeTab === 'khata' && (
          <KhataView
            clients={clients}
            onAdjustBalance={handleAdjustKhata}
            onClearBalance={handleClearKhata}
            onAddClient={handleAddClient}
          />
        )}

        {activeTab === 'charts' && (
          <AnalyticsView
            categories={categories}
            products={products}
            orders={orders}
            clients={clients}
            onQuickRestock={handleAdjustStock}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView orders={orders} clients={clients} />
        )}
      </main>

      {/* Mobile Bottom Dock */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80"
      >
        <div className="grid grid-cols-5 items-center h-14">
          {mobileDockItems.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
                <span className="text-[10px] font-bold font-urdu tracking-tight whitespace-nowrap">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
