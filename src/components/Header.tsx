import type React from 'react';
import type { WeekPlan, DayOfWeek, DayShift } from '../types';
import { DAYS_OF_WEEK } from '../types';
import {
  Printer,
  LayoutTemplate,
  FolderKanban,
  ChevronDown,
  CalendarDays,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  currentPlan: WeekPlan;
  plans: WeekPlan[];
  selectedDayId: DayOfWeek | 'week';
  onSelectDay: (dayId: DayOfWeek | 'week') => void;
  onOpenPlanManager: () => void;
  onOpenTemplatePicker: () => void;
  onOpenPrintModal: () => void;
  onToggleAllDaysShift?: (shift: DayShift) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlan,
  plans,
  selectedDayId,
  onSelectDay,
  onOpenPlanManager,
  onOpenTemplatePicker,
  onOpenPrintModal,
  onToggleAllDaysShift,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-3 border-slate-900 shadow-sm print:hidden">
      {/* Top Brand & Utility Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-xs shrink-0">
            <CalendarDays size={20} className="text-slate-900 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none truncate">
              Piktogram Maker
            </h1>
            <p className="hidden sm:block text-[11px] font-bold text-slate-500 leading-none mt-1 truncate">
              Visuel ugeplan til hverdagsstruktur
            </p>
          </div>
        </div>

        {/* Plan Switcher Badge & Button (Desktop) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenPlanManager}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-50 hover:bg-amber-100 transition-colors text-slate-900 font-bold text-xs shadow-2xs cursor-pointer"
          >
            <FolderKanban size={15} className="text-amber-600" />
            <span className="truncate max-w-[140px]">{currentPlan.name} ({plans.length})</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenTemplatePicker}
            title="Vælg skabelon"
            aria-label="Vælg skabelon"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer min-h-[36px]"
          >
            <LayoutTemplate size={16} />
            <span className="hidden sm:inline">Skabeloner</span>
          </button>

          <button
            onClick={onOpenPlanManager}
            title="Administrer ugeplaner"
            aria-label="Administrer ugeplaner"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
          >
            <FolderKanban size={16} />
          </button>

          <button
            onClick={onOpenPrintModal}
            aria-label="Print eller download PDF"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 font-black text-slate-900 text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[36px]"
          >
            <Printer size={16} className="stroke-[2.5]" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Days of Week Navigation Bar */}
      <div className="bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 flex items-center justify-start sm:justify-center overflow-x-auto py-1.5 gap-1.5 scrollbar-none touch-pan-x">
          {/* Week Overview Tab */}
          <button
            onClick={() => onSelectDay('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all shrink-0 cursor-pointer min-h-[32px] ${
              selectedDayId === 'week'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span>Ugeoversigt</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-0.5 shrink-0" />

          {/* 7 Days Tabs */}
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = currentPlan.days[day.id];
            const count = daySchedule?.pictograms.length || 0;
            const isSelected = selectedDayId === day.id;
            const shift = daySchedule?.activeShift || 'dag';

            return (
              <button
                key={day.id}
                onClick={() => onSelectDay(day.id)}
                title={shift === 'aften' ? `${day.name} (Aftenplan)` : `${day.name} (Dagplan)`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all shrink-0 cursor-pointer min-h-[32px] ${
                  isSelected
                    ? 'bg-amber-400 text-slate-900 border-2 border-slate-900 shadow-xs'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
                }`}
              >
                {shift === 'aften' ? (
                  <Moon size={12} className="text-indigo-600 stroke-[2.5] shrink-0" />
                ) : (
                  <Sun size={12} className="text-amber-600 stroke-[2.5] shrink-0" />
                )}
                <span>{day.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Global quick shift switcher */}
          {onToggleAllDaysShift && (
            <div className="ml-auto hidden md:flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-300 shadow-2xs text-[11px] font-bold shrink-0">
              <span className="text-[10px] text-slate-500 font-bold px-1.5">Alle:</span>
              <button
                type="button"
                onClick={() => onToggleAllDaysShift('dag')}
                title="Skift alle ugedage til Dagplaner"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-amber-100 text-slate-800 transition-colors cursor-pointer"
              >
                <Sun size={12} className="text-amber-600 stroke-[2.5]" />
                <span>Dag</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleAllDaysShift('aften')}
                title="Skift alle ugedage til Aftenplaner"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-indigo-100 text-slate-800 transition-colors cursor-pointer"
              >
                <Moon size={12} className="text-indigo-600 stroke-[2.5]" />
                <span>Aften</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
