import React, { useState, useRef } from 'react';
import { X, Camera, Loader2, Check, Upload, Trash2, AlertCircle } from 'lucide-react';
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

    setError(null);
    setIsGenerating(true);

    try {
      const avatarDataUrl = await createAvatarFromPhoto(photoDataUrl);
      setGeneratedAvatarUrl(avatarDataUrl);
      setPhotoDataUrl(null);
    } catch (err) {
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
      name: id,
      shortCode: '',
      avatarUrl: generatedAvatarUrl,
      description: '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
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

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!generatedAvatarUrl ? (
            <div className="space-y-3">
              {!photoDataUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 hover:bg-amber-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-300 border-2 border-slate-900 flex items-center justify-center transition-colors">
                    <Upload size={18} className="text-slate-900" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Vælg et foto af personen
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl">
                  <img
                    src={photoDataUrl}
                    alt="Valgt foto"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-slate-900 shadow-xs"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-900">Foto valgt</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-xl border border-slate-300 hover:border-rose-500 text-slate-600 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
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
                disabled={!photoDataUrl || isGenerating}
                onClick={handleTransform}
                className="w-full py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-slate-900" />
                    <span>Opretter figur...</span>
                  </>
                ) : (
                  <>
                    <Camera size={15} className="text-slate-900" />
                    <span>Opret figur</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Result preview */
            <div className="space-y-3 p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-900 p-1 shadow-xs overflow-hidden flex items-center justify-center">
                  <img
                    src={generatedAvatarUrl}
                    alt="Ny figur"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-white text-xs transition-colors cursor-pointer"
                >
                  Prøv igen
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  className="px-5 py-2 rounded-xl border-2 border-slate-900 bg-emerald-400 hover:bg-emerald-500 font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>Gem og brug figur</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
