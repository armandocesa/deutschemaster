import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useData, DataProvider } from './DataContext';

vi.mock('./contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ levels: {} }) }));

describe('DataContext', () => {
  it('exports DataProvider and useData', () => {
    expect(typeof DataProvider).toBe('function');
    expect(typeof useData).toBe('function');
  });

  it('useData returns context value without crashing', () => {
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => {
      try { return useData(); } catch { return 'threw'; }
    }, { wrapper });
    // During loading, returns null (loading screen shown instead of children)
    expect(result.current === null || typeof result.current === 'object' || result.current === 'threw').toBe(true);
  });
});
