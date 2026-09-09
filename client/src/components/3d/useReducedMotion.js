import { useState, useEffect } from 'react';

/**
 * Custom hook to detect user's motion preference and device touch capability
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  });

  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(hover: none)')?.matches || 'ontouchstart' in window;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchQuery = window.matchMedia('(hover: none)');

    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    const handleTouchChange = (e) => setIsTouchDevice(e.matches);

    motionQuery.addEventListener?.('change', handleMotionChange);
    touchQuery.addEventListener?.('change', handleTouchChange);

    return () => {
      motionQuery.removeEventListener?.('change', handleMotionChange);
      touchQuery.removeEventListener?.('change', handleTouchChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    isTouchDevice,
    is3DDisabled: prefersReducedMotion
  };
}
