import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Header } from '../components/Header';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate } from '../data/templates';

describe('Header component', () => {
  it('displays ChatGPT status indicator and Startguide button', () => {
    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
    const handleOpenWizard = vi.fn();

    const { rerender } = render(
      React.createElement(Header, {
        currentPlan: plan,
        plans: [plan],
        selectedDayId: 'mandag',
        onSelectDay: vi.fn(),
        onOpenPlanManager: vi.fn(),
        onOpenTemplatePicker: vi.fn(),
        onOpenPrintModal: vi.fn(),
        onOpenStartWizard: handleOpenWizard,
        isChatGPTConnected: false,
      })
    );

    // Should show disconnected badge and button
    expect(screen.getByText(/Log ind på ChatGPT/i)).toBeTruthy();
    const wizardBtn = screen.getByText(/Ny figur & aktiviteter/i);
    expect(wizardBtn).toBeTruthy();

    fireEvent.click(wizardBtn);
    expect(handleOpenWizard).toHaveBeenCalled();

    // Re-render as connected
    rerender(
      React.createElement(Header, {
        currentPlan: plan,
        plans: [plan],
        selectedDayId: 'mandag',
        onSelectDay: vi.fn(),
        onOpenPlanManager: vi.fn(),
        onOpenTemplatePicker: vi.fn(),
        onOpenPrintModal: vi.fn(),
        onOpenStartWizard: handleOpenWizard,
        isChatGPTConnected: true,
      })
    );

    expect(screen.getByText(/ChatGPT forbundet/i)).toBeTruthy();
  });
});
