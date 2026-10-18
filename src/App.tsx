import React, { useState, useEffect } from 'react';
import type { WeekPlan, DayOfWeek, Pictogram, PrintLayoutMode, TemplateDefinition } from './types';
import {
  loadPlansFromSession,
  savePlansToSession,
  clearAllUserData,
  exportPlansToJsonFile,
  importPlansFromJsonFile,
} from './services/storage';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate, generateUniqueId } from './data/templates';
import { Header } from './components/Header';
import { DailyBoard } from './components/DailyBoard';
import { WeekView } from './components/WeekView';
import { PictogramEditorModal } from './components/PictogramEditorModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { PlanManagerModal } from './components/PlanManagerModal';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { MoveToDayModal } from './components/MoveToDayModal';
import { CopyDayModal } from './components/CopyDayModal';
import { PrivacyInfoModal } from './components/PrivacyInfoModal';
import { PersonaSelectorModal } from './components/PersonaSelectorModal';
import { getPersona } from './services/personas';

export const App: React.FC = () => {
  // Load plans from sessionStorage on initial render
  const [plans, setPlans] = useState<WeekPlan[]>(() => {
    const loaded = loadPlansFromSession();
    return loaded.plans;
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    const loaded = loadPlansFromSession();
    return loaded.activePlanId;
  });

  const [selectedDayId, setSelectedDayId] = useState<DayOfWeek | 'week'>('mandag');
  const [viewMode, setViewMode] = useState<PrintLayoutMode>('board');

  // Modal states
  const [editingPictogram, setEditingPictogram] = useState<Pictogram | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPlanManagerOpen, setIsPlanManagerOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [movingPictogram, setMovingPictogram] = useState<Pictogram | null>(null);
  const [copyingSourceDayId, setCopyingSourceDayId] = useState<DayOfWeek | null>(null);

  // Sync state to sessionStorage whenever plans change
  useEffect(() => {
    savePlansToSession(plans, activePlanId);
  }, [plans, activePlanId]);

  // Active plan lookup
  const currentPlan = plans.find((p) => p.id === activePlanId) || plans[0];
  const activePersona = getPersona(currentPlan.personaId);

  // Helper to update current plan
  const updateCurrentPlan = (updater: (prev: WeekPlan) => WeekPlan) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id === currentPlan.id) {
          const updated = updater(p);
          return { ...updated, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  const handleSelectPersona = (personaId: string, customShortCode: string, customAvatarUrl?: string) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      personaId,
      shortCode: customShortCode,
      avatarUrl: customAvatarUrl || prev.avatarUrl,
    }));
  };

  // --- Pictogram Operations ---
  const handleOpenAddPictogram = (targetDayId?: DayOfWeek) => {
    if (targetDayId) {
      setSelectedDayId(targetDayId);
    }
    const newPic: Pictogram = {
      id: generateUniqueId('pic'),
      title: '',
      subtitle: '',
      iconId: 'smile',
      illustrationId: 'kaffe',
      bgColor: '#FEF08A',
      fontSize: 'base',
    };
    setEditingPictogram(newPic);
    setIsEditorOpen(true);
  };

  const handleOpenEditPictogram = (pic: Pictogram) => {
    setEditingPictogram(pic);
    setIsEditorOpen(true);
  };

  const handleSavePictogram = (pic: Pictogram) => {
    const activeDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;
    updateCurrentPlan((prev) => {
      const daySchedule = prev.days[activeDay];
      const existingIdx = daySchedule.pictograms.findIndex((p) => p.id === pic.id);
      let newPics: Pictogram[];

      if (existingIdx >= 0) {
        newPics = [...daySchedule.pictograms];
        newPics[existingIdx] = pic;
      } else {
        newPics = [...daySchedule.pictograms, pic];
      }

      return {
        ...prev,
        days: {
          ...prev.days,
          [activeDay]: {
            ...daySchedule,
            pictograms: newPics,
          },
        },
      };
    });
  };

  const handleDuplicatePictogram = (pic: Pictogram) => {
    const activeDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;
    updateCurrentPlan((prev) => {
      const daySchedule = prev.days[activeDay];
      const idx = daySchedule.pictograms.findIndex((p) => p.id === pic.id);
      const cloned: Pictogram = {
        ...pic,
        id: generateUniqueId('pic_copy'),
        title: `${pic.title}`,
      };

      const newPics = [...daySchedule.pictograms];
      newPics.splice(idx + 1, 0, cloned);

      return {
        ...prev,
        days: {
          ...prev.days,
          [activeDay]: {
            ...daySchedule,
            pictograms: newPics,
          },
        },
      };
    });
  };

  const handleDeletePictogram = (id: string) => {
    const activeDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;
    updateCurrentPlan((prev) => {
      const daySchedule = prev.days[activeDay];
      return {
        ...prev,
        days: {
          ...prev.days,
          [activeDay]: {
            ...daySchedule,
            pictograms: daySchedule.pictograms.filter((p) => p.id !== id),
          },
        },
      };
    });
  };

  const handleReorderPictograms = (newOrder: Pictogram[]) => {
    const activeDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;
    updateCurrentPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          pictograms: newOrder,
        },
      },
    }));
  };

  const handleMoveToDay = (pic: Pictogram, targetDayId: DayOfWeek, isCopy: boolean) => {
    const currentDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;

    updateCurrentPlan((prev) => {
      const sourceSchedule = prev.days[currentDay];
      const targetSchedule = prev.days[targetDayId];

      const itemToAdd: Pictogram = isCopy
        ? { ...pic, id: generateUniqueId('pic_copy') }
        : pic;

      const newSourcePics = isCopy
        ? sourceSchedule.pictograms
        : sourceSchedule.pictograms.filter((p) => p.id !== pic.id);

      const newTargetPics = [...targetSchedule.pictograms, itemToAdd];

      return {
        ...prev,
        days: {
          ...prev.days,
          [currentDay]: {
            ...sourceSchedule,
            pictograms: newSourcePics,
          },
          [targetDayId]: {
            ...targetSchedule,
            pictograms: newTargetPics,
          },
        },
      };
    });
  };

  const handleCopyDay = (fromDay: DayOfWeek, toDay: DayOfWeek) => {
    updateCurrentPlan((prev) => {
      const sourceDay = prev.days[fromDay];
      const targetDay = prev.days[toDay];

      const clonedPics = sourceDay.pictograms.map((p) => ({
        ...p,
        id: generateUniqueId('pic_day_copy'),
      }));

      return {
        ...prev,
        days: {
          ...prev.days,
          [toDay]: {
            ...targetDay,
            headerSubtitle: sourceDay.headerSubtitle || targetDay.headerSubtitle,
            pictograms: clonedPics,
          },
        },
      };
    });
  };

  const handleResetDay = (dayId: DayOfWeek) => {
    const defaultTemplate = BUILTIN_TEMPLATES[0];
    const defaultDay = defaultTemplate.days[dayId];

    if (!defaultDay) return;

    if (confirm(`Vil du nulstille ${currentPlan.days[dayId].dayName} til standardskabelonen?`)) {
      updateCurrentPlan((prev) => ({
        ...prev,
        days: {
          ...prev.days,
          [dayId]: {
            ...prev.days[dayId],
            headerSubtitle: defaultDay.headerSubtitle || '',
            pictograms: defaultDay.pictograms.map((p) => ({
              ...p,
              id: generateUniqueId('item'),
            })),
          },
        },
      }));
    }
  };

  const handleClearDay = (dayId: DayOfWeek) => {
    if (confirm(`Er du sikker på, at du vil tømme alle piktogrammer for ${currentPlan.days[dayId].dayName}?`)) {
      updateCurrentPlan((prev) => ({
        ...prev,
        days: {
          ...prev.days,
          [dayId]: {
            ...prev.days[dayId],
            pictograms: [],
          },
        },
      }));
    }
  };

  const handleUpdateHeaderSubtitle = (newSubtitle: string) => {
    const activeDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;
    updateCurrentPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          headerSubtitle: newSubtitle,
        },
      },
    }));
  };

  const handleUpdateDayName = (newName: string) => {
    const activeDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;
    updateCurrentPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          dayName: newName,
        },
      },
    }));
  };

  const handleUpdateHeaderIcons = (leftIcon: string, rightIcon: string) => {
    const activeDay = selectedDayId === 'week' ? 'mandag' : selectedDayId;
    updateCurrentPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          headerLeftIcon: leftIcon,
          headerRightIcon: rightIcon,
        },
      },
    }));
  };

  const handleApplyFontSizeToAll = (size: number | string) => {
    updateCurrentPlan((prev) => {
      const updatedDays = { ...prev.days };
      for (const dayKey of Object.keys(updatedDays) as DayOfWeek[]) {
        const day = updatedDays[dayKey];
        if (day && day.pictograms) {
          updatedDays[dayKey] = {
            ...day,
            pictograms: day.pictograms.map((p) => ({
              ...p,
              fontSize: size,
            })),
          };
        }
      }
      return {
        ...prev,
        days: updatedDays,
      };
    });
  };

  // --- Plan Management Operations ---
  const handleCreatePlan = (name: string, templateId: string) => {
    const tpl = BUILTIN_TEMPLATES.find((t) => t.id === templateId) || BUILTIN_TEMPLATES[0];
    const newPlan = createWeekPlanFromTemplate(tpl, name);
    setPlans((prev) => [...prev, newPlan]);
    setActivePlanId(newPlan.id);
  };

  const handleRenamePlan = (planId: string, newName: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p))
    );
  };

  const handleDuplicatePlan = (planId: string) => {
    const planToClone = plans.find((p) => p.id === planId);
    if (!planToClone) return;

    const clonedPlan: WeekPlan = {
      ...JSON.parse(JSON.stringify(planToClone)),
      id: generateUniqueId('plan_copy'),
      name: `${planToClone.name} (Kopi)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPlans((prev) => [...prev, clonedPlan]);
    setActivePlanId(clonedPlan.id);
  };

  const handleDeletePlan = (planId: string) => {
    if (plans.length <= 1) {
      alert('Du kan ikke slette den eneste tilbageværende plan.');
      return;
    }

    const filtered = plans.filter((p) => p.id !== planId);
    setPlans(filtered);
    if (activePlanId === planId) {
      setActivePlanId(filtered[0].id);
    }
  };

  const handleApplyTemplate = (template: TemplateDefinition, mode: 'overwrite_current' | 'new_plan') => {
    if (mode === 'new_plan') {
      const newPlan = createWeekPlanFromTemplate(template);
      setPlans((prev) => [...prev, newPlan]);
      setActivePlanId(newPlan.id);
    } else {
      const overwritten = createWeekPlanFromTemplate(template, currentPlan.name);
      setPlans((prev) =>
        prev.map((p) => (p.id === currentPlan.id ? { ...overwritten, id: currentPlan.id } : p))
      );
    }
  };

  const handleClearAllData = () => {
    const resetState = clearAllUserData();
    setPlans(resetState.plans);
    setActivePlanId(resetState.activePlanId);
    setSelectedDayId('mandag');
  };

  const handleExportBackup = () => {
    exportPlansToJsonFile(plans, activePlanId);
  };

  const handleImportBackup = async (file: File) => {
    try {
      const imported = await importPlansFromJsonFile(file);
      setPlans(imported.plans);
      setActivePlanId(imported.activePlanId);
      alert('Sikkerhedskopien blev indlæst korrekt!');
    } catch (err: any) {
      alert(`Fejl ved import: ${err.message || 'Ukendt fejl'}`);
    }
  };

  const activeDaySchedule =
    selectedDayId === 'week'
      ? currentPlan.days.mandag
      : currentPlan.days[selectedDayId];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Header
        currentPlan={currentPlan}
        plans={plans}
        selectedDayId={selectedDayId}
        onSelectDay={setSelectedDayId}
        onOpenPlanManager={() => setIsPlanManagerOpen(true)}
        onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 print-container">
        {selectedDayId === 'week' ? (
          <WeekView
            plan={currentPlan}
            selectedDayId={selectedDayId === 'week' ? 'mandag' : selectedDayId}
            onSelectDay={(dayId) => setSelectedDayId(dayId)}
            onAddPictogramToDay={(dayId) => handleOpenAddPictogram(dayId)}
          />
        ) : (
          <DailyBoard
            schedule={activeDaySchedule}
            persona={activePersona}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
            onAddPictogram={() => handleOpenAddPictogram(selectedDayId)}
            onEditPictogram={handleOpenEditPictogram}
            onDuplicatePictogram={handleDuplicatePictogram}
            onDeletePictogram={handleDeletePictogram}
            onReorderPictograms={handleReorderPictograms}
            onMoveToDay={(pic) => setMovingPictogram(pic)}
            onCopyDay={() => setCopyingSourceDayId(selectedDayId)}
            onResetDay={() => handleResetDay(selectedDayId)}
            onClearDay={() => handleClearDay(selectedDayId)}
            onUpdateHeaderSubtitle={handleUpdateHeaderSubtitle}
            onUpdateDayName={handleUpdateDayName}
            onUpdateHeaderIcons={handleUpdateHeaderIcons}
            onUpdateAllCardsFontSize={handleApplyFontSizeToAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-4 bg-white border-t border-slate-200 text-center text-xs font-semibold text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Piktogram Maker – 100% lokal kørsel i browseren uden backend eller sporing.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Privatlivspolitik
            </button>
            <span>•</span>
            <button
              onClick={handleExportBackup}
              className="hover:text-slate-800 transition-colors"
            >
              Tag backup
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PictogramEditorModal
        pictogram={editingPictogram}
        isOpen={isEditorOpen}
        persona={activePersona}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPictogram(null);
        }}
        onSave={handleSavePictogram}
        onApplyFontSizeToAll={handleApplyFontSizeToAll}
      />

      <PrintPreviewModal
        plan={currentPlan}
        currentDayId={selectedDayId === 'week' ? 'mandag' : selectedDayId}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      <PlanManagerModal
        plans={plans}
        activePlanId={activePlanId}
        isOpen={isPlanManagerOpen}
        onClose={() => setIsPlanManagerOpen(false)}
        onSelectPlan={(id) => {
          setActivePlanId(id);
          setIsPlanManagerOpen(false);
        }}
        onCreatePlan={handleCreatePlan}
        onRenamePlan={handleRenamePlan}
        onDuplicatePlan={handleDuplicatePlan}
        onDeletePlan={handleDeletePlan}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      <MoveToDayModal
        pictogram={movingPictogram}
        currentDayId={selectedDayId === 'week' ? 'mandag' : selectedDayId}
        isOpen={!!movingPictogram}
        onClose={() => setMovingPictogram(null)}
        onMoveToDay={handleMoveToDay}
      />

      <CopyDayModal
        sourceDayId={copyingSourceDayId || 'mandag'}
        isOpen={!!copyingSourceDayId}
        onClose={() => setCopyingSourceDayId(null)}
        onCopyDay={handleCopyDay}
      />

      <PrivacyInfoModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearAllData={handleClearAllData}
      />

      <PersonaSelectorModal
        isOpen={isPersonaModalOpen}
        currentPersona={activePersona}
        currentShortCode={currentPlan.shortCode || 'K.'}
        onClose={() => setIsPersonaModalOpen(false)}
        onSelectPersona={handleSelectPersona}
      />
    </div>
  );
};

export default App;
