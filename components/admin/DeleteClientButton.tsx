"use client";

import { deleteClient } from "@/app/actions/client";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteClientButton({ id, clientName }: { id: string, clientName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the client "${clientName}"? This action cannot be undone.`)) {
      startTransition(() => {
        deleteClient(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
      title="Delete Client"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
