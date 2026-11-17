"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function SwipeableToastItem({
  toast,
  onDismiss,
  getIcon,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
  getIcon: (type: ToastType) => ReactNode;
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startXRef.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 70) {
      onDismiss();
    } else {
      setDragOffset(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${dragOffset}px)`,
        opacity: Math.max(0.2, 1 - dragOffset / 150),
      }}
      className="pointer-events-auto p-4 rounded-card glass flex items-start gap-3 transition-transform duration-75 animate-in slide-in-from-top-2 select-none"
    >
      <div className="mt-0.5">{getIcon(toast.type)}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-ink font-sans">{toast.title}</h4>
        {toast.message && (
          <p className="text-[11px] text-muted mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted hover:text-ink p-1 rounded-full hover:bg-subtle/80 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, "id">) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-semantic-verified shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-semantic-pending shrink-0" />;
      case "error":
        return <XCircle className="h-4 w-4 text-semantic-flagged shrink-0" />;
      case "info":
        return <Info className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Top-Right Stack under the floating top bar with 16px gap */}
      <div className="fixed top-[84px] right-4 sm:right-6 z-50 flex flex-col gap-4 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <SwipeableToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
            getIcon={getIcon}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
