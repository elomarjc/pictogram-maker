import type React from 'react';
import {
  Coffee,
  Utensils,
  Pill,
  ShowerHead,
  Sparkles,
  Shirt,
  Moon,
  Sun,
  Tv,
  Smartphone,
  Bed,
  BedDouble,
  Trash2,
  Bike,
  Music,
  Palette,
  Car,
  ShoppingBag,
  ShoppingCart,
  Apple,
  Heart,
  BookOpen,
  Trees,
  Waves,
  Gamepad2,
  Clock,
  Smile,
  Home,
  CheckCircle2,
  Brush,
  Footprints,
  Dumbbell,
  Wrench,
  UtensilsCrossed,
} from 'lucide-react';

export interface IconItem {
  id: string;
  name: string;
  category: 'Mad & Drikke' | 'Hygiejne & Pleje' | 'Pligter' | 'Aktiviteter' | 'Rutine & Ro';
  icon: React.ComponentType<{ className?: string; size?: number; color?: string; strokeWidth?: number }>;
}

export const ICONS: Record<string, IconItem> = {
  // Mad & Drikke
  coffee: { id: 'coffee', name: 'Kaffe / The', category: 'Mad & Drikke', icon: Coffee },
  utensils: { id: 'utensils', name: 'Spisetid (bestik)', category: 'Mad & Drikke', icon: Utensils },
  utensils_crossed: { id: 'utensils_crossed', name: 'Middag / Forberede mad', category: 'Mad & Drikke', icon: UtensilsCrossed },
  apple: { id: 'apple', name: 'Frugt / Snack', category: 'Mad & Drikke', icon: Apple },
  bun: { id: 'bun', name: 'Bolle / Brød', category: 'Mad & Drikke', icon: Coffee },

  // Hygiejne & Pleje
  pill: { id: 'pill', name: 'Medicin', category: 'Hygiejne & Pleje', icon: Pill },
  shower: { id: 'shower', name: 'Badetid', category: 'Hygiejne & Pleje', icon: ShowerHead },
  sparkles: { id: 'sparkles', name: 'Børste tænder / Rent', category: 'Hygiejne & Pleje', icon: Sparkles },
  heart: { id: 'heart', name: 'Sundhed / Omsorg', category: 'Hygiejne & Pleje', icon: Heart },

  // Pligter
  shirt: { id: 'shirt', name: 'Vasketøj (tøj)', category: 'Pligter', icon: Shirt },
  trash: { id: 'trash', name: 'Skraldespand', category: 'Pligter', icon: Trash2 },
  bed_make: { id: 'bed_make', name: 'Rede seng', category: 'Pligter', icon: BedDouble },
  shopping: { id: 'shopping', name: 'Handle / Indkøb', category: 'Pligter', icon: ShoppingCart },
  shopping_bag: { id: 'shopping_bag', name: 'Varer / Pant', category: 'Pligter', icon: ShoppingBag },
  brush: { id: 'brush', name: 'Gøre rent / Vaske op', category: 'Pligter', icon: Brush },
  tools: { id: 'tools', name: 'Praktisk arbejde', category: 'Pligter', icon: Wrench },

  // Aktiviteter
  walk: { id: 'walk', name: 'Gåtur', category: 'Aktiviteter', icon: Footprints },
  bike: { id: 'bike', name: 'Cykle', category: 'Aktiviteter', icon: Bike },
  palette: { id: 'palette', name: 'Kreativ / Perler / Male', category: 'Aktiviteter', icon: Palette },
  music: { id: 'music', name: 'Musik i stalden', category: 'Aktiviteter', icon: Music },
  trees: { id: 'trees', name: 'Haven / Ud i naturen', category: 'Aktiviteter', icon: Trees },
  car: { id: 'car', name: 'Køretur / Tur', category: 'Aktiviteter', icon: Car },
  swim: { id: 'swim', name: 'Svømme / Svømmehal', category: 'Aktiviteter', icon: Waves },
  games: { id: 'games', name: 'Spil / Gaming', category: 'Aktiviteter', icon: Gamepad2 },
  book: { id: 'book', name: 'Læse / Kigge i bog', category: 'Aktiviteter', icon: BookOpen },
  workout: { id: 'workout', name: 'Gymnastik / I salen', category: 'Aktiviteter', icon: Dumbbell },

  // Rutine & Ro
  bed: { id: 'bed', name: 'Sengetid / Sove', category: 'Rutine & Ro', icon: Bed },
  moon: { id: 'moon', name: 'Godnat / Aften', category: 'Rutine & Ro', icon: Moon },
  sun: { id: 'sun', name: 'Morgenrutine / Dag', category: 'Rutine & Ro', icon: Sun },
  tv: { id: 'tv', name: 'TV / Fjernsyn', category: 'Rutine & Ro', icon: Tv },
  phone: { id: 'phone', name: 'Telefon / Tablet', category: 'Rutine & Ro', icon: Smartphone },
  clock: { id: 'clock', name: 'Pause / Tid', category: 'Rutine & Ro', icon: Clock },
  smile: { id: 'smile', name: 'Slap af / Hygge', category: 'Rutine & Ro', icon: Smile },
  home: { id: 'home', name: 'Hjem til far / Hjemme', category: 'Rutine & Ro', icon: Home },
  check: { id: 'check', name: 'Færdig / Godkendt', category: 'Rutine & Ro', icon: CheckCircle2 },
};

export const COLOR_PRESETS = [
  { id: 'pink', name: 'Lyserød', bg: '#FCE7F3', border: '#1E293B', text: '#1E293B' },
  { id: 'yellow', name: 'Solgul', bg: '#FEF08A', border: '#1E293B', text: '#1E293B' },
  { id: 'green', name: 'Mintgrøn', bg: '#BBF7D0', border: '#1E293B', text: '#1E293B' },
  { id: 'blue', name: 'Himmelblå', bg: '#BAE6FD', border: '#1E293B', text: '#1E293B' },
  { id: 'orange', name: 'Fersken', bg: '#FED7AA', border: '#1E293B', text: '#1E293B' },
  { id: 'purple', name: 'Lavendel', bg: '#E9D5FF', border: '#1E293B', text: '#1E293B' },
  { id: 'slate', name: 'Lys grå', bg: '#F1F5F9', border: '#1E293B', text: '#1E293B' },
  { id: 'white', name: 'Klassisk hvid', bg: '#FFFFFF', border: '#1E293B', text: '#1E293B' },
];
