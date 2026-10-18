import React, { useState } from 'react';
import type { WeekPlan, PrintSettings, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { exportElementToPdf, exportElementToImage, downloadWeekPlanPdf } from '../services/pdfExport';
import {
  Printer,
  Download,
  X,
  Calendar,
  Loader2,
  CheckCircle2,
  FileImage,
} from 'lucide-react';
import { PictogramCard } from './PictogramCard';
import { getPersona } from '../services/personas';
import { HeaderIconDisplay } from '../data/headerIcons';

interface PrintPreviewModalProps {
  plan: WeekPlan;
  currentDayId: DayOfWeek;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  plan,
  currentDayId,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [scope, setScope] = useState<'current' | 'selected' | 'all'>('current');
  const [targetDayId, setTargetDayId] = useState<DayOfWeek>(currentDayId);
  const [isExporting, setIsExporting] = useState(false);

  const activeDaySchedule = plan.days[scope === 'all' ? currentDayId : (scope === 'selected' ? targetDayId : currentDayId)];
  const activePics = activeDaySchedule?.pictograms || [];
  const activePersona = getPersona(plan.personaId);

  const [isExportingImage, setIsExportingImage] = useState(false);

  const handleDownloadImage = async () => {
    try {
      setIsExportingImage(true);
      const previewEl = document.getElementById('print-sheet-exact-preview');
      const dayName = activeDaySchedule?.dayName || 'piktogram-dagsplan';
      if (previewEl) {
        await exportElementToImage(previewEl, `${dayName}-piktogrammer.png`);
      }
    } catch (err) {
      console.error('Fejl ved download af billede:', err);
      alert('Der opstod en fejl under download af billedet. Prøv igen.');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);

      if (scope === 'all') {
        // Multi-page clean board generation
        const printSettings: PrintSettings = {
          layoutMode: 'board',
          cardWidthCm: 6.5,
          cardHeightCm: 10.0,
          showDayHeader: true,
          showHeaderIcons: true,
          showCutLines: false,
          colorMode: 'color',
          scope: 'all',
          targetDayId,
        };
        await downloadWeekPlanPdf(plan, printSettings);
      } else {
        // 1:1 Exact capture: Renders preview to image first, then places image into PDF
        const previewEl = document.getElementById('print-sheet-exact-preview');
        const dayName = activeDaySchedule?.dayName || 'piktogram-dagsplan';
        const fallbackSettings: PrintSettings = {
          layoutMode: 'board',
          cardWidthCm: 6.5,
          cardHeightCm: 10.0,
          showDayHeader: true,
          showHeaderIcons: true,
          showCutLines: false,
          colorMode: 'color',
          scope: scope === 'selected' ? 'selected' : 'current',
          targetDayId,
        };

        if (previewEl) {
          try {
            await exportElementToPdf(previewEl, `${dayName}-piktogrammer.pdf`);
          } catch (captureErr) {
            console.warn('Canvas PDF export failed, falling back to direct jsPDF generation:', captureErr);
            await downloadWeekPlanPdf(plan, fallbackSettings);
          }
        } else {
          await downloadWeekPlanPdf(plan, fallbackSettings);
        }
      }
    } catch (err) {
      console.error('Fejl ved generering af PDF:', err);
      alert('Der opstod en fejl under generering af PDF-filen. Prøv igen.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDirectPrint = () => {
    // Attach printing class to isolate the exact board preview without modal backdrop/chrome
    document.body.classList.add('printing-modal-active');
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-modal-active');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div id="print-modal-portal" className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div id="print-modal-backdrop" onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Window */}
      <div id="print-modal-window" className="relative z-10 bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div id="print-modal-header" className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-xs">
              <Printer size={18} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                Udskriv og Download PDF
              </h2>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                100% identisk med det format du ser og redigerer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Luk"
            className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Simple Day Selector */}
          <div id="print-modal-controls" className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar size={15} className="text-amber-500" />
              Vælg hvad du vil udskrive / downloade:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('current')}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  scope === 'current'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400 shadow-xs'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-xs font-extrabold block text-slate-900">
                  Aktuel dag ({DAYS_OF_WEEK.find((d) => d.id === currentDayId)?.name})
                </span>
                <span className="text-[11px] text-slate-600">
                  Den dag du har åben lige nu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('selected')}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  scope === 'selected'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400 shadow-xs'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-xs font-extrabold block text-slate-900">
                  Vælg anden dag
                </span>
                <span className="text-[11px] text-slate-600">
                  Vælg frit mellem ugens 7 dage
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  scope === 'all'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400 shadow-xs'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-xs font-extrabold block text-slate-900">
                  Alle 7 dage
                </span>
                <span className="text-[11px] text-slate-600">
                  Hele ugen samlet i én PDF
                </span>
              </button>
            </div>

            {scope === 'selected' && (
              <div className="pt-1">
                <select
                  value={targetDayId}
                  onChange={(e) => setTargetDayId(e.target.value as DayOfWeek)}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm bg-white"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.name} – {plan.days[day.id]?.pictograms.length || 0} aktiviteter
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Exact 1:1 Live Preview (Matches DailyBoard exactly) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Forhåndsvisning (præcis sådan bliver dit print og din PDF):
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 size={13} />
                Præcis 1:1 format
              </span>
            </div>

            <div className="p-3 sm:p-5 bg-slate-100 rounded-2xl border-2 border-slate-300 flex justify-center items-center overflow-x-auto">
              {/* Paper / Sheet element captured 1:1 by html2canvas */}
              <div
                id="print-sheet-exact-preview"
                className="bg-white rounded-3xl border-4 border-slate-900 shadow-xl overflow-hidden p-3 sm:p-5 w-full max-w-xl mx-auto flex flex-col items-stretch"
              >
                {/* Board Header: Exact match to DailyBoard header */}
                <div className="bg-[#7ECBFC] border-3 border-slate-900 rounded-2xl p-2.5 sm:p-3 mb-3 flex items-center justify-between shadow-xs">
                  <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 shrink-0 filter drop-shadow-xs">
                    <HeaderIconDisplay iconKey={activeDaySchedule?.headerLeftIcon || 'sun'} fallbackKey="sun" />
                  </div>

                  <div className="text-center px-2 flex-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-rounded">
                      {activeDaySchedule?.dayName || 'Mandag'}
                    </h3>
                  </div>

                  <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 shrink-0 filter drop-shadow-xs">
                    <HeaderIconDisplay iconKey={activeDaySchedule?.headerRightIcon || 'cloud'} fallbackKey="cloud" />
                  </div>
                </div>

                {/* Pictograms List in Exact Strip Order */}
                {activePics.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                    <p className="text-sm font-bold text-slate-500">
                      Ingen aktiviteter på denne dag endnu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-1">
                    {activePics.map((pic, idx) => (
                      <div key={pic.id} className="w-full">
                        <PictogramCard
                          pictogram={pic}
                          persona={activePersona}
                          index={idx}
                          totalCount={activePics.length}
                          viewMode="strip"
                          isPreview={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p id="print-modal-info" className="text-[11px] font-semibold text-slate-500 text-center">
              A4-striben er tilpasset så alle aktiviteter og overskriften fremstår skarpt og i korrekt format.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div id="print-modal-footer" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3 sm:py-4 border-t-2 border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:block px-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-sm transition-colors cursor-pointer"
          >
            Luk
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDirectPrint}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 active:bg-slate-200 font-extrabold text-slate-900 text-xs sm:text-sm shadow-xs transition-colors cursor-pointer min-h-[38px]"
            >
              <Printer size={16} />
              Udskriv direkte
            </button>
            <button
              type="button"
              disabled={isExportingImage}
              onClick={handleDownloadImage}
              title="Gem som et skarpt billede (PNG) præcis som du ser det"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 active:bg-slate-200 font-extrabold text-slate-900 text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[38px]"
            >
              {isExportingImage ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-900" />
                  Gemmer PNG...
                </>
              ) : (
                <>
                  <FileImage size={16} className="text-slate-900" />
                  Gem billede (PNG)
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 font-black text-slate-900 text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer min-h-[38px]"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Gemmer PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download PDF
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden w-full py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer min-h-[36px]"
            >
              Luk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
