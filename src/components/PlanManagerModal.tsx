import React, { useState } from 'react';
import type { WeekPlan } from '../types';
import { BUILTIN_TEMPLATES } from '../data/templates';
import {
  FolderKanban,
  Plus,
  Copy,
  Pencil,
  Trash2,
  Check,
  X,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';

interface PlanManagerModalProps {
  plans: WeekPlan[];
  activePlanId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  onCreatePlan: (name: string, templateId: string) => void;
  onRenamePlan: (planId: string, newName: string) => void;
  onDuplicatePlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

export const PlanManagerModal: React.FC<PlanManagerModalProps> = ({
  plans,
  activePlanId,
  isOpen,
  onClose,
  onSelectPlan,
  onCreatePlan,
  onRenamePlan,
  onDuplicatePlan,
  onDeletePlan,
  onExportBackup,
  onImportBackup,
}) => {
  if (!isOpen) return null;

  const [isCreating, setIsCreating] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(BUILTIN_TEMPLATES[0].id);

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState('');

  const [planToDelete, setPlanToDelete] = useState<WeekPlan | null>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewPlanName(`Ugeplan ${String.fromCharCode(65 + plans.length)}`);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    onCreatePlan(newPlanName.trim(), selectedTemplateId);
    setIsCreating(false);
  };

  const handleStartRename = (plan: WeekPlan) => {
    setEditingPlanId(plan.id);
    setEditNameInput(plan.name);
  };

  const handleSaveRename = (planId: string) => {
    if (editNameInput.trim()) {
      onRenamePlan(planId, editNameInput.trim());
    }
    setEditingPlanId(null);
  };

  const handleConfirmDelete = () => {
    if (!planToDelete) return;
    onDeletePlan(planToDelete.id);
    setPlanToDelete(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-xl w-full max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-slate-900 bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center">
              <FolderKanban size={18} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Administrer ugeplaner
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Skift, opret, omdøb eller tag backup af dine planer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Luk"
            className="p-1.5 rounded-xl hover:bg-amber-200 text-slate-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Create new plan panel */}
          {isCreating ? (
            <form onSubmit={handleConfirmCreate} className="bg-amber-50 border-2 border-slate-900 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-black text-slate-900">Opret ny ugeplan</h3>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Planens navn:
                </label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="F.eks. Ugeplan B eller Sommerferie"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-sm font-bold bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Start ud fra en skabelon:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold bg-white"
                >
                  {BUILTIN_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
                >
                  Annuller
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-400 font-black text-xs text-slate-900 hover:bg-amber-500 shadow-xs"
                >
                  Opret plan
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartCreate}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-900 bg-amber-50 hover:bg-amber-100 text-slate-900 font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Plus size={18} />
              Opret en ny ugeplan
            </button>
          )}

          {/* List of plans */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Dine ugeplaner ({plans.length})
            </span>
            {plans.map((plan) => {
              const isActive = plan.id === activePlanId;
              const isRenaming = editingPlanId === plan.id;
              const totalItems = Object.values(plan.days).reduce(
                (sum, d) => sum + d.pictograms.length,
                0
              );

              return (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                    isActive
                      ? 'border-slate-900 bg-amber-100/60 ring-2 ring-amber-400'
                      : 'border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    {isRenaming ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          className="px-2 py-1 text-sm font-bold bg-white border-2 border-slate-900 rounded-lg"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(plan.id)}
                          className="p-1 rounded-lg bg-emerald-500 text-white"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingPlanId(null)}
                          className="p-1 rounded-lg bg-slate-200 text-slate-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => onSelectPlan(plan.id)}>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm truncate">
                            {plan.name}
                          </h4>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {totalItems} aktiviteter i alt
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions for this plan */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => onSelectPlan(plan.id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-900 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 cursor-pointer min-h-[32px]"
                      >
                        Vælg
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartRename(plan)}
                      title="Omdøb plan"
                      aria-label="Omdøb plan"
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicatePlan(plan.id)}
                      title="Kopiér plan"
                      aria-label="Kopiér plan"
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 cursor-pointer"
                    >
                      <Copy size={15} />
                    </button>
                    {plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPlanToDelete(plan)}
                        title="Slet plan"
                        aria-label="Slet plan"
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 active:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Local Backup section */}
          <div className="pt-3 border-t-2 border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Sikkerhedskopi & Filoverførsel (Lokal JSON)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                <Download size={14} />
                Gem backup som fil
              </button>

              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                <Upload size={14} />
                Indlæs backup fra fil
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t-2 border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 font-bold text-slate-900 text-sm shadow-xs cursor-pointer min-h-[38px]"
          >
            Færdig
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {planToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70">
          <div className="bg-white rounded-2xl border-3 border-slate-900 p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle size={24} />
              <h3 className="text-base font-black text-slate-900">
                Slet ugeplan?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Er du sikker på, at du vil slette planen <strong>"{planToDelete.name}"</strong>? Handlingen kan ikke fortrydes.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPlanToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Annuller
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl border-2 border-slate-900 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs"
              >
                Ja, slet planen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
