# ChatGPT Onboarding, Startskærm & Pædagogisk Billedgenerering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skabe en 100% brugervenlig, dansk og pædagogisk startskærm med et 3-trins flow (Login til ChatGPT -> Vælg/Opret figur -> Generér aktiviteter/idéer) samt altid synlig ChatGPT-status og generator-knap i top-menuen.

**Architecture:** Modulær udvidelse i `pictogram-maker` med en dedikeret `StartWizardModal`-komponent, opdateret `Header`-statusindikator, robust Windows-sikring af ChatGPT browser-kommandoer i `generate-with-chatgpt.mjs`, og live polling-service i `chatgptGeneration.ts`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Vitest.

---

## File Structure Map
- **Modify:** `scripts/generate-with-chatgpt.mjs` — Cross-platform Windows fix for `where/which image-use` og `start https://chatgpt.com`.
- **Modify:** `src/services/chatgptGeneration.ts` — Tilføj polling-hjælper og robust status-håndtering.
- **Create:** `src/components/StartWizardModal.tsx` — 3-trins onboarding og startguide modal.
- **Modify:** `src/components/Header.tsx` — Tilføj ChatGPT-statusindikator og "🎨 Ny figur & aktiviteter"-knap.
- **Modify:** `src/App.tsx` — Indfør `isStartWizardOpen`, autostart-tjek og integration med `StartWizardModal`.
- **Create:** `src/__tests__/startWizard.test.ts` — Enhedstest for wizardens trin, login-håndtering og navigation.

---

### Task 1: Cross-platform Windows Fix & ChatGPT Service Polling

**Files:**
- Modify: `scripts/generate-with-chatgpt.mjs:45-105`
- Modify: `src/services/chatgptGeneration.ts:20-65`
- Create: `src/__tests__/chatgptService.test.ts`

- [ ] **Step 1: Write test for ChatGPT status service**

Create `src/__tests__/chatgptService.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getChatGPTStatus } from '../services/chatgptGeneration';

describe('chatgptGeneration service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles backend response correctly when ready', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        installed: true,
        ready: true,
        loggedIn: true,
        relayConnected: true,
        profiles: ['chrome_default'],
        message: 'ChatGPT er klar',
      }),
    });

    const status = await getChatGPTStatus();
    expect(status.ready).toBe(true);
    expect(status.loggedIn).toBe(true);
    expect(status.profiles).toContain('chrome_default');
  });

  it('handles backend fetch failure gracefully without throwing', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const status = await getChatGPTStatus();
    expect(status.ready).toBe(false);
    expect(status.loggedIn).toBe(false);
    expect(status.message).toContain('Kunne ikke kontakte');
  });
});
```

- [ ] **Step 2: Run test to verify it passes/fails**

Run: `npx vitest run src/__tests__/chatgptService.test.ts`
Expected: Passes or fails based on fetch mock.

- [ ] **Step 3: Update `scripts/generate-with-chatgpt.mjs` for Windows**

Update `checkImageUseInstalled()` and `openChatGPTInBrowser()`:
```javascript
export function checkImageUseInstalled() {
  try {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'where.exe image-use 2>nul' : 'which image-use 2>/dev/null';
    const res = execSync(cmd, { encoding: 'utf-8' });
    return res.trim().length > 0;
  } catch {
    return false;
  }
}

export function openChatGPTInBrowser() {
  try {
    const isWin = process.platform === 'win32';
    if (isWin) {
      spawn('cmd.exe', ['/c', 'start', 'https://chatgpt.com'], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      }).unref();
    } else {
      const cmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
      spawn(cmd, ['https://chatgpt.com'], { detached: true, stdio: 'ignore' }).unref();
    }
    return { success: true, message: 'Åbnede https://chatgpt.com i din standardbrowser.' };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}
```

- [ ] **Step 4: Run test to verify passes**

Run: `npx vitest run src/__tests__/chatgptService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C ..\pictogram-maker add scripts/generate-with-chatgpt.mjs src/__tests__/chatgptService.test.ts
git -C ..\pictogram-maker commit -m "fix: understoet Windows browser-aabning og statustjek i ChatGPT generator"
```

---

### Task 2: Build `StartWizardModal.tsx` (3-trins Startguide)

**Files:**
- Create: `src/components/StartWizardModal.tsx`
- Create: `src/__tests__/startWizard.test.ts`

- [ ] **Step 1: Write the tests for `StartWizardModal`**

Create `src/__tests__/startWizard.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StartWizardModal } from '../components/StartWizardModal';
import { DEFAULT_PERSONAS } from '../services/personas';

describe('StartWizardModal component', () => {
  it('renders step 1 when open and shows ChatGPT login instructions', () => {
    render(
      React.createElement(StartWizardModal, {
        isOpen: true,
        onClose: vi.fn(),
        currentPersona: DEFAULT_PERSONAS[0],
        onSelectPersona: vi.fn(),
      })
    );

    expect(screen.getByText(/Trin 1: Forbind ChatGPT/i)).toBeTruthy();
    expect(screen.getByText(/Log ind på ChatGPT/i)).toBeTruthy();
  });

  it('allows advancing to step 2 and switching steps', () => {
    render(
      React.createElement(StartWizardModal, {
        isOpen: true,
        onClose: vi.fn(),
        currentPersona: DEFAULT_PERSONAS[0],
        onSelectPersona: vi.fn(),
      })
    );

    const nextBtn = screen.getByText(/Gå til Trin 2/i);
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Trin 2: Vælg eller opret figur/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/startWizard.test.ts`
Expected: FAIL because `StartWizardModal` does not exist yet.

- [ ] **Step 3: Implement `src/components/StartWizardModal.tsx`**

Implement full Danish 3-step modal with:
1. Stepper indicator at top: `1: Forbind ChatGPT`, `2: Vælg/Opret figur`, `3: Generér aktiviteter`.
2. Step 1: ChatGPT login button, background poll interval every 3 seconds, status badge (green/yellow), "Spring over" link, "Gå til Trin 2" button.
3. Step 2: Persona gallery (select existing `avatar_1` / custom) + "Upload foto & skab ny figur" area.
4. Step 3: Batch 20-scene master generator button + Custom Idea suggestions ("Brætspil", "iPad tid", "Læse bog", "Svømmehal", etc.) + Danish input textarea + "Tegn aktivitet" button.
5. Final button: "🎉 Åbn ugeplanen med de nye piktogrammer" (calls `onClose()` and marks `pictogram_has_seen_onboarding` in localStorage).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/startWizard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C ..\pictogram-maker add src/components/StartWizardModal.tsx src/__tests__/startWizard.test.ts
git -C ..\pictogram-maker commit -m "feat: tilfoej pædagogisk 3-trins StartWizardModal til ChatGPT login og figurvalg"
```

---

### Task 3: Update `Header.tsx` with Live Connection Badge and Action Button

**Files:**
- Modify: `src/components/Header.tsx:20-100`
- Modify: `src/types/index.ts` (if new props needed)
- Modify: `src/__tests__/plan.test.ts` or add Header tests

- [ ] **Step 1: Write/Update test for Header connection badge**

Add test in `src/__tests__/header.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Header } from '../components/Header';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate } from '../data/templates';

describe('Header component', () => {
  it('displays ChatGPT status indicator and Startguide button', () => {
    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
    render(
      React.createElement(Header, {
        currentPlan: plan,
        plans: [plan],
        selectedDayId: 'mandag',
        onSelectDay: vi.fn(),
        onOpenPlanManager: vi.fn(),
        onOpenTemplatePicker: vi.fn(),
        onOpenPrintModal: vi.fn(),
        onOpenStartWizard: vi.fn(),
        isChatGPTConnected: false,
      })
    );

    expect(screen.getByText(/Log ind på ChatGPT/i)).toBeTruthy();
    expect(screen.getByText(/Ny figur & aktiviteter/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/header.test.tsx`
Expected: FAIL due to missing props.

- [ ] **Step 3: Modify `src/components/Header.tsx`**

Add `onOpenStartWizard: () => void` and `isChatGPTConnected?: boolean` props:
- Insert a permanent status badge in the header:
  - When connected: `🟢 ChatGPT forbundet` (emerald badge).
  - When disconnected: `🟡 Log ind på ChatGPT` (yellow badge with pulsing dot, clicking it opens `onOpenStartWizard()`).
- Insert primary CTA button next to "Skabeloner" and "Print/PDF":
  - `<button onClick={onOpenStartWizard} className="bg-amber-400 hover:bg-amber-500 ... font-black text-slate-900"><Sparkles size={16} /><span>Ny figur & aktiviteter</span></button>`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/header.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C ..\pictogram-maker add src/components/Header.tsx src/__tests__/header.test.tsx
git -C ..\pictogram-maker commit -m "feat: tilfoej ChatGPT status-badge og generator-knap i top-menuen"
```

---

### Task 4: Integrate `StartWizardModal` in `App.tsx` & Auto-Start Flow

**Files:**
- Modify: `src/App.tsx:35-120, 620-815`

- [ ] **Step 1: Inspect `App.tsx` and integrate ChatGPT status state and wizard state**

In `src/App.tsx`:
1. Add state:
   ```typescript
   const [isStartWizardOpen, setIsStartWizardOpen] = useState(false);
   const [chatgptStatus, setChatgptStatus] = useState<ChatGPTStatus | null>(null);
   ```
2. On initial mount (`useEffect`):
   - Check `getChatGPTStatus()`.
   - Read `localStorage.getItem('pictogram_has_seen_onboarding')`.
   - If not seen before OR if `!status.loggedIn`, automatically open `setIsStartWizardOpen(true)`.
3. Provide `onOpenStartWizard={() => setIsStartWizardOpen(true)}` and `isChatGPTConnected={chatgptStatus?.loggedIn ?? false}` to `Header`.
4. Render `<StartWizardModal>` with callbacks to update active persona and day plans.

- [ ] **Step 2: Run `npm test` to verify no regressions**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git -C ..\pictogram-maker add src/App.tsx
git -C ..\pictogram-maker commit -m "feat: integrer startguide og automatisk velkomst-tjek i App"
```

---

### Task 5: End-to-End Build Verification & Typecheck

**Files:**
- Run full test suite and build.

- [ ] **Step 1: Run TypeScript build**

Run: `npm run build` in `pictogram-maker`.
Expected: `tsc -b && vite build` succeeds with code 0.

- [ ] **Step 2: Run all automated Vitest tests**

Run: `npm test` in `pictogram-maker`.
Expected: 100% pass rate.

- [ ] **Step 3: Commit final integration**

```bash
git -C ..\pictogram-maker commit --allow-empty -m "chore: fuldfoer verifikation af onboarding og ChatGPT startguide"
```
