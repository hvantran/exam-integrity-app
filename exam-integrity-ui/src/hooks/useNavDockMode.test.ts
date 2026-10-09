import { renderHook, act } from '@testing-library/react';
import {
  useNavDockMode,
  NAV_DOCK_STORAGE_KEY,
  TEACHER_NAV_DOCK_STORAGE_KEY,
} from './useNavDockMode';

describe('useNavDockMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to pinned mode when no storage exists', () => {
    const { result } = renderHook(() => useNavDockMode());
    expect(result.current[0]).toBe('pinned');
  });

  it('initializes from localStorage if valid mode is stored', () => {
    localStorage.setItem(NAV_DOCK_STORAGE_KEY, 'docked');
    const { result } = renderHook(() => useNavDockMode());
    expect(result.current[0]).toBe('docked');
  });

  it('updates mode and saves to localStorage', () => {
    const { result } = renderHook(() => useNavDockMode());
    act(() => {
      result.current[1]('auto-hide');
    });
    expect(result.current[0]).toBe('auto-hide');
    expect(localStorage.getItem(NAV_DOCK_STORAGE_KEY)).toBe('auto-hide');

    act(() => {
      result.current[1]('docked');
    });
    expect(result.current[0]).toBe('docked');
    expect(localStorage.getItem(NAV_DOCK_STORAGE_KEY)).toBe('docked');
  });

  it('supports custom storageKey for teacher nav dock mode', () => {
    localStorage.setItem(TEACHER_NAV_DOCK_STORAGE_KEY, 'docked');
    const { result } = renderHook(() =>
      useNavDockMode('pinned', TEACHER_NAV_DOCK_STORAGE_KEY)
    );
    expect(result.current[0]).toBe('docked');

    act(() => {
      result.current[1]('auto-hide');
    });
    expect(result.current[0]).toBe('auto-hide');
    expect(localStorage.getItem(TEACHER_NAV_DOCK_STORAGE_KEY)).toBe('auto-hide');
  });
});
