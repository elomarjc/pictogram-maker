import React, { useState, useRef } from 'react';
import { X, Sparkles, Loader2, Check, ShieldCheck, Upload, Trash2, AlertCircle } from 'lucide-react';
import { createAvatarFromPhoto } from '../services/imageGenerationApi';
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
  const [personaName, setPersonaName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Resize client-side to maximum 512x512 to ensure fast processing
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
  };

  const handleTransform = async () => {
    if (!photoDataUrl) {
      setError('Vælg venligst et foto først.');
      return;
    }
    if (!personaName.trim()) {
      setError('Indtast venligst et navn til figuren.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const avatarDataUrl = await createAvatarFromPhoto(photoDataUrl, personaName);
      setGeneratedAvatarUrl(avatarDataUrl);
      // Immediately discard the real photo to protect privacy!
      setPhotoDataUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndUse = () => {
    if (!generatedAvatarUrl) return;

    const id = `custom_${Date.now()}`;
    const newPersona: Persona = {
      id,
      name: personaName.trim() || 'Ny figur',
      shortCode: (personaName.trim()[0] || 'X').toUpperCase() + '.',
      avatarUrl: generatedAvatarUrl,
      description: `Tilpasset figur for ${personaName.trim()}`,
      activityScenes: {},
    };

    saveCustomPersona(newPersona);
    onAvatarCreated(newPersona);
    onClose();
  };

  const handleReset = () => {
    setPhotoDataUrl(null);
    setGeneratedAvatarUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-200 bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center font-bold text-slate-900 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Opret figur ud fra et foto
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Omdan et rigtigt foto til en 2D piktogram-tegneseriefigur
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-slate-300 hover:border-slate-900 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Privacy Guarantee Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">100% Privatlivsgaranti:</span> Dit rigtige foto bruges udelukkende i browseren til at tegne figuren. Det bliver <strong>aldrig</strong> gemt eller uploadet til GitHub. Kun den færdige tegneserie-figur gemmes!
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Navn */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              1. Hvad hedder personen?
            </label>
            <input
              type="text"
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
              placeholder="f.eks. Peter, Mette eller Kasper"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-slate-900 text-sm font-bold bg-white"
            />
          </div>

          {/* Step 2: Vælg foto eller vis resultat */}
          {!generatedAvatarUrl ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                2. Vælg foto af personen
              </label>

              {!photoDataUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-3 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-amber-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 group-hover:bg-amber-300 border-2 border-slate-900 flex items-center justify-center transition-colors">
                    <Upload size={24} className="text-slate-900" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Klik her for at vælge et foto
                  </span>
                  <span className="text-xs text-slate-500">
                    Et portrætfoto af ansigt og overkrop giver det bedste resultat
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-4 p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl">
                  <img
                    src={photoDataUrl}
                    alt="Valgt foto"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-slate-900 shadow-xs"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-900">Foto valgt og klar!</p>
                    <p className="text-slate-500">Klar til at tegne 2D piktogram-figuren.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 rounded-xl border-2 border-slate-300 hover:border-rose-500 text-slate-600 hover:text-rose-600 hover:bg-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <button
                type="button"
                disabled={!photoDataUrl || !personaName.trim() || isGenerating}
                onClick={handleTransform}
                className="w-full mt-2 py-3 rounded-2xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-black text-slate-900 text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-slate-900" />
                    <span>Tegner din nye figur... (ca. 4 sekunder)</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-slate-900" />
                    <span>Omdan foto til tegneserie-figur (1-klik)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Result preview */
            <div className="space-y-3 p-4 bg-amber-50 border-3 border-amber-400 rounded-2xl text-center animate-in zoom-in-95 duration-150">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Din nye figur er klar!
              </span>
              <div className="flex justify-center">
                <div className="w-28 h-28 rounded-2xl bg-white border-3 border-slate-900 p-1 shadow-md overflow-hidden flex items-center justify-center">
                  <img
                    src={generatedAvatarUrl}
                    alt={personaName}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {personaName} er nu omdannet til en 2D piktogram-figur med transparent baggrund!
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-white text-xs transition-colors"
                >
                  Prøv igen
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  className="px-5 py-2 rounded-xl border-2 border-slate-900 bg-emerald-400 hover:bg-emerald-500 font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>Gem og brug figuren nu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
