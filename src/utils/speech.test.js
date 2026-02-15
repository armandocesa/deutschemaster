import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speak } from './speech';

describe('speech', () => {
  beforeEach(() => {
    window.speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn(() => []),
      onvoiceschanged: null,
    };
    window.SpeechSynthesisUtterance = vi.fn(function(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.pitch = 1;
      this.voice = null;
    });
  });

  it('calls speechSynthesis.speak', () => {
    speak('Hund');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('cancels previous speech', () => {
    speak('Katze');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('sets German language', () => {
    speak('Hallo');
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.lang).toBe('de-DE');
  });

  it('sets rate to 0.85', () => {
    speak('Guten Tag');
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.rate).toBe(0.85);
  });

  it('does nothing with empty text', () => {
    speak('');
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('does nothing with null text', () => {
    speak(null);
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('selects German voice if available', () => {
    window.speechSynthesis.getVoices = vi.fn(() => [
      { lang: 'en-US', name: 'English' },
      { lang: 'de-DE', name: 'German' },
    ]);
    speak('Wort');
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.voice).toEqual({ lang: 'de-DE', name: 'German' });
  });
});
