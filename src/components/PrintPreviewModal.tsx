import React, { useState } from 'react';
import type { WeekPlan, PrintSettings, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { downloadWeekPlanPdf } from '../services/pdfExport';
import {
  Printer,
  Download,
  X,
  Sliders,
  Calendar,
  Loader2,
  Eye,
} from 'lucide-react';
import { PictogramCard } from './PictogramCard';
import { getPersona, REFERENCE_ICONS } from '../services/personas';

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

  const [settings, setSettings] = useState<PrintSettings>({
    layoutMode: 'board',
    cardWidthCm: 6.5,
    cardHeightCm: 10.0,
    showDayHeader: true,
    showHeaderIcons: true,
    showCutLines: true,
    colorMode: 'color',
    scope: 'current',
    targetDayId: currentDayId,
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      await downloadWeekPlanPdf(plan, settings);
    } catch (err) {
      console.error('Fejl ved generering af PDF:', err);
      alert('Der opstod en fejl under generering af PDF-filen. Prøv igen.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-900 bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center">
              <Printer size={18} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Udskriv og Eksportér som PDF
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Lokal PDF-generering på A4-format uden cloud-tjenester
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

        {/* Modal Body Settings */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Scope: What to export */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={16} className="text-amber-500" />
              Hvad vil du udskrive / eksportere?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, scope: 'current', targetDayId: currentDayId })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  settings.scope === 'current'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block text-slate-900">
                  Aktuel dag ({DAYS_OF_WEEK.find((d) => d.id === currentDayId)?.name})
                </span>
                <span className="text-[11px] text-slate-600">
                  Kun den dag du kigger på nu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, scope: 'selected' })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  settings.scope === 'selected'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block text-slate-900">
                  Vælg en bestemt dag
                </span>
                <span className="text-[11px] text-slate-600">
                  Vælg fra ugens syv dage
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, scope: 'all' })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  settings.scope === 'all'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block text-slate-900">
                  Alle 7 dage
                </span>
                <span className="text-[11px] text-slate-600">
                  Hele ugen samlet i én PDF
                </span>
              </button>
            </div>

            {settings.scope === 'selected' && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Vælg ugedag:
                </label>
                <select
                  value={settings.targetDayId || currentDayId}
                  onChange={(e) => setSettings({ ...settings, targetDayId: e.target.value as DayOfWeek })}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm bg-white"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.name} {plan.days[day.id]?.headerSubtitle ? `(${plan.days[day.id].headerSubtitle})` : ''} – {plan.days[day.id]?.pictograms.length || 0} kort
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Exact Print Sheet Visual Preview */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Eye size={16} className="text-amber-500" />
              Forhåndsvisning af print (præcis som det vil se ud på papiret)
            </label>
            <div className="p-4 sm:p-6 bg-slate-200/90 rounded-2xl border-2 border-slate-900 flex justify-center items-center overflow-x-auto">
              {/* Paper Representation (Centered narrow strip on A4 sheet) */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-400 p-4 w-full max-w-[460px] min-h-[300px] flex flex-col items-center">
                {/* Print Sheet Header */}
                {settings.showDayHeader && (
                  <div className="w-full bg-[#7ECBFC] border-2 border-slate-900 rounded-xl p-2 mb-3 flex items-center justify-between shadow-2xs">
                    {settings.showHeaderIcons ? (
                      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                        <img src={REFERENCE_ICONS.sun} alt="Sol" className="w-full h-full object-contain" />
                      </div>
                    ) : <div className="w-8" />}
                    <h3 className="text-base font-black text-slate-900 font-rounded tracking-tight">
                      {DAYS_OF_WEEK.find((d) => d.id === (settings.targetDayId || currentDayId))?.name || 'Mandag'}
                    </h3>
                    {settings.showHeaderIcons ? (
                      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                        <img src={REFERENCE_ICONS.cloud} alt="Sky" className="w-full h-full object-contain" />
                      </div>
                    ) : <div className="w-8" />}
                  </div>
                )}

                {/* Pictograms List in Preview */}
                <div className="w-full space-y-2">
                  {(() => {
                    const activeDay = plan.days[settings.targetDayId || currentDayId];
                    const activePics = activeDay?.pictograms || [];
                    const activePersona = getPersona(plan.personaId);

                    if (activePics.length === 0) {
                      return (
                        <p className="text-xs text-slate-400 italic text-center py-6">
                          Ingen piktogrammer tilføjet denne dag endnu.
                        </p>
                      );
                    }

                    return activePics.slice(0, 4).map((pic, idx) => (
                      <div key={pic.id} className="w-full">
                        <PictogramCard
                          pictogram={pic}
                          persona={activePersona}
                          index={idx}
                          totalCount={activePics.length}
                          viewMode="strip"
                          onEdit={() => {}}
                          onDuplicate={() => {}}
                          onDelete={() => {}}
                          onMoveUp={() => {}}
                          onMoveDown={() => {}}
                          onMoveToDay={() => {}}
                        />
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic text-center">
              Piktogramstriben er reduceret i bredden (~11,5 cm) så den ikke fylder hele A4-sidens bredde.
            </p>
          </div>

          {/* 2. Layout Mode */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders size={16} className="text-amber-500" />
              Vælg printlayout
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, layoutMode: 'board' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  settings.layoutMode === 'board'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-sm font-extrabold block text-slate-900">
                  Tavle-visning (Reference)
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Lodret dagsplan med dagsoverskrift, sol/sky og aktiviteter i stribeform fra top til bund (som på referencebilledet).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, layoutMode: 'cards' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  settings.layoutMode === 'cards'
                    ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400'
                    : 'border-slate-300 hover:border-slate-500 bg-slate-50'
                }`}
              >
                <span className="text-sm font-extrabold block text-slate-900">
                  Klippekort (iPhone proportioner)
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Individuelle vertikale kort med afrundede hjørner og skæremærker, egnet til udklip og laminering (6.5 × 10 cm).
                </p>
              </button>
            </div>
          </div>

          {/* 3. Physical Dimensions (Configurable print dimensions) */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-black uppercase text-slate-600 tracking-wider block">
              Konfigurerbare fysiske printmål (A4 papir)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kortbredde (cm): {settings.cardWidthCm} cm
                </label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.5"
                  value={settings.cardWidthCm}
                  onChange={(e) => setSettings({ ...settings, cardWidthCm: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <span className="text-[11px] text-slate-500">Standard: 6.5 cm</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Korthøjde (cm): {settings.cardHeightCm} cm
                </label>
                <input
                  type="range"
                  min="7"
                  max="14"
                  step="0.5"
                  value={settings.cardHeightCm}
                  onChange={(e) => setSettings({ ...settings, cardHeightCm: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <span className="text-[11px] text-slate-500">Standard: 10.0 cm</span>
              </div>
            </div>
          </div>

          {/* 4. Display options checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showDayHeader}
                onChange={(e) => setSettings({ ...settings, showDayHeader: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-bold text-slate-800">
                Vis overskrift med ugedagens navn
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showHeaderIcons}
                onChange={(e) => setSettings({ ...settings, showHeaderIcons: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-bold text-slate-800">
                Vis sol og sky i overskriften
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCutLines}
                onChange={(e) => setSettings({ ...settings, showCutLines: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-bold text-slate-800">
                Vis stiplede skæremærker til saks
              </span>
            </label>

            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300">
              <span className="text-xs font-bold text-slate-800">Farvetilstand:</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, colorMode: 'color' })}
                className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  settings.colorMode === 'color' ? 'bg-amber-400 text-slate-900 font-black' : 'text-slate-600'
                }`}
              >
                Farve
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, colorMode: 'grayscale' })}
                className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  settings.colorMode === 'grayscale' ? 'bg-slate-800 text-white font-black' : 'text-slate-600'
                }`}
              >
                Sort/hvid
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-sm"
          >
            Luk
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDirectPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 font-bold text-slate-900 text-sm shadow-xs"
            >
              <Printer size={16} />
              Udskriv direkte
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Genererer PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
