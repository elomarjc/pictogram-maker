import React, { useState, useEffect } from 'react';
import type { Persona } from '../types';
import { getAllPersonas, deleteCustomPersona, isDefaultPersona, DEFAULT_PERSONAS } from '../services/personas';
import { X, Check, User, Upload, Camera, Trash2, AlertTriangle } from 'lucide-react';
import { CreateAvatarModal } from './CreateAvatarModal';

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
  const [personas, setPersonas] = useState<Persona[]>(() => getAllPersonas());
  const [avatarToDelete, setAvatarToDelete] = useState<Persona | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | undefined>(undefined);
  const [isCreatePhotoModalOpen, setIsCreatePhotoModalOpen] = useState(false);

  // Sync state whenever modal opens or current active persona changes
  useEffect(() => {
    if (isOpen) {
      setPersonas(getAllPersonas());
      setSelectedId(currentPersona.id);
      setAvatarToDelete(null);
    }
  }, [isOpen, currentPersona.id]);

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
    const selected = personas.find((p) => p.id === selectedId) || personas[0] || DEFAULT_PERSONAS[0];
    onSelectPersona(selected.id, selected.shortCode || currentShortCode || '', customAvatar || selected.avatarUrl);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!avatarToDelete) return;

    deleteCustomPersona(avatarToDelete.id);
    const updated = getAllPersonas();
    setPersonas(updated);

    // If the deleted avatar was selected, fall back to default persona
    if (selectedId === avatarToDelete.id) {
      const fallback = DEFAULT_PERSONAS[0];
      setSelectedId(fallback.id);
      onSelectPersona(fallback.id, fallback.shortCode || '', fallback.avatarUrl);
    }

    setAvatarToDelete(null);
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
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Action button to create avatar from photo */}
          <button
            type="button"
            onClick={() => setIsCreatePhotoModalOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl border-3 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Camera size={19} className="stroke-[2.5]" />
            <span>Opret ny figur ud fra et foto (1-klik)</span>
          </button>

          {/* Grid of Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {personas.map((p) => {
              const isSelected = selectedId === p.id;
              const isCustom = !isDefaultPersona(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`relative aspect-square rounded-2xl border-3 p-3 transition-all flex items-center justify-center cursor-pointer group bg-white ${
                    isSelected
                      ? 'border-slate-900 bg-amber-50 shadow-md ring-4 ring-amber-400'
                      : 'border-slate-300 hover:border-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={p.avatarUrl}
                    alt="Figur"
                    className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform pointer-events-none"
                  />

                  {/* Active selection checkmark */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md z-10 pointer-events-none">
                      <Check size={14} className="stroke-[3]" />
                    </span>
                  )}

                  {/* Delete button for custom avatars */}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarToDelete(p);
                      }}
                      title="Slet figur"
                      className="absolute top-2 left-2 w-7 h-7 rounded-xl bg-white/95 hover:bg-rose-500 text-slate-400 hover:text-white border border-slate-300 hover:border-rose-600 flex items-center justify-center shadow-xs transition-colors z-20 cursor-pointer"
                    >
                      <Trash2 size={13} className="stroke-[2.5]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload custom avatar box if user already has an image file */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Har du allerede et eget figur-billede?
                </h4>
                <p className="text-xs text-slate-600">
                  Vælg et billede fra din computer.
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
                  <p className="text-xs font-bold text-emerald-800">Dit eget billede er valgt</p>
                  <button
                    type="button"
                    onClick={() => setCustomAvatar(undefined)}
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Fjern eget billede
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border-2 border-slate-300 text-sm transition-colors cursor-pointer"
          >
            Annuller
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check size={16} className="stroke-[3]" />
            Vælg figur
          </button>
        </div>
      </div>

      {/* Verification modal for deleting avatar */}
      {avatarToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Slet figur?</h3>
                <p className="text-xs text-slate-500 font-semibold">Handlingen kan ikke fortrydes</p>
              </div>
            </div>

            <div className="flex justify-center p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <div className="w-20 h-20 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center">
                <img
                  src={avatarToDelete.avatarUrl}
                  alt="Figur til sletning"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700 text-center leading-relaxed">
              Er du sikker på, at du vil slette denne figur fra dine valgmuligheder?
            </p>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setAvatarToDelete(null)}
                className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
              >
                Annuller
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl border-2 border-slate-900 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} className="stroke-[2.5]" />
                <span>Ja, slet figur</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateAvatarModal
        isOpen={isCreatePhotoModalOpen}
        onClose={() => setIsCreatePhotoModalOpen(false)}
        onAvatarCreated={(newPersona) => {
          const updated = getAllPersonas();
          setPersonas(updated);
          setSelectedId(newPersona.id);
          onSelectPersona(newPersona.id, newPersona.shortCode || '', newPersona.avatarUrl);
        }}
      />
    </div>
  );
};
