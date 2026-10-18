import React, { useState, useEffect, useRef } from 'react';
import type { DaySchedule, Pictogram, PrintLayoutMode, Persona } from '../types';
import { PictogramCard } from './PictogramCard';
import { HeaderIconDisplay, HEADER_ICONS, SHIFT_PRESETS } from '../data/headerIcons';
import {
  Plus,
  Copy,
  RotateCcw,
  Trash2,
  LayoutList,
  Grid,
  Pencil,
  X,
  Type,
  ChevronDown,
} from 'lucide-react';

interface DailyBoardProps {
  schedule: DaySchedule;
  persona: Persona;
  viewMode: PrintLayoutMode;
  onChangeViewMode: (mode: PrintLayoutMode) => void;
  onOpenPersonaModal: () => void;
  onAddPictogram: () => void;
  onEditPictogram: (pic: Pictogram) => void;
  onDuplicatePictogram: (pic: Pictogram) => void;
  onDeletePictogram: (id: string) => void;
  onReorderPictograms: (newOrder: Pictogram[]) => void;
  onMoveToDay: (pic: Pictogram) => void;
  onCopyDay: () => void;
  onResetDay: () => void;
  onClearDay: () => void;
  onUpdateHeaderSubtitle: (newSubtitle: string) => void;
  onUpdateDayName?: (newName: string) => void;
  onUpdateHeaderIcons?: (leftIcon: string, rightIcon: string) => void;
  globalFontSize?: number;
  onUpdateAllCardsFontSize?: (size: number) => void;
  headerFontSize?: number;
  onUpdateHeaderFontSize?: (size: number) => void;
}

export const DailyBoard: React.FC<DailyBoardProps> = ({
  schedule,
  persona,
  viewMode,
  globalFontSize,
  headerFontSize,
  onChangeViewMode,
  onOpenPersonaModal,
  onAddPictogram,
  onEditPictogram,
  onDuplicatePictogram,
  onDeletePictogram,
  onReorderPictograms,
  onMoveToDay,
  onCopyDay,
  onResetDay,
  onClearDay,
  onUpdateHeaderSubtitle: _onUpdateHeaderSubtitle,
  onUpdateDayName,
  onUpdateHeaderIcons,
  onUpdateAllCardsFontSize,
  onUpdateHeaderFontSize,
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(schedule.dayName);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // State for header icon popover dropdown
  const [activeIconPicker, setActiveIconPicker] = useState<'left' | 'right' | null>(null);
  const leftIconRef = useRef<HTMLDivElement>(null);
  const rightIconRef = useRef<HTMLDivElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  // State for global font size dropdown
  const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState(false);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);

  const currentGlobalFontSize = globalFontSize ?? 22;
  const currentHeaderFontSize = headerFontSize ?? schedule.headerFontSize ?? 28;

  const currentLeftIcon = schedule.headerLeftIcon || 'sun';
  const currentRightIcon = schedule.headerRightIcon || 'cloud';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(e.target as Node) &&
        !leftIconRef.current?.contains(e.target as Node) &&
        !rightIconRef.current?.contains(e.target as Node)
      ) {
        setActiveIconPicker(null);
      }
      if (
        fontSizeMenuRef.current &&
        !fontSizeMenuRef.current.contains(e.target as Node)
      ) {
        setIsFontSizeMenuOpen(false);
      }
      if (target && !target.closest('[data-pictogram-card="true"]')) {
        setSelectedCardId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setTempTitle(schedule.dayName);
  }, [schedule.dayName]);

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...schedule.pictograms];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    onReorderPictograms(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index >= schedule.pictograms.length - 1) return;
    const newItems = [...schedule.pictograms];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    onReorderPictograms(newItems);
  };

  // Drag and drop handlers
  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleDrop = (_e: React.DragEvent, dropIndex: number) => {
    if (draggedIdx === null || draggedIdx === dropIndex) return;
    const items = [...schedule.pictograms];
    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(dropIndex, 0, draggedItem);
    onReorderPictograms(items);
    setDraggedIdx(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Action Toolbar for the Day */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-900 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={onAddPictogram}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 shadow-sm hover:shadow transition-all text-xs sm:text-sm cursor-pointer min-h-[36px]"
          >
            <Plus size={18} className="stroke-[3]" />
            Tilføj piktogram
          </button>

          {/* Persona / Figure selector button */}
          <button
            onClick={onOpenPersonaModal}
            title="Vælg figur"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-900 font-black rounded-xl border-2 border-slate-900 shadow-xs hover:shadow transition-all text-xs cursor-pointer min-h-[36px]"
          >
            <div className="w-5 h-5 rounded-md border border-slate-900 overflow-hidden shrink-0 bg-amber-100">
              <img src={persona.avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <span>Vælg figur</span>
          </button>

          {/* View mode toggle - accessible on both mobile and desktop */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => onChangeViewMode('board')}
              title="Tavle-visning"
              aria-label="Tavle-visning"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white text-slate-900 border border-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList size={14} />
              <span className="hidden sm:inline">Tavle</span>
            </button>
            <button
              onClick={() => onChangeViewMode('cards')}
              title="Kort-visning"
              aria-label="Kort-visning"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 border border-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid size={14} />
              <span className="hidden sm:inline">Kort</span>
            </button>
          </div>

          {/* Quick font size control for all cards */}
          {onUpdateAllCardsFontSize && (
            <div className="relative" ref={fontSizeMenuRef}>
              <button
                type="button"
                onClick={() => setIsFontSizeMenuOpen((prev) => !prev)}
                title="Skift tekststørrelse for alle kort"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border-2 border-slate-900 shadow-xs text-xs cursor-pointer transition-all min-h-[36px]"
              >
                <Type size={13} className="text-slate-700" />
                <span className="hidden sm:inline">Tekst</span>
                <span className="font-black text-amber-950 bg-amber-100 px-1 rounded border border-amber-300">
                  {currentGlobalFontSize}
                </span>
                <ChevronDown size={12} className={`text-slate-600 transition-transform ${isFontSizeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFontSizeMenuOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-40 p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-xl w-56 max-w-[calc(100vw-32px)] space-y-2.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Tekststørrelse</span>
                    <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded-lg px-1.5 py-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateAllCardsFontSize(Math.max(8, currentGlobalFontSize - 2))}
                        className="w-5 h-6 rounded hover:bg-slate-200 font-black text-sm text-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-slate-900">{currentGlobalFontSize}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateAllCardsFontSize(currentGlobalFontSize + 2)}
                        className="w-5 h-6 rounded hover:bg-slate-200 font-black text-sm text-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'S', size: 14 },
                      { label: 'M', size: 18 },
                      { label: 'L', size: 22 },
                      { label: 'XL', size: 28 },
                    ].map((chip) => (
                      <button
                        key={chip.size}
                        type="button"
                        onClick={() => {
                          onUpdateAllCardsFontSize(chip.size);
                        }}
                        className={`py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentGlobalFontSize === chip.size
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold text-center">
                    Gælder alle kort i planen
                  </p>

                  {onUpdateHeaderFontSize && (
                    <div className="border-t border-slate-200 pt-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Overskrift</span>
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded-lg px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateHeaderFontSize(Math.max(12, currentHeaderFontSize - 2))}
                            className="w-5 h-6 rounded hover:bg-slate-200 font-black text-sm text-slate-700 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-slate-900">{currentHeaderFontSize}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateHeaderFontSize(Math.min(48, currentHeaderFontSize + 2))}
                            className="w-5 h-6 rounded hover:bg-slate-200 font-black text-sm text-slate-700 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: 'S', size: 20 },
                          { label: 'M', size: 24 },
                          { label: 'L', size: 28 },
                          { label: 'XL', size: 34 },
                        ].map((chip) => (
                          <button
                            key={chip.size}
                            type="button"
                            onClick={() => onUpdateHeaderFontSize(chip.size)}
                            className={`py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              currentHeaderFontSize === chip.size
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold text-center">
                        Gælder dagens overskrift
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onCopyDay}
            title="Kopiér denne dagsplan til en anden ugedag"
            aria-label="Kopiér denne dagsplan"
            className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer min-h-[34px] min-w-[34px]"
          >
            <Copy size={14} />
            <span className="hidden md:inline">Kopiér dag</span>
          </button>
          <button
            onClick={onResetDay}
            title="Nulstil denne dag til standardskabelonen"
            aria-label="Nulstil denne dag"
            className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer min-h-[34px] min-w-[34px]"
          >
            <RotateCcw size={14} />
            <span className="hidden md:inline">Nulstil dag</span>
          </button>
          <button
            onClick={onClearDay}
            title="Tøm alle piktogrammer for denne dag"
            aria-label="Tøm denne dag"
            className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 transition-colors cursor-pointer min-h-[34px] min-w-[34px]"
          >
            <Trash2 size={14} />
            <span className="hidden md:inline">Tøm dag</span>
          </button>
        </div>
      </div>

      {/* Main Board Container - Matching reference proportions */}
      <div id="daily-board-container" className="bg-white rounded-3xl border-4 border-slate-900 shadow-xl overflow-hidden p-3 sm:p-5 max-w-xl mx-auto">
        {/* Board Header: Sky-blue banner with customizable high-res icons and day title */}
        <div className="relative bg-[#7ECBFC] border-3 border-slate-900 rounded-2xl p-2 sm:p-2.5 mb-3 flex items-center justify-between shadow-xs">
          {/* Left Icon (Clickable Dropdown/Popup) */}
          <div className="relative shrink-0" ref={leftIconRef}>
            <button
              type="button"
              onClick={() => setActiveIconPicker(activeIconPicker === 'left' ? null : 'left')}
              title="Klik for at skifte venstre ikon (f.eks. Sol, Måne, Kaffe, Dagvagt/Aftenvagt)"
              className="group/icon flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl hover:bg-white/40 transition-all p-1 cursor-pointer border-2 border-transparent hover:border-slate-900/50 relative"
            >
              {currentLeftIcon !== 'none' ? (
                <div className="w-full h-full filter drop-shadow-xs">
                  <HeaderIconDisplay iconKey={currentLeftIcon} fallbackKey="sun" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-700/60 flex items-center justify-center text-slate-800 text-[10px] font-bold bg-white/40">
                  + Ikon
                </div>
              )}
              {/* Subtle hover edit badge */}
              <span
                data-html2canvas-ignore="true"
                className="print:hidden absolute -bottom-1 -right-1 w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-white border border-slate-900 text-slate-800 shadow-xs flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover/icon:opacity-100 transition-opacity"
              >
                <Pencil size={11} className="stroke-[2.5]" />
              </span>
            </button>
          </div>

          {/* Central Title: Clean day name with rounded font, directly editable when clicked */}
          <div className="text-center px-2 flex-1">
            {isEditingTitle ? (
              <div className="flex flex-col items-center gap-1.5">
                <input
                  type="text"
                  value={tempTitle}
                  autoFocus
                  style={{ fontSize: `${currentHeaderFontSize}px` }}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => {
                    setIsEditingTitle(false);
                    if (tempTitle.trim() && onUpdateDayName) {
                      onUpdateDayName(tempTitle.trim());
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingTitle(false);
                      if (tempTitle.trim() && onUpdateDayName) {
                        onUpdateDayName(tempTitle.trim());
                      }
                    } else if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setTempTitle(schedule.dayName);
                    }
                  }}
                  className="w-full max-w-sm text-center font-black text-slate-900 tracking-tight font-rounded bg-white/95 border-2 border-slate-900 rounded-xl px-2 py-0.5 outline-none shadow-sm leading-tight"
                />
                {onUpdateHeaderFontSize && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex items-center gap-1.5 bg-white/95 border border-slate-900/40 rounded-lg px-2 py-0.5 shadow-2xs text-xs font-bold text-slate-800"
                  >
                    <span className="text-[10px] text-slate-600">Tekst:</span>
                    <button
                      type="button"
                      onClick={() => onUpdateHeaderFontSize(Math.max(12, currentHeaderFontSize - 2))}
                      className="w-7 h-7 sm:w-5 sm:h-5 rounded hover:bg-slate-200 font-black cursor-pointer flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <span className="tabular-nums text-xs">{currentHeaderFontSize}px</span>
                    <button
                      type="button"
                      onClick={() => onUpdateHeaderFontSize(Math.min(48, currentHeaderFontSize + 2))}
                      className="w-7 h-7 sm:w-5 sm:h-5 rounded hover:bg-slate-200 font-black cursor-pointer flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempTitle(schedule.dayName);
                  setIsEditingTitle(true);
                }}
                title="Klik for at redigere overskriften direkte"
                className="group/title inline-flex items-center justify-center gap-1.5 cursor-pointer py-1 px-3 rounded-xl hover:bg-black/10 transition-colors"
              >
                <h1
                  style={{ fontSize: `${currentHeaderFontSize}px` }}
                  className="font-black text-slate-900 tracking-tight font-rounded leading-tight"
                >
                  {schedule.dayName}
                </h1>
                <Pencil size={16} className="text-slate-800 opacity-70 sm:opacity-40 sm:group-hover/title:opacity-100 transition-opacity shrink-0 print:hidden" data-html2canvas-ignore="true" />
              </div>
            )}
          </div>

          {/* Right Icon (Clickable Dropdown/Popup) */}
          <div className="relative shrink-0" ref={rightIconRef}>
            <button
              type="button"
              onClick={() => setActiveIconPicker(activeIconPicker === 'right' ? null : 'right')}
              title="Klik for at skifte højre ikon (f.eks. Sky, Stjerne, Seng, Dagvagt/Aftenvagt)"
              className="group/icon flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl hover:bg-white/40 transition-all p-1 cursor-pointer border-2 border-transparent hover:border-slate-900/50 relative"
            >
              {currentRightIcon !== 'none' ? (
                <div className="w-full h-full filter drop-shadow-xs">
                  <HeaderIconDisplay iconKey={currentRightIcon} fallbackKey="cloud" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-700/60 flex items-center justify-center text-slate-800 text-[10px] font-bold bg-white/40">
                  + Ikon
                </div>
              )}
              {/* Subtle hover edit badge */}
              <span
                data-html2canvas-ignore="true"
                className="print:hidden absolute -bottom-1 -left-1 w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-white border border-slate-900 text-slate-800 shadow-xs flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover/icon:opacity-100 transition-opacity"
              >
                <Pencil size={11} className="stroke-[2.5]" />
              </span>
            </button>
          </div>

          {/* Icon Picker Popover */}
          {activeIconPicker && (
            <div
              ref={iconPickerRef}
              data-html2canvas-ignore="true"
              className={`print:hidden absolute ${
                activeIconPicker === 'left' ? 'left-0 sm:left-2' : 'right-0 sm:right-2'
              } top-full mt-2 z-50 bg-white border-3 border-slate-900 rounded-3xl p-3 sm:p-3.5 shadow-2xl w-72 sm:w-80 max-w-[calc(100vw-24px)] space-y-3 animate-in fade-in zoom-in-95 text-left`}
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-slate-900">
                  {activeIconPicker === 'left' ? 'Vælg venstre ikon' : 'Vælg højre ikon'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIconPicker(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Shift Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Vagt & Tema (Begge ikoner)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {SHIFT_PRESETS.map((preset) => {
                    const isCurrent =
                      currentLeftIcon === preset.leftIcon && currentRightIcon === preset.rightIcon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onUpdateHeaderIcons?.(preset.leftIcon, preset.rightIcon);
                          setActiveIconPicker(null);
                        }}
                        className={`p-1.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isCurrent
                            ? 'border-slate-900 bg-amber-100 font-black shadow-2xs'
                            : 'border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-0.5 shrink-0 w-8 h-4">
                          <div className="w-4 h-4">
                            <HeaderIconDisplay iconKey={preset.leftIcon} />
                          </div>
                          <div className="w-4 h-4">
                            <HeaderIconDisplay iconKey={preset.rightIcon} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold block truncate text-slate-900">
                            {preset.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Individual Icons Grid */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {activeIconPicker === 'left' ? 'Skift venstre ikon alene' : 'Skift højre ikon alene'}
                </span>
                <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-0.5">
                  {Object.entries(HEADER_ICONS).map(([key, def]) => {
                    const selectedKey = activeIconPicker === 'left' ? currentLeftIcon : currentRightIcon;
                    const isSelected = selectedKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (activeIconPicker === 'left') {
                            onUpdateHeaderIcons?.(key, currentRightIcon);
                          } else {
                            onUpdateHeaderIcons?.(currentLeftIcon, key);
                          }
                          setActiveIconPicker(null);
                        }}
                        className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-between gap-1 transition-all cursor-pointer aspect-square ${
                          isSelected
                            ? 'border-slate-900 bg-amber-100 ring-2 ring-amber-400 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white'
                        }`}
                        title={def.name}
                      >
                        <div className="w-7 h-7 flex items-center justify-center">
                          {key === 'none' ? (
                            <span className="text-[10px] font-bold text-slate-400">Ingen</span>
                          ) : (
                            <HeaderIconDisplay iconKey={key} />
                          )}
                        </div>
                        <span className="text-[9.5px] font-bold text-slate-700 truncate w-full text-center">
                          {def.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List of Pictograms (Top to Bottom) */}
        {schedule.pictograms.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-slate-900 flex items-center justify-center mx-auto text-amber-700">
              <Plus size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Ingen piktogrammer på denne dag endnu
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Klik på knappen nedenfor for at tilføje det første piktogram, eller nulstil dagen til standardskabelonen.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onAddPictogram}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 shadow-sm text-sm"
              >
                + Tilføj piktogram
              </button>
              <button
                onClick={onResetDay}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border-2 border-slate-300 text-sm"
              >
                Gendan standardskabelon
              </button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards view: Vertical iPhone style cards */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center py-2">
            {schedule.pictograms.map((pic, idx) => (
              <PictogramCard
                key={pic.id}
                pictogram={pic}
                index={idx}
                totalCount={schedule.pictograms.length}
                persona={persona}
                viewMode="vertical"
                isSelected={selectedCardId === pic.id}
                onSelect={() => setSelectedCardId((prev) => (prev === pic.id ? null : pic.id))}
                onEdit={onEditPictogram}
                onDuplicate={onDuplicatePictogram}
                onDelete={onDeletePictogram}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onMoveToDay={onMoveToDay}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        ) : (
          /* Board strip view: Stacks vertically from top to bottom */
          <div className="space-y-2 py-1">
            {schedule.pictograms.map((pic, idx) => (
              <PictogramCard
                key={pic.id}
                pictogram={pic}
                index={idx}
                totalCount={schedule.pictograms.length}
                persona={persona}
                viewMode="strip"
                isSelected={selectedCardId === pic.id}
                onSelect={() => setSelectedCardId((prev) => (prev === pic.id ? null : pic.id))}
                onEdit={onEditPictogram}
                onDuplicate={onDuplicatePictogram}
                onDelete={onDeletePictogram}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onMoveToDay={onMoveToDay}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}

        {/* Quick add card button at the bottom of the list */}
        {schedule.pictograms.length > 0 && (
          <div data-html2canvas-ignore="true" className="pt-3 print:hidden">
            <button
              onClick={onAddPictogram}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-900 hover:bg-amber-50 text-slate-700 hover:text-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={18} />
              Tilføj næste aktivitet til dagsplanen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
