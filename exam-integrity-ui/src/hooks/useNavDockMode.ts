import { useState, useCallback } from 'react';
import type { ExamIntegrityNavDockMode } from '@hvantran/ui-component-library';

export const NAV_DOCK_STORAGE_KEY = 'exam_integrity_nav_mode';

export const useNavDockMode = (defaultMode: ExamIntegrityNavDockMode = 'pinned') => {
  const [dockMode, setDockModeState] = useState<ExamIntegrityNavDockMode>(() => {
    try {
      const stored = localStorage.getItem(NAV_DOCK_STORAGE_KEY);
      if (stored === 'pinned' || stored === 'docked' || stored === 'auto-hide') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors (e.g. security sandboxes, SSR)
    }
    return defaultMode;
  });

  const setDockMode = useCallback((mode: ExamIntegrityNavDockMode) => {
    setDockModeState(mode);
    try {
      localStorage.setItem(NAV_DOCK_STORAGE_KEY, mode);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return [dockMode, setDockMode] as const;
};

export default useNavDockMode;
