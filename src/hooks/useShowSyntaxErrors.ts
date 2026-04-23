import { useCallback, useEffect, useState } from "react";

export function useShowSyntaxErrors(defaultValue: boolean = true) {
  const [showSyntaxErrors, setShowSyntaxErrorsInternal] = useState<boolean>(
    () => {
      const stored = localStorage.getItem("showSyntaxErrors");
      if (stored !== null) {
        return stored === "true";
      }
      return defaultValue;
    },
  );

  useEffect(() => {
    localStorage.setItem("showSyntaxErrors", String(showSyntaxErrors));
  }, [showSyntaxErrors]);

  const setShowSyntaxErrors = useCallback((value: boolean) => {
    setShowSyntaxErrorsInternal(value);
  }, []);

  return { showSyntaxErrors, setShowSyntaxErrors };
}
