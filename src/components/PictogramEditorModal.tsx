import React, { useState } from 'react';
import type { Pictogram, Persona } from '../types';
import { getPersona } from '../services/personas';
import { PictogramCard } from './PictogramCard';
import { X, Upload, Trash2, Check, Sparkles, Type, Loader2, AlertCircle, Settings } from 'lucide-react';
import { PRESET_SCENE_PROMPTS, buildCloudflareAiPrompt } from '../data/scenePrompts';
import {
  generateSceneImage,
  getStoredWorkerUrl,
  setStoredWorkerUrl,
  getStoredApiKey,
  setStoredApiKey,
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

  // Cloudflare Workers AI integration state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [workerUrl, setWorkerUrl] = useState(getStoredWorkerUrl());
  const [workerApiKey, setWorkerApiKey] = useState(getStoredApiKey());
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateWithAi = async () => {
    if (!workerUrl.trim()) {
      setAiError('Ingen Cloudflare Worker adresse fundet.');
      return;
    }

    setAiError(null);
    setIsGeneratingAi(true);

    try {
      setStoredWorkerUrl(workerUrl);
      setStoredApiKey(workerApiKey);

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
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Live Preview card */}
          <div className="p-3 bg-slate-100 rounded-2xl border-2 border-slate-200 flex justify-center items-center">
            <div className="w-full max-w-md">
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
          </div>

          {/* Form fields: Aktivitet & Tidspunkt */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Aktivitetens navn *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. Spisetid, Morgenmad, Medicin"
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-sm text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Klokkeslæt
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="F.eks. 08:00"
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Form row: Tekststørrelse & Farve side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Tekststørrelse */}
            <div className="p-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Type size={14} className="text-amber-600" />
                  Tekststørrelse
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-0.5">
                  <button
                    type="button"
                    onClick={() => setFontSizeNum((prev) => Math.max(8, prev - 2))}
                    className="w-4 h-5 rounded hover:bg-slate-100 font-bold text-xs text-slate-600 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={6}
                    max={99}
                    value={fontSizeNum}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setFontSizeNum(Math.max(1, val));
                    }}
                    className="w-8 text-center font-bold text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFontSizeNum((prev) => prev + 2)}
                    className="w-4 h-5 rounded hover:bg-slate-100 font-bold text-xs text-slate-600 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[
                  { label: 'S (14)', size: 14 },
                  { label: 'M (18)', size: 18 },
                  { label: 'L (22)', size: 22 },
                  { label: 'XL (28)', size: 28 },
                ].map((chip) => (
                  <button
                    key={chip.size}
                    type="button"
                    onClick={() => setFontSizeNum(chip.size)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      fontSizeNum === chip.size
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Baggrundsfarve */}
            <div className="p-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">Farve</span>
              <div className="flex flex-wrap gap-1.5">
                {REFERENCE_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setBgColor(preset.bg)}
                    style={{ backgroundColor: preset.bg }}
                    className={`w-7 h-7 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
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
          </div>

          {/* Visual asset picker tabs */}
          <div className="space-y-2 pt-1">
            <div className="flex border-b-2 border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('illustrations')}
                className={`py-1 px-3 font-bold text-xs border-b-2 -mb-[2px] transition-colors cursor-pointer ${
                  activeTab === 'illustrations'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Ikoner & Scener
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-1 px-3 font-bold text-xs border-b-2 -mb-[2px] transition-colors cursor-pointer ${
                  activeTab === 'upload'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lav ny AI-scene
              </button>
            </div>

            {/* TAB 1: Icons & Scenes grid (includes Upload button + custom uploaded images + preset scenes) */}
            {activeTab === 'illustrations' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1">
                {/* Upload tile directly in the icons grid */}
                <label className="flex flex-col items-center justify-center p-1.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-900 bg-white hover:bg-amber-50 cursor-pointer transition-all group h-22">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 group-hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors mb-1">
                    <Upload size={14} />
                  </div>
                  <span className="text-[10.5px] font-bold text-slate-700 group-hover:text-slate-900 text-center leading-tight">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Custom uploaded images */}
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

                      {/* Active checkmark */}
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs z-10 pointer-events-none">
                          <Check size={10} className="stroke-[3]" />
                        </span>
                      )}

                      {/* Smaller, hidden delete button (appears on hover) */}
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
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-600" />
                      Generér scene med figuren
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
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
                    placeholder="Beskriv hvad figuren skal lave..."
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
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs rounded-xl border-2 border-slate-900 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-amber-400" />
                        <span>Genererer scene...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Generér scene nu</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Discreet collapsible advanced connection settings */}
          <details className="text-[11px] text-slate-400 group px-1">
            <summary className="cursor-pointer hover:text-slate-600 font-medium select-none list-none flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              <Settings size={13} />
              <span>Avanceret forbindelse</span>
            </summary>
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700">
              <div>
                <label className="font-semibold block mb-0.5 text-[10.5px]">Cloudflare Worker Adresse:</label>
                <input
                  type="text"
                  value={workerUrl}
                  onChange={(e) => {
                    setWorkerUrl(e.target.value);
                    setStoredWorkerUrl(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-0.5 text-[10.5px]">API Nøgle (valgfri):</label>
                <input
                  type="password"
                  value={workerApiKey}
                  onChange={(e) => {
                    setWorkerApiKey(e.target.value);
                    setStoredApiKey(e.target.value);
                  }}
                  placeholder="Bearer nøgle"
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
            </div>
          </details>

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
