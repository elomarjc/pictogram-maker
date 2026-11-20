import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getChatGPTStatus,
  pollChatGPTStatusUntilReady,
  isChatGPTConnectedManual,
  setChatGPTConnectedManual,
  isChatGPTLoginPending,
  clearChatGPTLoginPending,
  STORAGE_KEY_CHATGPT_CONNECTED,
  STORAGE_KEY_CHATGPT_PENDING,
} from '../services/chatgptGeneration';

describe('chatgptGeneration service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
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

  it('polls until ready or signal aborts', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        json: async () => ({
          installed: true,
          ready: callCount >= 2,
          loggedIn: callCount >= 2,
          profiles: callCount >= 2 ? ['profile1'] : [],
          message: callCount >= 2 ? 'Klar' : 'Venter',
        }),
      };
    });

    const finalStatus = await pollChatGPTStatusUntilReady({ intervalMs: 10, maxAttempts: 5 });
    expect(finalStatus.ready).toBe(true);
    expect(callCount).toBe(2);
  });

  it('supports mobile manual connection and disconnection via localStorage', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('No local server on phone'));

    expect(isChatGPTConnectedManual()).toBe(false);
    let status = await getChatGPTStatus();
    expect(status.loggedIn).toBe(false);

    // User confirms on phone
    setChatGPTConnectedManual(true);
    expect(isChatGPTConnectedManual()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY_CHATGPT_CONNECTED)).toBe('true');

    status = await getChatGPTStatus();
    expect(status.loggedIn).toBe(true);
    expect(status.ready).toBe(true);
    expect(status.profiles).toContain('Browser / Mobil session');

    // Disconnect
    setChatGPTConnectedManual(false);
    expect(isChatGPTConnectedManual()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY_CHATGPT_CONNECTED)).toBeNull();

    status = await getChatGPTStatus();
    expect(status.loggedIn).toBe(false);
  });

  it('tracks pending login state for tab-switch return detection', () => {
    expect(isChatGPTLoginPending()).toBe(false);
    sessionStorage.setItem(STORAGE_KEY_CHATGPT_PENDING, 'true');
    expect(isChatGPTLoginPending()).toBe(true);

    clearChatGPTLoginPending();
    expect(isChatGPTLoginPending()).toBe(false);
  });
});
