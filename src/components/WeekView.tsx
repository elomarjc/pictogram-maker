import React, { useState, useRef, useEffect } from 'react';
import type { WeekPlan, DayOfWeek, Pictogram } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { ICONS } from '../data/icons';
import {
  Plus,
  ArrowRight,
  Calendar,
  Pencil,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  GripVertical,
  ArrowRightLeft,
} from 'lucide-react';

interface WeekViewProps {
  plan: WeekPlan;
  selectedDayId: DayOfWeek;
  onSelectDay: (dayId: DayOfWeek) => void;
  onAddPictogramToDay: (dayId: DayOfWeek) => void;
  onQuickAddCard: (dayId: DayOfWeek, title: string) => void;
  onQuickUpdateCardTitle: (dayId: DayOfWeek, cardId: string, newTitle: string) => void;
  onQuickDeleteCard: (dayId: DayOfWeek, cardId: string) => void;
  onQuickDuplicateCard: (dayId: DayOfWeek, cardId: string) => void;
  onQuickMoveCard: (dayId: DayOfWeek, cardId: string, direction: 'up' | 'down') => void;
  onQuickMoveCardBetweenDays: (
    fromDayId: DayOfWeek,
    toDayId: DayOfWeek,
    cardId: string,
    targetIndex?: number
  ) => void;
  onQuickReorderCards: (dayId: DayOfWeek, newCards: Pictogram[]) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  plan,
  selectedDayId,
  onSelectDay,
  onAddPictogramToDay: _onAddPictogramToDay,
  onQuickAddCard,
  onQuickUpdateCardTitle,
  onQuickDeleteCard,
  onQuickDuplicateCard,
  onQuickMoveCard,
  onQuickMoveCardBetweenDays,
  onQuickReorderCards,
}) => {
  // Quick add inputs per day
  const [quickAddTexts, setQuickAddTexts] = useState<Record<string, string>>({});

  // Inline editing state for title
  const [editingCard, setEditingCard] = useState<{ dayId: DayOfWeek; cardId: string } | null>(null);
  const [editingText, setEditingText] = useState('');

  // Selected card for quick toolbar (especially helpful on mobile touchscreens)
  const [selectedCard, setSelectedCard] = useState<{ dayId: DayOfWeek; cardId: string } | null>(null);

  // Day picker popover state
  const [dayPickerCardId, setDayPickerCardId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedState, setDraggedState] = useState<{
    fromDayId: DayOfWeek;
    cardId: string;
    fromIndex: number;
  } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    dayId: DayOfWeek;
    index: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close day picker when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-day-picker="true"]')) {
        setDayPickerCardId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleStartEditing = (dayId: DayOfWeek, pic: Pictogram) => {
    setEditingCard({ dayId, cardId: pic.id });
    setEditingText(pic.title);
    setSelectedCard({ dayId, cardId: pic.id });
  };

  const handleSaveTitle = (dayId: DayOfWeek, cardId: string) => {
    const clean = editingText.trim();
    if (clean) {
      onQuickUpdateCardTitle(dayId, cardId, clean);
    }
    setEditingCard(null);
  };

  const handleCancelEditing = () => {
    setEditingCard(null);
  };

  const handleQuickAddSubmit = (dayId: DayOfWeek) => {
    const text = (quickAddTexts[dayId] || '').trim();
    if (!text) return;
    onQuickAddCard(dayId, text);
    setQuickAddTexts((prev) => ({ ...prev, [dayId]: '' }));
  };

  // Drag & drop handlers
  const handleCardDragStart = (e: React.DragEvent, dayId: DayOfWeek, cardId: string, index: number) => {
    setDraggedState({ fromDayId: dayId, cardId, fromIndex: index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleCardDragOver = (e: React.DragEvent, dayId: DayOfWeek, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverTarget || dragOverTarget.dayId !== dayId || dragOverTarget.index !== index) {
      setDragOverTarget({ dayId, index });
    }
  };

  const handleColumnDragOver = (e: React.DragEvent, _dayId: DayOfWeek) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCardDrop = (e: React.DragEvent, toDayId: DayOfWeek, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedState) return;
    const { fromDayId, cardId, fromIndex } = draggedState;

    if (fromDayId === toDayId) {
      if (fromIndex !== targetIndex) {
        const pics = [...(plan.days[toDayId]?.pictograms || [])];
        const [moved] = pics.splice(fromIndex, 1);
        pics.splice(targetIndex, 0, moved);
        onQuickReorderCards(toDayId, pics);
      }
    } else {
      onQuickMoveCardBetweenDays(fromDayId, toDayId, cardId, targetIndex);
    }

    setDraggedState(null);
    setDragOverTarget(null);
  };

  const handleColumnDrop = (e: React.DragEvent, toDayId: DayOfWeek) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedState) return;
    const { fromDayId, cardId } = draggedState;

    if (fromDayId !== toDayId) {
      onQuickMoveCardBetweenDays(fromDayId, toDayId, cardId);
    }

    setDraggedState(null);
    setDragOverTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedState(null);
    setDragOverTarget(null);
  };

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto space-y-4">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-amber-500 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Ugeoversigt – {plan.name}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Hurtig redigering: Opret, omdøb, flyt, kopiér og slet kort direkte her på ugen.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-xl shrink-0">
          Tip: Træk kort for at flytte mellem dage
        </div>
      </div>

      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-start">
        {DAYS_OF_WEEK.map((day) => {
          const schedule = plan.days[day.id];
          const pictograms = schedule?.pictograms || [];
          const count = pictograms.length;
          const isSelectedDay = selectedDayId === day.id;

          return (
            <div
              key={day.id}
              onDragOver={(e) => handleColumnDragOver(e, day.id)}
              onDrop={(e) => handleColumnDrop(e, day.id)}
              className={`flex flex-col bg-white rounded-2xl border-3 transition-all overflow-visible shadow-xs ${
                isSelectedDay
                  ? 'border-slate-900 ring-2 ring-amber-400'
                  : 'border-slate-800 hover:border-slate-900'
              }`}
            >
              {/* Day column header */}
              <div
                onClick={() => onSelectDay(day.id)}
                className="bg-[#BAE6FD] border-b-2 border-slate-900 p-2.5 text-center cursor-pointer hover:bg-sky-200 transition-colors rounded-t-[13px]"
                title="Klik for at åbne dagsplanen"
              >
                <span className="text-sm font-black text-slate-900 block truncate font-rounded">
                  {day.name}
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-800 border border-slate-900/20">
                  {count} {count === 1 ? 'kort' : 'kort'}
                </span>
              </div>

              {/* Day pictogram list */}
              <div className="p-1.5 sm:p-2 space-y-1.5 flex-1 min-h-[220px] max-h-[460px] overflow-y-auto bg-slate-50">
                {count === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400">
                    <p className="text-xs font-semibold mb-1">Ingen kort endnu</p>
                    <p className="text-[11px] text-slate-500">Skriv forneden for at tilføje et kort hurtigt.</p>
                  </div>
                ) : (
                  pictograms.map((pic, idx) => {
                    const IconComp = ICONS[pic.iconId]?.icon;
                    const isCardSelected =
                      selectedCard?.dayId === day.id && selectedCard?.cardId === pic.id;
                    const isEditing =
                      editingCard?.dayId === day.id && editingCard?.cardId === pic.id;
                    const isDragOver =
                      dragOverTarget?.dayId === day.id && dragOverTarget?.index === idx;

                    return (
                      <div
                        key={pic.id}
                        draggable={!isEditing}
                        onDragStart={(e) => handleCardDragStart(e, day.id, pic.id, idx)}
                        onDragOver={(e) => handleCardDragOver(e, day.id, idx)}
                        onDrop={(e) => handleCardDrop(e, day.id, idx)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard((prev) =>
                            prev?.cardId === pic.id && prev?.dayId === day.id
                              ? null
                              : { dayId: day.id, cardId: pic.id }
                          );
                        }}
                        style={{ backgroundColor: pic.bgColor || '#FFFFFF' }}
                        className={`group relative flex flex-col p-1.5 rounded-xl border text-left transition-all select-none cursor-pointer ${
                          isDragOver ? 'border-t-4 border-t-amber-500' : ''
                        } ${
                          isCardSelected
                            ? 'ring-2 ring-amber-400 border-slate-900 shadow-md'
                            : 'border-slate-900/60 hover:border-slate-900 shadow-2xs'
                        }`}
                      >
                        {/* Title or inline edit mode */}
                        {isEditing ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveTitle(day.id, pic.id);
                            }}
                            className="flex items-center gap-1 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancelEditing();
                              }}
                              onBlur={() => handleSaveTitle(day.id, pic.id)}
                              className="w-full text-xs font-bold px-1.5 py-1 rounded-lg border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400 font-rounded"
                            />
                            <button
                              type="submit"
                              title="Gem titel"
                              className="p-1 rounded bg-slate-900 text-white hover:bg-slate-800 shrink-0 cursor-pointer"
                            >
                              <Check size={12} className="stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleCancelEditing();
                              }}
                              title="Annuller"
                              className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 shrink-0 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Drag handle */}
                            <div
                              className="text-slate-400 group-hover:text-slate-800 cursor-grab active:cursor-grabbing shrink-0"
                              title="Træk for at flytte kort"
                            >
                              <GripVertical size={13} />
                            </div>

                            {/* Icon */}
                            {IconComp && (
                              <IconComp size={14} className="text-slate-800 shrink-0" />
                            )}

                            {/* Card Title */}
                            <span
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartEditing(day.id, pic);
                              }}
                              title="Dobbeltklik for at redigere tekst"
                              className="text-xs font-bold text-slate-900 truncate font-rounded flex-1"
                            >
                              {pic.title}
                            </span>

                            {/* Fast hover buttons for desktop */}
                            <div className="hidden sm:group-hover:flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditing(day.id, pic);
                                }}
                                title="Rediger tekst"
                                aria-label="Rediger tekst"
                                className="p-1 hover:bg-black/10 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickDuplicateCard(day.id, pic.id);
                                }}
                                title="Kopiér kort"
                                aria-label="Kopiér kort"
                                className="p-1 hover:bg-black/10 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
                              >
                                <Copy size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickDeleteCard(day.id, pic.id);
                                }}
                                title="Slet kort"
                                aria-label="Slet kort"
                                className="p-1 hover:bg-rose-500 hover:text-white rounded text-slate-700 cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Selected card action bar (visible on mobile tap or when selected) */}
                        {isCardSelected && !isEditing && (
                          <div
                            className="flex items-center justify-between gap-1 pt-1.5 mt-1 border-t border-slate-900/15"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Move Up / Down */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => onQuickMoveCard(day.id, pic.id, 'up')}
                                title="Flyt op"
                                aria-label="Flyt op"
                                className="p-1 rounded hover:bg-black/10 disabled:opacity-20 text-slate-800 cursor-pointer"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === count - 1}
                                onClick={() => onQuickMoveCard(day.id, pic.id, 'down')}
                                title="Flyt ned"
                                aria-label="Flyt ned"
                                className="p-1 rounded hover:bg-black/10 disabled:opacity-20 text-slate-800 cursor-pointer"
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {/* Move to another day popover */}
                              <div className="relative" data-day-picker="true">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDayPickerCardId((prev) => (prev === pic.id ? null : pic.id))
                                  }
                                  title="Flyt til en anden dag"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/90 hover:bg-white text-slate-800 border border-slate-900/25 flex items-center gap-0.5 cursor-pointer shadow-2xs"
                                >
                                  <ArrowRightLeft size={10} />
                                  Flyt
                                </button>

                                {dayPickerCardId === pic.id && (
                                  <div className="absolute right-0 bottom-full mb-1.5 z-40 bg-white rounded-xl shadow-xl border-2 border-slate-900 p-1.5 flex flex-col gap-1 min-w-[105px]">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
                                      Flyt til:
                                    </span>
                                    {DAYS_OF_WEEK.map((d) => (
                                      <button
                                        key={d.id}
                                        type="button"
                                        disabled={d.id === day.id}
                                        onClick={() => {
                                          onQuickMoveCardBetweenDays(day.id, d.id, pic.id);
                                          setDayPickerCardId(null);
                                        }}
                                        className="text-left px-2 py-1 rounded text-xs font-bold hover:bg-amber-100 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer"
                                      >
                                        {d.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Edit Text */}
                              <button
                                type="button"
                                onClick={() => handleStartEditing(day.id, pic)}
                                title="Rediger tekst"
                                aria-label="Rediger tekst"
                                className="p-1 rounded hover:bg-black/10 text-slate-800 cursor-pointer"
                              >
                                <Pencil size={12} />
                              </button>

                              {/* Copy Card */}
                              <button
                                type="button"
                                onClick={() => onQuickDuplicateCard(day.id, pic.id)}
                                title="Kopiér kort"
                                aria-label="Kopiér kort"
                                className="p-1 rounded hover:bg-black/10 text-slate-800 cursor-pointer"
                              >
                                <Copy size={12} />
                              </button>

                              {/* Delete Card */}
                              <button
                                type="button"
                                onClick={() => onQuickDeleteCard(day.id, pic.id)}
                                title="Slet kort"
                                aria-label="Slet kort"
                                className="p-1 rounded hover:bg-rose-500 hover:text-white text-slate-800 cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add Card form at the bottom of the column */}
              <div className="p-1.5 sm:p-2 border-t border-slate-200 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQuickAddSubmit(day.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={quickAddTexts[day.id] || ''}
                    onChange={(e) =>
                      setQuickAddTexts((prev) => ({ ...prev, [day.id]: e.target.value }))
                    }
                    placeholder="+ Nyt kort..."
                    className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50 focus:bg-white font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!(quickAddTexts[day.id] || '').trim()}
                    title="Opret kort"
                    aria-label="Opret kort"
                    className="p-1.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-900 font-bold rounded-lg border border-slate-900 text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  >
                    <Plus size={14} className="stroke-[3]" />
                  </button>
                </form>
              </div>

              {/* Column Footer: Navigate to full day plan */}
              <button
                type="button"
                onClick={() => onSelectDay(day.id)}
                className="w-full p-2 border-t border-slate-200 bg-slate-50 hover:bg-amber-50 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer rounded-b-[13px]"
              >
                <span>Åbn dagsplan</span>
                <ArrowRight size={14} className="text-slate-900" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
