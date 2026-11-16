export type PlatformId = 'store' | 'web' | 'market' | 'whatsapp';

export type AppTab =
  | 'home'
  | 'pos'
  | 'stock'
  | 'categories'
  | 'clients'
  | 'khata'
  | 'charts'
  | 'orders';

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'udhaar';

export type VisualArtKey =
  | 'atta'
  | 'rice'
  | 'daal'
  | 'oil'
  | 'sugar'
  | 'tea'
  | 'salt'
  | 'milk'
  | 'eggs'
  | 'butter'
  | 'biscuits'
  | 'soda'
  | 'chips'
  | 'detergent'
  | 'soap'
  | 'spices';

export interface CategoryNode {
  id: string;
  name: string;
  urduName: string;
  parentId: string | null;
  colorHex: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  urduName: string;
  unit: string;
  categoryId: string;
  price: number;
  stock: number;
  maxStock: number;
  sku: string;
  imageUrl?: string;
  artKey: VisualArtKey;
  platforms: PlatformId[];
}

export interface CartItem {
  productId: string;
  name: string;
  urduName: string;
  unit: string;
  price: number;
  qty: number;
  categoryId: string;
  imageUrl?: string;
  artKey: VisualArtKey;
}

export interface Client {
  id: string;
  serialNo: number;
  name: string;
  urduName: string;
  phone: string;
  address: string;
  udhaarBalance: number;
  udhaarSince: number | null;
  color: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  platform: PlatformId;
  payment: PaymentMethod;
  clientId?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  createdAt: number;
}

export interface CustomHomeShortcut {
  id: string;
  label: string;
  urduLabel: string;
  targetTab: AppTab;
  categoryId?: string;
  colorHex: string;
  imageUrl?: string;
}
