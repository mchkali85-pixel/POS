import { CategoryNode, PlatformId } from '../types/pos';

export const PLATFORM_META: Record<
  PlatformId,
  {
    label: string;
    urduLabel: string;
    colorClass: string;
    barHex: string;
  }
> = {
  store: {
    label: 'Dukaan',
    urduLabel: 'دکان',
    colorClass: 'bg-slate-900 text-white',
    barHex: '#0F172A',
  },
  web: {
    label: 'Web',
    urduLabel: 'ویب',
    colorClass: 'bg-indigo-600 text-white',
    barHex: '#4F46E5',
  },
  market: {
    label: 'Delivery',
    urduLabel: 'ڈیلیوری',
    colorClass: 'bg-sky-600 text-white',
    barHex: '#0284C7',
  },
  whatsapp: {
    label: 'WhatsApp',
    urduLabel: 'واٹس ایپ',
    colorClass: 'bg-emerald-600 text-white',
    barHex: '#16A34A',
  },
};

export function formatRs(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString('en-US')}`;
}

export function getRootCategory(
  categoryId: string,
  categories: CategoryNode[]
): CategoryNode | undefined {
  let current = categories.find((c) => c.id === categoryId);
  const visited = new Set<string>();
  while (current && current.parentId && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = categories.find((c) => c.id === current!.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

export function getDescendantIds(
  rootId: string,
  categories: CategoryNode[]
): Set<string> {
  const result = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const cat of categories) {
      if (cat.parentId && result.has(cat.parentId) && !result.has(cat.id)) {
        result.add(cat.id);
        added = true;
      }
    }
  }
  return result;
}

export function getCategoryTrail(
  categoryId: string,
  categories: CategoryNode[]
): CategoryNode[] {
  const trail: CategoryNode[] = [];
  let current = categories.find((c) => c.id === categoryId);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    trail.unshift(current);
    current = current.parentId
      ? categories.find((c) => c.id === current!.parentId)
      : undefined;
  }
  return trail;
}
