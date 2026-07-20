import { useCallback, useEffect, useState } from "react";

export type ToastType = "success" | "warning" | "error";
export type ShowToastFunction = (message: string, type?: ToastType, duration?: number) => void;

interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast(): [ToastState | null, ShowToastFunction] {
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const [toastDuration, setToastDuration] = useState<number>(2000);

  useEffect(() => {
    if (toastState) {
      const timer = setTimeout(() => {
        setToastState(null);
      }, toastDuration);
      return () => clearTimeout(timer);
    }
  }, [toastState, toastDuration]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration: number = 2000) => {
      setToastState({ message, type });
      setToastDuration(duration);
    },
    [],
  );

  return [toastState, showToast];
}
