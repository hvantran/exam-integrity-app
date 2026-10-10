import { useState, useCallback, useContext, useEffect } from 'react';
import type { ExamIntegrityNavDockMode } from '@hvantran/ui-component-library';
import { AuthContext } from '../context/AuthContext';
import { getScopedItem, setScopedItem } from '../utils/storage';

export const NAV_DOCK_STORAGE_KEY = 'exam_integrity_nav_mode';
export const TEACHER_NAV_DOCK_STORAGE_KEY = 'exam_integrity_teacher_nav_mode';

export const useNavDockMode = (
  defaultMode: ExamIntegrityNavDockMode = 'pinned',
  storageKey: string = NAV_DOCK_STORAGE_KEY,
  explicitUserId?: string | null
) => {
  const auth = useContext(AuthContext);
  const effectiveUserId =
    explicitUserId !== undefined
      ? explicitUserId
      : auth?.user?.username ?? null;

  const [dockMode, setDockModeState] = useState<ExamIntegrityNavDockMode>(() => {
    try {
      const stored = getScopedItem(storageKey, effectiveUserId);
      if (stored === 'pinned' || stored === 'docked' || stored === 'auto-hide') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors (e.g. security sandboxes, SSR)
    }
    return defaultMode;
  });

  useEffect(() => {
    if (effectiveUserId) {
      const stored = getScopedItem(storageKey, effectiveUserId);
      if (stored === 'pinned' || stored === 'docked' || stored === 'auto-hide') {
        setDockModeState(stored);
      }
    }
  }, [effectiveUserId, storageKey]);

  const setDockMode = useCallback(
    (mode: ExamIntegrityNavDockMode) => {
      setDockModeState(mode);
      try {
        setScopedItem(storageKey, mode, effectiveUserId);
      } catch {
        // Ignore localStorage errors
      }
    },
    [storageKey, effectiveUserId]
  );

  return [dockMode, setDockMode] as const;
};

export default useNavDockMode;
