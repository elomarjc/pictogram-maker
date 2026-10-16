import React, { useState } from 'react';
import type { Persona } from '../types';
import { DEFAULT_PERSONAS } from '../services/personas';
import { X, Check, User, Sparkles, Upload, ArrowRight, Download, Copy } from 'lucide-react';
import { buildDanishMasterPrompt } from '../data/scenePrompts';

interface PersonaSelectorModalProps {
  isOpen: boolean;
  currentPersona: Persona;
  currentShortCode: string;
  onClose: () => void;
  onSelectPersona: (personaId: string, customShortCode: string, customAvatarUrl?: string) => void;
}

export const PersonaSelectorModal: React.FC<PersonaSelectorModalProps> = ({
  isOpen,
  currentPersona,
  currentShortCode,
  onClose,
  onSelectPersona,
}) => {
  const [selectedId, setSelectedId] = useState(currentPersona.id);
  const [customAvatar, setCustomAvatar] = useState<string | undefined>(undefined);
  const [activeStep, setActiveStep] = useState<'select' | 'new_avatar' | 'new_scenes'>('select');
  const [avatarPromptCopied, setAvatarPromptCopied] = useState(false);
  const [newSceneDescription, setNewSceneDescription] = useState('Figuren sidder hyggeligt ved bordet og spiser en bolle med smør');
  const [scenePromptCopied, setScenePromptCopied] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vælg venligst en gyldig billedfil (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSelectPersona(selectedId, currentShortCode || 'K.', customAvatar);
    onClose();
  };

  const selectedPersonaObj = DEFAULT_PERSONAS.find((p) => p.id === selectedId) || DEFAULT_PERSONAS[0];

  const danishAvatarMasterPrompt = `# Master Prompt — Opret Ny Figur / Avatar (Dansk)

## Referencebillede (Stilart):
- **Billede 1 (Ref 2 — Piktogram-stilart):** Brug den vedhæftede piktogram-skabelon som stilreference for tegneseriestilen (tykke, bløde sorte streger, enkle cel-shading farver og venligt børne-/pædagogisk udtryk).

## Opgave:
Skab **én ny original tegneserie-figur (Avatar)** set forfra eller i 3/4 profil til et visuelt piktogramsystem.

### Retningslinjer:
1. **Udseende:** Venlig, imødekommende person (vælg selv køn/hårfarve/tøj, f.eks. glad dreng i rød trøje eller pige med briller).
2. **Stilart:** Tydelige, rene sorte omrids, flade glade farver og venligt ansigt.
3. **Baggrund:** 100% GENNEMSIGTIG BAGGRUND (Transparent PNG med alpha-kanal). INGEN hvid baggrund og ingen ramme.
4. **Format:** Hoved og overkrop (eller fuld figur), velegnet som reference til daglige aktiviteter.`;

  const copyToClipboard = async (text: string, isAvatar: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isAvatar) {
        setAvatarPromptCopied(true);
        setTimeout(() => setAvatarPromptCopied(false), 2200);
      } else {
        setScenePromptCopied(true);
        setTimeout(() => setScenePromptCopied(false), 2200);
      }
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (isAvatar) {
        setAvatarPromptCopied(true);
        setTimeout(() => setAvatarPromptCopied(false), 2200);
      } else {
        setScenePromptCopied(true);
        setTimeout(() => setScenePromptCopied(false), 2200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border-4 border-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-900 bg-amber-400 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs">
              <User size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                Vælg figur
              </h2>
              <p className="text-xs font-bold text-slate-800">
                Figuren der udfører aktiviteterne på piktogrammerne
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Top navigation between choosing figure, create new avatar, and create missing scenes */}
          <div className="flex border-b-2 border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveStep('select')}
              className={`pb-2 px-3 font-black text-xs sm:text-sm border-b-2 -mb-[2px] transition-colors ${
                activeStep === 'select'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              1. Vælg figur (Mand / Kvinde)
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('new_avatar')}
              className={`pb-2 px-3 font-black text-xs sm:text-sm border-b-2 -mb-[2px] transition-colors ${
                activeStep === 'new_avatar'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              2. Opret ny avatar
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('new_scenes')}
              className={`pb-2 px-3 font-black text-xs sm:text-sm border-b-2 -mb-[2px] transition-colors ${
                activeStep === 'new_scenes'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              3. Opret nye scener
            </button>
          </div>

          {/* TAB 1: Select between Man and Woman */}
          {activeStep === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {DEFAULT_PERSONAS.map((p) => {
                  const isSelected = selectedId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`cursor-pointer rounded-2xl border-3 p-4 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-amber-50 shadow-md ring-3 ring-amber-400'
                          : 'border-slate-300 hover:border-slate-600 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl border-2 border-slate-900 overflow-hidden bg-white shrink-0 shadow-xs">
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">
                              {p.name}
                            </h3>
                            {isSelected && (
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                                <Check size={14} className="stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upload custom avatar box if user has one ready */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Har du allerede et eget figur-billede?
                    </h4>
                    <p className="text-xs text-slate-600">
                      Gemmes lokalt på denne computer.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl border-2 border-slate-900 cursor-pointer shadow-xs transition-colors shrink-0">
                    <Upload size={14} />
                    Vælg billede
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {customAvatar && (
                  <div className="flex items-center gap-3 pt-1 p-2 bg-white rounded-xl border border-emerald-400">
                    <div className="w-14 h-14 rounded-xl border-2 border-slate-900 overflow-hidden bg-white shrink-0">
                      <img src={customAvatar} alt="Eget billede" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-800">✓ Dit eget billede er indlæst og aktivt!</p>
                      <button
                        onClick={() => setCustomAvatar(undefined)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Fjern eget billede
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">Mangler du en ny figur eller nye scener?</span>
                <button
                  type="button"
                  onClick={() => setActiveStep('new_avatar')}
                  className="inline-flex items-center gap-1 text-xs font-black text-amber-900 hover:text-black underline"
                >
                  Gå til trin-for-trin guide <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP CREATE NEW AVATAR */}
          {activeStep === 'new_avatar' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center">1</span>
                  <h4 className="text-sm font-black text-slate-900">
                    Download stilarts-eksemplet (Ref 2)
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  Dette billede viser ChatGPT den præcise piktogram-tegnestil:
                </p>
                <div>
                  <a
                    href={`${import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/'}reference/ref2_example.jpg`}
                    download="ref2-piktogram-stilart.jpg"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl border border-slate-300 transition-colors shadow-2xs"
                  >
                    <Download size={14} />
                    Download Ref 2 (Piktogram-stilart)
                  </a>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="text-sm font-black text-amber-400">
                      Kopiér Dansk Avatar Master Prompt
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(danishAvatarMasterPrompt, true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-colors shadow-xs ${
                      avatarPromptCopied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                    }`}
                  >
                    {avatarPromptCopied ? <Check size={14} /> : <Copy size={14} />}
                    {avatarPromptCopied ? 'Kopieret!' : 'Kopiér Prompt'}
                  </button>
                </div>
                <p className="text-xs text-slate-300">
                  Åbn ChatGPT, vedhæft <strong>Ref 2</strong>, indsæt den kopierede prompt og skriv f.eks. "Lav en glad dreng med krøllet brunt hår og grøn trøje".
                </p>
              </div>

              <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center">3</span>
                  <h4 className="text-sm font-black text-slate-900">
                    Upload det nye avatar-billede her
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  Når ChatGPT har genereret billedet, gemmer du det som PNG og vælger det her:
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl border-2 border-slate-900 cursor-pointer shadow-xs transition-colors">
                  <Upload size={14} />
                  Vælg avatar PNG fra computeren
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveStep('new_scenes')}
                  className="inline-flex items-center gap-1 text-xs font-black text-slate-900 hover:text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors"
                >
                  Næste: Opret scener til din nye avatar <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP CREATE MISSING SCENES */}
          {activeStep === 'new_scenes' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600" />
                  Mangler din nye avatar en aktivitet eller scene?
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Skriv den aktivitet du mangler på dansk herunder. Master Prompten tilpasser sig automatisk din valgte figur (<strong>{selectedPersonaObj.name}</strong>) og sikrer gennemsigtig baggrund:
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                    Beskriv scenen du mangler:
                  </label>
                  <textarea
                    rows={2}
                    value={newSceneDescription}
                    onChange={(e) => setNewSceneDescription(e.target.value)}
                    placeholder="F.eks.: Figuren sidder og tegner ved bordet med farveblyanter..."
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-amber-400">
                    Færdig Dansk Master Prompt
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        buildDanishMasterPrompt({
                          sceneDescription: newSceneDescription,
                          personaName: selectedPersonaObj.name,
                          isWoman: selectedPersonaObj.id === 'woman_a',
                        }),
                        false
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-colors shadow-xs ${
                      scenePromptCopied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                    }`}
                  >
                    {scenePromptCopied ? <Check size={14} /> : <Copy size={14} />}
                    {scenePromptCopied ? 'Kopieret!' : 'Kopiér Master Prompt'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  1. Vedhæft dit avatar-billede (Ref 1) og stilarts-eksemplet (Ref 2) i ChatGPT.<br />
                  2. Indsæt denne prompt og tryk send.<br />
                  3. Upload det færdige billede direkte i "Upload eget billede" på det ønskede piktogram!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border-2 border-slate-300 text-sm transition-colors"
          >
            Annuller
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Check size={16} className="stroke-[3]" />
            Vælg figur ({selectedPersonaObj.name})
          </button>
        </div>
      </div>
    </div>
  );
};
