import { useCallback, useEffect, useState } from "react";

export function useEnableLinting(defaultValue: boolean = true) {
  const [enableLinting, setEnableLintingInternal] = useState<boolean>(() => {
    const stored = localStorage.getItem("enableLinting");
    if (stored !== null) {
      return stored === "true";
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem("enableLinting", String(enableLinting));
  }, [enableLinting]);

  const setEnableLinting = useCallback((value: boolean) => {
    setEnableLintingInternal(value);
  }, []);

  return { enableLinting, setEnableLinting };
}
