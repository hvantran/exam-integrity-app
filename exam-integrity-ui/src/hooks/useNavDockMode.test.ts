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

  it('scopes storageKey by explicit userId and isolates users', () => {
    const { result: user1Result } = renderHook(() =>
      useNavDockMode('pinned', NAV_DOCK_STORAGE_KEY, 'user1')
    );
    const { result: user2Result } = renderHook(() =>
      useNavDockMode('pinned', NAV_DOCK_STORAGE_KEY, 'user2')
    );

    act(() => {
      user1Result.current[1]('auto-hide');
    });

    expect(user1Result.current[0]).toBe('auto-hide');
    expect(
      localStorage.getItem('exam_integrity_user1_nav_mode')
    ).toBe('auto-hide');
    expect(localStorage.getItem('exam_integrity_user2_nav_mode')).toBeNull();

    act(() => {
      user2Result.current[1]('docked');
    });

    expect(user2Result.current[0]).toBe('docked');
    expect(
      localStorage.getItem('exam_integrity_user2_nav_mode')
    ).toBe('docked');
    expect(
      localStorage.getItem('exam_integrity_user1_nav_mode')
    ).toBe('auto-hide');
  });
});

