import { useCallback, useEffect, useState } from "react";

export function useShowSemanticWarnings(defaultValue: boolean = true) {
  const [showSemanticWarnings, setShowSemanticWarningsInternal] = useState<
    boolean
  >(() => {
    const stored = localStorage.getItem("showSemanticWarnings");
    if (stored !== null) {
      return stored === "true";
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem("showSemanticWarnings", String(showSemanticWarnings));
  }, [showSemanticWarnings]);

  const setShowSemanticWarnings = useCallback((value: boolean) => {
    setShowSemanticWarningsInternal(value);
  }, []);

  return { showSemanticWarnings, setShowSemanticWarnings };
}
