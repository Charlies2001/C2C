import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useHintTrigger(mode: 'coding' | 'teaching' = 'coding') {
  const code = useStore((s) => s.code);
  const output = useStore((s) => s.output);
  const consecutiveFailures = useStore((s) => s.consecutiveFailures);
  const triggerHintNudge = useStore((s) => s.triggerHintNudge);
  const hasAllLevels = useStore((s) => s.hasAllLevels);
  const isHintLoading = useStore((s) => s.isHintLoading);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOutputRef = useRef(output);

  // Trigger on consecutive failures >= 2 (coding mode only)
  useEffect(() => {
    if (mode !== 'coding') return;
    if (consecutiveFailures >= 2 && !hasAllLevels() && !isHintLoading) {
      triggerHintNudge();
    }
  }, [mode, consecutiveFailures, hasAllLevels, isHintLoading, triggerHintNudge]);

  // Trigger on 2 minutes of code inactivity (coding mode only)
  useEffect(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (mode !== 'coding') return;

    if (code && !hasAllLevels() && !isHintLoading) {
      idleTimerRef.current = setTimeout(() => {
        triggerHintNudge();
      }, 2 * 60 * 1000);
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [mode, code, hasAllLevels, isHintLoading, triggerHintNudge]);

  // Trigger on runtime errors in output (coding mode only)
  useEffect(() => {
    if (mode !== 'coding') return;
    if (output && output !== prevOutputRef.current) {
      const hasError =
        /error|exception|traceback|syntaxerror|typeerror|nameerror|valueerror|indexerror|keyerror|attributeerror|zerodivisionerror/i.test(output);
      if (hasError && !hasAllLevels() && !isHintLoading) {
        triggerHintNudge();
      }
    }
    prevOutputRef.current = output;
  }, [mode, output, hasAllLevels, isHintLoading, triggerHintNudge]);
}
