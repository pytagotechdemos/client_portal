"use client";

import { deleteClient } from "@/app/actions/client";
import { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { toast } from "sonner";

export function DeleteClientButton({ id, clientName }: { id: string, clientName: string }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteClient(id);
        toast.success("Klien berhasil dihapus");
        setIsModalOpen(false);
      } catch (error) {
        toast.error("Gagal menghapus klien: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    });
  };

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
        disabled={isPending}
        className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
        title="Hapus Klien"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Klien"
        message={`Apakah Anda yakin ingin menghapus klien "${clientName}"? Tindakan ini tidak dapat dibatalkan.`}
        isPending={isPending}
      />
    </>
  );
}
