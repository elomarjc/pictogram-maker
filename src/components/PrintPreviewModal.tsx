import React, { useState } from 'react';
import type { WeekPlan, PrintSettings, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { exportElementToPdf, exportElementToImage, downloadWeekPlanPdf } from '../services/pdfExport';
import {
  Printer,
  Download,
  X,
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
  const [isExportingImage, setIsExportingImage] = useState(false);

  const displayDayId = scope === 'all' ? currentDayId : (scope === 'selected' ? targetDayId : currentDayId);
  const activeDaySchedule = plan.days[displayDayId];
  const activePics = activeDaySchedule?.pictograms || [];
  const activePersona = getPersona(plan.personaId);

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

      const printSettings: PrintSettings = {
        layoutMode: 'board',
        cardWidthCm: 6.5,
        cardHeightCm: 10.0,
        showDayHeader: true,
        showHeaderIcons: true,
        showCutLines: false,
        colorMode: 'color',
        scope: scope === 'all' ? 'all' : (scope === 'selected' ? 'selected' : 'current'),
        targetDayId,
        shiftFilter: 'active',
      };

      if (scope === 'all') {
        // Multi-page clean board generation
        await downloadWeekPlanPdf(plan, printSettings);
      } else {
        // 1:1 Exact capture: Renders preview to image first, then places image into PDF
        const previewEl = document.getElementById('print-sheet-exact-preview');
        const dayName = activeDaySchedule?.dayName || 'piktogram-dagsplan';

        if (previewEl) {
          try {
            await exportElementToPdf(previewEl, `${dayName}-piktogrammer.pdf`);
          } catch (captureErr) {
            console.warn('Canvas PDF export failed, falling back to direct jsPDF generation:', captureErr);
            await downloadWeekPlanPdf(plan, printSettings);
          }
        } else {
          await downloadWeekPlanPdf(plan, printSettings);
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
      <div id="print-modal-window" className="relative z-10 bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div id="print-modal-header" className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-xs">
              <Printer size={18} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                Udskriv og PDF
              </h2>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Simple Scope Selector */}
          <div id="print-modal-controls" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => setScope('current')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  scope !== 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Enkelt dag
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  scope === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hele ugen (7 dage)
              </button>
            </div>

            {scope !== 'all' && (
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-slate-500">Vælg dag:</span>
                <select
                  value={scope === 'selected' ? targetDayId : currentDayId}
                  onChange={(e) => {
                    setTargetDayId(e.target.value as DayOfWeek);
                    setScope('selected');
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 cursor-pointer"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.name} ({plan.days[day.id]?.pictograms.length || 0} kort)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Exact 1:1 Live Preview (Contained & Scrollable) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>
                {scope === 'all' ? 'Forhåndsvisning (viser 1. dag):' : 'Forhåndsvisning:'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 size={12} />
                1:1 format
              </span>
            </div>

            <div className="p-2 sm:p-3 bg-slate-100 rounded-2xl border border-slate-300 max-h-[46vh] sm:max-h-[52vh] overflow-y-auto flex justify-center">
              {/* Paper / Sheet element captured 1:1 by html2canvas */}
              <div
                id="print-sheet-exact-preview"
                className="bg-white rounded-2xl border-3 border-slate-900 shadow-md overflow-hidden p-3 w-full max-w-md mx-auto flex flex-col items-stretch"
              >
                {/* Board Header: Exact match to DailyBoard header */}
                <div className="bg-[#7ECBFC] border-2 border-slate-900 rounded-xl p-2 mb-2.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 shrink-0 filter drop-shadow-xs">
                    <HeaderIconDisplay iconKey={activeDaySchedule?.headerLeftIcon || 'sun'} fallbackKey="sun" />
                  </div>

                  <div className="text-center px-2 flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-rounded">
                      {activeDaySchedule?.dayName || 'Mandag'}
                    </h3>
                  </div>

                  <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 shrink-0 filter drop-shadow-xs">
                    <HeaderIconDisplay iconKey={activeDaySchedule?.headerRightIcon || 'cloud'} fallbackKey="cloud" />
                  </div>
                </div>

                {/* Pictograms List in Exact Strip Order */}
                {activePics.length === 0 ? (
                  <div className="text-center py-8 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-500">
                      Ingen aktiviteter på denne dag endnu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-0.5">
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
          </div>
        </div>

        {/* Modal Footer */}
        <div id="print-modal-footer" className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t-2 border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-200 text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Luk
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExportingImage}
              onClick={handleDownloadImage}
              title="Gem som billede (PNG)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-900 bg-white font-bold text-slate-700 hover:text-slate-900 text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileImage size={15} />
              <span>{isExportingImage ? 'Gemmer...' : 'Gem PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleDirectPrint}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 active:bg-slate-200 font-extrabold text-slate-900 text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Udskriv</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 font-black text-slate-900 text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Henter...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Hent PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
