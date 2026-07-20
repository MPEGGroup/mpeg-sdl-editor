import { useCallback, useEffect, useState } from "react";

export const RULER_WIDTH_OPTIONS = [60, 80, 100, 120, 140, 160, 180, 200] as const;
export type RulerWidth = (typeof RULER_WIDTH_OPTIONS)[number];

function isValidRulerWidth(value: number): value is RulerWidth {
  return RULER_WIDTH_OPTIONS.includes(value as RulerWidth);
}

export function useRulerWidth(defaultWidth: RulerWidth = 80) {
  const [rulerWidth, setRulerWidthInternal] = useState<RulerWidth>(() => {
    const stored = localStorage.getItem("rulerWidth");
    if (stored) {
      const parsed = Number(stored);
      if (isValidRulerWidth(parsed)) {
        return parsed;
      }
    }
    return defaultWidth;
  });

  useEffect(() => {
    localStorage.setItem("rulerWidth", String(rulerWidth));
  }, [rulerWidth]);

  const setRulerWidth = useCallback((width: number) => {
    if (isValidRulerWidth(width)) {
      setRulerWidthInternal(width);
    }
  }, []);

  return { rulerWidth, setRulerWidth };
}
