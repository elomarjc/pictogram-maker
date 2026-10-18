import React, { useState, useRef, useEffect } from 'react';
import type { Pictogram, Persona } from '../types';
import { getPersona } from '../services/personas';
import { PictogramCard } from './PictogramCard';
import { X, Upload, Trash2, Check, Sparkles, Type, Loader2, AlertCircle, ChevronDown, Image as ImageIcon, Clock } from 'lucide-react';
import { PRESET_SCENE_PROMPTS, buildCloudflareAiPrompt } from '../data/scenePrompts';
import {
  generateSceneImage,
  getStoredWorkerUrl,
  getStoredApiKey,
} from '../services/imageGenerationApi';
import { convertImageToDataUrl } from '../services/pdfExport';

interface PictogramEditorModalProps {
  pictogram: Pictogram | null;
  isOpen: boolean;
  persona?: Persona;
  onClose: () => void;
  onSave: (pic: Pictogram) => void;
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

const STORAGE_KEY_CUSTOM_ICONS = 'pictogram_custom_icons';

function getStoredCustomIcons(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_ICONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomIcon(dataUrl: string): string[] {
  const list = getStoredCustomIcons().filter((url) => url !== dataUrl);
  list.unshift(dataUrl);
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_ICONS, JSON.stringify(list));
  } catch {
    // quota fallback
  }
  return list;
}

function deleteCustomIcon(dataUrl: string): string[] {
  const list = getStoredCustomIcons().filter((url) => url !== dataUrl);
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_ICONS, JSON.stringify(list));
  } catch {
    // fallback
  }
  return list;
}

export const PictogramEditorModal: React.FC<PictogramEditorModalProps> = ({
  pictogram,
  isOpen,
  persona,
  onClose,
  onSave,
}) => {
  if (!isOpen || !pictogram) return null;

  const activePersona = persona || getPersona();
  const [title, setTitle] = useState(pictogram.title);
  const [time, setTime] = useState(pictogram.time || '');
  const [illustrationId, setIllustrationId] = useState(pictogram.illustrationId || 'spisetid');
  const [sceneImageUrl, setSceneImageUrl] = useState(pictogram.sceneImageUrl || '');
  const [customImageUrl, setCustomImageUrl] = useState(pictogram.customImageUrl || '');
  const [customIcons, setCustomIcons] = useState<string[]>(() => {
    const stored = getStoredCustomIcons();
    if (pictogram.customImageUrl && !stored.includes(pictogram.customImageUrl)) {
      return [pictogram.customImageUrl, ...stored];
    }
    return stored;
  });
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
  const [selectedScenePromptId, setSelectedScenePromptId] = useState<string>(PRESET_SCENE_PROMPTS[0].id);
  const [inlineSceneText, setInlineSceneText] = useState<string>(PRESET_SCENE_PROMPTS[0].prompt);

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

  // Cloudflare Workers AI integration state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateWithAi = async () => {
    const workerUrl = getStoredWorkerUrl();
    const workerApiKey = getStoredApiKey();
    if (!workerUrl.trim()) {
      setAiError('Ingen Cloudflare Worker adresse fundet.');
      return;
    }

    setAiError(null);
    setIsGeneratingAi(true);

    try {
      const promptToUse = buildCloudflareAiPrompt({
        sceneDescription: inlineSceneText,
        personaName: activePersona.name,
        isWoman: activePersona.id === 'woman_a',
      });

      let avatarRefBase64: string | undefined = undefined;
      if (activePersona.avatarUrl) {
        try {
          const converted = await convertImageToDataUrl(activePersona.avatarUrl);
          if (converted) avatarRefBase64 = converted;
        } catch {
          // If avatar conversion fails, proceed with prompt
        }
      }

      const generatedDataUrl = await generateSceneImage(promptToUse, {
        workerUrl,
        apiKey: workerApiKey,
        referenceImage: avatarRefBase64,
        strength: 0.7,
      });

      const updated = saveCustomIcon(generatedDataUrl);
      setCustomIcons(updated);
      setCustomImageUrl(generatedDataUrl);
      setIllustrationId('');
      setSceneImageUrl('');
      setActiveTab('illustrations');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : String(err));
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
        const dataUrl = reader.result;
        const updated = saveCustomIcon(dataUrl);
        setCustomIcons(updated);
        setCustomImageUrl(dataUrl);
        setIllustrationId('');
        setSceneImageUrl('');
        setActiveTab('illustrations');
      }
    };
    reader.readAsDataURL(file);
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
              index={0}
              totalCount={1}
              viewMode="strip"
              onEdit={() => {}}
              onDuplicate={() => {}}
              onDelete={() => {}}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
              onMoveToDay={() => {}}
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

              <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1.5">
                <img src={activePersona.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover border border-slate-300" />
                <span>{activePersona.name}</span>
              </div>
            </div>

            {/* TAB 1: Icons & Scenes grid */}
            {activeTab === 'illustrations' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1">
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

                {/* Custom uploaded / generated images */}
                {customIcons.map((imgUrl, idx) => {
                  const isSelected = customImageUrl === imgUrl;
                  return (
                    <div
                      key={`custom-${idx}`}
                      onClick={() => {
                        setCustomImageUrl(imgUrl);
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
                        <img src={imgUrl} alt="Eget billede" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 text-center line-clamp-1">
                        Eget billede
                      </span>

                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs z-10 pointer-events-none">
                          <Check size={10} className="stroke-[3]" />
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = deleteCustomIcon(imgUrl);
                          setCustomIcons(updated);
                          if (customImageUrl === imgUrl) {
                            setCustomImageUrl('');
                            setIllustrationId('spisetid');
                          }
                        }}
                        title="Fjern billede"
                        className="absolute top-1 left-1 w-4 h-4 rounded-md bg-black/40 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                      >
                        <Trash2 size={9} className="stroke-[2.5]" />
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

            {/* TAB 2: AI Generate scene */}
            {activeTab === 'upload' && (
              <div className="p-1">
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-600" />
                      Beskriv scenen der skal oprettes
                    </span>
                    <span className="text-[10.5px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <img src={activePersona.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                      <span>{activePersona.name}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-18 overflow-y-auto p-1 bg-white rounded-xl border border-amber-200">
                    {PRESET_SCENE_PROMPTS.slice(0, 8).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedScenePromptId(preset.id);
                          setInlineSceneText(preset.prompt);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border transition-colors cursor-pointer ${
                          selectedScenePromptId === preset.id
                            ? 'bg-amber-400 border-slate-900 text-slate-900'
                            : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={inlineSceneText}
                    onChange={(e) => setInlineSceneText(e.target.value)}
                    rows={2}
                    placeholder="F.eks. Figuren børster tænder, bager en kage, sidder ved computeren..."
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border-2 border-slate-300 focus:border-slate-900 bg-white resize-none"
                  />

                  {aiError && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800 flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-700 shrink-0" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateWithAi}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs rounded-xl border-2 border-slate-900 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-amber-400" />
                        <span>Opretter scene med figuren...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Opret ny scene</span>
                      </>
                    )}
                  </button>
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
    </div>
  );
};
