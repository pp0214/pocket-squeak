import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { View } from "react-native";
import { Toast, ToastData, ToastType } from "@/src/components/ui/Toast";

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 11);
    const newToast: ToastData = {
      id,
      type: options.type,
      message: options.message,
      duration: options.duration,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: "success", message, duration });
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: "error", message, duration });
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: "info", message, duration });
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: "warning", message, duration });
    },
    [showToast],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      success,
      error,
      info,
      warning,
    }),
    [showToast, success, error, info, warning],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          pointerEvents: "box-none",
        }}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
