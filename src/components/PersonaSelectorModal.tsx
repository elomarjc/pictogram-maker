import React, { useState } from 'react';
import type { Persona } from '../types';
import { DEFAULT_PERSONAS } from '../services/personas';
import { X, Check, User, Sparkles, Upload } from 'lucide-react';

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
  const [shortCode, setShortCode] = useState(currentShortCode || currentPersona.shortCode || 'K.');
  const [customAvatar, setCustomAvatar] = useState<string | undefined>(undefined);

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
    const cleanCode = shortCode.trim() || 'K.';
    onSelectPersona(selectedId, cleanCode, customAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border-4 border-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-900 bg-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900">
              <User size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                Vælg figur & forkortelse
              </h2>
              <p className="text-xs font-semibold text-slate-800">
                Figuren vises i venstre side af hvert piktogramkort
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
          {/* Information box */}
          <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-3.5 flex items-start gap-3">
            <Sparkles size={20} className="text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-sky-900 leading-relaxed">
              Her kan du vælge figuren, der udfører aktiviteterne (f.eks. vasker tøj, spiser, drikker kaffe). 
              Af hensyn til privatliv bruges altid en <strong>forkortelse</strong> (f.eks. <em>K.</em> eller <em>A.</em>) i stedet for det fulde navn.
            </p>
          </div>

          {/* Persona Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Vælg figur:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DEFAULT_PERSONAS.map((p) => {
                const isSelected = selectedId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedId(p.id);
                      if (shortCode === currentPersona.shortCode || !shortCode) {
                        setShortCode(p.shortCode);
                      }
                    }}
                    className={`cursor-pointer rounded-2xl border-3 p-3.5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-amber-50 shadow-md ring-2 ring-amber-400'
                        : 'border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50'
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
                          <h3 className="text-base font-black text-slate-900 truncate">
                            {p.name}
                          </h3>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                              <Check size={12} className="stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-tight">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Abbreviation input */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
              Forkortelse / Initialer til overskrift (f.eks. K. eller AV):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                maxLength={6}
                placeholder="f.eks. K."
                className="w-28 px-3 py-2 text-base font-black bg-white border-2 border-slate-900 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-center"
              />
              <span className="text-xs text-slate-600">
                Vises i overskriften på tavlen (f.eks. <strong>Mandag – {shortCode || 'K.'}</strong>).
              </span>
            </div>
          </div>

          {/* Custom Avatar Upload (Optional) */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Valgfrit: Upload eget figur-billede
                </label>
                <p className="text-xs text-slate-600">
                  Gemmes kun lokalt i din browser – ingen upload til skyen.
                </p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border-2 border-slate-900 cursor-pointer shadow-xs transition-colors">
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
              <div className="flex items-center gap-3 pt-1">
                <div className="w-14 h-14 rounded-xl border-2 border-slate-900 overflow-hidden bg-white shrink-0">
                  <img src={customAvatar} alt="Tilpasset avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-700">✓ Dit eget billede er indlæst lokalt</p>
                  <button
                    onClick={() => setCustomAvatar(undefined)}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Fjern billede
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border-2 border-slate-300 text-sm transition-colors"
          >
            Annuller
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <Check size={16} className="stroke-[3]" />
            Anvend figur ({shortCode || 'K.'})
          </button>
        </div>
      </div>
    </div>
  );
};
