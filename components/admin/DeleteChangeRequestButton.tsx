"use client";

import { Trash2 } from "lucide-react";
import { deleteChangeRequest } from "@/app/actions/changeRequest";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export function DeleteChangeRequestButton({ id, portalToken }: { id: string, portalToken?: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteChangeRequest(id, portalToken);
      toast.success("Permintaan perubahan berhasil dihapus");
      setIsModalOpen(false);
    } catch {
      toast.error("Gagal menghapus permintaan perubahan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
        disabled={isDeleting}
        className="text-muted hover:text-red-500 transition-colors disabled:opacity-50"
        title="Hapus Permintaan Perubahan"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Permintaan Perubahan"
        message="Apakah Anda yakin ingin menghapus permintaan perubahan ini?"
        isPending={isDeleting}
      />
    </>
  );
}
