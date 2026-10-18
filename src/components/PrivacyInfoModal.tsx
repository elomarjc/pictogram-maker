import React from 'react';
import { ShieldCheck, Lock, HardDrive, Trash2, X, FileJson, Globe } from 'lucide-react';

interface PrivacyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
}

export const PrivacyInfoModal: React.FC<PrivacyInfoModalProps> = ({
  isOpen,
  onClose,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-xl w-full max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-slate-900 bg-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
              <ShieldCheck size={20} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Privatliv & Databeskyttelse
              </h2>
              <p className="text-xs font-semibold text-emerald-800">
                100% lokalt i din browser – ingen data forlader din enhed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Luk"
            className="p-1.5 rounded-xl hover:bg-emerald-200 text-slate-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 text-sm">
          {/* Key privacy points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Lock size={15} className="text-emerald-600" />
                Ingen konto eller login
              </div>
              <p className="text-xs text-slate-600">
                Appen kræver intet login, intet password og ingen registrering.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <HardDrive size={15} className="text-emerald-600" />
                Midlertidig session (sessionStorage)
              </div>
              <p className="text-xs text-slate-600">
                Dine planer gemmes udelukkende i browserens sessionshukommelse. Lukkes fanebladet, slettes de midlertidige data.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Globe size={15} className="text-emerald-600" />
                Ingen tracking eller cookies
              </div>
              <p className="text-xs text-slate-600">
                Ingen Google Analytics, ingen marketing-cookies og ingen tredjepartstjenester.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <FileJson size={15} className="text-emerald-600" />
                Lokal PDF & Sikkerhedskopi
              </div>
              <p className="text-xs text-slate-600">
                PDF-eksport og JSON-backup genereres direkte på din computer uden at gå gennem en server.
              </p>
            </div>
          </div>

          {/* Detailed explanation */}
          <div className="space-y-2 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
              Forståelse af lagring i Piktogram Maker
            </h4>
            <ul className="text-xs text-amber-900/90 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>GitHub Pages:</strong> Leverer udelukkende de statiske hjemmesidefiler (HTML, CSS, JavaScript). Serveren modtager eller gemmer <em>aldrig</em> dine ugeplaner eller billeder.
              </li>
              <li>
                <strong>Midlertidig Browsersession:</strong> Dine ugeplaner og ændringer gemmes i <code className="bg-white/80 px-1 py-0.5 rounded font-mono">sessionStorage</code>, så de bevares under genindlæsning af siden.
              </li>
              <li>
                <strong>Permanent Sikkerhedskopi:</strong> Hvis du vil gemme dine ugeplaner permanent, skal du klikke på <em>"Gem backup som fil"</em> for at downloade en JSON-fil på din egen computer.
              </li>
            </ul>
          </div>

          {/* Clear all data button */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Ryd alle data nu</h4>
              <p className="text-xs text-slate-500">
                Slet alle ændringer i sessionen og gendan standardskabelonerne
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Er du sikker på, at du vil rydde alle brugerdata i denne session? Dette kan ikke fortrydes.')) {
                  onClearAllData();
                  onClose();
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs rounded-xl border border-rose-300 transition-colors shrink-0 cursor-pointer min-h-[38px] w-full sm:w-auto"
            >
              <Trash2 size={14} />
              Ryd alle data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t-2 border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-sm shadow-xs cursor-pointer min-h-[38px]"
          >
            Forstået
          </button>
        </div>
      </div>
    </div>
  );
};
