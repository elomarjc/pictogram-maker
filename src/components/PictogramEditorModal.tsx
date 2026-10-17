import React, { useState } from 'react';
import type { Pictogram, Persona } from '../types';
import { getPersona } from '../services/personas';
import { PictogramCard } from './PictogramCard';
import { X, Upload, Trash2, Check, Sparkles, Copy, Download, ChevronDown, ChevronUp, Type, Loader2, Bot } from 'lucide-react';
import { PRESET_SCENE_PROMPTS, buildDanishMasterPrompt, buildCloudflareAiPrompt } from '../data/scenePrompts';
import { SceneGeneratorGuideModal } from './SceneGeneratorGuideModal';
import {
  generateSceneImage,
  getStoredWorkerUrl,
  setStoredWorkerUrl,
  getStoredApiKey,
  setStoredApiKey,
} from '../services/imageGenerationApi';

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
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(true);
  const [selectedScenePromptId, setSelectedScenePromptId] = useState<string>(PRESET_SCENE_PROMPTS[0].id);
  const [inlineSceneText, setInlineSceneText] = useState<string>(PRESET_SCENE_PROMPTS[0].prompt);
  const [copiedMasterPrompt, setCopiedMasterPrompt] = useState(false);

  // Cloudflare Workers AI integration state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [workerUrl, setWorkerUrl] = useState(getStoredWorkerUrl());
  const [workerApiKey, setWorkerApiKey] = useState(getStoredApiKey());
  const [showWorkerConfig, setShowWorkerConfig] = useState(!getStoredWorkerUrl());
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const handleGenerateWithAi = async () => {
    if (!workerUrl.trim()) {
      setShowWorkerConfig(true);
      setAiError('Indtast venligst din Cloudflare Worker URL ovenfor først.');
      return;
    }

    setAiError(null);
    setAiSuccessMessage(null);
    setIsGeneratingAi(true);

    try {
      setStoredWorkerUrl(workerUrl);
      setStoredApiKey(workerApiKey);

      const promptToUse = buildCloudflareAiPrompt({
        sceneDescription: inlineSceneText,
        personaName: activePersona.name,
        isWoman: activePersona.id === 'woman_a',
      });

      const generatedDataUrl = await generateSceneImage(promptToUse, {
        workerUrl,
        apiKey: workerApiKey,
      });

      setCustomImageUrl(generatedDataUrl);
      setAiSuccessMessage('Billedet er genereret og indsat på dit piktogram!');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyMasterPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMasterPrompt(true);
      setTimeout(() => setCopiedMasterPrompt(false), 2200);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedMasterPrompt(true);
      setTimeout(() => setCopiedMasterPrompt(false), 2200);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vælg venligst en gyldig billedfil (f.eks. PNG eller JPEG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomImageUrl(reader.result);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center">
              <Sparkles size={18} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Rediger Piktogram
              </h2>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                Tilpas aktivitet, skriftstørrelse og billede
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Live Preview section showing exact print / board appearance */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Forhåndsvisning (vises præcis sådan på tavlen):
              </label>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                Live forhåndsvisning
              </span>
            </div>
            <div className="p-3 sm:p-4 bg-slate-100/90 rounded-2xl border-2 border-slate-300 flex justify-center items-center overflow-x-auto">
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
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-bold text-slate-800">
                Aktivitetens navn *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. Spisetid, Morgenmad, Medicin"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900 font-rounded"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800">
                Klokkeslæt (valgfrit)
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="F.eks. 08:00"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-slate-900"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3 bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Type size={15} className="text-amber-600" />
                    Tekststørrelse (skriv et tal for præcis skriftstørrelse)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Ingen begrænsning – juster tallet for at gøre skriften så stor eller lille som ønsket.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border-2 border-slate-900 rounded-xl px-2.5 py-1 shadow-2xs">
                    <input
                      type="number"
                      min={6}
                      max={99}
                      value={fontSizeNum}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setFontSizeNum(Math.max(1, val));
                      }}
                      className="w-14 text-center font-black text-sm text-slate-900 outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">px</span>
                  </div>

                  {/* Quick +/- buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFontSizeNum((prev) => Math.max(8, prev - 2))}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-black text-xs text-slate-700 transition-colors"
                      title="Mindre tekst"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeNum((prev) => prev + 2)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-black text-xs text-slate-700 transition-colors"
                      title="Større tekst"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick preset chips */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500">Genveje:</span>
                {[
                  { label: 'Lille (14)', size: 14 },
                  { label: 'Normal (18)', size: 18 },
                  { label: 'Stor (22)', size: 22 },
                  { label: 'Ekstra stor (28)', size: 28 },
                  { label: 'Kæmpe (36)', size: 36 },
                ].map((chip) => (
                  <button
                    key={chip.size}
                    type="button"
                    onClick={() => setFontSizeNum(chip.size)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
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
          </div>

          {/* Color palette selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">
              Kortets baggrundsfarve (reference-pasteller)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {REFERENCE_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBgColor(preset.bg)}
                  style={{ backgroundColor: preset.bg }}
                  className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-transform hover:scale-110 shadow-xs ${
                    bgColor.toLowerCase() === preset.bg.toLowerCase() ? 'ring-3 ring-amber-500 scale-105' : ''
                  }`}
                  title={preset.name}
                >
                  {bgColor.toLowerCase() === preset.bg.toLowerCase() && <Check size={16} className="text-slate-900 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Visual asset picker tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex border-b-2 border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('illustrations')}
                className={`py-2 px-4 font-bold text-sm border-b-2 -mb-[2px] transition-colors ${
                  activeTab === 'illustrations'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Figur-scene ({activePersona.name.split(' (')[0]})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-4 font-bold text-sm border-b-2 -mb-[2px] transition-colors ${
                  activeTab === 'upload'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload eget billede
              </button>
            </div>

            {/* TAB 1: Persona Activity Scenes */}
            {activeTab === 'illustrations' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Vælg aktiviteten for {activePersona.name}. Figuren i venstre side opdateres automatisk:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
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
                        className={`flex flex-col items-center justify-between p-2 rounded-2xl border-2 transition-all overflow-hidden ${
                          isSelected
                            ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400 shadow-sm'
                            : 'bg-slate-50 border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="w-full h-16 rounded-xl border border-slate-900/30 overflow-hidden bg-white mb-1.5">
                          <img src={imgUrl} alt={label} className="w-full h-full object-cover object-center" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 text-center line-clamp-1">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


            {/* TAB 2: Upload Custom Image & Inline Idiot-Proof Scene Guide */}
            {activeTab === 'upload' && (
              <div className="space-y-4 p-2">
                {/* 0. Direkte 1-Klik AI Billedgenerator via Cloudflare Workers AI */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-3 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles size={20} className="text-slate-900" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          ✨ 1-Klik AI Billedgenerator (Direkte i appen)
                        </h4>
                        <p className="text-[11.5px] font-bold text-slate-700">
                          Generér automatisk scenen for {activePersona.name} uden at skulle kopiere frem og tilbage til ChatGPT!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWorkerConfig(!showWorkerConfig)}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-950 underline bg-white/70 hover:bg-white px-2 py-1 rounded-lg border border-amber-300 transition-colors"
                    >
                      {showWorkerConfig ? 'Skjul API-indstillinger' : '⚙️ API URL'}
                    </button>
                  </div>

                  {showWorkerConfig && (
                    <div className="bg-white border-2 border-slate-300 rounded-xl p-3 space-y-2.5 text-xs animate-in fade-in duration-100">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-800 flex items-center justify-between">
                          <span>Cloudflare Worker URL:</span>
                          <span className="text-[10px] text-slate-500 font-normal">Gemmes lokalt i din browser</span>
                        </label>
                        <input
                          type="text"
                          value={workerUrl}
                          onChange={(e) => setWorkerUrl(e.target.value)}
                          placeholder="fx https://free-image-generation-api.<dit-subdomæne>.workers.dev"
                          className="w-full px-3 py-1.5 rounded-lg border-2 border-slate-300 focus:border-slate-900 font-mono text-[11px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-800 flex items-center justify-between">
                          <span>API Nøgle (valgfri):</span>
                          <span className="text-[10px] text-slate-500 font-normal">Kun hvis du har sat API_KEY på din worker</span>
                        </label>
                        <input
                          type="password"
                          value={workerApiKey}
                          onChange={(e) => setWorkerApiKey(e.target.value)}
                          placeholder="Bearer API nøgle (valgfri)"
                          className="w-full px-3 py-1.5 rounded-lg border-2 border-slate-300 focus:border-slate-900 font-mono text-[11px]"
                        />
                      </div>
                      <p className="text-[10.5px] text-slate-500">
                        💡 Bruger Cloudflare Workers AI gratis kvote (10,000 Neurons/dag med Flux-1-Schnell).
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">
                        Vælg hurtig scene eller skriv hvad {activePersona.name} skal lave:
                      </span>
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                        Figur: {activePersona.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/70 rounded-xl border border-amber-200">
                      {PRESET_SCENE_PROMPTS.slice(0, 10).map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedScenePromptId(preset.id);
                            setInlineSceneText(preset.prompt);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            selectedScenePromptId === preset.id
                              ? 'bg-amber-400 border-slate-900 text-slate-900 shadow-2xs'
                              : 'bg-white border-slate-300 hover:border-slate-500 text-slate-700'
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
                      placeholder="Beskriv scenen her, f.eks.: vasker tøj, drikker en kop kaffe, støvsuger stuen..."
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-slate-300 focus:border-slate-900 bg-white resize-none shadow-inner"
                    />
                  </div>

                  {aiError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-xs font-bold text-rose-800">
                      ⚠️ {aiError}
                    </div>
                  )}

                  {aiSuccessMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Check size={16} className="text-emerald-700 stroke-[3]" />
                      {aiSuccessMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateWithAi}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm rounded-xl border-2 border-slate-900 flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                        Genererer AI piktogram-billede...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="text-amber-400" />
                        ✨ Generér nyt piktogram-billede direkte (1-klik)
                      </>
                    )}
                  </button>
                </div>

                {/* 1. Manuel ChatGPT guide (Alternativ) */}
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-900 flex items-center justify-center shrink-0 shadow-2xs">
                        <Bot size={18} className="text-slate-900" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          Manuel ChatGPT / DALL-E metode (Alternativ)
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Hvis du foretrækker at generere i ChatGPT via referencebilleder:
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPromptDetails(!showPromptDetails)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-amber-300 transition-colors"
                    >
                      {showPromptDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {showPromptDetails ? 'Skjul detaljer' : 'Vis guide'}
                    </button>
                  </div>

                  {showPromptDetails && (
                    <div className="space-y-3.5 pt-1 text-xs text-slate-800">
                      {/* TRIN 1: Referencer */}
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] flex items-center justify-center">1</span>
                            Download de 2 referencebilleder
                          </span>
                          <span className="text-[11px] text-slate-500">Gemmes på din computer</span>
                        </div>
                        <p className="text-[11.5px] text-slate-600">
                          Du skal uploade to billeder i ChatGPT som referencer (Ref 1 tilpasser sig automatisk din valgte figur):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <a
                            href={activePersona.avatarUrl}
                            download={`ref1-${activePersona.id === 'woman_a' ? 'kvinde' : 'mand'}-avatar.webp`}
                            className="flex items-center justify-between p-2 rounded-lg bg-sky-50 border border-sky-300 hover:bg-sky-100 font-bold text-xs text-sky-900 transition-colors"
                          >
                            <span className="truncate">Ref 1: {activePersona.name} (Valgt figur)</span>
                            <Download size={14} className="shrink-0 ml-1 text-sky-700" />
                          </a>
                          <a
                            href={`${import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/'}reference/ref2_example.jpg`}
                            download="ref2-piktogram-stilart.jpg"
                            className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-300 hover:bg-amber-100 font-bold text-xs text-amber-950 transition-colors"
                          >
                            <span className="truncate">Ref 2: Piktogram-stilart (Reference)</span>
                            <Download size={14} className="shrink-0 ml-1 text-amber-700" />
                          </a>
                        </div>
                        <p className="text-[10.5px] text-slate-500 italic pt-0.5">
                          💡 <em>Vil du have en helt ny person?</em> Så uploader du bare dit eget billede som <strong>Ref 1</strong>, mens Ref 2 altid sikrer samme tegneseriestil.
                        </p>
                      </div>

                      {/* TRIN 2: Vælg Scene */}
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] flex items-center justify-center">2</span>
                            Vælg aktivitet eller skriv den scene du mangler:
                          </span>
                        </div>
                        
                        <div className="space-y-1.5">
                          <select
                            value={selectedScenePromptId}
                            onChange={(e) => {
                              setSelectedScenePromptId(e.target.value);
                              const found = PRESET_SCENE_PROMPTS.find((p) => p.id === e.target.value);
                              if (found) setInlineSceneText(found.prompt);
                            }}
                            className="w-full px-3 py-1.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-slate-900"
                          >
                            {PRESET_SCENE_PROMPTS.map((item) => (
                              <option key={item.id} value={item.id}>
                                [{item.category}] {item.title}
                              </option>
                            ))}
                          </select>

                          <textarea
                            rows={2}
                            value={inlineSceneText}
                            onChange={(e) => setInlineSceneText(e.target.value)}
                            placeholder="Skriv den scene du mangler (på dansk, f.eks.: Figuren sidder og spiller iPad...)"
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-xs text-slate-800 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      {/* TRIN 3: Kopiér Master Prompt med ét klik */}
                      <div className="bg-slate-900 text-white rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-400 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] flex items-center justify-center">3</span>
                            Kopiér Master Prompt (Dansk) til ChatGPT
                          </span>
                          
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyMasterPrompt(
                                buildDanishMasterPrompt({
                                  sceneDescription: inlineSceneText,
                                  personaName: activePersona.name,
                                  isWoman: activePersona.id === 'woman_a',
                                })
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-colors shadow-xs ${
                              copiedMasterPrompt
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                            }`}
                          >
                            {copiedMasterPrompt ? <Check size={14} /> : <Copy size={14} />}
                            {copiedMasterPrompt ? 'Kopieret!' : 'Kopiér Master Prompt'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          Prompten er 100% på dansk og tilpasset din valgte figur (<strong>{activePersona.name}</strong>) med krav om gennemsigtig baggrund (PNG).
                        </p>
                      </div>

                      {/* TRIN 4: Sådan gør du i ChatGPT */}
                      <div className="bg-amber-100/60 border border-amber-300 rounded-xl p-3 space-y-1">
                        <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] flex items-center justify-center">4</span>
                          I ChatGPT:
                        </span>
                        <p className="text-[11.5px] text-slate-700 leading-snug">
                          1. Åbn <strong>ChatGPT</strong>.<br />
                          2. Klik på <strong>+</strong> og vedhæft <strong>Ref 1</strong> og <strong>Ref 2</strong>.<br />
                          3. Indsæt den kopierede Master Prompt i tekstfeltet og send.<br />
                          4. Gem det genererede billede som PNG og upload det lige herunder!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload action card */}
                <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Trin 5: Upload det genererede billede
                      </h5>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Billedet gemmes lokalt og vises med det samme på dit piktogram.
                      </p>
                    </div>
                    {customImageUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomImageUrl('')}
                        className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold hover:underline"
                      >
                        <Trash2 size={13} />
                        Fjern eget billede
                      </button>
                    )}
                  </div>

                  {customImageUrl ? (
                    <div className="flex items-center gap-4 p-3 bg-white border-2 border-emerald-400 rounded-xl shadow-xs">
                      <div className="w-20 h-16 rounded-lg border border-slate-900/30 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                        <img src={customImageUrl} alt="Forhåndsvisning" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                          <Check size={15} className="text-emerald-600 stroke-[3]" />
                          Billedet er uploadet og aktivt!
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Se forhåndsvisningen øverst i vinduet for at se det på det færdige kort.
                        </p>
                      </div>
                      <label className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors shrink-0">
                        Skift fil
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-slate-800 bg-white hover:bg-amber-50/50 rounded-2xl cursor-pointer transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-300 flex items-center justify-center text-slate-900 transition-colors mb-2">
                        <Upload size={18} />
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        Klik her for at vælge dit genererede billede
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        Vælg din gemte PNG fra computeren
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-sm transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Check size={18} className="stroke-[3]" />
              Gem piktogram
            </button>
          </div>
        </form>
      </div>

      {/* Guide modal for generating scene prompts and avatars */}
      <SceneGeneratorGuideModal
        isOpen={isGuideOpen}
        persona={activePersona}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
