import React from 'react';

export const SunHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round">
      <line x1="32" y1="5" x2="32" y2="11" />
      <line x1="32" y1="53" x2="32" y2="59" />
      <line x1="5" y1="32" x2="11" y2="32" />
      <line x1="53" y1="32" x2="59" y2="32" />
      <line x1="13" y1="13" x2="17.5" y2="17.5" />
      <line x1="46.5" y1="46.5" x2="51" y2="51" />
      <line x1="51" y1="13" x2="46.5" y2="17.5" />
      <line x1="17.5" y1="46.5" x2="13" y2="51" />
    </g>
    <circle cx="32" cy="32" r="18" fill="#FDE047" stroke="#0F172A" strokeWidth="2.8" />
    <ellipse cx="23" cy="35" rx="3" ry="1.8" fill="#F87171" opacity="0.6" />
    <ellipse cx="41" cy="35" rx="3" ry="1.8" fill="#F87171" opacity="0.6" />
    <ellipse cx="25.5" cy="29" rx="1.8" ry="2.4" fill="#0F172A" />
    <circle cx="26.2" cy="28" r="0.8" fill="#FFFFFF" />
    <ellipse cx="38.5" cy="29" rx="1.8" ry="2.4" fill="#0F172A" />
    <circle cx="39.2" cy="28" r="0.8" fill="#FFFFFF" />
    <path d="M 27 34 Q 32 39 37 34" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </svg>
);

export const CloudHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 17 44 C 11 44 8 39 8 34 C 8 28 13 25 18 25 C 20 18 27 15 34 15 C 42 15 48 20 49 26 C 54 26 58 30 58 35 C 58 40 54 44 49 44 Z"
      fill="#FFFFFF"
      stroke="#0F172A"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path
      d="M 12 41 C 18 43 45 43 54 41 C 56 39 57 37 57 35 C 57 31 54 28 50 28 C 49 28 48 28 47 29 C 46 38 35 41 23 41 C 18 41 14 39 12 37 C 11 39 11 40 12 41 Z"
      fill="#BAE6FD"
      opacity="0.55"
    />
    <ellipse cx="24" cy="35" rx="2.5" ry="1.5" fill="#F87171" opacity="0.6" />
    <ellipse cx="42" cy="35" rx="2.5" ry="1.5" fill="#F87171" opacity="0.6" />
    <path d="M 25 30 Q 27.5 27 30 30" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M 36 30 Q 38.5 27 41 30" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M 31 34 Q 33.5 37 36 34" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const SunCloudHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round">
      <line x1="22" y1="6" x2="22" y2="10" />
      <line x1="9" y1="19" x2="13" y2="19" />
      <line x1="13" y1="10" x2="16" y2="13" />
      <line x1="31" y1="10" x2="28" y2="13" />
    </g>
    <circle cx="22" cy="22" r="12" fill="#FDE047" stroke="#0F172A" strokeWidth="2.5" />
    <path
      d="M 23 50 C 17 50 14 46 14 41 C 14 36 18 33 23 33 C 25 27 31 24 37 24 C 44 24 49 28 50 34 C 54 34 57 37 57 41 C 57 46 54 50 49 50 Z"
      fill="#FFFFFF"
      stroke="#0F172A"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <path
      d="M 18 47 C 23 49 46 49 53 47 C 55 45 56 43 56 41 C 56 38 54 35 50 35 C 49 35 48 35 47 36 C 46 44 37 47 27 47 C 23 47 19 45 18 43 Z"
      fill="#BAE6FD"
      opacity="0.5"
    />
    <path d="M 33 42 Q 35.5 45 38 42" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

export const MoonHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 48 14 L 50 19 L 55 21 L 50 23 L 48 28 L 46 23 L 41 21 L 46 19 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="1.8" />
    <circle cx="16" cy="18" r="1.5" fill="#0F172A" />
    <path
      d="M 38 10 C 24 10 13 21 13 35 C 13 49 24 60 38 60 C 44 60 49 58 53 54 C 36 53 28 39 31 24 C 33 17 38 12 43 10 C 41 10 40 10 38 10 Z"
      fill="#FEF08A"
      stroke="#0F172A"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M 23 32 Q 26 35 29 32" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <ellipse cx="23" cy="38" rx="2.5" ry="1.5" fill="#F87171" opacity="0.6" />
    <path d="M 26 40 Q 29 43 32 40" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const MoonStarsHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 46 12 L 48 16 L 52 17 L 48 19 L 46 23 L 44 19 L 40 17 L 44 16 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="1.8" />
    <path d="M 50 32 L 51.5 35 L 55 36 L 51.5 37.5 L 50 41 L 48.5 37.5 L 45 36 L 48.5 35 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="1.6" />
    <circle cx="41" cy="48" r="1.8" fill="#FDE047" stroke="#0F172A" strokeWidth="1.4" />
    <path
      d="M 33 11 C 21 11 11 21 11 34 C 11 47 21 57 33 57 C 39 57 44 55 47 51 C 32 50 25 38 27 24 C 29 17 33 13 38 11 C 36 11 35 11 33 11 Z"
      fill="#FEF08A"
      stroke="#0F172A"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M 21 33 Q 23.5 36 26 33" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <ellipse cx="20" cy="38" rx="2" ry="1.2" fill="#F87171" opacity="0.6" />
  </svg>
);

export const StarHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 32 8 L 38 23 L 54 24 L 41 34 L 46 50 L 32 40 L 18 50 L 23 34 L 10 24 L 26 23 Z"
      fill="#FDE047"
      stroke="#0F172A"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <ellipse cx="26" cy="33" rx="2.2" ry="1.4" fill="#F87171" opacity="0.6" />
    <ellipse cx="38" cy="33" rx="2.2" ry="1.4" fill="#F87171" opacity="0.6" />
    <circle cx="28" cy="28" r="1.6" fill="#0F172A" />
    <circle cx="28.5" cy="27.5" r="0.6" fill="#FFFFFF" />
    <circle cx="36" cy="28" r="1.6" fill="#0F172A" />
    <circle cx="36.5" cy="27.5" r="0.6" fill="#FFFFFF" />
    <path d="M 30 33 Q 32 36 34 33" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const CoffeeHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 22 17 Q 24 13 22 9" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M 29 15 Q 31 11 29 7" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M 36 17 Q 38 13 36 9" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M 40 28 C 48 28 51 32 51 38 C 51 44 47 47 40 47" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    <rect x="15" y="22" width="28" height="30" rx="6" fill="#FDE047" stroke="#0F172A" strokeWidth="2.8" />
    <ellipse cx="29" cy="24" rx="11" ry="3" fill="#78350F" />
    <path d="M 26 38 Q 29 41 32 38" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const BedHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="18" width="6" height="34" rx="2" fill="#FDE047" stroke="#0F172A" strokeWidth="2.5" />
    <rect x="50" y="32" width="5" height="20" rx="2" fill="#FDE047" stroke="#0F172A" strokeWidth="2.5" />
    <rect x="16" y="34" width="35" height="13" rx="3" fill="#93C5FD" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M 28 34 L 28 47" stroke="#0F172A" strokeWidth="2" />
    <rect x="16" y="27" width="11" height="8" rx="2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" />
  </svg>
);

export const HeartHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 32 54 C 32 54 10 39 10 24 C 10 16 16 11 23 11 C 28 11 31 14 32 17 C 33 14 36 11 41 11 C 48 11 54 16 54 24 C 54 39 32 54 32 54 Z"
      fill="#FB7185"
      stroke="#0F172A"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M 18 19 Q 20 15 25 15" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </svg>
);

export const HomeHeaderIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="16" width="6" height="12" fill="#FB923C" stroke="#0F172A" strokeWidth="2.2" />
    <path d="M 10 29 L 32 12 L 54 29 Z" fill="#FB923C" stroke="#0F172A" strokeWidth="2.8" strokeLinejoin="round" />
    <rect x="16" y="29" width="32" height="23" fill="#FEF08A" stroke="#0F172A" strokeWidth="2.8" />
    <rect x="27" y="38" width="10" height="14" rx="1.5" fill="#60A5FA" stroke="#0F172A" strokeWidth="2.2" />
    <circle cx="34" cy="45" r="1" fill="#0F172A" />
  </svg>
);

export interface HeaderIconDef {
  id: string;
  name: string;
  category: 'dag' | 'aften' | 'generel';
  component: React.FC<{ className?: string }> | null;
}

export const HEADER_ICONS: Record<string, HeaderIconDef> = {
  sun: {
    id: 'sun',
    name: 'Sol (Morgen / Dag)',
    category: 'dag',
    component: SunHeaderIcon,
  },
  cloud: {
    id: 'cloud',
    name: 'Sky (Dag)',
    category: 'dag',
    component: CloudHeaderIcon,
  },
  sun_cloud: {
    id: 'sun_cloud',
    name: 'Sol & sky',
    category: 'dag',
    component: SunCloudHeaderIcon,
  },
  coffee: {
    id: 'coffee',
    name: 'Kaffe (Morgen)',
    category: 'dag',
    component: CoffeeHeaderIcon,
  },
  moon: {
    id: 'moon',
    name: 'Måne (Aften)',
    category: 'aften',
    component: MoonHeaderIcon,
  },
  star: {
    id: 'star',
    name: 'Stjerne (Aften)',
    category: 'aften',
    component: StarHeaderIcon,
  },
  moon_stars: {
    id: 'moon_stars',
    name: 'Måne & stjerner (Nat)',
    category: 'aften',
    component: MoonStarsHeaderIcon,
  },
  bed: {
    id: 'bed',
    name: 'Seng (Sengetid)',
    category: 'aften',
    component: BedHeaderIcon,
  },
  heart: {
    id: 'heart',
    name: 'Hjerte (Hygge)',
    category: 'generel',
    component: HeartHeaderIcon,
  },
  home: {
    id: 'home',
    name: 'Hjem (Weekend)',
    category: 'generel',
    component: HomeHeaderIcon,
  },
  none: {
    id: 'none',
    name: 'Ingen (Skjul)',
    category: 'generel',
    component: null,
  },
};

export interface ShiftPreset {
  id: string;
  name: string;
  description: string;
  leftIcon: string;
  rightIcon: string;
}

export const SHIFT_PRESETS: ShiftPreset[] = [
  {
    id: 'dagvagt',
    name: 'Dagvagt',
    description: 'Sol & Sky',
    leftIcon: 'sun',
    rightIcon: 'cloud',
  },
  {
    id: 'aftenvagt',
    name: 'Aftenvagt',
    description: 'Måne & Stjerne',
    leftIcon: 'moon',
    rightIcon: 'star',
  },
  {
    id: 'nattevagt',
    name: 'Nattevagt',
    description: 'Måne & Seng',
    leftIcon: 'moon_stars',
    rightIcon: 'bed',
  },
  {
    id: 'morgen',
    name: 'Morgenstund',
    description: 'Sol & Kaffe',
    leftIcon: 'sun',
    rightIcon: 'coffee',
  },
  {
    id: 'weekend',
    name: 'Weekend / Hjemme',
    description: 'Hjem & Hjerte',
    leftIcon: 'home',
    rightIcon: 'heart',
  },
];

export const HeaderIconDisplay: React.FC<{
  iconKey?: string;
  fallbackKey?: string;
  className?: string;
}> = ({ iconKey, fallbackKey = 'sun', className = 'w-full h-full' }) => {
  const key = iconKey || fallbackKey;
  if (key === 'none') return null;
  const def = HEADER_ICONS[key] || HEADER_ICONS[fallbackKey];
  if (!def || !def.component) return null;
  const Comp = def.component;
  return <Comp className={className} />;
};
