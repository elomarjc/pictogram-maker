import type React from 'react';
import type { Pictogram } from '../types';
import { ICONS } from '../data/icons';
import { ILLUSTRATIONS } from '../data/illustrations';
import {
  Pencil,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowRightLeft,
  GripVertical,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';

interface PictogramCardProps {
  pictogram: Pictogram;
  index: number;
  totalCount: number;
  viewMode?: 'strip' | 'vertical';
  onEdit: (pic: Pictogram) => void;
  onDuplicate: (pic: Pictogram) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onMoveToDay: (pic: Pictogram) => void;
  // Drag and drop support
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

export const PictogramCard: React.FC<PictogramCardProps> = ({
  pictogram,
  index,
  totalCount,
  viewMode = 'strip',
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const IconComponent = ICONS[pictogram.iconId]?.icon;
  const IllustrationComponent = pictogram.illustrationId
    ? ILLUSTRATIONS[pictogram.illustrationId]?.svg
    : null;

  const titleSizeClass =
    pictogram.fontSize === 'xl'
      ? 'text-lg sm:text-xl font-black'
      : pictogram.fontSize === 'lg'
      ? 'text-base sm:text-lg font-extrabold'
      : pictogram.fontSize === 'sm'
      ? 'text-xs sm:text-sm font-bold'
      : 'text-sm sm:text-base font-bold';

  if (viewMode === 'vertical') {
    // iPhone vertical aspect ratio card (6.5 x 10 cm proportions)
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart && onDragStart(e, index)}
        onDragOver={(e) => onDragOver && onDragOver(e, index)}
        onDrop={(e) => onDrop && onDrop(e, index)}
        style={{ backgroundColor: pictogram.bgColor || '#FFFFFF' }}
        className="group relative flex flex-col justify-between w-full max-w-[240px] aspect-[6.5/10] rounded-2xl border-3 border-slate-900 shadow-md hover:shadow-xl transition-all p-3 select-none"
      >
        {/* Top bar with drag handle and order badge */}
        <div className="flex items-center justify-between pb-1">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          {pictogram.time && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/90 border border-slate-900/30 px-2 py-0.5 rounded-full text-slate-800">
              <Clock size={11} />
              {pictogram.time}
            </span>
          )}
          <div className="cursor-grab active:cursor-grabbing text-slate-400 group-hover:text-slate-800">
            <GripVertical size={16} />
          </div>
        </div>

        {/* Top/Middle: Large illustration / image */}
        <div className="flex-1 bg-white rounded-xl border-2 border-slate-900 overflow-hidden flex items-center justify-center p-2 my-1 shadow-inner relative">
          {pictogram.customImageUrl ? (
            <img
              src={pictogram.customImageUrl}
              alt={pictogram.title}
              className="w-full h-full object-contain"
            />
          ) : IllustrationComponent ? (
            <IllustrationComponent className="w-full h-full max-h-[110px]" />
          ) : IconComponent ? (
            <IconComponent size={48} className="text-slate-800 stroke-[2.2]" />
          ) : (
            <ImageIcon size={36} className="text-slate-300" />
          )}
        </div>

        {/* Bottom: Text description & small pictogram icon */}
        <div className="pt-1 flex items-end justify-between gap-1">
          <div className="flex-1 min-w-0 pr-1">
            <h3 className={`${titleSizeClass} text-slate-900 leading-tight break-words uppercase tracking-wide`}>
              {pictogram.title}
            </h3>
            {pictogram.subtitle && (
              <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-tight mt-0.5">
                {pictogram.subtitle}
              </p>
            )}
          </div>
          {IconComponent && (
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-900 flex items-center justify-center shrink-0 shadow-sm">
              <IconComponent size={18} className="text-slate-900" />
            </div>
          )}
        </div>

        {/* Hover action menu buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-slate-900 shadow-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
          <button
            onClick={() => onEdit(pictogram)}
            title="Rediger piktogram"
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDuplicate(pictogram)}
            title="Kopiér piktogram"
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onMoveToDay(pictogram)}
            title="Flyt til anden ugedag"
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
          >
            <ArrowRightLeft size={13} />
          </button>
          <button
            onClick={() => onDelete(pictogram.id)}
            title="Slet piktogram"
            className="p-1 rounded hover:bg-rose-100 text-rose-600"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  // MODE: Strip (Horizontal Strip, exact match to "eksempel på pictogram.jpeg")
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      style={{ backgroundColor: pictogram.bgColor || '#FFFFFF' }}
      className="group relative flex items-center justify-between w-full min-h-[72px] sm:min-h-[82px] rounded-xl border-3 border-slate-900 shadow-sm hover:shadow-md transition-all select-none overflow-hidden my-1.5"
    >
      {/* Left section: Graphic illustration / Photo */}
      <div className="w-28 sm:w-36 h-full min-h-[72px] sm:min-h-[82px] bg-white/70 border-r-3 border-slate-900 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
        {pictogram.customImageUrl ? (
          <img
            src={pictogram.customImageUrl}
            alt={pictogram.title}
            className="w-full h-full object-contain max-h-[70px]"
          />
        ) : IllustrationComponent ? (
          <IllustrationComponent className="w-full h-full max-h-[68px]" />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            {IconComponent ? (
              <IconComponent size={28} className="text-slate-700" />
            ) : (
              <ImageIcon size={24} />
            )}
          </div>
        )}
      </div>

      {/* Middle section: Activity Title, Subtitle, Time */}
      <div className="flex-1 px-3 sm:px-4 py-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <h3 className={`${titleSizeClass} text-slate-900 leading-tight uppercase tracking-wider truncate`}>
            {pictogram.title}
          </h3>
          {pictogram.time && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/90 border border-slate-900/30 px-2 py-0.5 rounded-full text-slate-700 shrink-0">
              <Clock size={12} />
              {pictogram.time}
            </span>
          )}
        </div>
        {pictogram.subtitle && (
          <p className="text-xs sm:text-sm font-semibold text-slate-700 pl-7 line-clamp-1 mt-0.5">
            {pictogram.subtitle}
          </p>
        )}
      </div>

      {/* Right section: Distinct pictogram symbol */}
      <div className="w-20 sm:w-24 h-full min-h-[72px] sm:min-h-[82px] border-l-3 border-slate-900 bg-white/60 flex items-center justify-center shrink-0 p-2">
        {IconComponent ? (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-sm">
            <IconComponent size={24} className="text-slate-900 stroke-[2.3]" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
            ?
          </div>
        )}
      </div>

      {/* Floating Action Controls on the card */}
      <div className="absolute right-24 sm:right-28 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-xl border-2 border-slate-900 shadow-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          title="Flyt op"
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-700"
        >
          <ChevronUp size={15} />
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1}
          title="Flyt ned"
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-700"
        >
          <ChevronDown size={15} />
        </button>
        <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
        <button
          onClick={() => onEdit(pictogram)}
          title="Rediger"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDuplicate(pictogram)}
          title="Kopiér"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
        >
          <Copy size={15} />
        </button>
        <button
          onClick={() => onMoveToDay(pictogram)}
          title="Flyt til anden ugedag"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
        >
          <ArrowRightLeft size={15} />
        </button>
        <button
          onClick={() => onDelete(pictogram.id)}
          title="Slet"
          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
