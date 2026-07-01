"use client";

import { deleteDeliverable } from "@/app/actions/deliverable";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteDeliverableButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if this is inside a Link
    if (confirm(`Are you sure you want to delete this deliverable?`)) {
      startTransition(() => {
        deleteDeliverable(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
      title="Delete Deliverable"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
