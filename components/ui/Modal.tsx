"use client";

import { ReactNode } from "react";

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
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        className={`bg-midnight border border-gold/20 rounded-xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gold font-serif text-xl">{title}</h3>
          <button
            onClick={onClose}
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
