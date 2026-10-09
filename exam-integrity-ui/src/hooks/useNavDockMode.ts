import { useState, useCallback } from 'react';
import type { ExamIntegrityNavDockMode } from '@hvantran/ui-component-library';

export const NAV_DOCK_STORAGE_KEY = 'exam_integrity_nav_mode';
export const TEACHER_NAV_DOCK_STORAGE_KEY = 'exam_integrity_teacher_nav_mode';

export const useNavDockMode = (
  defaultMode: ExamIntegrityNavDockMode = 'pinned',
  storageKey: string = NAV_DOCK_STORAGE_KEY
) => {
  const [dockMode, setDockModeState] = useState<ExamIntegrityNavDockMode>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'pinned' || stored === 'docked' || stored === 'auto-hide') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors (e.g. security sandboxes, SSR)
    }
    return defaultMode;
  });

  const setDockMode = useCallback(
    (mode: ExamIntegrityNavDockMode) => {
      setDockModeState(mode);
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        // Ignore localStorage errors
      }
    },
    [storageKey]
  );

  return [dockMode, setDockMode] as const;
};

export default useNavDockMode;
