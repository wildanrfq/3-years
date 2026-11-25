import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useTilt<T extends HTMLElement = HTMLDivElement>(maxDeg = 8) {
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();
  const isFinePointerRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      isFinePointerRef.current = window.matchMedia('(pointer: fine)').matches;
    }
  }, []);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    el.style.setProperty('--glare-opacity', '0');
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (reducedMotion || !isFinePointerRef.current) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 2 * maxDeg;
      const rotateX = (0.5 - y) * 2 * maxDeg;

      el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      el.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`);
      el.style.setProperty('--glare-opacity', '0.28');
    },
    [maxDeg, reducedMotion]
  );

  const onPointerLeave = useCallback(() => {
    reset();
  }, [reset]);

  return {
    ref,
    onPointerMove,
    onPointerLeave,
  };
}
