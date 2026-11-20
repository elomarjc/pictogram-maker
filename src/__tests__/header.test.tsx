import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Header } from '../components/Header';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate } from '../data/templates';

describe('Header component', () => {
  it('displays sandwich menu and AI startguide button inside the menu', () => {
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

    // Open sandwich menu
    const menuBtn = screen.getByRole('button', { name: /Åbn menu/i });
    expect(menuBtn).toBeTruthy();
    fireEvent.click(menuBtn);

    // Should show AI & Ny figur item in the menu
    const aiBtn = screen.getByText(/AI & Ny figur ud fra foto/i);
    expect(aiBtn).toBeTruthy();

    fireEvent.click(aiBtn);
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

    // Reopen menu if needed and check connected status badge
    fireEvent.click(screen.getByRole('button', { name: /Åbn menu/i }));
    expect(screen.getByText(/Klar/i)).toBeTruthy();
  });

  it('renders sandwich menu on mobile and opens persona modal when tapping Vælg figur', () => {
    window.innerWidth = 375;
    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
    const handleOpenPersona = vi.fn();
    const handleSelectDay = vi.fn();

    render(
      React.createElement(Header, {
        currentPlan: plan,
        plans: [plan],
        selectedDayId: 'mandag',
        onSelectDay: handleSelectDay,
        onOpenPlanManager: vi.fn(),
        onOpenTemplatePicker: vi.fn(),
        onOpenPrintModal: vi.fn(),
        onOpenPersonaModal: handleOpenPersona,
      })
    );

    // Sandwich menu button should exist
    const menuBtn = screen.getByRole('button', { name: /Åbn menu/i });
    expect(menuBtn).toBeTruthy();

    // Open sandwich menu
    fireEvent.click(menuBtn);

    // "Vælg figur" should be in the menu and clickable
    const choosePersonaBtns = screen.getAllByText(/Vælg figur/i);
    expect(choosePersonaBtns.length).toBeGreaterThan(0);

    fireEvent.click(choosePersonaBtns[choosePersonaBtns.length - 1]);
    expect(handleOpenPersona).toHaveBeenCalled();

    // Test day dropdown
    const daySelectorBtn = screen.getByRole('button', { name: /Vælg ugedag/i });
    expect(daySelectorBtn).toBeTruthy();

    fireEvent.click(daySelectorBtn);
    const tuesdayOptions = screen.getAllByText(/Tirsdag/i);
    expect(tuesdayOptions.length).toBeGreaterThan(0);

    fireEvent.click(tuesdayOptions[0]);
    expect(handleSelectDay).toHaveBeenCalledWith('tirsdag');

    window.innerWidth = 1024;
  });

  it('opens print modal when clicking Print & PDF in sandwich menu', () => {
    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
    const handleOpenPrint = vi.fn();

    render(
      React.createElement(Header, {
        currentPlan: plan,
        plans: [plan],
        selectedDayId: 'mandag',
        onSelectDay: vi.fn(),
        onOpenPlanManager: vi.fn(),
        onOpenTemplatePicker: vi.fn(),
        onOpenPrintModal: handleOpenPrint,
      })
    );

    // Open sandwich menu
    const menuBtn = screen.getByRole('button', { name: /Åbn menu/i });
    fireEvent.click(menuBtn);

    // Click Print & PDF in the sandwich menu
    const printBtn = screen.getByText(/Print & PDF/i);
    expect(printBtn).toBeTruthy();
    fireEvent.click(printBtn);

    expect(handleOpenPrint).toHaveBeenCalledTimes(1);
  });
});
