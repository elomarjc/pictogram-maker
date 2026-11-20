import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  Wand2,
  ExternalLink,
  RefreshCw,
  Upload,
  Sparkles,
  User,
  ArrowRight,
  ArrowLeft,
  Clock,
  Loader2,
  Plus,
  Play,
} from 'lucide-react';
import type { Persona } from '../types';
import { getAllPersonas, saveCustomPersona } from '../services/personas';
import {
  getChatGPTStatus,
  openChatGPTLogin,
  generateSingleSceneWithChatGPT,
  type ChatGPTStatus,
} from '../services/chatgptGeneration';
import {
  getReadyScenesCount,
  generateAllMissingScenes,
  type SceneGenProgress,
} from '../services/characterSceneGenerator';

interface StartWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: Persona;
  onSelectPersona: (personaId: string, customShortCode: string, customAvatarUrl?: string) => void;
  onPersonaUpdated?: (updated: Persona) => void;
  onOpenSceneGen?: (persona: Persona, batch?: 1 | 2) => void;
}

const QUICK_ACTIVITY_IDEAS = [
  { label: 'Brætspil', prompt: 'Figuren sidder ved stuebordet og spiller et farverigt brætspil, smilende og glad.' },
  { label: 'iPad / tablet', prompt: 'Figuren sidder hyggeligt i sofaen og bruger en tablet/iPad med et smil.' },
  { label: 'Svømmehal', prompt: 'Figuren er i svømmehallen med badehætte og svømmebriller og bader glad i bassinet.' },
  { label: 'Læse en bog', prompt: 'Figuren sidder behageligt i en blød lænestol og fordyber sig i en god bog med et varmt smil.' },
  { label: 'Bage boller', prompt: 'Figuren står i køkkenet med forklæde og bager lækre, friskbagte boller.' },
  { label: 'Fysioterapi', prompt: 'Figuren laver sjove og rolige gymnastikøvelser på en træningsmåtte sammen med en hjælper.' },
  { label: 'Tage overtøj på', prompt: 'Figuren tager sin varme vinterjakke og støvler på i gangen, klar til at gå ud.' },
  { label: 'Bus & Tog', prompt: 'Figuren sidder i en rød bybus og kigger glad ud af vinduet på en hyggelig tur.' },
  { label: 'Havearbejde', prompt: 'Figuren vander grønne planter med en lille vandkande i haven med et stort smil.' },
];

export const StartWizardModal: React.FC<StartWizardModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
  onPersonaUpdated,
  onOpenSceneGen,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [chatgptStatus, setChatgptStatus] = useState<ChatGPTStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>(() => getAllPersonas());
  const [selectedPersonaId, setSelectedPersonaId] = useState(currentPersona.id);

  // New persona from photo state
  const [newPhotoDataUrl, setNewPhotoDataUrl] = useState<string | null>(null);
  const [newPersonaName, setNewPersonaName] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step 3 Activity generation state
  const [customIdeaText, setCustomIdeaText] = useState('');
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [ideaProgressMsg, setIdeaProgressMsg] = useState('');
  const [ideaSuccessMsg, setIdeaSuccessMsg] = useState<string | null>(null);
  const [ideaErrorMsg, setIdeaErrorMsg] = useState<string | null>(null);

  // Batch generation state
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<SceneGenProgress | null>(null);

  const activeWizardPersona =
    personas.find((p) => p.id === selectedPersonaId) || currentPersona;

  // Check ChatGPT status
  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const s = await getChatGPTStatus();
      setChatgptStatus(s);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setPersonas(getAllPersonas());
      setSelectedPersonaId(currentPersona.id);

      // Background auto-polling while on Step 1 if not connected
      const interval = setInterval(async () => {
        const s = await getChatGPTStatus();
        setChatgptStatus(s);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOpen, currentPersona.id]);

  if (!isOpen) return null;

  const handleFinishWizard = () => {
    try {
      localStorage.setItem('pictogram_has_seen_onboarding', 'true');
    } catch {}
    const chosen = personas.find((p) => p.id === selectedPersonaId) || currentPersona;
    onSelectPersona(chosen.id, chosen.shortCode || chosen.name || '', chosen.avatarUrl);
    onClose();
  };

  const handleSelectExistingPersona = (persona: Persona) => {
    setSelectedPersonaId(persona.id);
    onSelectPersona(persona.id, persona.shortCode || persona.name || '', persona.avatarUrl);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vælg venligst en gyldig billedfil (JPG, PNG eller WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoDataUrl(reader.result);
        if (!newPersonaName) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setNewPersonaName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    };
    reader.readAsDataURL(file);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleSaveNewPersona = () => {
    if (!newPhotoDataUrl) return;

    const id = `avatar_${Date.now()}`;
    const name = newPersonaName.trim() || 'Min figur';
    const newP: Persona = {
      id,
      name,
      shortCode: name.slice(0, 3),
      avatarUrl: newPhotoDataUrl,
      description: name,
      activityScenes: {},
    };

    saveCustomPersona(newP);
    const updated = getAllPersonas();
    setPersonas(updated);
    setSelectedPersonaId(newP.id);
    onSelectPersona(newP.id, newP.shortCode, newP.avatarUrl);
    onPersonaUpdated?.(newP);
    setNewPhotoDataUrl(null);
    setNewPersonaName('');
    setCurrentStep(3);
  };

  const handleGenerateBatch1 = async () => {
    if (isGeneratingBatch) return;
    setIsGeneratingBatch(true);
    setBatchProgress(null);

    try {
      const updated = await generateAllMissingScenes(
        activeWizardPersona,
        (p) => {
          setBatchProgress(p);
        },
        { batch: 1 }
      );
      setPersonas(getAllPersonas());
      onPersonaUpdated?.(updated);
    } catch (err: any) {
      alert(`Fejl under generering: ${err.message || String(err)}`);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleGenerateCustomIdea = async () => {
    const text = customIdeaText.trim();
    if (!text || isGeneratingIdea) return;

    setIsGeneratingIdea(true);
    setIdeaProgressMsg('Starter ChatGPT session...');
    setIdeaSuccessMsg(null);
    setIdeaErrorMsg(null);

    const safeKey = `custom_${Date.now()}`;

    try {
      const res = await generateSingleSceneWithChatGPT(
        activeWizardPersona.id,
        safeKey,
        text,
        (prog) => {
          setIdeaProgressMsg(prog.message);
        }
      );

      if (res.sceneUrl) {
        const updated = {
          ...activeWizardPersona,
          activityScenes: {
            ...(activeWizardPersona.activityScenes || {}),
            [safeKey]: res.sceneUrl,
          },
        };
        saveCustomPersona(updated);
        setPersonas(getAllPersonas());
        onPersonaUpdated?.(updated);
        setIdeaSuccessMsg(`Scenen blev tegnet og tilføjet til ${activeWizardPersona.name}!`);
        setCustomIdeaText('');
      } else {
        setIdeaSuccessMsg(`Scenen blev tegnet!`);
      }
    } catch (err: any) {
      setIdeaErrorMsg(`Fejl: ${err.message || String(err)}`);
    } finally {
      setIsGeneratingIdea(false);
      setIdeaProgressMsg('');
    }
  };

  const { ready, total } = getReadyScenesCount(activeWizardPersona);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-3 sm:border-4 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-xs">
              <Sparkles size={18} className="text-slate-900 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                Kom godt i gang med AI-piktogrammer
              </h2>
              <span className="text-[11px] font-bold text-slate-800">
                Følg de 3 enkle trin for at skabe dine egne billeder
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinishWizard}
            title="Luk guiden og åbn ugeplanen"
            aria-label="Luk"
            className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3-Step Navigation Tabs */}
        <div className="grid grid-cols-3 border-b-2 border-slate-200 bg-slate-100 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-white text-slate-900 shadow-xs border-2 border-slate-900'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">
              1
            </span>
            <span className="truncate">Forbind ChatGPT</span>
            {chatgptStatus?.loggedIn && (
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-white text-slate-900 shadow-xs border-2 border-slate-900'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">
              2
            </span>
            <span className="truncate">Vælg figur</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-white text-slate-900 shadow-xs border-2 border-slate-900'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">
              3
            </span>
            <span className="truncate">Generér aktiviteter</span>
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TRIN 1: FORBIND CHATGPT */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Trin 1: Forbind ChatGPT</span>
                  {chatgptStatus?.loggedIn ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Forbundet
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center gap-1">
                      <AlertCircle size={12} /> Ikke forbundet endnu
                    </span>
                  )}
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                  For at appen kan tegne dine egne personlige piktogrammer med AI, skal den bruge din
                  ChatGPT-konto i browseren. Du skal blot logge ind én gang på chatgpt.com.
                </p>
              </div>

              {/* Status Card */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all ${
                  chatgptStatus?.loggedIn
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-amber-50 border-amber-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-4 h-4 rounded-full mt-1 shrink-0 ${
                      chatgptStatus?.loggedIn
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                        : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  <div className="space-y-1.5 flex-1">
                    <span className="text-sm font-black text-slate-900 block">
                      {chatgptStatus?.loggedIn
                        ? 'ChatGPT er forbundet og klar til at tegne!'
                        : 'Log ind på ChatGPT for at aktivere billedtegning'}
                    </span>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                      {chatgptStatus?.loggedIn
                        ? `Forbundet via browser (${
                            chatgptStatus.profiles.length > 0
                              ? chatgptStatus.profiles.join(', ')
                              : 'Aktiv session'
                          }). Alt er klar til at lave personlige piktogrammer!`
                        : '1. Klik på den gule knap for at åbne ChatGPT i en ny fane.\n2. Log ind med din konto.\n3. Vend tilbage hertil — appen opdager automatisk forbindelsen med det samme.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-slate-900/10">
                  <button
                    type="button"
                    onClick={openChatGPTLogin}
                    className="px-4 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>{chatgptStatus?.loggedIn ? 'Åbn ChatGPT fane' : 'Log ind på ChatGPT (åbner i ny fane)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={checkStatus}
                    disabled={checkingStatus}
                    className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} className={checkingStatus ? 'animate-spin' : ''} />
                    <span>Tjek forbindelse igen</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions for Step 1 */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Fortsæt uden AI (brug standardsymboler)
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Gå til Trin 2: Vælg figur</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TRIN 2: VÆLG ELLER OPRET FIGUR */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Trin 2: Vælg eller opret figur
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  Vælg hvem piktogrammerne skal handle om. Du kan vælge en eksisterende figur, eller uploade et foto af barnet/eleven.
                </p>
              </div>

              {/* Existing Personas */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Eksisterende figurer
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {personas.map((p) => {
                    const isSelected = p.id === selectedPersonaId;
                    const { ready: r, total: t } = getReadyScenesCount(p);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectExistingPersona(p)}
                        className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400 shadow-xs'
                            : 'bg-slate-50 border-slate-300 hover:border-slate-500 hover:bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl border-2 border-slate-900 overflow-hidden bg-white shrink-0">
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-slate-900 block truncate">
                            {p.name && !p.name.startsWith('avatar_') ? p.name : 'Standardfigur (K.)'}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-500 block">
                            {r}/{t} scener klar
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload photo to create new persona */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/60 space-y-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-amber-700" />
                  <span className="text-xs font-black text-slate-900">
                    Opret en ny personlig figur ud fra foto
                  </span>
                </div>

                {!newPhotoDataUrl ? (
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-900 bg-white hover:bg-amber-50 cursor-pointer transition-colors group">
                    <Upload size={20} className="text-amber-600 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      Klik her for at vælge et foto af personen
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                      JPG, PNG eller WebP fra din computer eller telefon
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={photoInputRef}
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-300">
                    <img
                      src={newPhotoDataUrl}
                      alt="Forhåndsvisning"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-slate-900 shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        Figurens navn:
                      </label>
                      <input
                        type="text"
                        value={newPersonaName}
                        onChange={(e) => setNewPersonaName(e.target.value)}
                        placeholder="F.eks. Lucas, Sofie eller AV"
                        className="w-full h-8 px-2.5 rounded-lg border-2 border-slate-900 text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveNewPersona}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 border-2 border-slate-900 text-slate-900 font-black text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      Gem figur
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Actions for Step 2 */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Tilbage</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Gå til Trin 3: Aktiviteter</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TRIN 3: GENERÉR AKTIVITETER & IDÉER */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Trin 3: Generér aktiviteter & idéer
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  Figuren <strong>{activeWizardPersona.name}</strong> har {ready} af {total} standardscener klar. Du kan generere hele grundpakken på én gang eller tilføje dine egne specifikke idéer.
                </p>
              </div>

              {/* Active persona preview banner */}
              <div className="p-3 bg-slate-100 border-2 border-slate-300 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl border-2 border-slate-900 overflow-hidden bg-white shrink-0">
                    <img
                      src={activeWizardPersona.avatarUrl}
                      alt={activeWizardPersona.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Aktiv figur: {activeWizardPersona.name}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {ready} af {total} piktogramscener er klar ({Math.round((ready / total) * 100)}%)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Skift figur
                </button>
              </div>

              {/* Option A: Generate 20-in-1 Master Sheet Batch */}
              <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Play size={14} className="text-amber-700 fill-current" />
                    Mulighed A: Generér 20 hverdagsrutiner (Anbefalet)
                  </span>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                    Kun 1 ChatGPT prompt
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                  Tegner automatisk de 20 vigtigste hverdagsrutiner (Morgenmad, Tandbørstning, Vasketøj, Medicin, Badetid, Sove osv.) på ét ark med OpenCV-beskæring.
                </p>

                <button
                  type="button"
                  disabled={isGeneratingBatch || !chatgptStatus?.loggedIn}
                  onClick={handleGenerateBatch1}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  {isGeneratingBatch ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-slate-900" />
                      <span>{batchProgress?.currentSceneTitle || 'Genererer 20 scener i ChatGPT...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Start generering af 20 grundrutiner nu</span>
                    </>
                  )}
                </button>

                {!chatgptStatus?.loggedIn && (
                  <span className="text-[11px] font-bold text-amber-800 block text-center">
                    ⚠️ Kræver login på ChatGPT (gå til Trin 1 for at logge ind).
                  </span>
                )}
              </div>

              {/* Option B: Custom Activity Ideas */}
              <div className="p-4 rounded-2xl border-2 border-slate-300 bg-white space-y-3">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Wand2 size={14} className="text-indigo-600" />
                  Mulighed B: Tilføj egne idéer til aktiviteter
                </span>

                {/* Quick Idea Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10.5px] font-bold text-slate-500">Idéer:</span>
                  {QUICK_ACTIVITY_IDEAS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setCustomIdeaText(item.prompt)}
                      className="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-slate-100 hover:bg-amber-100 border border-slate-300 hover:border-slate-900 text-slate-800 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Custom prompt textarea */}
                <textarea
                  value={customIdeaText}
                  onChange={(e) => setCustomIdeaText(e.target.value)}
                  rows={2}
                  placeholder="Skriv hvad figuren skal lave på dansk, f.eks.: Figuren er i svømmehallen med badehætte..."
                  className="w-full p-2.5 rounded-xl border-2 border-slate-900 text-xs font-bold text-slate-900 resize-none outline-none focus:ring-2 focus:ring-amber-400"
                />

                <button
                  type="button"
                  disabled={isGeneratingIdea || !customIdeaText.trim() || !chatgptStatus?.loggedIn}
                  onClick={handleGenerateCustomIdea}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-900 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  {isGeneratingIdea ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>{ideaProgressMsg || 'ChatGPT tegner din aktivitet...'}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={14} />
                      <span>Tegn min idé med ChatGPT</span>
                    </>
                  )}
                </button>

                {ideaSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                    <span>{ideaSuccessMsg}</span>
                  </div>
                )}

                {ideaErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 text-rose-600" />
                    <span>{ideaErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions for Step 3: Finish and enter board */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Tilbage</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="px-6 py-3 rounded-2xl border-3 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Check size={18} className="stroke-[3]" />
                  <span>Åbn ugeplanen med de nye piktogrammer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartWizardModal;
