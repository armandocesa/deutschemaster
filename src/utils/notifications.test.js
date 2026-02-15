import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestPermission, isEnabled, setEnabled, getReminderTime, setReminderTime, showNotification, scheduleReminder } from './notifications';

describe('notifications', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('isEnabled / setEnabled', () => {
    it('defaults to false', () => {
      expect(isEnabled()).toBe(false);
    });

    it('enables notifications', () => {
      setEnabled(true);
      expect(isEnabled()).toBe(true);
    });

    it('disables notifications', () => {
      setEnabled(true);
      setEnabled(false);
      expect(isEnabled()).toBe(false);
    });
  });

  describe('getReminderTime / setReminderTime', () => {
    it('defaults to 20:00', () => {
      expect(getReminderTime()).toBe('20:00');
    });

    it('sets custom time', () => {
      setReminderTime('18:00');
      expect(getReminderTime()).toBe('18:00');
    });
  });

  describe('requestPermission', () => {
    it('returns false when Notification API not available', async () => {
      delete window.Notification;
      const result = await requestPermission();
      expect(result).toBe(false);
    });

    it('returns true when already granted', async () => {
      window.Notification = { permission: 'granted', requestPermission: vi.fn() };
      const result = await requestPermission();
      expect(result).toBe(true);
    });

    it('returns false when denied', async () => {
      window.Notification = { permission: 'denied', requestPermission: vi.fn() };
      const result = await requestPermission();
      expect(result).toBe(false);
    });
  });

  describe('showNotification', () => {
    it('does nothing without Notification API', () => {
      delete window.Notification;
      expect(() => showNotification('Test')).not.toThrow();
    });

    it('does nothing without permission', () => {
      window.Notification = { permission: 'default' };
      expect(() => showNotification('Test')).not.toThrow();
    });
  });

  describe('scheduleReminder', () => {
    it('returns cleanup function', () => {
      setEnabled(true);
      window.Notification = { permission: 'granted' };
      const cleanup = scheduleReminder('20:00');
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('returns noop when disabled', () => {
      const cleanup = scheduleReminder('20:00');
      expect(typeof cleanup).toBe('function');
    });
  });
});
