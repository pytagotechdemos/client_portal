"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  isPending?: boolean;
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm", 
  message,
  isPending = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button 
              onClick={onClose}
              disabled={isPending}
              className="text-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted text-sm">{message}</p>
        </div>
        <div className="p-4 bg-surface-light border-t border-border flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-surface-hover border border-border rounded-lg hover:bg-surface-light transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            {isPending ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
