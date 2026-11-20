import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  User,
  Menu,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useIsMobile } from '../utils/device';

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
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const dayTriggerRef = useRef<HTMLDivElement>(null);
  const dayDropdownMenuRef = useRef<HTMLDivElement>(null);

  // Robust click outside handler that ignores clicks on trigger buttons
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;

      // Handle day dropdown
      if (
        dayDropdownMenuRef.current &&
        !dayDropdownMenuRef.current.contains(target) &&
        dayTriggerRef.current &&
        !dayTriggerRef.current.contains(target)
      ) {
        setIsDayDropdownOpen(false);
      }

      // Handle sandwich menu
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelectDay = (dayId: DayOfWeek | 'week') => {
    onSelectDay(dayId);
    setIsDayDropdownOpen(false);
  };

  const handleOpenPersona = () => {
    setIsMenuOpen(false);
    if (onOpenPersonaModal) {
      onOpenPersonaModal();
    } else {
      onOpenStartWizard?.();
    }
  };

  const currentDaySchedule = selectedDayId !== 'week' ? currentPlan.days[selectedDayId] : null;
  const currentDayName =
    selectedDayId === 'week'
      ? 'Ugeoversigt'
      : DAYS_OF_WEEK.find((d) => d.id === selectedDayId)?.name || 'Dag';
  const currentShift = currentDaySchedule?.activeShift || 'dag';
  const currentCount = currentDaySchedule?.pictograms.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-3 border-slate-900 shadow-sm print:hidden">
      {/* Unified Top Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-xs shrink-0">
            <CalendarDays size={20} className="text-slate-900 stroke-[2.5]" />
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

        {/* Center: Clean Day Dropdown Selector (Simple Dropdown without left/right arrows) */}
        <div className="relative min-w-0 flex-1 max-w-xs sm:max-w-sm mx-1 sm:mx-4" ref={dayTriggerRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDayDropdownOpen((prev) => !prev);
            }}
            aria-label="Vælg ugedag"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[38px] ${
              selectedDayId === 'week'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-amber-400 text-slate-900 border-slate-900 hover:bg-amber-500'
            }`}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              {selectedDayId === 'week' ? (
                <>
                  <Layers size={16} className="shrink-0" />
                  <span className="truncate">Ugeoversigt (Alle 7 dage)</span>
                </>
              ) : (
                <>
                  {currentShift === 'aften' ? (
                    <Moon size={15} className="text-indigo-950 stroke-[2.5] shrink-0" />
                  ) : (
                    <Sun size={15} className="text-amber-950 stroke-[2.5] shrink-0" />
                  )}
                  <span className="truncate">
                    {currentDayName}
                    {' · '}
                    <span className="font-bold opacity-90">
                      {currentShift === 'aften' ? 'Aften' : 'Dag'}
                    </span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-white shrink-0 font-black">
                    {currentCount}
                  </span>
                </>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform shrink-0 ml-1.5 ${isDayDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Day Dropdown Menu */}
          {isDayDropdownOpen && (
            <div
              ref={dayDropdownMenuRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-slate-900 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Ugeoversigt option */}
              <button
                type="button"
                onClick={() => handleSelectDay('week')}
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

              {/* 7 individual days */}
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
                      onClick={() => handleSelectDay(day.id)}
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

        {/* Right: Print Button + Sandwich Menu Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenPrintModal}
            aria-label="Print eller download PDF"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 font-black text-slate-900 text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[38px]"
          >
            <Printer size={16} className="stroke-[2.5]" />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">Print</span>
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            aria-label={isMenuOpen ? 'Luk menu' : 'Åbn menu'}
            className={`p-2 rounded-xl border-2 border-slate-900 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shadow-xs ${
              isMenuOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            }`}
          >
            {isMenuOpen ? (
              <X size={20} className="stroke-[2.5]" />
            ) : (
              <Menu size={20} className="stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Unified Sandwich Menu (Opens on Desktop & Mobile below header) */}
      {isMenuOpen && (
        <div
          ref={menuContainerRef}
          onClick={(e) => e.stopPropagation()}
          className="border-t-2 border-slate-900 bg-white p-4 shadow-2xl animate-in slide-in-from-top-2 duration-150"
        >
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Top Row / Section 1: Main Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* 1. Vælg figur */}
              <button
                type="button"
                onClick={handleOpenPersona}
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-900 hover:bg-amber-50 active:bg-amber-100 transition-all text-left cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-slate-900 flex items-center justify-center text-slate-900 shrink-0 overflow-hidden shadow-2xs">
                    {currentPlan.avatarUrl ? (
                      <img src={currentPlan.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-black text-slate-900 block truncate group-hover:text-amber-950">
                      Vælg figur
                    </span>
                    <span className="text-xs font-bold text-slate-500 block truncate">
                      Skift aktiv figur til planen
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 shrink-0" />
              </button>

              {/* 2. Ugeplaner */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPlanManager();
                }}
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-900 hover:bg-amber-50 active:bg-amber-100 transition-all text-left cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-900 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs">
                    <FolderKanban size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-black text-slate-900 block truncate group-hover:text-amber-950">
                      Mine ugeplaner ({plans.length})
                    </span>
                    <span className="text-xs font-bold text-slate-500 block truncate">
                      Aktiv: {currentPlan.name}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 shrink-0" />
              </button>

              {/* 3. Skabeloner */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenTemplatePicker();
                }}
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-900 hover:bg-amber-50 active:bg-amber-100 transition-all text-left cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-900 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs">
                    <LayoutTemplate size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-black text-slate-900 block truncate group-hover:text-amber-950">
                      Skabeloner
                    </span>
                    <span className="text-xs font-bold text-slate-500 block truncate">
                      Brug en færdig ugeplan
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 shrink-0" />
              </button>
            </div>

            {/* Bottom Row / Section 2: Shift Toggles & AI Generator Link */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Global Day/Night Shift Switcher */}
              {onToggleAllDaysShift && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0">
                    Skift alle dage:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleAllDaysShift('dag');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      <Sun size={14} className="text-amber-600 stroke-[2.5]" />
                      <span>Alle til Dagplan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleAllDaysShift('aften');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      <Moon size={14} className="text-indigo-600 stroke-[2.5]" />
                      <span>Alle til Aftenplan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI & ChatGPT Creation Link */}
              {onOpenStartWizard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenStartWizard();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-white text-slate-800 transition-colors text-xs font-bold cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-600" />
                  <span>AI & Ny figur ud fra foto</span>
                  {isMobile ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                      Kun computer
                    </span>
                  ) : (
                    isChatGPTConnected && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Klar
                      </span>
                    )
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
