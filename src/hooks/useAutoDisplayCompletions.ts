import { useCallback, useEffect, useState } from "react";

export function useAutoDisplayCompletions(defaultValue: boolean = true) {
  const [autoDisplayCompletions, setAutoDisplayCompletionsInternal] = useState<
    boolean
  >(() => {
    const stored = localStorage.getItem("autoDisplayCompletions");
    if (stored !== null) {
      return stored === "true";
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(
      "autoDisplayCompletions",
      String(autoDisplayCompletions),
    );
  }, [autoDisplayCompletions]);

  const setAutoDisplayCompletions = useCallback((value: boolean) => {
    setAutoDisplayCompletionsInternal(value);
  }, []);

  return { autoDisplayCompletions, setAutoDisplayCompletions };
}
