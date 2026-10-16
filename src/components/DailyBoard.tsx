import React, { useState } from 'react';
import type { DaySchedule, Pictogram, PrintLayoutMode, Persona } from '../types';
import { PictogramCard } from './PictogramCard';
import { REFERENCE_ICONS } from '../services/personas';
import {
  Plus,
  Copy,
  RotateCcw,
  Trash2,
  LayoutList,
  Grid,
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
}

export const DailyBoard: React.FC<DailyBoardProps> = ({
  schedule,
  persona,
  viewMode,
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
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

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
        <div className="flex items-center gap-2">
          <button
            onClick={onAddPictogram}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 shadow-sm hover:shadow transition-all text-sm"
          >
            <Plus size={18} className="stroke-[3]" />
            Tilføj piktogram
          </button>

          {/* Persona / Figure selector button */}
          <button
            onClick={onOpenPersonaModal}
            title="Vælg figur (Mand eller Kvinde)"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-900 font-black rounded-xl border-2 border-slate-900 shadow-xs hover:shadow transition-all text-xs"
          >
            <div className="w-5 h-5 rounded-md border border-slate-900 overflow-hidden shrink-0 bg-amber-100">
              <img src={persona.avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <span>Figur: <strong>{persona.id === 'woman_a' ? 'Kvinde' : 'Mand'}</strong></span>
          </button>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => onChangeViewMode('board')}
              title="Tavle-visning (som på billedet)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-slate-900 border border-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList size={14} />
              Tavle
            </button>
            <button
              onClick={() => onChangeViewMode('cards')}
              title="Kort-visning (6.5 x 10 cm kort)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 border border-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid size={14} />
              Kort
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onCopyDay}
            title="Kopiér denne dagsplan til en anden ugedag"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
          >
            <Copy size={14} />
            <span className="hidden md:inline">Kopiér dag</span>
          </button>
          <button
            onClick={onResetDay}
            title="Nulstil denne dag til standardskabelonen"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
          >
            <RotateCcw size={14} />
            <span className="hidden md:inline">Nulstil dag</span>
          </button>
          <button
            onClick={onClearDay}
            title="Tøm alle piktogrammer for denne dag"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 transition-colors"
          >
            <Trash2 size={14} />
            <span className="hidden md:inline">Tøm dag</span>
          </button>
        </div>
      </div>

      {/* Main Board Container - Matching reference proportions */}
      <div id="daily-board-container" className="bg-white rounded-3xl border-4 border-slate-900 shadow-xl overflow-hidden p-3 sm:p-5 max-w-xl mx-auto">
        {/* Board Header: Sky-blue banner with Sun, Title, and Cloud */}
        <div className="bg-[#7ECBFC] border-3 border-slate-900 rounded-2xl p-2.5 sm:p-3 mb-3 flex items-center justify-between shadow-xs">
          {/* Sun icon on the left */}
          <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 shrink-0">
            <img src={REFERENCE_ICONS.sun} alt="Sol" className="w-full h-full object-contain filter drop-shadow-xs" />
          </div>

          {/* Central Title: Clean day name with rounded font */}
          <div className="text-center px-2 flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-rounded">
              {schedule.dayName}
            </h1>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {schedule.pictograms.length} {schedule.pictograms.length === 1 ? 'aktivitet' : 'aktiviteter'} (læses fra top mod bund)
            </p>
          </div>

          {/* Cloud icon on the right */}
          <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 shrink-0">
            <img src={REFERENCE_ICONS.cloud} alt="Sky" className="w-full h-full object-contain filter drop-shadow-xs" />
          </div>
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
