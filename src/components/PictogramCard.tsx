import React, { useState } from 'react';
import type { Pictogram, Persona } from '../types';
import { ICONS } from '../data/icons';
import { ILLUSTRATIONS } from '../data/illustrations';
import { resolveSceneImage, getPersona } from '../services/personas';
import { darkenColor } from '../services/colorUtils';
import { ConfirmModal } from './ConfirmModal';
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
  index?: number;
  totalCount?: number;
  persona?: Persona;
  viewMode?: 'strip' | 'vertical';
  isPreview?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (pic: Pictogram) => void;
  onDuplicate?: (pic: Pictogram) => void;
  onDelete?: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onMoveToDay?: (pic: Pictogram) => void;
  // Drag and drop support
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

export const PictogramCard: React.FC<PictogramCardProps> = ({
  pictogram,
  index = 0,
  totalCount = 1,
  persona,
  viewMode = 'strip',
  isPreview = false,
  isSelected = false,
  onSelect,
  onEdit = () => {},
  onDuplicate = () => {},
  onDelete = () => {},
  onMoveUp = () => {},
  onMoveDown = () => {},
  onMoveToDay = () => {},
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
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

  const sceneBgColor = darkenColor(pictogram.bgColor || '#FFFFFF', 0.04);

  if (viewMode === 'vertical') {
    // iPhone vertical aspect ratio card (6.5 x 10 cm proportions)
    return (
      <div
        data-pictogram-card="true"
        draggable={!isPreview}
        onDragStart={(e) => !isPreview && onDragStart && onDragStart(e, index)}
        onDragOver={(e) => !isPreview && onDragOver && onDragOver(e, index)}
        onDrop={(e) => !isPreview && onDrop && onDrop(e, index)}
        onClick={(e) => {
          if (isPreview) return;
          if ((e.target as HTMLElement).closest('button')) return;
          onSelect?.();
        }}
        style={{ backgroundColor: pictogram.bgColor || '#FFFFFF' }}
        className={`group relative flex flex-col justify-between w-full max-w-[240px] aspect-[6.5/10] rounded-2xl border-3 border-slate-900 shadow-md transition-all p-3 select-none cursor-pointer ${
          isPreview
            ? 'cursor-default pointer-events-none'
            : isSelected
            ? 'ring-3 ring-amber-400 border-slate-900 shadow-xl'
            : 'hover:shadow-xl'
        }`}
      >
        {/* Top bar with drag handle */}
        <div className="flex items-center justify-between pb-1">
          {pictogram.time ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/90 border border-slate-900/30 px-2 py-0.5 rounded-full text-slate-800">
              <Clock size={11} />
              {pictogram.time}
            </span>
          ) : <div />}
          {!isPreview && (
            <div className="cursor-grab active:cursor-grabbing text-slate-400 group-hover:text-slate-800">
              <GripVertical size={16} />
            </div>
          )}
        </div>

        {/* Top/Middle: Large illustration / image (takes up more space) */}
        <div
          style={{ backgroundColor: sceneBgColor }}
          className="flex-1 rounded-xl border-2 border-slate-900 overflow-hidden flex items-center justify-center my-1 shadow-inner relative"
        >
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

        {/* Action menu buttons on hover or when tapped/selected on phone */}
        {!isPreview && (
          <div
            data-html2canvas-ignore="true"
            className={`print:hidden absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border-2 border-slate-900 shadow-xl transition-all duration-150 z-20 ${
              isSelected
                ? 'opacity-100 pointer-events-auto scale-100'
                : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto scale-95 group-hover:scale-100'
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(index);
              }}
              disabled={index === 0}
              title="Flyt op"
              aria-label="Flyt op"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none text-slate-700 cursor-pointer"
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(index);
              }}
              disabled={index === totalCount - 1}
              title="Flyt ned"
              aria-label="Flyt ned"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none text-slate-700 cursor-pointer"
            >
              <ChevronDown size={15} />
            </button>
            <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pictogram);
              }}
              title="Rediger piktogram"
              aria-label="Rediger"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-100 active:bg-amber-200 text-slate-800 cursor-pointer"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(pictogram);
              }}
              title="Kopiér piktogram"
              aria-label="Kopiér"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <Copy size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveToDay(pictogram);
              }}
              title="Flyt til anden ugedag"
              aria-label="Flyt til anden dag"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <ArrowRightLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmDeleteOpen(true);
              }}
              title="Slet piktogram"
              aria-label="Slet"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 active:bg-rose-200 text-rose-600 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          title={`Slet "${pictogram.title}"?`}
          subtitle="Fjern piktogram fra dagsplanen"
          message="Er du sikker på, at du vil slette dette piktogramkort fra din plan?"
          previewImage={sceneImageUrl || undefined}
          confirmText="Ja, slet kort"
          cancelText="Annuller"
          variant="danger"
          onConfirm={() => {
            setIsConfirmDeleteOpen(false);
            onDelete(pictogram.id);
          }}
          onCancel={() => setIsConfirmDeleteOpen(false)}
        />
      </div>
    );
  }

  // MODE: Strip (Horizontal Strip, exact match to "eksempel på pictogram.jpeg")
  return (
    <div
      data-pictogram-card="true"
      draggable={!isPreview}
      onDragStart={(e) => !isPreview && onDragStart && onDragStart(e, index)}
      onDragOver={(e) => !isPreview && onDragOver && onDragOver(e, index)}
      onDrop={(e) => !isPreview && onDrop && onDrop(e, index)}
      onClick={(e) => {
        if (isPreview) return;
        if ((e.target as HTMLElement).closest('button')) return;
        onSelect?.();
      }}
      style={{ backgroundColor: pictogram.bgColor || '#FFFFFF' }}
      className={`group relative flex items-stretch justify-between w-full min-h-[72px] sm:min-h-[82px] rounded-xl border-3 border-slate-900 shadow-sm transition-all select-none overflow-hidden my-1.5 cursor-pointer ${
        isPreview
          ? 'cursor-default pointer-events-none'
          : isSelected
          ? 'ring-3 ring-amber-400 border-slate-900 shadow-md'
          : 'hover:shadow-md'
      }`}
    >
      {/* Left section: Graphic illustration / Scene photo - always exactly 50% width */}
      <div
        style={{ backgroundColor: sceneBgColor }}
        className="w-1/2 min-h-[84px] sm:min-h-[96px] flex items-center justify-center shrink-0 overflow-hidden relative"
      >
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

      {/* Right section: Activity Title & optional Time - always exactly 50% width */}
      <div
        className={`w-1/2 px-3 sm:px-6 ${
          pictogram.time ? 'pr-18 sm:pr-22' : ''
        } py-2 min-w-0 flex items-center justify-center relative shrink-0`}
      >
        <h3
          style={customTitleStyle}
          className={`${titleSizeClass} font-rounded text-slate-900 leading-tight uppercase tracking-wide text-center break-words max-w-full`}
        >
          {pictogram.title}
        </h3>
        {pictogram.time && (
          <span className="absolute top-2 right-2 sm:right-2.5 inline-flex items-center gap-1 text-[11px] font-bold bg-white border-2 border-slate-900 px-2 py-0.5 rounded-full text-slate-900 shadow-2xs shrink-0 z-1 pointer-events-none">
            <Clock size={11} className="stroke-[2.5] text-slate-700" />
            {pictogram.time}
          </span>
        )}
      </div>

      {/* Floating Action Controls on the card (shown on hover, or when card is tapped/selected on phone) */}
      {!isPreview && (
        <div
          data-html2canvas-ignore="true"
          className={`print:hidden absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl border-2 border-slate-900 shadow-2xl z-20 transition-all duration-150 ${
            isSelected
              ? 'opacity-100 pointer-events-auto scale-100'
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto scale-95 group-hover:scale-100'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
            disabled={index === 0}
            title="Flyt op"
            aria-label="Flyt op"
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 active:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none text-slate-700 cursor-pointer transition-colors"
          >
            <ChevronUp size={17} className="stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
            disabled={index === totalCount - 1}
            title="Flyt ned"
            aria-label="Flyt ned"
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 active:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none text-slate-700 cursor-pointer transition-colors"
          >
            <ChevronDown size={17} className="stroke-[2.5]" />
          </button>
          <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pictogram);
            }}
            title="Rediger"
            aria-label="Rediger"
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-xl hover:bg-amber-100 active:bg-amber-200 text-slate-800 cursor-pointer transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(pictogram);
            }}
            title="Kopiér"
            aria-label="Kopiér"
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveToDay(pictogram);
            }}
            title="Flyt til anden ugedag"
            aria-label="Flyt til anden ugedag"
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            <ArrowRightLeft size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsConfirmDeleteOpen(true);
            }}
            title="Slet"
            aria-label="Slet"
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-xl hover:bg-rose-100 active:bg-rose-200 text-rose-600 cursor-pointer transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title={`Slet "${pictogram.title}"?`}
        subtitle="Fjern piktogram fra dagsplanen"
        message="Er du sikker på, at du vil slette dette piktogramkort fra din plan?"
        previewImage={sceneImageUrl || undefined}
        confirmText="Ja, slet kort"
        cancelText="Annuller"
        variant="danger"
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          onDelete(pictogram.id);
        }}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};
