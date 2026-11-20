import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { StartWizardModal } from '../components/StartWizardModal';
import { DEFAULT_PERSONAS } from '../services/personas';

describe('StartWizardModal component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders step 1 when open and shows ChatGPT connection status', () => {
    render(
      React.createElement(StartWizardModal, {
        isOpen: true,
        onClose: vi.fn(),
        currentPersona: DEFAULT_PERSONAS[0],
        onSelectPersona: vi.fn(),
      })
    );

    expect(screen.getByText(/Trin 1: Forbind ChatGPT/i)).toBeTruthy();
    expect(screen.getAllByText(/Log ind på ChatGPT/i).length).toBeGreaterThan(0);
  });

  it('advances from step 1 to step 2 and step 3', async () => {
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

    const step3Btn = screen.getByText(/Gå til Trin 3/i);
    fireEvent.click(step3Btn);

    expect(screen.getByText(/Trin 3: Generér aktiviteter/i)).toBeTruthy();
  });

  it('marks onboarding as seen and closes when clicking complete button', () => {
    const handleClose = vi.fn();
    render(
      React.createElement(StartWizardModal, {
        isOpen: true,
        onClose: handleClose,
        currentPersona: DEFAULT_PERSONAS[0],
        onSelectPersona: vi.fn(),
      })
    );

    // Jump to step 3
    fireEvent.click(screen.getByText(/Gå til Trin 2/i));
    fireEvent.click(screen.getByText(/Gå til Trin 3/i));

    const finishBtn = screen.getByText(/Åbn ugeplanen/i);
    fireEvent.click(finishBtn);

    expect(localStorage.getItem('pictogram_has_seen_onboarding')).toBe('true');
    expect(handleClose).toHaveBeenCalled();
  });
});
