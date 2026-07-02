"use client";

import React, { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isPending?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDestructive = true,
  isPending = false,
}: ConfirmModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-surface border border-border shadow-2xl rounded-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted text-sm mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-foreground bg-background hover:bg-surface-hover border border-border rounded-md transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              // Do not auto-close if pending state is managed externally, 
              // or let the parent component close it when done.
            }}
            disabled={isPending}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${
              isDestructive 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {isPending ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
