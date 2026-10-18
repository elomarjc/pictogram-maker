import React, { useState, useRef, useEffect } from 'react';
import type { Pictogram, Persona } from '../types';
import { getPersona } from '../services/personas';
import { PictogramCard } from './PictogramCard';
import {
  X,
  Upload,
  Trash2,
  Check,
  Sparkles,
  Type,
  Loader2,
  AlertCircle,
  ChevronDown,
  Image as ImageIcon,
  Clock,
  Crop,
  Wand2,
  Copy,
  Download,
  ExternalLink,
  Layers,
  FileText,
} from 'lucide-react';
import {
  buildCloudflareAiPrompt,
  buildDanishMasterPrompt,
  buildEnglishMasterPrompt,
  optimizeScenePrompt,
} from '../data/scenePrompts';
import { PICTO_STYLE_REF_URL } from '../services/personas';
import { CropSceneModal, type CropSceneResult } from './CropSceneModal';
import {
  generateSceneImage,
  removeImageBackground,
  autoFitSceneToStandardFormat,
} from '../services/imageGenerationApi';
import { getShortSceneTitle } from '../utils/sceneTitleHelper';
import { getDbItem, setDbItem } from '../services/storageDb';
import { SceneGenerationModal } from './SceneGenerationModal';
import { getReadyScenesCount } from '../services/characterSceneGenerator';

interface PictogramEditorModalProps {
  pictogram: Pictogram | null;
  isOpen: boolean;
  persona?: Persona;
  onClose: () => void;
  onSave: (pic: Pictogram) => void;
  onApplyFontSizeToAll?: (fontSize: number) => void;
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
  spisetid: 'Spisetid (Frokost/Aftensmad)',
  aktiviteter: 'Aktiviteter & Hobby',
  vaske_op: 'Vaske op',
  bolle: 'Bolle / Eftermiddag',
  sengetid: 'Sengetid & Sove',
  gatur: 'Gåtur / Frisk luft',
  rede_seng: 'Rede seng',
  pause_sofa: 'Pause på sofa / TV',
  skraldespand: 'Skrald & Flasker',
  handle: 'Handle indkøb',
};

// Auto-match scenes based on activity title keywords (checked in priority order)
const SCENE_MATCH_RULES: Array<{ sceneId: string; keywords: string[] }> = [
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
    keywords: ['bad', 'bade', 'brusebad', 'bruse', 'karbad', 'bruser', 'vaske sig', 'tand', 'tænder', 'børste tænder', 'toilet', 'wc'],
  },
  {
    sceneId: 'spisetid',
    keywords: ['spis', 'spise', 'spisetid', 'mad', 'frokost', 'aftensmad', 'morgenmad', 'middagsmad', 'måltid', 'aftenmad', 'lave mad', 'tilberede mad', 'spisning', 'snack'],
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
    keywords: ['sofa', 'tv', 'fjernsyn', 'film', 'serie', 'slappe af', 'afslapning', 'pause', 'læse', 'bog', 'ipad', 'computer', 'skærm', 'gaming'],
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
    sceneId: 'aktiviteter',
    keywords: ['aktivitet', 'hobby', 'tegne', 'male', 'puslespil', 'spil', 'krea', 'musik', 'lego', 'træning', 'motion', 'gymnastik'],
  },
];

const SCENE_COLOR_MAP: Record<string, string> = {
  vaesketoeg: '#fbb6db',
  kaffe: '#fdef8c',
  medicin: '#c1ea9a',
  badetid: '#9adafd',
  spisetid: '#fdc67c',
  aktiviteter: '#ccadfb',
  vaske_op: '#9ceacc',
  bolle: '#cdb7f8',
  sengetid: '#97d9fc',
  gatur: '#9adafd',
  rede_seng: '#97d9fc',
  pause_sofa: '#fdef8c',
  skraldespand: '#c1ea9a',
  handle: '#fdc67c',
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
}) => {
  if (!isOpen || !pictogram) return null;

  const activePersona = persona || getPersona();
  const [appliedToAll, setAppliedToAll] = useState(false);
  const [isSceneGenOpen, setIsSceneGenOpen] = useState(false);
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

  // Master prompt & reference copying state
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedRef1, setCopiedRef1] = useState(false);
  const [copiedRef2, setCopiedRef2] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [masterPromptLang, setMasterPromptLang] = useState<'en' | 'da'>('en');
  const uploadInputRef = useRef<HTMLInputElement>(null);

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
    const matched = findMatchingScene(newTitle);
    if (matched) {
      setIllustrationId(matched);
      setCustomImageUrl('');
      setSceneImageUrl('');
      if (SCENE_COLOR_MAP[matched]) {
        setBgColor(SCENE_COLOR_MAP[matched]);
      }
    }
  };

  const handleCopyImage = async (imageUrl: string, type: 'ref1' | 'ref2') => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const blobUrl = URL.createObjectURL(blob);
      img.src = blobUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(blobUrl);
        const pngBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );
        if (pngBlob && navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
          if (type === 'ref1') {
            setCopiedRef1(true);
            setTimeout(() => setCopiedRef1(false), 2000);
          } else {
            setCopiedRef2(true);
            setTimeout(() => setCopiedRef2(false), 2000);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Kunne ikke kopiere billede til udklipsholder:', err);
    }
    // Fallback: trigger download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = type === 'ref1' ? 'Ref1_Figur_Avatar.png' : 'Ref2_Piktogram_Stil.jpg';
    link.click();
  };

  const handleCopyMasterPrompt = async () => {
    const promptFn = masterPromptLang === 'en' ? buildEnglishMasterPrompt : buildDanishMasterPrompt;
    const defaultDesc =
      masterPromptLang === 'en'
        ? 'The character performs the daily activity happily.'
        : 'Figuren udfører aktiviteten glad og naturligt.';
    const promptText = promptFn({
      sceneDescription: inlineSceneText.trim() || defaultDesc,
      personaName: activePersona.name,
      isWoman: activePersona.id === 'woman_a',
    });
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      // fallback
    }
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleDropGeneratedImage = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const sceneTitle = getShortSceneTitle(
          inlineSceneText,
          title.trim() && title !== 'Aktivitetsnavn' ? title.trim() : baseName
        );

        let processedUrl = reader.result;
        try {
          processedUrl = await removeImageBackground(processedUrl);
        } catch {
          // ignore
        }
        try {
          processedUrl = await autoFitSceneToStandardFormat(processedUrl);
        } catch {
          // ignore
        }

        const updatedCustom = saveCustomScene({
          url: processedUrl,
          name: sceneTitle,
        });
        setCustomScenes(updatedCustom);
        setSceneImageUrl(processedUrl);
        setIllustrationId('');
        setCustomImageUrl('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Cloudflare Workers AI integration state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRotationNotice, setAiRotationNotice] = useState<string | null>(null);

  const handleGenerateWithAi = async () => {
    setAiError(null);
    setAiRotationNotice(null);
    setIsGeneratingAi(true);

    try {
      const promptToUse = buildCloudflareAiPrompt({
        sceneDescription: inlineSceneText,
        personaName: activePersona.name,
        personaId: activePersona.id,
        personaDescription: activePersona.description,
        isWoman: activePersona.id === 'woman_a',
      });

      const generatedDataUrl = await generateSceneImage(promptToUse, {
        onAccountRotated: (rot) => {
          setAiRotationNotice(rot.message);
        },
      });

      // Automatically remove solid background to make it transparent
      let finalDataUrl = generatedDataUrl;
      try {
        finalDataUrl = await removeImageBackground(generatedDataUrl);
      } catch {
        // keep generatedDataUrl if background removal fails
      }

      // Automatically fit and format to exact 2126x740 ratio (matching reference/scenes/vaesketoeg.webp)
      try {
        finalDataUrl = await autoFitSceneToStandardFormat(finalDataUrl);
      } catch {
        // keep finalDataUrl if auto-fit fails
      }

      const sceneTitle = getShortSceneTitle(inlineSceneText, title);

      // Automatically save and apply to card without forcing manual crop!
      const updatedCustom = saveCustomScene({
        url: finalDataUrl,
        name: sceneTitle,
      });
      setCustomScenes(updatedCustom);
      setSceneImageUrl(finalDataUrl);
      setIllustrationId('');
      setCustomImageUrl('');
    } catch (err) {
      setAiError(
        `AI-fejl: ${err instanceof Error ? err.message : String(err)}. Brug gerne den idiotsikre ChatGPT-metode ovenfor med Masterprompt + Ref 1 & 2!`
      );
    } finally {
      setIsGeneratingAi(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-xs">
              <Sparkles size={18} className="text-slate-900" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              Rediger piktogram
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
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
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-40 p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-xl w-64 space-y-2.5 animate-in fade-in zoom-in-95">
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
                <div className="absolute right-0 top-full mt-1.5 z-40 p-2.5 bg-white border-2 border-slate-900 rounded-2xl shadow-xl w-60 animate-in fade-in zoom-in-95">
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
                <div className="absolute right-0 top-full mt-1.5 z-40 p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-xl w-56 space-y-2.5 animate-in fade-in zoom-in-95">
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
            {/* Prominent segmented tab bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('illustrations')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'illustrations'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Scene</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-amber-400 text-slate-900 shadow-xs border border-slate-900'
                      : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/50'
                  }`}
                >
                  <Sparkles size={14} className={activeTab === 'upload' ? 'text-slate-900' : 'text-amber-600'} />
                  <span>Opret en ny scene</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Icons & Scenes grid */}
            {activeTab === 'illustrations' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1">
                {/* Missing scenes banner for current persona */}
                {(() => {
                  const { ready, total } = getReadyScenesCount(activePersona);
                  if (ready >= total) return null;
                  return (
                    <div className="col-span-full mb-1 p-2 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles size={15} className="text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          Figuren mangler {total - ready} standardscener ({ready}/{total} klar).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSceneGenOpen(true)}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-lg border border-slate-900 shadow-xs cursor-pointer flex items-center gap-1 flex-shrink-0"
                      >
                        <Sparkles size={12} />
                        <span>Generer manglende</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Upload tile */}
                <label className="flex flex-col items-center justify-center p-1.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-900 bg-white hover:bg-amber-50 cursor-pointer transition-all group h-22">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 group-hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors mb-1">
                    <Upload size={14} />
                  </div>
                  <span className="text-[10.5px] font-bold text-slate-700 group-hover:text-slate-900 text-center leading-tight">
                    Upload eget foto
                  </span>
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
                  onClick={() => setActiveTab('upload')}
                  className="flex flex-col items-center justify-center p-1.5 rounded-xl border-2 border-dashed border-amber-400 hover:border-amber-600 bg-amber-50/60 hover:bg-amber-100/80 cursor-pointer transition-all group h-22"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-300 group-hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors mb-1">
                    <Sparkles size={14} className="text-slate-900" />
                  </div>
                  <span className="text-[10.5px] font-black text-amber-950 text-center leading-tight">
                    Opret en ny scene
                  </span>
                </button>

                {/* Custom uploaded & generated scenes (with custom names, cropping & delete) */}
                {customScenes.map((scene) => {
                  const isSelected = customImageUrl === scene.url;
                  return (
                    <div
                      key={scene.id}
                      onClick={() => {
                        setCustomImageUrl(scene.url);
                        setIllustrationId('');
                        setSceneImageUrl('');
                      }}
                      className={`relative group flex flex-col items-center justify-between p-1.5 rounded-xl border-2 transition-all cursor-pointer h-22 ${
                        isSelected
                          ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400 shadow-xs'
                          : 'bg-slate-50 border-slate-300 hover:border-slate-500 hover:bg-white'
                      }`}
                    >
                      <div className="w-full flex-1 rounded-lg border border-slate-900/20 overflow-hidden bg-white mb-1 flex items-center justify-center">
                        <img src={scene.url} alt={scene.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 text-center line-clamp-1 w-full px-1">
                        {scene.name}
                      </span>

                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs z-10 pointer-events-none">
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
                        className="absolute top-1 left-6 w-5 h-5 rounded-md bg-black/50 hover:bg-amber-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                      >
                        <Crop size={11} className="stroke-[2.5]" />
                      </button>

                      {/* Delete scene button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = deleteCustomScene(scene.id);
                          setCustomScenes(updated);
                          if (customImageUrl === scene.url) {
                            setCustomImageUrl('');
                            setIllustrationId('spisetid');
                          }
                        }}
                        title="Fjern scene"
                        className="absolute top-1 left-1 w-5 h-5 rounded-md bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                      >
                        <Trash2 size={11} className="stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })}

                {/* Persona Activity Scenes */}
                {Object.entries(activePersona.activityScenes).map(([key, imgUrl]) => {
                  const isSelected = !customImageUrl && illustrationId === key;
                  const label = SCENE_DESCRIPTIONS[key] || key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setIllustrationId(key);
                        setSceneImageUrl('');
                        setCustomImageUrl('');
                      }}
                      className={`flex flex-col items-center justify-between p-1.5 rounded-xl border-2 transition-all cursor-pointer h-22 ${
                        isSelected
                          ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400 shadow-xs'
                          : 'bg-slate-50 border-slate-300 hover:border-slate-500 hover:bg-white'
                      }`}
                    >
                      <div className="w-full flex-1 rounded-lg border border-slate-900/30 overflow-hidden bg-white mb-1">
                        <img src={imgUrl} alt={label} className="w-full h-full object-cover object-center" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-900 text-center line-clamp-1">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Opret en ny scene (Masterprompt + Figur + Scenebeskrivelse + Piktogram-ref) */}
            {activeTab === 'upload' && (
              <div className="space-y-3 p-1">
                {/* 1. Referencebilleder (Figur Ref 1 + Piktogram Ref 2) */}
                <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Layers size={14} className="text-amber-500" />
                      Referencebilleder til AI (Ref 1 & Ref 2)
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Vedhæftes i ChatGPT / DALL-E
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Ref 1: Figur / Avatar */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-300">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-lg border-2 border-slate-900 overflow-hidden shrink-0 bg-amber-50">
                          <img src={activePersona.avatarUrl} alt="Ref 1" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                            Billede 1 (Ref 1)
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            Figur: {activePersona.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyImage(activePersona.avatarUrl, 'ref1')}
                          className="p-1.5 rounded-lg border border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-amber-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs flex items-center gap-1"
                          title="Kopiér Billede 1 til udklipsholder"
                        >
                          {copiedRef1 ? <Check size={13} className="text-emerald-600 stroke-[3]" /> : <Copy size={13} />}
                          <span className="hidden xs:inline text-[11px] font-bold">{copiedRef1 ? 'Kopieret' : 'Kopiér'}</span>
                        </button>
                        <a
                          href={activePersona.avatarUrl}
                          download="Ref1_Figur_Avatar.png"
                          className="p-1.5 rounded-lg border border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Download Billede 1"
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    </div>

                    {/* Ref 2: Piktogram-stil reference */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-300">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-lg border-2 border-slate-900 overflow-hidden shrink-0 bg-slate-100">
                          <img src={PICTO_STYLE_REF_URL} alt="Ref 2" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">
                            Billede 2 (Ref 2)
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            Piktogram tegneseriestil
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyImage(PICTO_STYLE_REF_URL, 'ref2')}
                          className="p-1.5 rounded-lg border border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-amber-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs flex items-center gap-1"
                          title="Kopiér Billede 2 til udklipsholder"
                        >
                          {copiedRef2 ? <Check size={13} className="text-emerald-600 stroke-[3]" /> : <Copy size={13} />}
                          <span className="hidden xs:inline text-[11px] font-bold">{copiedRef2 ? 'Kopieret' : 'Kopiér'}</span>
                        </button>
                        <a
                          href={PICTO_STYLE_REF_URL}
                          download="Ref2_Piktogram_Stil.jpg"
                          className="p-1.5 rounded-lg border border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Download Billede 2"
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Scenebeskrivelse */}
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-600" />
                      Hvad skal figuren lave i scenen?
                    </span>
                    <button
                      type="button"
                      onClick={() => setInlineSceneText((prev) => optimizeScenePrompt(prev))}
                      className="text-[11px] font-black text-amber-950 bg-amber-200 hover:bg-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-400 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Formater og optimer din tekst automatisk til tegneseriestil"
                    >
                      <Wand2 size={12} className="text-amber-700" />
                      <span>Optimer beskrivelse</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10.5px] font-bold text-amber-900">Ideer:</span>
                    {[
                      { label: 'Brætspil', prompt: 'Figuren sidder ved stuebordet og spiller et farverigt brætspil, smilende og koncentreret.' },
                      { label: 'Læse en bog', prompt: 'Figuren sidder behageligt i en blød lænestol og fordyber sig i en god bog med et varmt smil.' },
                      { label: 'Cykeltur', prompt: 'Figuren cykler glad på en cykelsti i godt vejr med cykelhjelm på hovedet.' },
                      { label: 'Vande blomster', prompt: 'Figuren vander grønne stueplanter med en lille vandkande, smilende og tilfreds.' },
                      { label: 'Bage kage', prompt: 'Figuren står i køkkenet med et forklæde og bager lækre kager ved køkkenbordet.' },
                      { label: 'Høre musik', prompt: 'Figuren sidder afslappet i sofaen med store høretelefoner på og lytter fornøjet til musik.' },
                    ].map((idea) => (
                      <button
                        key={idea.label}
                        type="button"
                        onClick={() => setInlineSceneText(idea.prompt)}
                        className="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-amber-100/70 hover:bg-amber-300 border border-amber-300 text-amber-950 transition-colors cursor-pointer"
                      >
                        {idea.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={inlineSceneText}
                    onChange={(e) => setInlineSceneText(e.target.value)}
                    rows={2}
                    placeholder="F.eks.: Figuren sidder ved bordet og lægger et puslespil..."
                    className="w-full p-2.5 rounded-xl border-2 border-slate-900 focus:border-amber-500 font-bold text-xs text-slate-900 resize-none bg-white outline-hidden"
                  />
                </div>

                {/* 3. Masterprompt & ChatGPT handlinger */}
                <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2.5 border-2 border-slate-900 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText size={15} className="text-amber-400" />
                      <span className="text-xs font-black text-white">
                        Generer i ChatGPT / DALL-E (Anbefalet)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Language switcher for Masterprompt */}
                      <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setMasterPromptLang('en')}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            masterPromptLang === 'en'
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          English (Bedst til AI)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMasterPromptLang('da')}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            masterPromptLang === 'da'
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Dansk
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPromptPreview((prev) => !prev)}
                        className="text-[11px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer underline"
                      >
                        {showPromptPreview ? 'Skjul' : 'Vis'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    Kopiér Masterprompten på {masterPromptLang === 'en' ? 'engelsk (anbefalet til AI)' : 'dansk'} herunder og vedhæft <strong>Ref 1</strong> (Figur) og <strong>Ref 2</strong> (Piktogram-stil) i ChatGPT.
                  </p>

                  {showPromptPreview && (
                    <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-200 text-[10.5px] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800">
                      {masterPromptLang === 'en'
                        ? buildEnglishMasterPrompt({
                            sceneDescription: inlineSceneText || 'The character performs the daily activity happily.',
                            personaName: activePersona.name,
                            isWoman: activePersona.id === 'woman_a',
                          })
                        : buildDanishMasterPrompt({
                            sceneDescription: inlineSceneText || 'Figuren udfører aktiviteten glad og naturligt.',
                            personaName: activePersona.name,
                            isWoman: activePersona.id === 'woman_a',
                          })}
                    </pre>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyMasterPrompt}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 ${
                        copiedPrompt
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-md'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-xs'
                      }`}
                    >
                      {copiedPrompt ? (
                        <>
                          <Check size={16} className="stroke-[3]" />
                          <span>Masterprompt kopieret!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} />
                          <span>Kopiér Masterprompt</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl font-black text-xs bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Åbn ChatGPT</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* 4. Dropzone for det færdige billede */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropGeneratedImage}
                  className="p-3 rounded-2xl border-2 border-dashed border-slate-400 hover:border-slate-900 bg-white hover:bg-amber-50/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-8 h-8 rounded-xl bg-amber-100 group-hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors mb-1.5">
                    <Upload size={16} />
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    Har du fået billedet fra ChatGPT? Træk eller upload det her
                  </span>
                  <span className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                    Åbner straks beskæring og navngivning, så det passer perfekt i piktogramkortet
                  </span>
                </div>

                {/* 5. Direkte 1-klik AI generering i appen */}
                <div className="pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      Eller prøv direkte i browseren:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isGeneratingAi || !inlineSceneText.trim()}
                        onClick={handleGenerateWithAi}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-amber-100 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 hover:border-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isGeneratingAi ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-amber-600" />
                            <span>Genererer...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} className="text-amber-500" />
                            <span>Direkte AI (1-klik)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {aiRotationNotice && (
                    <div className="mt-2 p-2 rounded-xl bg-sky-50 border border-sky-300 text-xs font-bold text-sky-800 flex items-center gap-1.5 animate-pulse">
                      <Sparkles size={13} className="text-sky-600 shrink-0" />
                      <span>{aiRotationNotice}</span>
                    </div>
                  )}

                  {aiError && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 flex flex-col gap-1.5">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                        <span>{aiError}</span>
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

      <SceneGenerationModal
        isOpen={isSceneGenOpen}
        persona={activePersona}
        onClose={() => setIsSceneGenOpen(false)}
      />
    </div>
  );
};
