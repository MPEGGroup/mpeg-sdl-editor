import { useCallback, useEffect, useState } from "react";

export function useShowSemanticErrors(defaultValue: boolean = true) {
  const [showSemanticErrors, setShowSemanticErrorsInternal] = useState<boolean>(
    () => {
      const stored = localStorage.getItem("showSemanticErrors");
      if (stored !== null) {
        return stored === "true";
      }
      return defaultValue;
    },
  );

  useEffect(() => {
    localStorage.setItem("showSemanticErrors", String(showSemanticErrors));
  }, [showSemanticErrors]);

  const setShowSemanticErrors = useCallback((value: boolean) => {
    setShowSemanticErrorsInternal(value);
  }, []);

  return { showSemanticErrors, setShowSemanticErrors };
}
