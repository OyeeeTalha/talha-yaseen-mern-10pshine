import { useState, useCallback } from "react";
import type { ToastType } from "../components/ui/toast";

interface Toast {
  id: string;
  message: string;
  type?: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast],
  );

  const error = useCallback(
    (message: string) => {
      showToast(message, "error");
    },
    [showToast],
  );

  const info = useCallback(
    (message: string) => {
      showToast(message, "info");
    },
    [showToast],
  );

  return {
    toasts,
    hideToast,
    showToast,
    success,
    error,
    info,
  };
};
