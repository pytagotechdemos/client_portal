"use client";

import { deleteDeliverable } from "@/app/actions/deliverable";
import { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { toast } from "sonner";

export function DeleteDeliverableButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteDeliverable(id);
        toast.success("Deliverable berhasil dihapus");
        setIsModalOpen(false);
      } catch (error) {
        toast.error("Gagal menghapus deliverable: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    });
  };

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
        disabled={isPending}
        className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
        title="Hapus Deliverable"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Deliverable"
        message="Apakah Anda yakin ingin menghapus deliverable ini? Tindakan ini tidak dapat dibatalkan."
        isPending={isPending}
      />
    </>
  );
}
