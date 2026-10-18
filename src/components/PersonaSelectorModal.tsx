import React, { useState, useEffect } from 'react';
import type { Persona } from '../types';
import { getAllPersonas, saveCustomPersona, deleteCustomPersona, isDefaultPersona, DEFAULT_PERSONAS } from '../services/personas';
import { X, Check, User, Upload, Camera, Trash2, Clock, CheckCircle2, Images, AlertTriangle } from 'lucide-react';
import { CreateAvatarModal } from './CreateAvatarModal';
import { getReadyScenesCount } from '../services/characterSceneGenerator';

interface PersonaSelectorModalProps {
  isOpen: boolean;
  currentPersona: Persona;
  currentShortCode: string;
  onClose: () => void;
  onSelectPersona: (personaId: string, customShortCode: string, customAvatarUrl?: string) => void;
  onOpenSceneGen?: (persona: Persona, autoStart?: boolean) => void;
  updatedPersona?: Persona | null;
}

export const PersonaSelectorModal: React.FC<PersonaSelectorModalProps> = ({
  isOpen,
  currentPersona,
  currentShortCode,
  onClose,
  onSelectPersona,
  onOpenSceneGen,
  updatedPersona,
}) => {
  const [selectedId, setSelectedId] = useState(currentPersona.id);
  const [personas, setPersonas] = useState<Persona[]>(() => getAllPersonas());
  const [avatarToDelete, setAvatarToDelete] = useState<Persona | null>(null);
  const [isCreatePhotoModalOpen, setIsCreatePhotoModalOpen] = useState(false);

  // Sync state whenever modal opens or current active persona or updated persona changes
  useEffect(() => {
    if (isOpen) {
      setPersonas(getAllPersonas());
      setSelectedId(currentPersona.id);
      setAvatarToDelete(null);
    }
  }, [isOpen, currentPersona.id, updatedPersona]);

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
      if (result) {
        const id = `avatar_${Date.now()}`;
        const newPersona: Persona = {
          id,
          name: 'Min figur',
          shortCode: '',
          avatarUrl: result,
          description: '',
          activityScenes: {},
        };
        saveCustomPersona(newPersona);
        const updated = getAllPersonas();
        setPersonas(updated);
        setSelectedId(newPersona.id);
        onOpenSceneGen?.(newPersona, false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const selected = personas.find((p) => p.id === selectedId) || personas[0] || DEFAULT_PERSONAS[0];
    onSelectPersona(selected.id, selected.shortCode || currentShortCode || '', selected.avatarUrl);
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
        <div className="px-5 py-3 border-b-2 border-slate-900 bg-amber-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs">
              <User size={18} />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              Vælg figur
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Top action section: Opret figur ud fra foto + diskret upload for eksisterende avatar */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setIsCreatePhotoModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera size={16} />
              <span>Opret ny figur ud fra foto (AI)</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <span>Har du allerede en færdig avatar?</span>
              <label className="text-slate-800 hover:text-amber-600 font-bold underline cursor-pointer inline-flex items-center gap-1 transition-colors">
                <Upload size={12} />
                <span>Upload den her</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Grid of Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {personas.map((p) => {
              const isSelected = selectedId === p.id;
              const isCustom = !isDefaultPersona(p.id);
              const { ready, total } = getReadyScenesCount(p);
              const isAllReady = ready === total;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`relative rounded-2xl border-3 p-2.5 transition-all flex flex-col items-center justify-between cursor-pointer group bg-white ${
                    isSelected
                      ? 'border-slate-900 bg-amber-50 shadow-md ring-3 ring-amber-400'
                      : 'border-slate-300 hover:border-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-full aspect-square flex items-center justify-center relative mb-1.5">
                    <img
                      src={p.avatarUrl}
                      alt="Figur"
                      className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform pointer-events-none"
                    />

                    {/* Active selection checkmark */}
                    {isSelected && (
                      <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md z-10 pointer-events-none">
                        <Check size={12} className="stroke-[3]" />
                      </span>
                    )}

                    {/* Discreet delete button for custom avatars (appears on hover) */}
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAvatarToDelete(p);
                        }}
                        title="Slet figur"
                        className="absolute top-0 left-0 w-5 h-5 rounded-md bg-black/40 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                      >
                        <Trash2 size={11} className="stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* Scene readiness pill (clickable to inspect scenes) */}
                  <div className="w-full text-center mt-auto pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSceneGen?.(p, false);
                      }}
                      title="Klik for at se figurens scener"
                      className={`inline-flex items-center justify-center gap-1 px-2.5 h-6 rounded-full text-[10px] font-black whitespace-nowrap transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                        isAllReady
                          ? 'text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300'
                          : 'text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                      }`}
                    >
                      {isAllReady ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-700 shrink-0" />
                          <span>14/14 scener</span>
                        </>
                      ) : (
                        <>
                          <Clock size={11} className="text-amber-700 shrink-0" />
                          <span>{ready}/{total} scener</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              const selected = personas.find((p) => p.id === selectedId) || personas[0];
              if (selected) {
                onOpenSceneGen?.(selected, false);
              }
            }}
            className="px-3.5 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Images size={14} />
            <span>Tjek / generer scener</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border-2 border-slate-300 text-xs transition-colors cursor-pointer"
            >
              Annuller
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={16} className="stroke-[3]" />
              Vælg figur
            </button>
          </div>
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
          onOpenSceneGen?.(newPersona, false);
        }}
      />
    </div>
  );
};
