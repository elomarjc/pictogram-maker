import type React from 'react';
import type { TemplateDefinition } from '../types';
import { BUILTIN_TEMPLATES } from '../data/templates';
import { LayoutTemplate, X, Calendar, Sun, FileText } from 'lucide-react';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: TemplateDefinition, mode: 'overwrite_current' | 'new_plan') => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-900 bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center">
              <LayoutTemplate size={18} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Vælg en skabelon
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Start med en færdig standardskabelon og tilpas den frit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-amber-200 text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Templates list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {BUILTIN_TEMPLATES.map((tpl) => {
            const totalPictograms = Object.values(tpl.days).reduce(
              (sum, d) => sum + d.pictograms.length,
              0
            );

            return (
              <div
                key={tpl.id}
                className="bg-slate-50 hover:bg-amber-50/50 border-2 border-slate-900 rounded-2xl p-4 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shrink-0">
                      {tpl.id === 'kristian_fuld_uge' ? (
                        <Calendar size={22} className="text-amber-500" />
                      ) : tpl.id === 'enkel_hverdag' ? (
                        <Sun size={22} className="text-amber-500" />
                      ) : (
                        <FileText size={22} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-900/30 text-slate-700">
                    {totalPictograms} piktogrammer
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                  <button
                    onClick={() => {
                      onApplyTemplate(tpl, 'new_plan');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-900 bg-white hover:bg-slate-100 text-xs font-bold text-slate-900 transition-colors"
                  >
                    Opret som ny plan
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Vil du overskrive den aktuelle plan med skabelonen "${tpl.name}"?`)) {
                        onApplyTemplate(tpl, 'overwrite_current');
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-xs font-black text-slate-900 shadow-2xs transition-colors"
                  >
                    Brug på aktuel plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-sm"
          >
            Annuller
          </button>
        </div>
      </div>
    </div>
  );
};
