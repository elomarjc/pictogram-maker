import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Check, Upload, Trash2, AlertCircle, RotateCcw, Sparkles, Clock } from 'lucide-react';
import { createAvatarFromPhoto, describeAvatarImage } from '../services/imageGenerationApi';
import { saveCustomPersona } from '../services/personas';
import type { Persona } from '../types';

interface CreateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: (persona: Persona) => void;
}

export const CreateAvatarModal: React.FC<CreateAvatarModalProps> = ({
  isOpen,
  onClose,
  onAvatarCreated,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);
  const [avatarDescription, setAvatarDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<number | null>(null);

  // Clear progress timer on unmount or modal close
  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vælg venligst en gyldig billedfil (JPG, PNG eller WEBP).');
      return;
    }

    setError(null);
    setGeneratedAvatarUrl(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 512;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const resized = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoDataUrl(resized);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTransform = async () => {
    if (!photoDataUrl) {
      setError('Vælg venligst et foto først.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(5);
    setProgressStage('Forbereder foto...');

    const startTime = Date.now();
    if (progressTimerRef.current !== null) {
      clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        setProgressStage('Forbereder foto...');
        setProgress(Math.min(25, 5 + (elapsed / 1000) * 20));
      } else if (elapsed < 2500) {
        setProgressStage('Analyserer ansigt & personlige træk...');
        setProgress(Math.min(70, 25 + ((elapsed - 1000) / 1500) * 45));
      } else if (elapsed < 4000) {
        setProgressStage('Tegner 2D tegneseriefigur med AI...');
        setProgress(Math.min(92, 70 + ((elapsed - 2500) / 1500) * 22));
      } else {
        setProgressStage('Færdiggør figur...');
        setProgress(Math.min(96, 92 + ((elapsed - 4000) / 3000) * 4));
      }
    }, 80);

    try {
      const avatarDataUrl = await createAvatarFromPhoto(photoDataUrl);
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
      }
      setProgress(100);
      setProgressStage('Færdig!');

      // Kick off background visual trait analysis so it's ready when generating scenes
      describeAvatarImage(avatarDataUrl).then((desc) => {
        if (desc && desc.trim()) {
          setAvatarDescription(desc.trim());
        }
      }).catch(() => {});

      // Brief pause to display 100% completion before switching view
      await new Promise((r) => setTimeout(r, 200));
      setGeneratedAvatarUrl(avatarDataUrl);
    } catch (err) {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
      }
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndUse = () => {
    if (!generatedAvatarUrl) return;

    const id = `avatar_${Date.now()}`;
    const newPersona: Persona = {
      id,
      name: 'Min figur',
      shortCode: '',
      avatarUrl: generatedAvatarUrl,
      description: avatarDescription.trim(),
      activityScenes: {},
    };

    saveCustomPersona(newPersona);
    onAvatarCreated(newPersona);
    onClose();
  };

  const handleReset = () => {
    if (progressTimerRef.current !== null) {
      clearInterval(progressTimerRef.current);
    }
    setPhotoDataUrl(null);
    setGeneratedAvatarUrl(null);
    setAvatarDescription('');
    setIsGenerating(false);
    setProgress(0);
    setProgressStage('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs">
              <Camera size={18} />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              Opret figur ud fra foto
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

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STATE 1: GENERATING IN PROGRESS */}
          {isGenerating ? (
            <div className="space-y-4 p-5 bg-amber-50/60 border-2 border-amber-300 rounded-2xl text-center">
              {photoDataUrl && (
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-900 overflow-hidden shadow-xs relative">
                    <img
                      src={photoDataUrl}
                      alt="Forbereder foto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-amber-400/20 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Progress details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-900 px-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600 animate-spin" />
                    <span>{progressStage || 'Opretter figur...'}</span>
                  </span>
                  <span className="tabular-nums font-black text-amber-950">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-3.5 bg-slate-200 border-2 border-slate-900 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
                  />
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 pt-0.5">
                  <Clock size={12} />
                  <span>Tager ca. 4 sekunder</span>
                </div>
              </div>
            </div>
          ) : generatedAvatarUrl ? (
            /* STATE 2: COMPARISON & ACTIONS VIEW */
            <div className="space-y-4">
              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-3">
                {/* Original Photo */}
                <div className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Dit foto
                  </span>
                  <div className="w-full aspect-square rounded-xl bg-white border-2 border-slate-900 overflow-hidden shadow-xs flex items-center justify-center">
                    {photoDataUrl ? (
                      <img
                        src={photoDataUrl}
                        alt="Dit foto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 font-bold">Foto</div>
                    )}
                  </div>
                </div>

                {/* Generated Cartoon Avatar */}
                <div className="flex flex-col items-center gap-1.5 p-2.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    Ny figur
                  </span>
                  <div className="w-full aspect-square rounded-xl bg-white border-2 border-slate-900 overflow-hidden shadow-xs flex items-center justify-center p-1.5">
                    <img
                      src={generatedAvatarUrl}
                      alt="Ny figur"
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Primary: Save and Use */}
                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  className="w-full py-2.5 rounded-xl border-2 border-slate-900 bg-emerald-400 hover:bg-emerald-500 font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>Gem og brug figur</span>
                </button>

                {/* Secondary Actions: Regenerate, New Photo, Discard */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTransform}
                    title="Prøv igen med samme foto"
                    className="flex-1 py-2 px-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 font-bold text-slate-900 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={13} className="stroke-[2.5]" />
                    <span>Generer igen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Vælg et andet foto"
                    className="flex-1 py-2 px-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 font-bold text-slate-900 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={13} className="stroke-[2.5]" />
                    <span>Nyt foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    title="Kassér figur"
                    className="py-2 px-3 rounded-xl border-2 border-slate-300 hover:border-rose-400 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} className="stroke-[2.5]" />
                    <span>Kassér</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 3: PHOTO SELECTION / INITIAL VIEW */
            <div className="space-y-3">
              {!photoDataUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-amber-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 group-hover:bg-amber-300 border-2 border-slate-900 flex items-center justify-center transition-colors shadow-xs">
                    <Upload size={20} className="text-slate-900" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black text-slate-900 block">
                      Vælg et foto af personen
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Brug et portrætfoto forfra i godt lys for bedste resultat
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl">
                  <img
                    src={photoDataUrl}
                    alt="Valgt foto"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-slate-900 shadow-xs shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-900">Foto valgt</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer mt-0.5"
                    >
                      Vælg et andet foto
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-xl border border-slate-300 hover:border-rose-500 text-slate-600 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                    title="Fjern foto"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={!photoDataUrl}
                onClick={handleTransform}
                className="w-full py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={15} className="text-slate-900" />
                <span>Opret tegneseriefigur (AI)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
