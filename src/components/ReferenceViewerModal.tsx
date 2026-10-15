import React from 'react';
import { Eye, X } from 'lucide-react';

interface ReferenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceViewerModal: React.FC<ReferenceViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-900 bg-sky-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-400 border-2 border-slate-900 flex items-center justify-center">
              <Eye size={18} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Referencebillede (Mandag - AV)
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Designets visuelle forlæg og standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-sky-200 text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex items-center justify-center">
          <img
            src={`${import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/'}reference/eksempel-paa-piktogram.webp`}
            alt="Reference layout: Mandag - AV"
            className="max-h-[70vh] w-auto rounded-xl border-3 border-slate-900 shadow-lg object-contain bg-white"
          />
        </div>

        <div className="px-6 py-3 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Formål: Lodret dagsplan med faste rutiner og klare visuelle elementer.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-400 font-black text-xs text-slate-900 hover:bg-amber-500 shadow-xs"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
};
