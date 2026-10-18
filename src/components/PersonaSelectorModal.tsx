import React, { useState, useEffect } from 'react';
import type { Persona } from '../types';
import {
  getAllPersonas,
  saveCustomPersona,
  deleteCustomPersona,
  restoreCustomPersona,
  getDeletedPersonas,
  isDefaultPersona,
  DEFAULT_PERSONAS,
  type DeletedPersona,
} from '../services/personas';
import {
  X,
  Check,
  User,
  Upload,
  Camera,
  Trash2,
  Clock,
  CheckCircle2,
  Images,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
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
  const [deletedPersonas, setDeletedPersonas] = useState<DeletedPersona[]>(() => getDeletedPersonas());
  const [recentlyDeleted, setRecentlyDeleted] = useState<Persona | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [avatarToDelete, setAvatarToDelete] = useState<Persona | null>(null);
  const [isCreatePhotoModalOpen, setIsCreatePhotoModalOpen] = useState(false);

  // Sync state whenever modal opens or current active persona or updated persona changes
  useEffect(() => {
    if (isOpen) {
      setPersonas(getAllPersonas());
      setDeletedPersonas(getDeletedPersonas());
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

    const target = avatarToDelete;
    deleteCustomPersona(target.id);
    const updated = getAllPersonas();
    setPersonas(updated);
    setDeletedPersonas(getDeletedPersonas());
    setRecentlyDeleted(target);

    // If the deleted avatar was selected, fall back to default persona
    if (selectedId === target.id) {
      const fallback = DEFAULT_PERSONAS[0];
      setSelectedId(fallback.id);
      onSelectPersona(fallback.id, fallback.shortCode || '', fallback.avatarUrl);
    }

    setAvatarToDelete(null);
  };

  const handleUndoDelete = (idToRestore?: string) => {
    const targetId = idToRestore || recentlyDeleted?.id;
    if (!targetId) return;

    const restored = restoreCustomPersona(targetId);
    if (restored) {
      const updated = getAllPersonas();
      setPersonas(updated);
      setDeletedPersonas(getDeletedPersonas());
      setSelectedId(restored.id);
      onSelectPersona(restored.id, restored.shortCode || '', restored.avatarUrl);
    }
    setRecentlyDeleted(null);
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
          {/* Top action section: Opret figur ud fra foto + diskret upload for eksisterende avatar + Papirkurv */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setIsCreatePhotoModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera size={16} />
              <span>Opret ny figur ud fra foto (AI)</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 font-semibold flex-wrap">
              <div className="flex items-center gap-1">
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

              {deletedPersonas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsTrashOpen(true)}
                  className="text-slate-700 hover:text-slate-900 font-bold underline cursor-pointer inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Papirkurv ({deletedPersonas.length})</span>
                </button>
              )}
            </div>

            {/* Undo notification banner after deleting */}
            {recentlyDeleted && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold animate-in fade-in slide-in-from-top-1 shadow-md">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Figuren blev slettet og gemt i papirkurven.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUndoDelete(recentlyDeleted.id)}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg font-black text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={12} className="stroke-[2.5]" />
                    <span>Fortryd</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecentlyDeleted(null)}
                    className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
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

                    {/* Discreet delete button for custom avatars (appears on hover or when selected) */}
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAvatarToDelete(p);
                        }}
                        title="Slet figur"
                        className={`absolute top-0 left-0 w-5 h-5 rounded-md bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center transition-opacity z-20 cursor-pointer ${
                          isSelected ? 'opacity-90 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
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
                <p className="text-xs text-slate-500 font-semibold">Figuren gemmes i papirkurven og kan gendannes</p>
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

      {/* Trash / Papirkurv Modal */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">Papirkurv</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Slettede figurer kan gendannes her</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTrashOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {deletedPersonas.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold text-center py-8">
                  Papirkurven er tom
                </p>
              ) : (
                deletedPersonas.map((del) => (
                  <div
                    key={del.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={del.avatarUrl}
                          alt={del.name || 'Figur'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {del.name || 'Min figur'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold truncate">
                          ID: {del.id}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUndoDelete(del.id)}
                      className="px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <RotateCcw size={12} className="stroke-[2.5]" />
                      <span>Gendan</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t-2 border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTrashOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 text-xs transition-colors cursor-pointer"
              >
                Luk
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
