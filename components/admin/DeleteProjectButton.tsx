"use client";

import { deleteProject } from "@/app/actions/project";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteProjectButton({ id, projectName }: { id: string, projectName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`)) {
      startTransition(() => {
        deleteProject(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 h-10 rounded-md transition-colors text-sm font-medium flex items-center justify-center whitespace-nowrap"
      title="Delete Project"
    >
      <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</span>
    </button>
  );
}
