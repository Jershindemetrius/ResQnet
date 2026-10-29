import { useEffect, useRef } from 'react';

export default function usePolling(callback, intervalMs = 2500) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let active = true;
    let timeoutId;

    const poll = async () => {
      try {
        await callbackRef.current();
      } finally {
        if (active) timeoutId = window.setTimeout(poll, intervalMs);
      }
    };

    timeoutId = window.setTimeout(poll, intervalMs);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [intervalMs]);
}
