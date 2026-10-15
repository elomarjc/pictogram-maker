import type { WeekPlan } from '../types';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate } from '../data/templates';

const SESSION_STORAGE_KEY = 'piktogram_maker_session_v1';
const ACTIVE_PLAN_ID_KEY = 'piktogram_maker_active_plan_id';

export interface AppStateData {
  plans: WeekPlan[];
  activePlanId: string;
}

/**
 * Loads all plans from browser sessionStorage.
 * If empty, initializes with the default built-in template.
 */
export function loadPlansFromSession(): { plans: WeekPlan[]; activePlanId: string } {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed: AppStateData = JSON.parse(raw);
      if (parsed.plans && parsed.plans.length > 0) {
        return {
          plans: parsed.plans,
          activePlanId: parsed.activePlanId || parsed.plans[0].id,
        };
      }
    }
  } catch (err) {
    console.warn('Kunne ikke indlæse fra sessionStorage:', err);
  }

  // Initialize with the recommended built-in template
  const defaultPlan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
  const initialData: AppStateData = {
    plans: [defaultPlan],
    activePlanId: defaultPlan.id,
  };

  savePlansToSession(initialData.plans, initialData.activePlanId);
  return initialData;
}

/**
 * Saves plans strictly to sessionStorage (RAM / browser tab life only, NO localStorage/cookies/cloud).
 */
export function savePlansToSession(plans: WeekPlan[], activePlanId: string): void {
  try {
    const data: AppStateData = { plans, activePlanId };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(ACTIVE_PLAN_ID_KEY, activePlanId);
  } catch (err) {
    console.error('Kunne ikke gemme til sessionStorage:', err);
  }
}

/**
 * Completely clears all user data from sessionStorage.
 * Re-initializes with a fresh default template.
 */
export function clearAllUserData(): { plans: WeekPlan[]; activePlanId: string } {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(ACTIVE_PLAN_ID_KEY);
  } catch (err) {
    console.error('Fejl ved rydning af sessionStorage:', err);
  }

  const freshDefault = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
  savePlansToSession([freshDefault], freshDefault.id);
  return { plans: [freshDefault], activePlanId: freshDefault.id };
}

/**
 * Exports plans to a downloadable JSON file strictly within the user's browser.
 */
export function exportPlansToJsonFile(plans: WeekPlan[], activePlanId: string): void {
  const exportPayload = {
    app: 'Piktogram Maker',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    plans,
    activePlanId,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `piktogrammer-ugeplan-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports plans from a local JSON file.
 */
export async function importPlansFromJsonFile(file: File): Promise<AppStateData> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!parsed || !Array.isArray(parsed.plans) || parsed.plans.length === 0) {
    throw new Error('Ugyldig fil: Ingen ugeplaner fundet i den importerede fil.');
  }

  for (const plan of parsed.plans) {
    if (!plan.id || !plan.name || !plan.days) {
      throw new Error(`Ugyldigt format i planen "${plan.name || 'Ukendt'}"`);
    }
  }

  const activeId = parsed.activePlanId && parsed.plans.some((p: WeekPlan) => p.id === parsed.activePlanId)
    ? parsed.activePlanId
    : parsed.plans[0].id;

  savePlansToSession(parsed.plans, activeId);
  return { plans: parsed.plans, activePlanId: activeId };
}
