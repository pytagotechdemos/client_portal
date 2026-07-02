"use client";

import { deleteDeliverable } from "@/app/actions/deliverable";
import { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export function DeleteDeliverableButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    startTransition(() => {
      deleteDeliverable(id);
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
        disabled={isPending}
        className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
        title="Delete Deliverable"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Deliverable"
        message={`Are you sure you want to delete this deliverable? This action cannot be undone.`}
        isPending={isPending}
      />
    </>
  );
}
