"use client";

import { Trash2 } from "lucide-react";
import { deleteBrief } from "@/app/actions/brief";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteBriefButton({ id, projectId, portalToken }: { id: string, projectId: string, portalToken?: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin menghapus brief ini?")) {
      setIsDeleting(true);
      try {
        await deleteBrief(id, projectId, portalToken);
        toast.success("Brief berhasil dihapus");
      } catch {
        toast.error("Gagal menghapus brief");
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
      title="Hapus Brief"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
