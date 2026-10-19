import React, { useState, useRef, useEffect } from 'react';
import type { Pictogram, Persona } from '../types';
import { getPersona, SCENE_ALIAS_MAP } from '../services/personas';
import { PictogramCard } from './PictogramCard';
import {
  X,
  Upload,
  Trash2,
  Check,
  Type,
  Loader2,
  AlertCircle,
  ChevronDown,
  Clock,
  Crop,
  Wand2,
  ExternalLink,
  Play,
  Plus,
  Edit3,
  ArrowLeft,
} from 'lucide-react';
import { CropSceneModal, type CropSceneResult } from './CropSceneModal';
import { generateSingleSceneWithChatGPT, openChatGPTLogin } from '../services/chatgptGeneration';
import { getShortSceneTitle } from '../utils/sceneTitleHelper';
import { getDbItem, setDbItem } from '../services/storageDb';
import { getReadyScenesCount } from '../services/characterSceneGenerator';
import { ConfirmModal } from './ConfirmModal';

interface PictogramEditorModalProps {
  pictogram: Pictogram | null;
  isOpen: boolean;
  persona?: Persona;
  onClose: () => void;
  onSave: (pic: Pictogram) => void;
  onApplyFontSizeToAll?: (fontSize: number) => void;
  onOpenSceneGen?: (persona: Persona) => void;
}

const REFERENCE_COLOR_PRESETS = [
  { id: 'pink', name: 'Vasketøj (Lyserød)', bg: '#fbb6db' },
  { id: 'yellow', name: 'Kaffe/Morgenmad (Gul)', bg: '#fdef8c' },
  { id: 'green', name: 'Medicin (Grøn)', bg: '#c1ea9a' },
  { id: 'cyan', name: 'Badetid (Lyseblå)', bg: '#9adafd' },
  { id: 'orange', name: 'Spisetid (Fersken)', bg: '#fdc67c' },
  { id: 'purple', name: 'Aktiviteter (Lilla)', bg: '#ccadfb' },
  { id: 'mint', name: 'Vaske op (Mint)', bg: '#9ceacc' },
  { id: 'lavender', name: 'Bolle (Lavendel)', bg: '#cdb7f8' },
  { id: 'blue', name: 'Sengetid (Blå)', bg: '#97d9fc' },
  { id: 'white', name: 'Hvid (Neutral)', bg: '#ffffff' },
];

const SCENE_DESCRIPTIONS: Record<string, string> = {
  vaesketoeg: 'Hænge vasketøj op',
  kaffe: 'The & Kaffe',
  medicin: 'Medicin',
  badetid: 'Badetid',
  spisetid: 'Aftensmad / Spisetid',
  morgenmad: 'Morgenmad',
  frokost: 'Frokost (rugbrød)',
  boerste_taender: 'Børste tænder',
  aktiviteter: 'Aktiviteter & Hobby',
  vaske_op: 'Vaske op',
  bolle: 'Bolle / Mellemmåltid',
  sengetid: 'Sengetid & Sove',
  gatur: 'Gåtur / Frisk luft',
  rede_seng: 'Rede seng',
  pause_sofa: 'Pause på sofa / TV',
  skraldespand: 'Skrald & Pant',
  handle: 'Handle indkøb',
  cykeltur: 'Cykeltur / Motion',
  weekend: 'Weekendhygge',
  skifte_sengetoj: 'Skifte sengetøj',
  stovsuge: 'Støvsuge gulv',
  torre_bord: 'Tørre bord af',
  tomme_opvaskemaskine: 'Tømme opvaskemaskine',
  legge_toj_sammen: 'Lægge tøj sammen',
  forberede_mad: 'Forberede mad',
  hore_musik: 'Høre musik',
  ipad_tablet: 'iPad & Tablet',
  perler: 'Lave perleplade',
  havearbejde: 'Havearbejde & Vande',
  svommehal: 'Svømmehal',
  bus_tog: 'Bus & Tog',
  pakke_taske: 'Pakke taske',
  besog_far: 'Besøg hos familie',
  aflevere_flasker: 'Aflevere pantflasker',
  tage_jakke_paa: 'Tage overtøj på',
  drikke_vand: 'Drikke et glas vand',
  braetspil: 'Spille brætspil',
  rydde_op: 'Rydde op på værelset',
  sansehus: 'Sansehus & Sanserum',
};

// Auto-match scenes based on activity title keywords (checked in priority order)
const SCENE_MATCH_RULES: Array<{ sceneId: string; keywords: string[] }> = [
  {
    sceneId: 'boerste_taender',
    keywords: ['børste tænder', 'tandbørste', 'børst tænder', 'børste tand', 'tandbørstning', 'tandpasta', 'tænder'],
  },
  {
    sceneId: 'vaske_op',
    keywords: ['opvask', 'vaske op', 'opvaskemaskine', 'tømme opvask', 'fylde opvask'],
  },
  {
    sceneId: 'vaesketoeg',
    keywords: ['vasketøj', 'tøjvask', 'hænge tøj', 'tøj', 'vaskemaskine', 'tørretumbler', 'vask'],
  },
  {
    sceneId: 'rede_seng',
    keywords: ['rede seng', 'sengeredning', 'ordne seng', 'skifte sengetøj'],
  },
  {
    sceneId: 'sengetid',
    keywords: ['sove', 'seng', 'sengetid', 'godnat', 'putte', 'hvile', 'sovetid', 'middagslur', 'lur', 'nat'],
  },
  {
    sceneId: 'kaffe',
    keywords: ['kaffe', 'the', 'te', 'morgenkaffe', 'kop', 'formiddag'],
  },
  {
    sceneId: 'medicin',
    keywords: ['medicin', 'pille', 'piller', 'vitamin', 'læge', 'apotek', 'dråber', 'indsprøjtning'],
  },
  {
    sceneId: 'badetid',
    keywords: ['bad', 'bade', 'brusebad', 'bruse', 'karbad', 'bruser', 'vaske sig', 'toilet', 'wc'],
  },
  {
    sceneId: 'morgenmad',
    keywords: ['morgenmad', 'havregryn', 'cornflakes', 'cereal', 'morgenmåltid'],
  },
  {
    sceneId: 'frokost',
    keywords: ['frokost', 'rugbrød', 'rugbrødsmad', 'madpakke', 'frokostpause'],
  },
  {
    sceneId: 'spisetid',
    keywords: ['spis', 'spise', 'spisetid', 'mad', 'aftensmad', 'middagsmad', 'måltid', 'aftenmad', 'lave mad', 'tilberede mad', 'spisning', 'snack'],
  },
  {
    sceneId: 'bolle',
    keywords: ['bolle', 'brød', 'kage', 'mellemmåltid', 'eftermiddag', 'bageri', 'wienerbrød'],
  },
  {
    sceneId: 'gatur',
    keywords: ['gåtur', 'gå tur', 'tur', 'lufte', 'hund', 'frisk luft', 'gå', 'spadsere', 'skov', 'park', 'ud at gå'],
  },
  {
    sceneId: 'pause_sofa',
    keywords: ['sofa', 'tv', 'fjernsyn', 'film', 'serie', 'slappe af', 'afslapning', 'pause', 'læse', 'bog', 'ipad', 'computer', 'skærm', 'gaming', 'screen', 'fladskærm', 'tv-skærm'],
  },
  {
    sceneId: 'skraldespand',
    keywords: ['skrald', 'affald', 'skraldespand', 'tømme skrald', 'flasker', 'pant', 'sortere'],
  },
  {
    sceneId: 'handle',
    keywords: ['handle', 'indkøb', 'købe ind', 'supermarked', 'netto', 'rema', 'føtex', 'købmand', 'butik', 'handle ind'],
  },
  {
    sceneId: 'cykeltur',
    keywords: ['cykeltur', 'cykle', 'cykel', 'cykling'],
  },
  {
    sceneId: 'weekend',
    keywords: ['weekend', 'weekendhygge', 'søndagshygge', 'lørdagshygge'],
  },
  {
    sceneId: 'aktiviteter',
    keywords: ['aktivitet', 'hobby', 'tegne', 'male', 'puslespil', 'spil', 'krea', 'musik', 'lego', 'træning', 'motion', 'gymnastik'],
  },
];

const SCENE_COLOR_MAP: Record<string, string> = {
  vaesketoeg: '#fbb6db',
  kaffe: '#fdef8c',
  medicin: '#c1ea9a',
  badetid: '#9adafd',
  boerste_taender: '#9adafd',
  spisetid: '#fdc67c',
  morgenmad: '#fdef8c',
  frokost: '#fdc67c',
  aktiviteter: '#ccadfb',
  vaske_op: '#9ceacc',
  bolle: '#cdb7f8',
  sengetid: '#97d9fc',
  gatur: '#9adafd',
  rede_seng: '#97d9fc',
  pause_sofa: '#fdef8c',
  skraldespand: '#c1ea9a',
  handle: '#fdc67c',
  cykeltur: '#9adafd',
  weekend: '#ccadfb',
  skifte_sengetoj: '#97d9fc',
  stovsuge: '#fbb6db',
  torre_bord: '#9ceacc',
  tomme_opvaskemaskine: '#9ceacc',
  legge_toj_sammen: '#fbb6db',
  forberede_mad: '#fdc67c',
  hore_musik: '#ccadfb',
  ipad_tablet: '#fdef8c',
  perler: '#ccadfb',
  havearbejde: '#c1ea9a',
  svommehal: '#9adafd',
  bus_tog: '#9adafd',
  pakke_taske: '#cdb7f8',
  besog_far: '#fdc67c',
  aflevere_flasker: '#c1ea9a',
  tage_jakke_paa: '#9adafd',
  drikke_vand: '#9adafd',
  braetspil: '#ccadfb',
  rydde_op: '#fbb6db',
  sansehus: '#cdb7f8',
};

function findMatchingScene(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return null;
  for (const rule of SCENE_MATCH_RULES) {
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        return rule.sceneId;
      }
    }
  }
  return null;
}

export interface CustomSceneItem {
  id: string;
  url: string;
  name: string;
  originalUrl?: string;
}

const STORAGE_KEY_CUSTOM_SCENES = 'pictogram_custom_scenes';
const STORAGE_KEY_CUSTOM_ICONS = 'pictogram_custom_icons';

let memoryCustomScenes: CustomSceneItem[] | null = null;

if (typeof window !== 'undefined') {
  getDbItem<CustomSceneItem[]>(STORAGE_KEY_CUSTOM_SCENES)
    .then((items) => {
      if (items && Array.isArray(items) && items.length > 0) {
        memoryCustomScenes = items;
      }
    })
    .catch(() => {});
}

function getStoredCustomScenes(): CustomSceneItem[] {
  if (memoryCustomScenes) {
    return memoryCustomScenes;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_SCENES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const items = parsed.map((item, idx) => {
          if (typeof item === 'string') {
            return { id: `legacy_${idx}`, url: item, name: 'Eget billede' };
          }
          return item;
        });
        memoryCustomScenes = items;
        return items;
      }
    }
    // Migration from legacy array of strings
    const legacy = localStorage.getItem(STORAGE_KEY_CUSTOM_ICONS);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        const items = parsed.map((url, idx) => ({
          id: `legacy_${idx}`,
          url,
          name: 'Eget billede',
        }));
        memoryCustomScenes = items;
        return items;
      }
    }
    return [];
  } catch {
    return [];
  }
}

function saveCustomScene(item: { url: string; name: string; originalUrl?: string }): CustomSceneItem[] {
  const current = getStoredCustomScenes();
  const existingIdx = current.findIndex(
    (s) => s.url === item.url || (item.originalUrl && s.originalUrl === item.originalUrl)
  );
  const newScene: CustomSceneItem = {
    id: `scene_${Date.now()}`,
    url: item.url,
    name: item.name.trim() || 'Min scene',
    originalUrl: item.originalUrl,
  };

  let updated: CustomSceneItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = newScene;
  } else {
    updated = [newScene, ...current];
  }
  memoryCustomScenes = updated;

  // Persist to IndexedDB
  setDbItem(STORAGE_KEY_CUSTOM_SCENES, updated);

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SCENES, JSON.stringify(updated));
  } catch (err) {
    console.warn('Quota exceeded, saving slimmed custom scenes:', err);
    try {
      const slim = updated.map(({ id, url, name }) => ({ id, url, name }));
      localStorage.setItem(STORAGE_KEY_CUSTOM_SCENES, JSON.stringify(slim));
    } catch {
      // ignore
    }
  }
  return updated;
}

function deleteCustomScene(idOrUrl: string): CustomSceneItem[] {
  const current = getStoredCustomScenes();
  const updated = current.filter((s) => s.id !== idOrUrl && s.url !== idOrUrl);
  memoryCustomScenes = updated;

  setDbItem(STORAGE_KEY_CUSTOM_SCENES, updated);

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SCENES, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export const PictogramEditorModal: React.FC<PictogramEditorModalProps> = ({
  pictogram,
  isOpen,
  persona,
  onClose,
  onSave,
  onApplyFontSizeToAll,
  onOpenSceneGen,
}) => {
  if (!isOpen || !pictogram) return null;

  const activePersona = persona || getPersona();
  const [appliedToAll, setAppliedToAll] = useState(false);
  const [title, setTitle] = useState(pictogram.title);
  const [time, setTime] = useState(pictogram.time || '');
  const [illustrationId, setIllustrationId] = useState(pictogram.illustrationId || 'spisetid');
  const [sceneImageUrl, setSceneImageUrl] = useState(pictogram.sceneImageUrl || '');
  const [customImageUrl, setCustomImageUrl] = useState(pictogram.customImageUrl || '');
  const [customScenes, setCustomScenes] = useState<CustomSceneItem[]>(() => {
    const stored = getStoredCustomScenes();
    if (pictogram.customImageUrl && !stored.some((s) => s.url === pictogram.customImageUrl)) {
      return [
        {
          id: `init_${Date.now()}`,
          url: pictogram.customImageUrl,
          name: pictogram.title || 'Eget billede',
        },
        ...stored,
      ];
    }
    return stored;
  });

  // State for crop modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSource, setCropImageSource] = useState<string | null>(null);
  const [cropInitialName, setCropInitialName] = useState('');
  const [sceneToDelete, setSceneToDelete] = useState<CustomSceneItem | null>(null);

  const [bgColor, setBgColor] = useState(pictogram.bgColor || '#fdef8c');
  // Convert legacy presets to pixel numbers if needed, default to 20px
  const initialPixelSize =
    typeof pictogram.fontSize === 'number'
      ? pictogram.fontSize
      : typeof pictogram.fontSize === 'string' && /^\d+$/.test(pictogram.fontSize)
      ? Number(pictogram.fontSize)
      : pictogram.fontSize === 'xl'
      ? 24
      : pictogram.fontSize === 'lg'
      ? 20
      : pictogram.fontSize === 'sm'
      ? 14
      : 18;

  const [fontSizeNum, setFontSizeNum] = useState<number>(initialPixelSize);
  const [activeTab, setActiveTab] = useState<'illustrations' | 'upload'>('illustrations');
  const [inlineSceneText, setInlineSceneText] = useState<string>('');
  const [isManuallySelected, setIsManuallySelected] = useState<boolean>(
    Boolean(pictogram.illustrationId || pictogram.customImageUrl || pictogram.sceneImageUrl)
  );

  // ChatGPT generation state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiProgressMessage, setAiProgressMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Dropdown states for compact time, color and font size pickers
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const fontSizeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setIsTimeOpen(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target as Node)) {
        setIsColorOpen(false);
      }
      if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(e.target as Node)) {
        setIsFontSizeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!newTitle.trim()) {
      setIsManuallySelected(false);
      return;
    }
    if (!isManuallySelected) {
      const matched = findMatchingScene(newTitle);
      if (matched) {
        setIllustrationId(matched);
        setCustomImageUrl('');
        setSceneImageUrl('');
        if (SCENE_COLOR_MAP[matched]) {
          setBgColor(SCENE_COLOR_MAP[matched]);
        }
      }
    }
  };

  const handleGenerateWithAi = async () => {
    setAiError(null);
    setAiProgressMessage('Forbereder ChatGPT session...');
    setIsGeneratingAi(true);

    try {
      const userText = inlineSceneText.trim() || title.trim();
      const sceneTitle = getShortSceneTitle(userText, title);
      const safeKey = sceneTitle.toLowerCase().replace(/[^a-z0-9]/g, '_') || `scene_${Date.now()}`;

      const res = await generateSingleSceneWithChatGPT(
        activePersona.id,
        safeKey,
        userText,
        (progress) => {
          setAiProgressMessage(progress.message);
        }
      );
      if (res.sceneUrl) {
        if (activePersona.activityScenes) {
          activePersona.activityScenes[safeKey] = res.sceneUrl;
        }
        setSceneImageUrl(res.sceneUrl);
        setIllustrationId(safeKey);
        setCustomImageUrl('');
        setIsManuallySelected(true);
        if (!title.trim() || title === 'Aktivitetsnavn') {
          setTitle(sceneTitle);
        }
        setActiveTab('illustrations');
      } else {
        throw new Error('Kunne ikke hente genereret scene fra ChatGPT.');
      }
    } catch (err) {
      setAiError(
        `ChatGPT Fejl: ${err instanceof Error ? err.message : String(err)}. Sørg for at du er logget ind på chatgpt.com i browseren.`
      );
    } finally {
      setIsGeneratingAi(false);
      setAiProgressMessage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vælg venligst en gyldig billedfil (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropImageSource(reader.result);
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setCropInitialName(title.trim() && title !== 'Aktivitetsnavn' ? title.trim() : baseName);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCropSave = (result: CropSceneResult) => {
    const updated = saveCustomScene({
      url: result.dataUrl,
      name: result.name,
      originalUrl: result.originalUrl,
    });
    setCustomScenes(updated);
    setCustomImageUrl(result.dataUrl);
    setIllustrationId('');
    setSceneImageUrl('');
    if (!title.trim() || title === 'Aktivitetsnavn') {
      setTitle(result.name);
    }
    setActiveTab('illustrations');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Angiv venligst en titel på aktiviteten.');
      return;
    }

    onSave({
      ...pictogram,
      title: title.trim(),
      subtitle: undefined,
      time: time.trim() || undefined,
      iconId: pictogram.iconId,
      illustrationId: customImageUrl ? undefined : illustrationId,
      sceneImageUrl: sceneImageUrl || undefined,
      rightIconUrl: undefined,
      customImageUrl: customImageUrl || undefined,
      bgColor,
      fontSize: fontSizeNum,
    });
    onClose();
  };

  // Preview object for the live preview card
  const previewPic: Pictogram = {
    ...pictogram,
    title: title || 'Aktivitetsnavn',
    subtitle: undefined,
    time: time || undefined,
    illustrationId: customImageUrl ? undefined : illustrationId,
    sceneImageUrl: sceneImageUrl || undefined,
    rightIconUrl: undefined,
    customImageUrl: customImageUrl || undefined,
    bgColor,
    fontSize: fontSizeNum,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border-3 sm:border-4 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-xs">
              <Edit3 size={18} className="text-slate-900" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
              Rediger piktogram
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Luk"
            className="p-1 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3">
          {/* Live Preview card - snug, full-width, zero wasted gaps */}
          <div className="w-full">
            <PictogramCard
              pictogram={previewPic}
              persona={activePersona}
              viewMode="strip"
              isPreview={true}
            />
          </div>

          {/* Form row: Aktivitet, Tid, Farve dropdown, Tekststørrelse dropdown */}
          <div className="flex flex-wrap sm:flex-nowrap items-end gap-2">
            <div className="flex-1 min-w-[170px] space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Aktivitetens navn *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="F.eks. Spisetid, Morgenmad, Medicin"
                className="w-full h-10 px-3 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-sm text-slate-900 bg-white"
              />
            </div>

            {/* Klokkeslæt Dropdown */}
            <div className="relative shrink-0 space-y-1" ref={timeDropdownRef}>
              <label className="text-xs font-bold text-slate-700 block">
                Klokkeslæt
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsTimeOpen((prev) => !prev);
                  setIsColorOpen(false);
                  setIsFontSizeOpen(false);
                }}
                className="h-10 px-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs min-w-[85px] justify-between"
                title="Vælg klokkeslæt"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Clock size={13} className="text-slate-600 shrink-0" />
                  <span>{time.trim() ? time : 'Ingen'}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-600 transition-transform duration-150 ${isTimeOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTimeOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-40 p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-xl w-64 max-w-[calc(100vw-32px)] space-y-2.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Vælg klokkeslæt</span>
                    {time && (
                      <button
                        type="button"
                        onClick={() => {
                          setTime('');
                          setIsTimeOpen(false);
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Fjern tid
                      </button>
                    )}
                  </div>

                  {/* Valgmulighed: Ingen */}
                  <button
                    type="button"
                    onClick={() => {
                      setTime('');
                      setIsTimeOpen(false);
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-colors cursor-pointer ${
                      !time.trim()
                        ? 'bg-amber-100 border-slate-900 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Ingen (vis ikke klokkeslæt)</span>
                    {!time.trim() && <Check size={14} className="stroke-[3] text-slate-900" />}
                  </button>

                  {/* Hurtigvalg af tider */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Hurtigvalg
                    </span>
                    <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto p-0.5">
                      {[
                        '07:00', '07:30', '08:00', '08:30',
                        '09:00', '09:30', '10:00', '11:00',
                        '12:00', '12:30', '13:00', '14:00',
                        '15:00', '16:00', '17:00', '18:00',
                        '19:00', '20:00', '21:00', '22:00',
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTime(t);
                            setIsTimeOpen(false);
                          }}
                          className={`py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            time === t
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manuel indtastning */}
                  <div className="pt-1.5 border-t border-slate-200 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Eller skriv selv (f.eks. 13.00-14.00)
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="08:00 eller 13.00-14.00"
                      className="w-full h-8 px-2.5 rounded-lg border-2 border-slate-300 focus:border-slate-900 font-bold text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Farve Dropdown */}
            <div className="relative shrink-0 space-y-1" ref={colorDropdownRef}>
              <label className="text-xs font-bold text-slate-700 block">
                Farve
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsColorOpen((prev) => !prev);
                  setIsFontSizeOpen(false);
                }}
                className="h-10 px-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Vælg kortfarve"
              >
                <span
                  className="w-4 h-4 rounded-full border border-slate-900/40 shrink-0"
                  style={{ backgroundColor: bgColor }}
                />
                <ChevronDown size={14} className={`text-slate-600 transition-transform duration-150 ${isColorOpen ? 'rotate-180' : ''}`} />
              </button>

              {isColorOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-40 p-2.5 bg-white border-2 border-slate-900 rounded-2xl shadow-xl w-60 max-w-[calc(100vw-32px)] animate-in fade-in zoom-in-95">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-0.5">
                    Vælg kortfarve
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {REFERENCE_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setBgColor(preset.bg);
                          setIsColorOpen(false);
                        }}
                        style={{ backgroundColor: preset.bg }}
                        className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                          bgColor.toLowerCase() === preset.bg.toLowerCase() ? 'ring-3 ring-amber-400 scale-105' : ''
                        }`}
                        title={preset.name}
                      >
                        {bgColor.toLowerCase() === preset.bg.toLowerCase() && (
                          <Check size={13} className="text-slate-900 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tekststørrelse Dropdown */}
            <div className="relative shrink-0 space-y-1" ref={fontSizeDropdownRef}>
              <label className="text-xs font-bold text-slate-700 block">
                Tekst
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsFontSizeOpen((prev) => !prev);
                  setIsColorOpen(false);
                }}
                className="h-10 px-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Juster tekststørrelse"
              >
                <Type size={14} className="text-slate-700" />
                <span className="text-xs font-bold text-slate-900">{fontSizeNum}</span>
                <ChevronDown size={14} className={`text-slate-600 transition-transform duration-150 ${isFontSizeOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFontSizeOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-40 p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-xl w-56 max-w-[calc(100vw-32px)] space-y-2.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Tekststørrelse</span>
                    <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded-lg px-1.5 py-0.5">
                      <button
                        type="button"
                        onClick={() => setFontSizeNum((prev) => Math.max(8, prev - 2))}
                        className="w-5 h-6 rounded hover:bg-slate-200 font-black text-sm text-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-slate-900">{fontSizeNum}</span>
                      <button
                        type="button"
                        onClick={() => setFontSizeNum((prev) => prev + 2)}
                        className="w-5 h-6 rounded hover:bg-slate-200 font-black text-sm text-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'S', size: 14 },
                      { label: 'M', size: 18 },
                      { label: 'L', size: 22 },
                      { label: 'XL', size: 28 },
                    ].map((chip) => (
                      <button
                        key={chip.size}
                        type="button"
                        onClick={() => {
                          setFontSizeNum(chip.size);
                        }}
                        className={`py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          fontSizeNum === chip.size
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {onApplyFontSizeToAll && (
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          onApplyFontSizeToAll(fontSizeNum);
                          setAppliedToAll(true);
                          setTimeout(() => setAppliedToAll(false), 2000);
                        }}
                        className={`w-full py-1.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                          appliedToAll
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            : 'bg-slate-50 hover:bg-amber-100 border-slate-300 hover:border-slate-900 text-slate-800'
                        }`}
                        title="Opdater tekststørrelsen på alle kort i hele planen"
                      >
                        {appliedToAll ? (
                          <>
                            <Check size={14} className="stroke-[3] text-emerald-700" />
                            <span>Anvendt på alle kort!</span>
                          </>
                        ) : (
                          <>
                            <Type size={13} className="text-slate-600" />
                            <span>Anvend på alle kort</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Visual asset picker */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            {/* Header when choosing scenes */}
            {activeTab === 'illustrations' && (
              <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-black text-slate-800">
                  Vælg scene
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {(() => {
                    const seenUrls = new Set<string>();
                    const count = Object.entries(activePersona.activityScenes || {}).filter(([k, url]) => {
                      if (!url || SCENE_ALIAS_MAP[k]) return false;
                      const clean = url.split('?')[0].trim();
                      if (seenUrls.has(clean)) return false;
                      seenUrls.add(clean);
                      return true;
                    }).length + customScenes.length;
                    return `${count} scener tilgængelige`;
                  })()}
                </span>
              </div>
            )}

            {/* TAB 1: Icons & Scenes grid */}
            {activeTab === 'illustrations' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                {/* Missing scenes banner for current persona */}
                {(() => {
                  const { ready, total } = getReadyScenesCount(activePersona);
                  if (ready >= total) return null;
                  return (
                    <div className="col-span-full mb-1 p-2 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          Figuren mangler {total - ready} standardscener ({ready}/{total} klar).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenSceneGen?.(activePersona)}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-lg border border-slate-900 shadow-xs cursor-pointer flex items-center gap-1 flex-shrink-0"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Generer manglende</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Upload tile */}
                <label className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-900 bg-white hover:bg-amber-50 cursor-pointer transition-all group aspect-[2126/740]">
                  <div className="flex items-center gap-1.5 text-slate-700 group-hover:text-slate-900 font-bold text-xs">
                    <Upload size={14} className="text-amber-600" />
                    <span>Upload foto</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Quick new scene button tile in the grid */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    setAiError(null);
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-amber-400 hover:border-amber-600 bg-amber-50/60 hover:bg-amber-100/80 cursor-pointer transition-all group aspect-[2126/740]"
                  title="Opret en ny scene med ChatGPT"
                >
                  <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs">
                    <Plus size={14} className="stroke-[2.5]" />
                    <span>Opret ny scene</span>
                  </div>
                </button>

                {/* Custom uploaded & generated scenes (clean unobstructed image, tooltip title) */}
                {customScenes.map((scene) => {
                  const isSelected = customImageUrl === scene.url;
                  return (
                    <div
                      key={scene.id}
                      onClick={() => {
                        setCustomImageUrl(scene.url);
                        setIllustrationId('');
                        setSceneImageUrl('');
                        setIsManuallySelected(true);
                      }}
                      title={scene.name}
                      className={`relative group flex flex-col items-center justify-between p-1 rounded-xl border-2 transition-all cursor-pointer aspect-[2126/740] ${
                        isSelected
                          ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400 shadow-xs'
                          : 'bg-slate-50 border-slate-300 hover:border-slate-500 hover:bg-white'
                      }`}
                    >
                      <div className="w-full h-full rounded-lg border border-slate-900/20 overflow-hidden bg-white relative flex items-center justify-center">
                        <img src={scene.url} alt={scene.name} className="w-full h-full object-cover object-center" />
                      </div>

                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs z-10 pointer-events-none">
                          <Check size={10} className="stroke-[3]" />
                        </span>
                      )}

                      {/* Re-crop / Edit position button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCropImageSource(scene.originalUrl || scene.url);
                          setCropInitialName(scene.name);
                          setCropModalOpen(true);
                        }}
                        title="Beskær og tilpas scene"
                        aria-label="Beskær og tilpas scene"
                        className="absolute top-1.5 left-9 sm:left-8 w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-black/70 hover:bg-amber-500 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-xs"
                      >
                        <Crop size={13} className="stroke-[2.5]" />
                      </button>

                      {/* Delete scene button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSceneToDelete(scene);
                        }}
                        title="Fjern scene"
                        aria-label="Fjern scene"
                        className="absolute top-1.5 left-1.5 w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-xs"
                      >
                        <Trash2 size={13} className="stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })}

                {/* Persona Activity Scenes — deduplicated canonical scenes without text banner blocking image */}
                {(() => {
                  const seenUrls = new Set<string>();
                  const uniquePersonaScenes = Object.entries(activePersona.activityScenes || {}).filter(
                    ([key, imgUrl]) => {
                      if (!imgUrl) return false;
                      if (SCENE_ALIAS_MAP[key]) return false;
                      const cleanUrl = imgUrl.split('?')[0].trim();
                      if (seenUrls.has(cleanUrl)) return false;
                      seenUrls.add(cleanUrl);
                      return true;
                    }
                  );

                  return uniquePersonaScenes.map(([key, imgUrl]) => {
                    const isSelected =
                      !customImageUrl &&
                      (illustrationId === key || SCENE_ALIAS_MAP[illustrationId] === key);
                    const label = SCENE_DESCRIPTIONS[key] || key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setIllustrationId(key);
                          setSceneImageUrl('');
                          setCustomImageUrl('');
                          setIsManuallySelected(true);
                        }}
                        title={label}
                        aria-label={label}
                        className={`relative group flex flex-col items-center justify-between p-1 rounded-xl border-2 transition-all cursor-pointer aspect-[2126/740] ${
                          isSelected
                            ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400 shadow-xs'
                            : 'bg-slate-50 border-slate-300 hover:border-slate-500 hover:bg-white'
                        }`}
                      >
                        <div className="w-full h-full rounded-lg border border-slate-900/30 overflow-hidden bg-white relative flex items-center justify-center">
                          <img src={imgUrl} alt={label} className="w-full h-full object-cover object-center" />
                        </div>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs z-10 pointer-events-none">
                            <Check size={10} className="stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            )}

            {/* TAB 2: Opret en ny scene — Automated ChatGPT Scene Creation with Back Button */}
            {activeTab === 'upload' && (
              <div className="space-y-3 p-1">
                {/* Back button header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('illustrations');
                      setAiError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={15} className="stroke-[2.5]" />
                    <span>Tilbage til scener</span>
                  </button>
                  <span className="text-xs font-black text-slate-800">
                    Opret ny scene med AI
                  </span>
                </div>

                {/* Input block */}
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Wand2 size={14} className="text-amber-600" />
                      Hvad skal figuren lave i scenen?
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10.5px] font-bold text-amber-900">Ideer:</span>
                    {[
                      {
                        label: 'Brætspil',
                        prompt:
                          'Figuren sidder ved stuebordet og spiller et farverigt brætspil, smilende og koncentreret.',
                      },
                      {
                        label: 'Læse en bog',
                        prompt:
                          'Figuren sidder behageligt i en blød lænestol og fordyber sig i en god bog med et varmt smil.',
                      },
                      {
                        label: 'Cykeltur',
                        prompt:
                          'Figuren cykler glad på en cykelsti i godt vejr med cykelhjelm på hovedet.',
                      },
                      {
                        label: 'Vande blomster',
                        prompt:
                          'Figuren vander grønne stueplanter med en lille vandkande, smilende og tilfreds.',
                      },
                      {
                        label: 'Bage kage',
                        prompt:
                          'Figuren står i køkkenet med et forklæde og bager lækre kager ved køkkenbordet.',
                      },
                      {
                        label: 'Høre musik',
                        prompt:
                          'Figuren sidder afslappet i sofaen med store høretelefoner på og lytter fornøjet til musik.',
                      },
                      {
                        label: 'Spille trommer',
                        prompt:
                          'Figuren sidder bag et trommesæt og spiller rytmisk og glad med trommestikker.',
                      },
                      {
                        label: 'Svømmehal',
                        prompt:
                          'Figuren er i svømmehallen med badehætte og svømmebriller og bader glad i bassinet.',
                      },
                    ].map((idea) => (
                      <button
                        key={idea.label}
                        type="button"
                        onClick={() => setInlineSceneText(idea.prompt)}
                        className="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-amber-100/80 hover:bg-amber-300 border border-amber-300 text-amber-950 transition-colors cursor-pointer"
                      >
                        {idea.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={inlineSceneText}
                    onChange={(e) => setInlineSceneText(e.target.value)}
                    rows={3}
                    placeholder={
                      title && title !== 'Aktivitetsnavn'
                        ? `F.eks.: Figuren udfører "${title}"...`
                        : 'F.eks.: Figuren sidder ved bordet og lægger et puslespil...'
                    }
                    className="w-full p-2.5 rounded-xl border-2 border-slate-900 focus:border-amber-500 font-bold text-xs text-slate-900 resize-none bg-white outline-hidden"
                  />
                </div>

                {/* Primary Automated Generate Button */}
                <div>
                  <button
                    type="button"
                    disabled={
                      isGeneratingAi ||
                      (!inlineSceneText.trim() && (!title.trim() || title === 'Aktivitetsnavn'))
                    }
                    onClick={handleGenerateWithAi}
                    className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black text-sm rounded-2xl border-2 border-slate-900 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-slate-900" />
                        <span>{aiProgressMessage || 'Genererer scene i ChatGPT...'}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} className="text-slate-900" />
                        <span>Generer scene med ChatGPT</span>
                      </>
                    )}
                  </button>

                  {isGeneratingAi && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 animate-pulse">
                      <Clock size={14} className="text-amber-600 shrink-0" />
                      <span>Automation kører i baggrunden via din browser. Det tager normalt ca. 15-30 sekunder.</span>
                    </div>
                  )}

                  {aiError && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-xs font-bold text-rose-900 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-rose-700 shrink-0 mt-0.5" />
                        <span>{aiError}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => openChatGPTLogin()}
                          className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-900 font-black text-xs rounded-xl border border-rose-300 shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <ExternalLink size={12} />
                          <span>Åbn ChatGPT og tjek login</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={16} className="stroke-[3]" />
              Gem piktogram
            </button>
          </div>
        </form>
      </div>

      <CropSceneModal
        isOpen={cropModalOpen}
        imageSource={cropImageSource}
        initialName={cropInitialName}
        onClose={() => {
          setCropModalOpen(false);
          setCropImageSource(null);
        }}
        onSave={handleCropSave}
      />

      {/* In-app Confirm Modal for Custom Scene Deletion */}
      <ConfirmModal
        isOpen={Boolean(sceneToDelete)}
        title={`Slet "${sceneToDelete?.name || 'denne scene'}"?`}
        subtitle="Egen uploadet eller beskåret scene"
        message="Er du sikker på, at du vil fjerne denne scene fra dine gemte scener?"
        previewImage={sceneToDelete?.url}
        confirmText="Ja, slet scene"
        cancelText="Annuller"
        variant="danger"
        onConfirm={() => {
          if (!sceneToDelete) return;
          const updated = deleteCustomScene(sceneToDelete.id);
          setCustomScenes(updated);
          if (customImageUrl === sceneToDelete.url) {
            setCustomImageUrl('');
            setIllustrationId('spisetid');
          }
          setSceneToDelete(null);
        }}
        onCancel={() => setSceneToDelete(null)}
      />
    </div>
  );
};
