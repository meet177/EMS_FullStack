"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = Omit<Toast, "id" | "variant"> & {
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, variant: input.variant ?? "info", title: input.title, description: input.description }].slice(-4));
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 grid w-[calc(100vw-2rem)] max-w-sm gap-3 sm:bottom-6 sm:right-6">
        {toasts.map((item) => {
          const Icon = item.variant === "success" ? CheckCircle2 : item.variant === "error" ? XCircle : Info;
          return (
            <div
              key={item.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 rounded-md border bg-card/95 p-4 text-card-foreground shadow-soft backdrop-blur duration-300",
                item.variant === "success" && "border-emerald-500/20",
                item.variant === "error" && "border-destructive/20"
              )}
            >
              <div className="flex gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    item.variant === "success" && "text-emerald-600 dark:text-emerald-300",
                    item.variant === "error" && "text-destructive",
                    item.variant === "info" && "text-primary"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p> : null}
                </div>
                <Button type="button" variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8" onClick={() => dismiss(item.id)} aria-label="Dismiss notification">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
