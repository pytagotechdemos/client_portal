"use client";

import { Trash2 } from "lucide-react";
import { deleteChangeRequest } from "@/app/actions/changeRequest";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteChangeRequestButton({ id, portalToken }: { id: string, portalToken?: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin menghapus permintaan perubahan ini?")) {
      setIsDeleting(true);
      try {
        await deleteChangeRequest(id, portalToken);
        toast.success("Permintaan perubahan berhasil dihapus");
      } catch {
        toast.error("Gagal menghapus permintaan perubahan");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-muted hover:text-red-500 transition-colors disabled:opacity-50"
      title="Hapus Permintaan Perubahan"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
