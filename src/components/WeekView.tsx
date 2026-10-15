import type React from 'react';
import type { WeekPlan, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { ICONS } from '../data/icons';
import { Plus, ArrowRight, Calendar } from 'lucide-react';

interface WeekViewProps {
  plan: WeekPlan;
  selectedDayId: DayOfWeek;
  onSelectDay: (dayId: DayOfWeek) => void;
  onAddPictogramToDay: (dayId: DayOfWeek) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  plan,
  selectedDayId,
  onSelectDay,
  onAddPictogramToDay,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-amber-500" />
          <h2 className="text-lg font-black text-slate-900">
            Ugeoversigt – {plan.name}
          </h2>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          Klik på en dag for at åbne og redigere dagsplanen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAYS_OF_WEEK.map((day) => {
          const schedule = plan.days[day.id];
          const count = schedule?.pictograms.length || 0;
          const isSelected = selectedDayId === day.id;

          return (
            <div
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`flex flex-col bg-white rounded-2xl border-3 transition-all cursor-pointer overflow-hidden shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-slate-900 ring-3 ring-amber-400 -translate-y-0.5'
                  : 'border-slate-800 hover:border-slate-900'
              }`}
            >
              {/* Day column header */}
              <div className="bg-[#BAE6FD] border-b-2 border-slate-900 p-2.5 text-center">
                <span className="text-xs font-extrabold uppercase text-slate-600 block">
                  {day.name}
                </span>
                <span className="text-sm font-black text-slate-900 block truncate">
                  {schedule?.headerSubtitle || 'Ugeplan'}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-800 border border-slate-900/20">
                  {count} {count === 1 ? 'kort' : 'kort'}
                </span>
              </div>

              {/* Day pictogram preview stack */}
              <div className="p-2 space-y-1.5 flex-1 min-h-[180px] max-h-[360px] overflow-y-auto bg-slate-50">
                {count === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-6 text-slate-400">
                    <p className="text-xs italic mb-2">Ingen aktiviteter</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddPictogramToDay(day.id);
                      }}
                      className="p-1.5 rounded-lg bg-amber-400 text-slate-900 hover:bg-amber-500 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Tilføj
                    </button>
                  </div>
                ) : (
                  schedule.pictograms.map((pic, idx) => {
                    const IconComp = ICONS[pic.iconId]?.icon;
                    return (
                      <div
                        key={pic.id}
                        style={{ backgroundColor: pic.bgColor || '#FFFFFF' }}
                        className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-900/60 shadow-2xs text-left"
                      >
                        <span className="text-[10px] font-bold text-slate-500 w-3">
                          {idx + 1}
                        </span>
                        {IconComp && (
                          <IconComp size={13} className="text-slate-800 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {pic.title}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer action */}
              <div className="p-2 border-t border-slate-200 bg-white flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Åbn dagsplan</span>
                <ArrowRight size={14} className="text-slate-900" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
