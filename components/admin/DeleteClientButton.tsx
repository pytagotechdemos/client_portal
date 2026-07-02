"use client";

import { deleteClient } from "@/app/actions/client";
import { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export function DeleteClientButton({ id, clientName }: { id: string, clientName: string }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    startTransition(() => {
      deleteClient(id);
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
        disabled={isPending}
        className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
        title="Delete Client"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete the client "${clientName}"? This action cannot be undone.`}
        isPending={isPending}
      />
    </>
  );
}
