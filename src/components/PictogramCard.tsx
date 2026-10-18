import type React from 'react';
import type { Pictogram, Persona } from '../types';
import { ICONS } from '../data/icons';
import { ILLUSTRATIONS } from '../data/illustrations';
import { resolveSceneImage, getPersona } from '../services/personas';
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
  persona?: Persona;
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
  persona,
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
  const activePersona = persona || getPersona();
  const sceneImageUrl = resolveSceneImage(pictogram, activePersona);
  const IconComponent = ICONS[pictogram.iconId]?.icon;
  const IllustrationComponent = pictogram.illustrationId
    ? ILLUSTRATIONS[pictogram.illustrationId]?.svg
    : null;

  const isNumericSize =
    typeof pictogram.fontSize === 'number' ||
    (typeof pictogram.fontSize === 'string' && /^\d+$/.test(pictogram.fontSize));

  const numericFontSize = isNumericSize ? Number(pictogram.fontSize) : null;

  const titleSizeClass = numericFontSize
    ? 'font-black'
    : pictogram.fontSize === 'xl'
    ? 'text-lg sm:text-xl font-black'
    : pictogram.fontSize === 'lg'
    ? 'text-base sm:text-lg font-extrabold'
    : pictogram.fontSize === 'sm'
    ? 'text-xs sm:text-sm font-bold'
    : 'text-sm sm:text-base font-bold';

  const customTitleStyle: React.CSSProperties = numericFontSize
    ? { fontSize: `${numericFontSize}px` }
    : {};

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
        {/* Top bar with drag handle */}
        <div className="flex items-center justify-between pb-1">
          {pictogram.time ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/90 border border-slate-900/30 px-2 py-0.5 rounded-full text-slate-800">
              <Clock size={11} />
              {pictogram.time}
            </span>
          ) : <div />}
          <div className="cursor-grab active:cursor-grabbing text-slate-400 group-hover:text-slate-800">
            <GripVertical size={16} />
          </div>
        </div>

        {/* Top/Middle: Large illustration / image (takes up more space) */}
        <div className="flex-1 bg-white rounded-xl border-2 border-slate-900 overflow-hidden flex items-center justify-center my-1 shadow-inner relative">
          {sceneImageUrl ? (
            <img
              src={sceneImageUrl}
              crossOrigin="anonymous"
              alt={pictogram.title}
              className="w-full h-full object-cover object-center"
            />
          ) : IllustrationComponent ? (
            <div className="p-2 w-full h-full flex items-center justify-center">
              <IllustrationComponent className="w-full h-full max-h-[140px]" />
            </div>
          ) : IconComponent ? (
            <IconComponent size={56} className="text-slate-800 stroke-[2.2]" />
          ) : (
            <ImageIcon size={40} className="text-slate-300" />
          )}
        </div>

        {/* Bottom: Only title (rounded font, no subtitle, no right icon) */}
        <div className="pt-1.5 pb-0.5 text-center">
          <h3
            style={customTitleStyle}
            className={`${titleSizeClass} font-rounded text-slate-900 leading-tight break-words uppercase tracking-wide`}
          >
            {pictogram.title}
          </h3>
        </div>

        {/* Hover action menu buttons */}
        <div data-html2canvas-ignore="true" className="print:hidden absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-slate-900 shadow-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
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
      {/* Left section: Graphic illustration / Photo (figure fills more space) */}
      <div className="w-40 sm:w-56 md:w-64 h-full min-h-[84px] sm:min-h-[96px] bg-white border-r-3 border-slate-900 flex items-center justify-center shrink-0 overflow-hidden relative">
        {sceneImageUrl ? (
          <img
            src={sceneImageUrl}
            crossOrigin="anonymous"
            alt={pictogram.title}
            className="w-full h-full object-cover object-center"
          />
        ) : IllustrationComponent ? (
          <div className="p-2 w-full h-full flex items-center justify-center">
            <IllustrationComponent className="w-full h-full max-h-[82px]" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            {IconComponent ? (
              <IconComponent size={36} className="text-slate-700" />
            ) : (
              <ImageIcon size={28} />
            )}
          </div>
        )}
      </div>

      {/* Middle/Main section: Activity Title & optional Time (centered title, round font) */}
      <div
        className={`flex-1 px-4 ${
          pictogram.time ? 'pr-24 sm:pr-28' : 'sm:px-8'
        } py-2 min-w-0 flex items-center justify-center relative`}
      >
        <h3
          style={customTitleStyle}
          className={`${titleSizeClass} font-rounded text-slate-900 leading-tight uppercase tracking-wide text-center break-words max-w-full`}
        >
          {pictogram.title}
        </h3>
        {pictogram.time && (
          <span className="absolute top-2 right-2.5 sm:right-3 inline-flex items-center gap-1 text-[11px] font-bold bg-white border-2 border-slate-900 px-2.5 py-0.5 rounded-full text-slate-900 shadow-2xs shrink-0 z-1 pointer-events-none">
            <Clock size={11} className="stroke-[2.5] text-slate-700" />
            {pictogram.time}
          </span>
        )}
      </div>

      {/* Floating Action Controls on the card */}
      <div data-html2canvas-ignore="true" className="print:hidden absolute right-24 sm:right-28 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-xl border-2 border-slate-900 shadow-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
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
