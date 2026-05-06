/** FE-13: Proctor — capture integrity events */
import { useEffect, useCallback, useRef } from 'react';
import { proctorService } from '../services/proctorService';

export function useProctor(sessionId: string, studentId: string) {
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const report = useCallback(
    (eventType: string) => {
      if (!sessionId) return;
      if (pendingRef.current) clearTimeout(pendingRef.current);
      // Debounce 300ms to avoid event storms
      pendingRef.current = setTimeout(() => {
        proctorService.reportEvent(sessionId, eventType, studentId).catch(() => {});
      }, 300);
    },
    [sessionId, studentId],
  );

  useEffect(() => {
    if (!sessionId) return;

    const onBlur = () => report('TAB_BLUR');
    const onFocus = () => report('TAB_FOCUS');
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      report('COPY_PASTE');
    };
    const onMenu = (e: MouseEvent) => {
      e.preventDefault();
      report('CONTEXT_MENU');
    };
    const onFs = () => {
      if (!document.fullscreenElement) report('FULLSCREEN_EXIT');
    };

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('copy', onCopy);
    document.addEventListener('contextmenu', onMenu);
    document.addEventListener('fullscreenchange', onFs);

    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('contextmenu', onMenu);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [report, sessionId]);
}
