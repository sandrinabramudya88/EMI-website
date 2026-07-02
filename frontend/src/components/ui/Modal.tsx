"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalVariant = "default" | "editor";

export function Modal({ title, children, onClose, variant = "default" }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  variant?: ModalVariant;
}) {
  const [mounted, setMounted] = useState(false);
  const isEditor = variant === "editor";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-1.5 sm:p-3 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className={`${isEditor ? "h-[calc(100dvh-0.75rem)] max-w-[1320px] sm:h-[calc(100dvh-1.5rem)]" : "max-h-[calc(100vh-2rem)] max-w-2xl"} relative z-10 flex w-full flex-col overflow-hidden card-premium rounded-2xl animate-fade-up`}>
        <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-4 border-b border-[rgba(99,179,237,0.08)] sm:px-6 sm:py-5">
          <h2 className="text-base font-black text-ink tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-surface-2 transition-all duration-150"
          >
            <X size={16} />
          </button>
        </div>
        <div className={`${isEditor ? "overflow-hidden" : "overflow-y-auto"} min-h-0 flex-1 p-5 sm:p-6`}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
