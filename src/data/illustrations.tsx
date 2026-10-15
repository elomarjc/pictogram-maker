import type React from 'react';

export interface IllustrationItem {
  id: string;
  name: string;
  category: string;
  svg: (props: { className?: string }) => React.JSX.Element;
}

export const ILLUSTRATIONS: Record<string, IllustrationItem> = {
  vasketoj: {
    id: 'vasketoj',
    name: 'Vasketøj (vaskemaskine & tørresnor)',
    category: 'Pligter',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="70" height="80" rx="10" fill="#E2E8F0" stroke="#1E293B" strokeWidth="3" />
        <circle cx="40" cy="55" r="24" fill="#93C5FD" stroke="#1E293B" strokeWidth="3" />
        <circle cx="40" cy="55" r="16" fill="#3B82F6" opacity="0.4" />
        <path d="M30 55 C35 48 45 62 50 55" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <rect x="15" y="18" width="16" height="8" rx="2" fill="#CBD5E1" />
        <circle cx="55" cy="22" r="4" fill="#64748B" />
        {/* Detergent bottle */}
        <path d="M85 45 H100 V90 H85 Z" fill="#10B981" stroke="#1E293B" strokeWidth="2.5" />
        <rect x="89" y="38" width="7" height="7" rx="1" fill="#34D399" stroke="#1E293B" strokeWidth="2" />
        {/* Laundry basket */}
        <path d="M108 50 L114 90 H152 L158 50 Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
        <path d="M106 48 Q133 42 160 48" stroke="#1E293B" strokeWidth="2.5" />
        <path d="M112 55 Q133 35 154 55" fill="#3B82F6" stroke="#1E293B" strokeWidth="2" />
        <path d="M120 48 Q135 25 146 48" fill="#EC4899" stroke="#1E293B" strokeWidth="2" />
      </svg>
    ),
  },
  kaffe: {
    id: 'kaffe',
    name: 'Kaffe & The hygge',
    category: 'Mad & Drikke',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Person holding cup */}
        <ellipse cx="50" cy="52" rx="22" ry="26" fill="#FED7AA" stroke="#1E293B" strokeWidth="3" />
        <path d="M32 46 Q40 40 48 46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 46 Q62 40 70 46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="42" cy="49" r="2.5" fill="#1E293B" />
        <circle cx="60" cy="49" r="2.5" fill="#1E293B" />
        <path d="M44 64 Q51 72 60 64" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        {/* Coffee cup with steam */}
        <rect x="85" y="45" width="40" height="38" rx="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <path d="M125 52 C135 52 135 70 125 70" stroke="#1E293B" strokeWidth="3" fill="none" />
        {/* Steam */}
        <path d="M96 35 Q92 24 98 15" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M106 32 Q102 21 108 12" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M116 35 Q112 24 118 15" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Coffee pot */}
        <path d="M135 35 L145 35 L152 82 H130 Z" fill="#334155" stroke="#1E293B" strokeWidth="2.5" />
      </svg>
    ),
  },
  medicin: {
    id: 'medicin',
    name: 'Medicin & Vand',
    category: 'Sundhed',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Medicine bottle */}
        <rect x="80" y="32" width="36" height="52" rx="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <rect x="86" y="22" width="24" height="10" rx="3" fill="#EF4444" stroke="#1E293B" strokeWidth="2.5" />
        {/* Red cross on bottle */}
        <rect x="94" y="52" width="8" height="14" fill="#EF4444" />
        <rect x="91" y="55" width="14" height="8" fill="#EF4444" />
        {/* Glass with water */}
        <path d="M126 30 L132 84 H154 L160 30 Z" fill="#BAE6FD" stroke="#1E293B" strokeWidth="3" />
        <path d="M128 48 L132 80 H152 L156 48 Z" fill="#60A5FA" opacity="0.6" />
        {/* Big Pill */}
        <g transform="translate(10, 20) rotate(-25)">
          <path d="M20 20 H50 A15 15 0 0 1 50 50 H20 Z" fill="#EF4444" stroke="#1E293B" strokeWidth="3" />
          <path d="M20 20 H5 A15 15 0 0 0 5 50 H20 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        </g>
      </svg>
    ),
  },
  badetid: {
    id: 'badetid',
    name: 'Badetid (bruser & sæbe)',
    category: 'Hygiejne',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shower head */}
        <path d="M40 8 H95 V25" stroke="#64748B" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M80 25 L110 25 L118 36 L72 36 Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" />
        {/* Water drops */}
        <circle cx="82" cy="46" r="2.5" fill="#38BDF8" />
        <circle cx="95" cy="48" r="2.5" fill="#38BDF8" />
        <circle cx="108" cy="46" r="2.5" fill="#38BDF8" />
        <circle cx="78" cy="62" r="3" fill="#38BDF8" />
        <circle cx="95" cy="66" r="3" fill="#38BDF8" />
        <circle cx="112" cy="62" r="3" fill="#38BDF8" />
        {/* Person in shower with bubbles on head */}
        <circle cx="95" cy="78" r="20" fill="#FED7AA" stroke="#1E293B" strokeWidth="2.5" />
        <ellipse cx="85" cy="62" rx="7" ry="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
        <ellipse cx="95" cy="58" rx="8" ry="7" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
        <ellipse cx="105" cy="62" rx="7" ry="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
        {/* Happy eyes */}
        <path d="M88 76 Q92 72 96 76" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <path d="M98 76 Q102 72 106 76" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  spisetid: {
    id: 'spisetid',
    name: 'Spisetid (frokost & aftensmad)',
    category: 'Mad & Drikke',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Fork */}
        <path d="M22 18 V45 M17 18 V30 C17 38 27 38 27 30 V18 M22 45 V84" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        {/* Plate */}
        <circle cx="80" cy="52" r="38" fill="#F8FAFC" stroke="#1E293B" strokeWidth="3.5" />
        <circle cx="80" cy="52" r="28" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
        {/* Food: potatoes & meatballs */}
        <circle cx="72" cy="46" r="9" fill="#B45309" stroke="#1E293B" strokeWidth="2" />
        <circle cx="88" cy="44" r="8" fill="#B45309" stroke="#1E293B" strokeWidth="2" />
        <circle cx="75" cy="62" r="8" fill="#FCD34D" stroke="#1E293B" strokeWidth="2" />
        <circle cx="90" cy="60" r="7" fill="#10B981" stroke="#1E293B" strokeWidth="2" />
        {/* Knife */}
        <path d="M138 18 C144 26 144 48 138 52 V84 H134 V18 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  aktiviteter: {
    id: 'aktiviteter',
    name: 'Aktiviteter & Hobby',
    category: 'Aktiviteter',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soccer ball */}
        <circle cx="35" cy="50" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <polygon points="35,38 43,45 40,54 30,54 27,45" fill="#1E293B" />
        {/* Paint palette */}
        <path d="M100 25 C125 20 145 35 145 60 C145 75 130 85 110 82 C102 80 98 72 90 75 C82 78 80 85 70 80 C60 72 65 50 80 35 C88 27 92 25 100 25 Z" fill="#FDE68A" stroke="#1E293B" strokeWidth="3" />
        <circle cx="125" cy="40" r="5" fill="#EF4444" />
        <circle cx="132" cy="56" r="5" fill="#3B82F6" />
        <circle cx="118" cy="70" r="5" fill="#10B981" />
        <circle cx="95" cy="60" r="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
      </svg>
    ),
  },
  vaske_op: {
    id: 'vaske_op',
    name: 'Vaske op (opvask)',
    category: 'Pligter',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Water tap */}
        <path d="M30 65 V28 C30 18 50 18 50 28 V38" stroke="#64748B" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Stack of dishes */}
        <ellipse cx="110" cy="75" rx="35" ry="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <ellipse cx="110" cy="64" rx="33" ry="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <ellipse cx="110" cy="53" rx="31" ry="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        {/* Bubbles */}
        <circle cx="68" cy="45" r="7" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="82" cy="35" r="9" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="98" cy="38" r="6" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
        {/* Soap bottle */}
        <rect x="135" y="42" width="18" height="35" rx="4" fill="#10B981" stroke="#1E293B" strokeWidth="2.5" />
        <rect x="140" y="35" width="8" height="7" rx="1" fill="#34D399" stroke="#1E293B" strokeWidth="2" />
      </svg>
    ),
  },
  bolle: {
    id: 'bolle',
    name: 'Bolle / Eftermiddagskaffe',
    category: 'Mad & Drikke',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Golden brown bun */}
        <ellipse cx="80" cy="54" rx="55" ry="32" fill="#D97706" stroke="#1E293B" strokeWidth="4" />
        <ellipse cx="80" cy="50" rx="48" ry="24" fill="#F59E0B" opacity="0.6" />
        {/* Sesame seeds */}
        <ellipse cx="60" cy="42" rx="3" ry="1.5" fill="#FEF3C7" />
        <ellipse cx="78" cy="38" rx="3" ry="1.5" fill="#FEF3C7" />
        <ellipse cx="98" cy="43" rx="3" ry="1.5" fill="#FEF3C7" />
        <ellipse cx="70" cy="52" rx="3" ry="1.5" fill="#FEF3C7" />
        <ellipse cx="90" cy="54" rx="3" ry="1.5" fill="#FEF3C7" />
        <ellipse cx="108" cy="50" rx="3" ry="1.5" fill="#FEF3C7" />
      </svg>
    ),
  },
  sengetid: {
    id: 'sengetid',
    name: 'Sengetid & Godnat',
    category: 'Rutine',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bed headboard and frame */}
        <rect x="15" y="35" width="12" height="52" rx="3" fill="#1E293B" />
        <rect x="140" y="55" width="10" height="32" rx="3" fill="#1E293B" />
        {/* Mattress and blanket */}
        <rect x="25" y="55" width="120" height="26" rx="6" fill="#1E3A8A" stroke="#1E293B" strokeWidth="3" />
        {/* Pillow */}
        <ellipse cx="45" cy="52" rx="15" ry="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
        {/* Sleeping face */}
        <circle cx="50" cy="48" r="9" fill="#FED7AA" />
        <path d="M47 48 Q50 51 53 48" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        {/* Z Z Z */}
        <text x="80" y="32" fontFamily="sans-serif" fontSize="16" fontWeight="bold" fill="#3B82F6">Z</text>
        <text x="96" y="24" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="#3B82F6">Z</text>
        <text x="116" y="16" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#2563EB">Z</text>
      </svg>
    ),
  },
  pause_sofa: {
    id: 'pause_sofa',
    name: 'Pause på sofaen',
    category: 'Afslapning',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cozy sofa */}
        <rect x="20" y="42" width="120" height="35" rx="8" fill="#6EE7B7" stroke="#1E293B" strokeWidth="3" />
        <rect x="15" y="32" width="15" height="45" rx="6" fill="#34D399" stroke="#1E293B" strokeWidth="3" />
        <rect x="130" y="32" width="15" height="45" rx="6" fill="#34D399" stroke="#1E293B" strokeWidth="3" />
        {/* Cushion / Pillow */}
        <ellipse cx="45" cy="50" rx="12" ry="10" fill="#FCD34D" stroke="#1E293B" strokeWidth="2.5" />
        {/* Legs */}
        <line x1="26" y1="77" x2="26" y2="88" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <line x1="134" y1="77" x2="134" y2="88" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        {/* Heart above */}
        <path d="M80 26 C80 18 70 14 65 20 C60 26 80 34 80 34 C80 34 100 26 95 20 C90 14 80 18 80 26 Z" fill="#F43F5E" />
      </svg>
    ),
  },
  gatur: {
    id: 'gatur',
    name: 'Gåtur / Frisk luft',
    category: 'Aktiviteter',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Path and trees */}
        <path d="M10 85 Q80 75 150 85" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
        {/* Tree */}
        <rect x="125" y="50" width="8" height="30" fill="#78350F" />
        <circle cx="129" cy="40" r="20" fill="#10B981" stroke="#1E293B" strokeWidth="2.5" />
        {/* Walking person stick figure / shoes */}
        <circle cx="55" cy="25" r="10" fill="#FED7AA" stroke="#1E293B" strokeWidth="2.5" />
        <line x1="55" y1="35" x2="55" y2="60" stroke="#1E293B" strokeWidth="3.5" />
        <line x1="55" y1="45" x2="40" y2="55" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <line x1="55" y1="45" x2="70" y2="52" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <line x1="55" y1="60" x2="42" y2="82" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="55" y1="60" x2="68" y2="80" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  rede_seng: {
    id: 'rede_seng',
    name: 'Rede seng',
    category: 'Pligter',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="45" width="120" height="36" rx="6" fill="#F8FAFC" stroke="#1E293B" strokeWidth="3" />
        <rect x="30" y="32" width="40" height="22" rx="4" fill="#60A5FA" stroke="#1E293B" strokeWidth="2.5" />
        <path d="M75 52 H135 V75 H75 Z" fill="#93C5FD" stroke="#1E293B" strokeWidth="2.5" />
        <line x1="28" y1="81" x2="28" y2="90" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="132" y1="81" x2="132" y2="90" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  tv_skaerm: {
    id: 'tv_skaerm',
    name: 'TV / Fjernsyn / Skærm',
    category: 'Afslapning',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="16" width="110" height="64" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
        <rect x="32" y="22" width="96" height="52" rx="4" fill="#38BDF8" />
        <polygon points="72,40 72,56 88,48" fill="#FFFFFF" />
        <rect x="70" y="80" width="20" height="10" fill="#334155" />
        <rect x="55" y="90" width="50" height="4" rx="2" fill="#1E293B" />
      </svg>
    ),
  },
  skraldespand: {
    id: 'skraldespand',
    name: 'Skraldespand & Flasker',
    category: 'Pligter',
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 160 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bin lid */}
        <rect x="50" y="20" width="60" height="8" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />
        <rect x="72" y="14" width="16" height="6" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />
        {/* Bin body */}
        <path d="M54 28 L60 84 H100 L106 28 Z" fill="#64748B" stroke="#1E293B" strokeWidth="3" />
        <line x1="70" y1="36" x2="72" y2="76" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="36" x2="80" y2="76" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="36" x2="88" y2="76" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        {/* Bottle */}
        <rect x="120" y="45" width="14" height="38" rx="3" fill="#10B981" stroke="#1E293B" strokeWidth="2" />
        <rect x="124" y="38" width="6" height="7" fill="#10B981" stroke="#1E293B" strokeWidth="1.5" />
      </svg>
    ),
  },
};
