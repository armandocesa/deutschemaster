import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLevelAccess } from './useLevelAccess';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

describe('useLevelAccess', () => {
  it('returns canAccessLevel function', () => {
    const { result } = renderHook(() => useLevelAccess());
    expect(typeof result.current.canAccessLevel).toBe('function');
  });

  it('allows access to all levels', () => {
    const { result } = renderHook(() => useLevelAccess());
    expect(result.current.canAccessLevel('A1')).toBe(true);
    expect(result.current.canAccessLevel('B2')).toBe(true);
    expect(result.current.canAccessLevel('C2')).toBe(true);
  });

  it('requiresAuth returns false for all levels', () => {
    const { result } = renderHook(() => useLevelAccess());
    expect(result.current.requiresAuth('A1')).toBe(false);
    expect(result.current.requiresAuth('C2')).toBe(false);
  });

  it('exposes isAuthenticated', () => {
    const { result } = renderHook(() => useLevelAccess());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
