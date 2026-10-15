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

export type CardFontSize = 'sm' | 'base' | 'lg' | 'xl';

export interface Pictogram {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  iconId: string; // ID from icon registry
  illustrationId?: string; // Predefined person drawing illustration (like the example image)
  customImageUrl?: string; // Base64 data URL if user uploaded a picture locally
  bgColor: string; // Card background color
  borderColor?: string;
  textColor?: string;
  fontSize?: CardFontSize;
}

export interface DaySchedule {
  dayId: DayOfWeek;
  dayName: string;
  headerSubtitle?: string; // e.g. "AV" or "Aften" or "Dag"
  pictograms: Pictogram[];
}

export interface WeekPlan {
  id: string;
  name: string;
  description?: string;
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
  days: Record<DayOfWeek, { headerSubtitle?: string; pictograms: Omit<Pictogram, 'id'>[] }>;
}
