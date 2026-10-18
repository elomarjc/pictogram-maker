import React, { useState } from 'react';
import type { DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { Copy, X } from 'lucide-react';

interface CopyDayModalProps {
  sourceDayId: DayOfWeek;
  isOpen: boolean;
  onClose: () => void;
  onCopyDay: (fromDay: DayOfWeek, toDay: DayOfWeek) => void;
}

export const CopyDayModal: React.FC<CopyDayModalProps> = ({
  sourceDayId,
  isOpen,
  onClose,
  onCopyDay,
}) => {
  if (!isOpen) return null;

  const sourceDayName = DAYS_OF_WEEK.find((d) => d.id === sourceDayId)?.name || 'Kildedag';
  const [targetDay, setTargetDay] = useState<DayOfWeek>(
    DAYS_OF_WEEK.find((d) => d.id !== sourceDayId)?.id || 'tirsdag'
  );

  const handleConfirm = () => {
    onCopyDay(sourceDayId, targetDay);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-sm w-full p-4 sm:p-5 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Copy size={18} className="text-amber-500" />
            <h3 className="text-base font-black text-slate-900">
              Kopiér dagsplan
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Luk"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Kopiér alle aktiviteter fra <strong>{sourceDayName}</strong> til en anden ugedag.
          </p>

          <label className="text-xs font-bold text-slate-700 block mb-1">
            Vælg modtager-ugedag:
          </label>
          <select
            value={targetDay}
            onChange={(e) => setTargetDay(e.target.value as DayOfWeek)}
            className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm bg-white min-h-[42px]"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === sourceDayId}>
                {d.name} {d.id === sourceDayId ? '(Nuværende dag)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[36px]"
          >
            Annuller
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 font-black text-xs text-slate-900 hover:bg-amber-500 active:bg-amber-600 shadow-xs cursor-pointer min-h-[36px]"
          >
            Kopiér dagsplan
          </button>
        </div>
      </div>
    </div>
  );
};
