import React, { useState, useRef, useEffect } from 'react';
import type { WeekPlan, DayOfWeek, DayShift } from '../types';
import { DAYS_OF_WEEK } from '../types';
import {
  Printer,
  LayoutTemplate,
  FolderKanban,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Layers,
  Sun,
  Moon,
  Sparkles,
  User,
  Menu,
  X,
  Check,
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
  onOpenStartWizard?: () => void;
  onOpenPersonaModal?: () => void;
  isChatGPTConnected?: boolean;
}

const ALL_DAY_IDS: (DayOfWeek | 'week')[] = [
  'week',
  'mandag',
  'tirsdag',
  'onsdag',
  'torsdag',
  'fredag',
  'loerdag',
  'soendag',
];

export const Header: React.FC<HeaderProps> = ({
  currentPlan,
  plans,
  selectedDayId,
  onSelectDay,
  onOpenPlanManager,
  onOpenTemplatePicker,
  onOpenPrintModal,
  onToggleAllDaysShift,
  onOpenStartWizard,
  onOpenPersonaModal,
  isChatGPTConnected,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDayDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelectDayMobile = (dayId: DayOfWeek | 'week') => {
    onSelectDay(dayId);
    setIsDayDropdownOpen(false);
  };

  // Day cycling helpers
  const currentIdx = ALL_DAY_IDS.indexOf(selectedDayId);
  const prevDayId = ALL_DAY_IDS[(currentIdx - 1 + ALL_DAY_IDS.length) % ALL_DAY_IDS.length];
  const nextDayId = ALL_DAY_IDS[(currentIdx + 1) % ALL_DAY_IDS.length];

  const handleOpenPersona = () => {
    setIsMobileMenuOpen(false);
    if (onOpenPersonaModal) {
      onOpenPersonaModal();
    } else {
      onOpenStartWizard?.();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-3 border-slate-900 shadow-sm print:hidden">
      {/* Top Brand & Utility Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-xs shrink-0">
            <CalendarDays size={18} className="text-slate-900 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-none truncate">
              Piktogram Maker
            </h1>
            <p className="hidden sm:block text-[11px] font-bold text-slate-500 leading-none mt-1 truncate">
              Visuel ugeplan til hverdagsstruktur
            </p>
          </div>
        </div>

        {/* Desktop Middle Bar: Plan Switcher Badge & ChatGPT Status */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenPlanManager}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-50 hover:bg-amber-100 transition-colors text-slate-900 font-bold text-xs shadow-2xs cursor-pointer"
          >
            <FolderKanban size={15} className="text-amber-600" />
            <span className="truncate max-w-[140px]">
              {currentPlan.name} ({plans.length})
            </span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {/* ChatGPT Status Badge in Top Bar (Desktop only) */}
          {onOpenStartWizard && (
            <button
              type="button"
              onClick={onOpenStartWizard}
              title={
                isChatGPTConnected
                  ? 'ChatGPT er forbundet og klar til at lave billeder'
                  : 'Log ind på ChatGPT for at tegne billeder'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-colors cursor-pointer shadow-2xs ${
                isChatGPTConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-900'
                  : 'bg-amber-100 hover:bg-amber-200 border-slate-900 text-slate-900 animate-pulse'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isChatGPTConnected
                    ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                    : 'bg-amber-500'
                }`}
              />
              <span>{isChatGPTConnected ? 'ChatGPT forbundet' : 'Log ind på ChatGPT'}</span>
            </button>
          )}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenPersonaModal && (
            <button
              type="button"
              onClick={onOpenPersonaModal}
              title="Vælg figur til din ugeplan"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-amber-50 font-black text-slate-900 text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[36px]"
            >
              <User size={16} className="text-slate-900 stroke-[2.5]" />
              <span>Vælg figur</span>
            </button>
          )}

          {onOpenStartWizard && (
            <button
              type="button"
              onClick={onOpenStartWizard}
              title="Kom godt i gang: Skab ny figur eller generér piktogrammer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 font-black text-slate-900 text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[36px]"
            >
              <Sparkles size={16} className="text-slate-900 stroke-[2.5]" />
              <span>Ny figur & aktiviteter</span>
            </button>
          )}

          <button
            onClick={onOpenTemplatePicker}
            title="Vælg skabelon"
            aria-label="Vælg skabelon"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer min-h-[36px]"
          >
            <LayoutTemplate size={16} />
            <span>Skabeloner</span>
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

        {/* Mobile Toolbar: Clean & Uncluttered (Print + Sandwich Menu) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <button
            onClick={onOpenPrintModal}
            aria-label="Print eller download PDF"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-xs shadow-2xs transition-all cursor-pointer min-h-[36px]"
          >
            <Printer size={15} className="stroke-[2.5]" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Luk menu' : 'Åbn menu'}
            className="p-2 rounded-xl border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-2xs"
          >
            {isMobileMenuOpen ? (
              <X size={18} className="stroke-[2.5]" />
            ) : (
              <Menu size={18} className="stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sandwich Menu Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden border-b-2 border-slate-900 bg-white p-3 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150"
        >
          {/* Main Action Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block">
              Menu & Værktøjer
            </span>

            {/* 1. Vælg figur */}
            <button
              type="button"
              onClick={handleOpenPersona}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-colors border border-transparent hover:border-amber-300 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-slate-900 flex items-center justify-center text-slate-900 shrink-0 overflow-hidden">
                  {currentPlan.avatarUrl ? (
                    <img src={currentPlan.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">Vælg figur</span>
                  <span className="text-[11px] font-bold text-slate-500 block truncate">
                    Skift figur til ugeplanen
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </button>

            {/* 2. Ugeplaner */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenPlanManager();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-colors border border-transparent hover:border-amber-300 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-900 flex items-center justify-center text-slate-800 shrink-0">
                  <FolderKanban size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    Mine ugeplaner ({plans.length})
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 block truncate">
                    Aktiv: {currentPlan.name}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </button>

            {/* 3. Skabeloner */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTemplatePicker();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-colors border border-transparent hover:border-amber-300 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-900 flex items-center justify-center text-slate-800 shrink-0">
                  <LayoutTemplate size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    Skabeloner
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 block truncate">
                    Vælg en færdig ugeplan
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Quick All-Days Shift Switcher */}
          {onToggleAllDaysShift && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Skift alle ugedage
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onToggleAllDaysShift('dag');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs transition-colors cursor-pointer"
                >
                  <Sun size={14} className="text-amber-600 stroke-[2.5]" />
                  <span>Alle til Dagplan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleAllDaysShift('aften');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black text-xs transition-colors cursor-pointer"
                >
                  <Moon size={14} className="text-indigo-600 stroke-[2.5]" />
                  <span>Alle til Aftenplan</span>
                </button>
              </div>
            </div>
          )}

          {/* Desktop AI Guide Link */}
          {onOpenStartWizard && (
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenStartWizard();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-600" />
                  <span className="text-[11px] font-bold text-slate-700">
                    Opret figur med AI
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                  Kun computer
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Day Selector (Replaces horizontal scroll with clean dropdown + quick day arrows) */}
      <div className="md:hidden bg-slate-100 border-t border-slate-200 p-2" ref={dropdownRef}>
        <div className="flex items-center gap-1.5">
          {/* Quick previous day arrow */}
          <button
            type="button"
            onClick={() => handleSelectDayMobile(prevDayId)}
            title="Gå til forrige dag"
            aria-label="Forrige dag"
            className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center shadow-2xs"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Main Day Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDayDropdownOpen((prev) => !prev)}
            aria-label="Vælg ugedag"
            className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border-2 font-black text-xs shadow-xs transition-all cursor-pointer min-h-[38px] ${
              selectedDayId === 'week'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-amber-400 text-slate-900 border-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedDayId === 'week' ? (
                <>
                  <Layers size={15} className="shrink-0" />
                  <span className="truncate">Ugeoversigt (Alle 7 dage)</span>
                </>
              ) : (
                <>
                  {currentPlan.days[selectedDayId]?.activeShift === 'aften' ? (
                    <Moon size={14} className="text-indigo-900 stroke-[2.5] shrink-0" />
                  ) : (
                    <Sun size={14} className="text-amber-900 stroke-[2.5] shrink-0" />
                  )}
                  <span className="truncate">
                    {DAYS_OF_WEEK.find((d) => d.id === selectedDayId)?.name}
                    {' · '}
                    {currentPlan.days[selectedDayId]?.activeShift === 'aften' ? 'Aftenplan' : 'Dagplan'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-white shrink-0">
                    {currentPlan.days[selectedDayId]?.pictograms.length || 0}
                  </span>
                </>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform shrink-0 ml-1.5 ${isDayDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Quick next day arrow */}
          <button
            type="button"
            onClick={() => handleSelectDayMobile(nextDayId)}
            title="Gå til næste dag"
            aria-label="Næste dag"
            className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center shadow-2xs"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dropdown Menu when clicked */}
        {isDayDropdownOpen && (
          <div className="mt-2 bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Week option */}
            <button
              type="button"
              onClick={() => handleSelectDayMobile('week')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-black transition-colors cursor-pointer ${
                selectedDayId === 'week'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-800 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={16} />
                <span>Ugeoversigt (Alle 7 dage samlet)</span>
              </div>
              {selectedDayId === 'week' && <Check size={16} className="stroke-[3]" />}
            </button>

            <div className="h-[1px] bg-slate-200" />

            {/* 7 Individual Days */}
            <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = currentPlan.days[day.id];
                const count = daySchedule?.pictograms.length || 0;
                const isSelected = selectedDayId === day.id;
                const shift = daySchedule?.activeShift || 'dag';

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleSelectDayMobile(day.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 font-black'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {shift === 'aften' ? (
                        <Moon size={14} className="text-indigo-600 stroke-[2.5]" />
                      ) : (
                        <Sun size={14} className="text-amber-600 stroke-[2.5]" />
                      )}
                      <span>{day.name}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ({shift === 'aften' ? 'Aftenplan' : 'Dagplan'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count} kort
                      </span>
                      {isSelected && <Check size={14} className="stroke-[3] text-slate-900" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Days of Week Navigation Bar */}
      <div className="hidden md:block bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center py-1.5 gap-1.5">
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
