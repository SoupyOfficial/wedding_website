"use client";

import { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}

export default function Modal({
  title,
  children,
  onClose,
  maxWidth = "max-w-md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "modal-title";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Focus the dialog on mount
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`bg-midnight border border-gold/20 rounded-xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto outline-none`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id={titleId} className="text-gold font-serif text-xl">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ivory/40 hover:text-ivory text-xl transition-colors"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
