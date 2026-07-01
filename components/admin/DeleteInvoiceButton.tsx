"use client";

import { deleteInvoice } from "@/app/actions/invoice";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteInvoiceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`Are you sure you want to delete this invoice?`)) {
      startTransition(() => {
        deleteInvoice(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
      title="Delete Invoice"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
