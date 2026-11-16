import React from 'react';

export type SmartAppIconType =
  | 'pos'
  | 'scan'
  | 'grains'
  | 'oil'
  | 'dairy'
  | 'snacks'
  | 'homecare'
  | 'stock'
  | 'khata'
  | 'clients'
  | 'categories'
  | 'charts'
  | 'orders'
  | 'add';

interface SmartAppIconProps {
  type: SmartAppIconType;
  className?: string;
}

export const SmartAppIcon: React.FC<SmartAppIconProps> = ({ type, className = 'w-full h-full' }) => {
  switch (type) {
    case 'pos':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-pos" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-pos)" />
          <path d="M16 24H23L28 49H56L62 30H25" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="59" r="4.5" fill="#FFFFFF" />
          <circle cx="52" cy="59" r="4.5" fill="#FFFFFF" />
          <rect x="33" y="21" width="18" height="14" rx="3" fill="#FEF08A" />
          <path d="M37 28L40.5 31.5L47 25" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'scan':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-scan" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-scan)" />
          <path d="M18 28V20C18 18.9 18.9 18 20 18H28" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M52 18H60C61.1 18 62 18.9 62 20V28" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M18 52V60C18 61.1 18.9 62 20 62H28" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M52 62H60C61.1 62 62 61.1 62 60V52" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="25" y="27" width="4" height="26" rx="1.5" fill="#F8FAFC" />
          <rect x="32" y="27" width="2.5" height="26" rx="1" fill="#E2E8F0" />
          <rect x="38" y="27" width="5" height="26" rx="1.5" fill="#F8FAFC" />
          <rect x="46" y="27" width="3" height="26" rx="1" fill="#E2E8F0" />
          <rect x="52" y="27" width="3.5" height="26" rx="1" fill="#F8FAFC" />
          <rect x="15" y="38.5" width="50" height="3.5" rx="1.75" fill="#FB7185" />
        </svg>
      );

    case 'grains':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-grains" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-grains)" />
          <path d="M23 26H53L57 62H19L23 26Z" fill="#FEF3C7" />
          <path d="M26 18H50L52 26H24L26 18Z" fill="#FDE68A" />
          <path d="M23 26H53" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="38" cy="44" r="9" fill="#F59E0B" />
          <path d="M38 38V50M38 41L34 39M38 45L42 43" stroke="#FFFBEB" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 22V58M60 28L55 24M60 35L65 31M60 42L55 38" stroke="#FFFBEB" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );

    case 'oil':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-oil" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-oil)" />
          <rect x="24" y="15" width="10" height="6" rx="2" fill="#FEF08A" />
          <path d="M21 23H37L41 34V61C41 62.6 39.6 64 38 64H20C18.4 64 17 62.6 17 61V34L21 23Z" fill="#FEF9C3" />
          <rect x="20" y="39" width="18" height="12" rx="3" fill="#F59E0B" />
          <path d="M44 45H63C63 55 58 61 53.5 61C49 61 44 55 44 45Z" fill="#FFFFFF" />
          <path d="M62 47H65C67 47 67 54 64 54H62" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M49 38C49 35 51 34 51 31M56 38C56 35 58 34 58 31" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'dairy':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-dairy" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-dairy)" />
          <path d="M21 26L26 16H38L43 26V61H21V26Z" fill="#FFFFFF" />
          <rect x="21" y="37" width="22" height="14" fill="#3B82F6" />
          <circle cx="32" cy="44" r="3.5" fill="#FFFFFF" />
          <ellipse cx="53" cy="50" rx="10" ry="12" fill="#FEF3C7" />
          <ellipse cx="59" cy="53" rx="8" ry="10" fill="#FDE68A" />
        </svg>
      );

    case 'snacks':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-snacks" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-snacks)" />
          <circle cx="33" cy="46" r="16" fill="#FDE68A" />
          <circle cx="48" cy="36" r="15" fill="#FBBF24" />
          <circle cx="44" cy="32" r="2.3" fill="#78350F" />
          <circle cx="53" cy="34" r="2.3" fill="#78350F" />
          <circle cx="48" cy="42" r="2.3" fill="#78350F" />
          <circle cx="29" cy="45" r="2.3" fill="#92400E" />
          <circle cx="34" cy="53" r="2.3" fill="#92400E" />
        </svg>
      );

    case 'homecare':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-homecare" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-homecare)" />
          <rect x="17" y="34" width="46" height="26" rx="12" fill="#FFFFFF" />
          <rect x="25" y="42" width="30" height="10" rx="5" fill="#99F6E4" />
          <circle cx="27" cy="23" r="6" fill="#CCFBF1" />
          <circle cx="43" cy="19" r="4.5" fill="#F0FDFA" />
          <circle cx="55" cy="25" r="7" fill="#CCFBF1" />
        </svg>
      );

    case 'stock':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-stock" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-stock)" />
          <rect x="17" y="40" width="21" height="21" rx="4" fill="#FDE68A" />
          <rect x="42" y="40" width="21" height="21" rx="4" fill="#FBBF24" />
          <rect x="29" y="18" width="22" height="20" rx="4" fill="#FEF3C7" />
          <rect x="37" y="18" width="6" height="8" fill="#D97706" />
          <rect x="24" y="40" width="6" height="8" fill="#B45309" />
          <rect x="50" y="40" width="6" height="8" fill="#B45309" />
        </svg>
      );

    case 'khata':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-khata" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-khata)" />
          <rect x="21" y="16" width="38" height="48" rx="6" fill="#FFFFFF" />
          <rect x="21" y="16" width="8" height="48" rx="3" fill="#DC2626" />
          <rect x="35" y="27" width="18" height="4" rx="2" fill="#CBD5E1" />
          <rect x="35" y="36" width="14" height="4" rx="2" fill="#CBD5E1" />
          <circle cx="49" cy="52" r="8" fill="#10B981" />
          <path d="M45.5 52L48 54.5L53 49.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'clients':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-clients" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-clients)" />
          <circle cx="33" cy="30" r="10" fill="#FFFFFF" />
          <path d="M17 57C17 48 24 43 33 43C42 43 49 48 49 57" fill="#FFFFFF" />
          <circle cx="53" cy="33" r="7.5" fill="#FBCFE8" />
          <path d="M46 57C47 50 51 46 57 46C61 46 64 49 65 57" fill="#FBCFE8" />
        </svg>
      );

    case 'categories':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-cats" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-cats)" />
          <rect x="17" y="17" width="20" height="20" rx="6" fill="#FFFFFF" />
          <rect x="43" y="17" width="20" height="20" rx="6" fill="#FDE68A" />
          <rect x="17" y="43" width="20" height="20" rx="6" fill="#99F6E4" />
          <rect x="43" y="43" width="20" height="20" rx="6" fill="#FFFFFF" />
        </svg>
      );

    case 'charts':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-charts" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#C026D3" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-charts)" />
          <rect x="18" y="42" width="11" height="20" rx="4" fill="#FDE047" />
          <rect x="34.5" y="30" width="11" height="32" rx="4" fill="#34D399" />
          <rect x="51" y="20" width="11" height="42" rx="4" fill="#FFFFFF" />
          <path d="M21 31L39 20L56 14" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'orders':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-orders" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-orders)" />
          <path d="M22 17H58V63L52 59L46 63L40 59L34 63L28 59L22 63V17Z" fill="#FFFFFF" />
          <rect x="29" y="26" width="22" height="4" rx="2" fill="#94A3B8" />
          <rect x="29" y="35" width="16" height="4" rx="2" fill="#CBD5E1" />
          <rect x="29" y="45" width="22" height="5" rx="2" fill="#10B981" />
        </svg>
      );

    case 'add':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none">
          <defs>
            <linearGradient id="bg-add" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#bg-add)" />
          <rect x="20" y="22" width="40" height="36" rx="10" fill="#FFFFFF" fillOpacity="0.22" />
          <path d="M40 27V53M27 40H53" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" />
        </svg>
      );
  }
};
