import React, { useState } from 'react';
import { VisualArtKey } from '../types/pos';

interface ProductVisualProps {
  imageUrl?: string;
  artKey: VisualArtKey;
  alt: string;
  className?: string;
}

const ART_BG: Record<VisualArtKey, string> = {
  atta: 'bg-gradient-to-br from-amber-50 to-orange-100/70',
  rice: 'bg-gradient-to-br from-stone-50 to-amber-50',
  daal: 'bg-gradient-to-br from-yellow-50 to-amber-100/70',
  oil: 'bg-gradient-to-br from-amber-50 to-yellow-100',
  sugar: 'bg-gradient-to-br from-sky-50 to-blue-100/70',
  tea: 'bg-gradient-to-br from-rose-50 to-red-100/60',
  salt: 'bg-gradient-to-br from-cyan-50 to-sky-100',
  milk: 'bg-gradient-to-br from-blue-50 to-sky-100',
  eggs: 'bg-gradient-to-br from-orange-50 to-amber-100',
  butter: 'bg-gradient-to-br from-yellow-50 to-amber-100',
  biscuits: 'bg-gradient-to-br from-amber-50 to-orange-100',
  soda: 'bg-gradient-to-br from-rose-50 to-red-100',
  chips: 'bg-gradient-to-br from-orange-50 to-amber-100',
  detergent: 'bg-gradient-to-br from-indigo-50 to-blue-100',
  soap: 'bg-gradient-to-br from-emerald-50 to-teal-100',
  spices: 'bg-gradient-to-br from-red-50 to-orange-100',
};

function VectorArt({ artKey }: { artKey: VisualArtKey }) {
  switch (artKey) {
    case 'atta':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <path d="M21 25H59L63 65H17L21 25Z" fill="#E3B57E" stroke="#9A5B13" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M25 16H55L57 25H23L25 16Z" fill="#F3CFA0" stroke="#9A5B13" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="40" cy="45" r="10" fill="#FEF3C7" />
          <path d="M40 38V52M40 41L36 39M40 45L44 43" stroke="#92400E" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'rice':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <path d="M16 42H64C64 56 54 64 40 64C26 64 16 56 16 42Z" fill="#1E293B" />
          <path d="M20 42C20 29 30 23 40 23C50 23 60 29 60 42H20Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="32" cy="35" r="2" fill="#CBD5E1" />
          <circle cx="42" cy="32" r="2" fill="#CBD5E1" />
          <circle cx="49" cy="37" r="2" fill="#CBD5E1" />
        </svg>
      );
    case 'daal':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <circle cx="40" cy="42" r="22" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
          <circle cx="33" cy="36" r="4.5" fill="#F59E0B" />
          <circle cx="46" cy="35" r="4.5" fill="#D97706" />
          <circle cx="39" cy="46" r="5" fill="#F59E0B" />
          <circle cx="49" cy="48" r="4" fill="#B45309" />
          <circle cx="30" cy="47" r="4" fill="#D97706" />
        </svg>
      );
    case 'oil':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="34" y="12" width="12" height="8" rx="2" fill="#D97706" />
          <path d="M30 22H50L56 36V64C56 66.2 54.2 68 52 68H28C25.8 68 24 66.2 24 64V36L30 22Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
          <rect x="28" y="42" width="24" height="14" rx="3" fill="#FFFBEB" />
          <path d="M40 45C40 45 36 49 36 51.5C36 53.5 37.8 55 40 55C42.2 55 44 53.5 44 51.5C44 49 40 45 40 45Z" fill="#F59E0B" />
        </svg>
      );
    case 'sugar':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="20" y="18" width="40" height="48" rx="9" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="3" />
          <rect x="20" y="34" width="40" height="17" fill="#0284C7" />
          <rect x="34" y="38" width="12" height="9" rx="2" fill="#FFFFFF" />
          <path d="M27 25H53" stroke="#BAE6FD" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'tea':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="18" y="22" width="32" height="42" rx="5" fill="#DC2626" />
          <rect x="16" y="18" width="36" height="6" rx="3" fill="#991B1B" />
          <path d="M46 46H64C64 56 59 62 55 62C51 62 46 56 46 46Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="2.5" />
        </svg>
      );
    case 'salt':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <path d="M26 26H54L50 64H30L26 26Z" fill="#FFFFFF" stroke="#0891B2" strokeWidth="2.5" />
          <path d="M28 26C28 19 52 19 52 26" fill="#06B6D4" />
          <circle cx="40" cy="45" r="7" fill="#CFFAFE" />
        </svg>
      );
    case 'milk':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <path d="M26 26L32 16H48L54 26V64H26V26Z" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />
          <rect x="27" y="38" width="26" height="16" fill="#2563EB" />
          <circle cx="40" cy="46" r="4" fill="#FFFFFF" />
        </svg>
      );
    case 'eggs':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="14" y="43" width="52" height="20" rx="7" fill="#D6D3D1" />
          <ellipse cx="27" cy="36" rx="8.5" ry="12" fill="#FDE68A" stroke="#D97706" strokeWidth="2.2" />
          <ellipse cx="40" cy="33" rx="8.5" ry="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.2" />
          <ellipse cx="53" cy="36" rx="8.5" ry="12" fill="#FDE68A" stroke="#D97706" strokeWidth="2.2" />
        </svg>
      );
    case 'butter':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="13" y="46" width="54" height="12" rx="5" fill="#E2E8F0" />
          <rect x="19" y="27" width="42" height="21" rx="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
          <path d="M26 35H43" stroke="#FEF9C3" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'biscuits':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <circle cx="36" cy="44" r="18" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="46" cy="34" r="16" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="42" cy="30" r="2.2" fill="#92400E" />
          <circle cx="50" cy="32" r="2.2" fill="#92400E" />
          <circle cx="46" cy="39" r="2.2" fill="#92400E" />
        </svg>
      );
    case 'soda':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="33" y="10" width="14" height="7" rx="2" fill="#991B1B" />
          <path d="M33 17H47L53 32V64C53 66.2 51.2 68 49 68H31C28.8 68 27 66.2 27 64V32L33 17Z" fill="#DC2626" />
          <rect x="27" y="38" width="26" height="12" fill="#FFFFFF" />
          <circle cx="40" cy="44" r="3.5" fill="#DC2626" />
        </svg>
      );
    case 'chips':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="20" y="16" width="40" height="48" rx="7" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
          <circle cx="40" cy="40" r="12" fill="#FDE047" />
          <path d="M24 22H56M24 58H56" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'detergent':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <path d="M19 21H61L63 65H17L19 21Z" fill="#4F46E5" stroke="#312E81" strokeWidth="2.5" />
          <circle cx="40" cy="44" r="12" fill="#FFFFFF" />
          <circle cx="40" cy="44" r="6" fill="#38BDF8" />
          <circle cx="53" cy="29" r="3" fill="#C7D2FE" />
        </svg>
      );
    case 'soap':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="15" y="30" width="50" height="27" rx="13" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
          <circle cx="28" cy="21" r="5.5" fill="#A7F3D0" />
          <circle cx="54" cy="19" r="4.5" fill="#A7F3D0" />
          <rect x="25" y="39" width="30" height="9" rx="4.5" fill="#D1FAE5" />
        </svg>
      );
    case 'spices':
      return (
        <svg viewBox="0 0 80 80" className="w-3/5 h-3/5 drop-shadow-sm" fill="none">
          <rect x="22" y="19" width="36" height="45" rx="7" fill="#B91C1C" />
          <rect x="26" y="30" width="28" height="19" rx="4" fill="#FEF2F2" />
          <circle cx="40" cy="39.5" r="5.5" fill="#DC2626" />
        </svg>
      );
  }
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  imageUrl,
  artKey,
  alt,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imageUrl && !imgFailed) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${ART_BG[artKey] || 'bg-slate-100'} ${className}`}
      aria-label={alt}
    >
      <VectorArt artKey={artKey} />
    </div>
  );
};
