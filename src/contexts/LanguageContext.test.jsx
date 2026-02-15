import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Helper component
function LanguageConsumer() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="translated">{t('nav.home')}</span>
      <span data-testid="missing">{t('nonexistent.key')}</span>
      <button onClick={() => setLanguage('it')}>Switch IT</button>
      <button onClick={() => setLanguage('de')}>Switch DE</button>
      <button onClick={() => setLanguage('en')}>Switch EN</button>
      <button onClick={() => setLanguage('xx')}>Switch Invalid</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('defaults to English when no saved preference', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });

  it('translates keys correctly', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    // 'nav.home' should return a translated string, not the key itself
    const translated = screen.getByTestId('translated').textContent;
    expect(translated).not.toBe('nav.home');
    expect(translated.length).toBeGreaterThan(0);
  });

  it('returns key for missing translations', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('missing').textContent).toBe('nonexistent.key');
  });

  it('switches language to Italian', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('Switch IT'));
    expect(screen.getByTestId('lang').textContent).toBe('it');
    expect(localStorage.getItem('dm_ui_language')).toBe('it');
  });

  it('switches language to German', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('Switch DE'));
    expect(screen.getByTestId('lang').textContent).toBe('de');
  });

  it('ignores invalid language codes', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('Switch Invalid'));
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });

  it('updates document.documentElement.lang on switch', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('Switch IT'));
    expect(document.documentElement.lang).toBe('it');
  });

  it('restores saved language from localStorage', () => {
    localStorage.setItem('dm_ui_language', 'de');
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang').textContent).toBe('de');
  });

  it('throws when useLanguage is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<LanguageConsumer />)).toThrow('useLanguage must be used within LanguageProvider');
    spy.mockRestore();
  });
});
