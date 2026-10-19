import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  previewImage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  subtitle,
  confirmText = 'Ja, slet',
  cancelText = 'Annuller',
  variant = 'danger',
  previewImage,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Luk"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-rose-100 border-rose-300 text-rose-600'
                : isWarning
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'bg-sky-100 border-sky-300 text-sky-600'
            }`}
          >
            {isDanger ? (
              <Trash2 size={22} className="stroke-[2.5]" />
            ) : isWarning ? (
              <AlertTriangle size={22} className="stroke-[2.5]" />
            ) : (
              <AlertCircle size={22} className="stroke-[2.5]" />
            )}
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base font-black text-slate-900 leading-snug">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 font-semibold mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Optional preview image (scene or avatar) */}
        {previewImage && (
          <div className="flex justify-center p-2.5 bg-slate-50 rounded-2xl border-2 border-slate-200">
            <div className="max-w-[240px] max-h-[110px] rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center p-1 shadow-2xs">
              <img
                src={previewImage}
                alt="Forhåndsvisning"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
          </div>
        )}

        {/* Body Message */}
        <div className="text-xs font-bold text-slate-700 leading-relaxed">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer min-h-[38px]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl border-2 border-slate-900 font-black text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : isWarning
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                : 'bg-sky-500 hover:bg-sky-600 text-white'
            }`}
          >
            {isDanger && <Trash2 size={14} className="stroke-[2.5]" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
