export type DayOfWeek =
  | 'mandag'
  | 'tirsdag'
  | 'onsdag'
  | 'torsdag'
  | 'fredag'
  | 'loerdag'
  | 'soendag';

export interface DayInfo {
  id: DayOfWeek;
  name: string;
  shortName: string;
}

export const DAYS_OF_WEEK: DayInfo[] = [
  { id: 'mandag', name: 'Mandag', shortName: 'Man' },
  { id: 'tirsdag', name: 'Tirsdag', shortName: 'Tir' },
  { id: 'onsdag', name: 'Onsdag', shortName: 'Ons' },
  { id: 'torsdag', name: 'Torsdag', shortName: 'Tor' },
  { id: 'fredag', name: 'Fredag', shortName: 'Fre' },
  { id: 'loerdag', name: 'Lørdag', shortName: 'Lør' },
  { id: 'soendag', name: 'Søndag', shortName: 'Søn' },
];

export type CardFontSize = 'sm' | 'base' | 'lg' | 'xl' | number | string;

export interface Persona {
  id: string; // 'avatar_1' | 'avatar_2' | 'custom'
  name: string; // 'Avatar 1' | 'Avatar 2' | 'Tilpasset'
  shortCode: string; // 'K.' | 'A.' | ...
  avatarUrl: string;
  description?: string;
  activityScenes: Record<string, string>; // activity key -> scene image URL
}

export interface Pictogram {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  iconId: string; // ID from icon registry
  illustrationId?: string; // Predefined person drawing illustration key (e.g. 'vasketoj', 'kaffe')
  sceneImageUrl?: string; // Direct image URL for character scene (overrides persona default if set)
  rightIconUrl?: string; // Direct image URL for right pictogram symbol (overrides iconId if set)
  cardImageUrl?: string; // Whole card image URL (if using scanned full strip)
  customImageUrl?: string; // Base64 data URL if user uploaded a picture locally
  bgColor: string; // Card pastel background color
  borderColor?: string;
  textColor?: string;
  fontSize?: CardFontSize;
}

export interface DaySchedule {
  dayId: DayOfWeek;
  dayName: string;
  headerSubtitle?: string; // e.g. "K." or "AV" or "Aften" or "Dag"
  headerFontSize?: number; // Custom font size for day header banner (e.g. 28)
  headerLeftIcon?: string; // e.g. 'sun', 'moon', 'coffee', 'home', 'none'
  headerRightIcon?: string; // e.g. 'cloud', 'star', 'bed', 'heart', 'none'
  pictograms: Pictogram[];
}

export interface WeekPlan {
  id: string;
  name: string;
  description?: string;
  personaId?: string; // Active persona ID (e.g. 'avatar_1')
  shortCode?: string; // Short code/abbreviation e.g. 'K.'
  avatarUrl?: string; // Custom avatar URL if uploaded
  globalFontSize?: number; // Global text font size for cards (default 22)
  headerFontSize?: number; // Global text font size for day headers (default 28)
  days: Record<DayOfWeek, DaySchedule>;
  createdAt: string;
  updatedAt: string;
}

export type PrintLayoutMode = 'board' | 'cards';

export interface PrintSettings {
  layoutMode: PrintLayoutMode; // 'board' = daily schedule board (like example image), 'cards' = cut-out cards
  cardWidthCm: number; // e.g. 6.5 cm
  cardHeightCm: number; // e.g. 10.0 cm for cards, or row height for board
  showDayHeader: boolean;
  showHeaderIcons: boolean; // sun and cloud
  showCutLines: boolean;
  colorMode: 'color' | 'grayscale';
  scope: 'current' | 'selected' | 'all'; // current day, chosen day, or all 7 days
  targetDayId?: DayOfWeek;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  personaId?: string;
  shortCode?: string;
  days: Record<DayOfWeek, { headerSubtitle?: string; pictograms: Omit<Pictogram, 'id'>[] }>;
}
