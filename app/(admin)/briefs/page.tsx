import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FadeIn } from "@/components/shared/FadeIn";
import { FileText, FolderKanban } from "lucide-react";

export default async function BriefsPage() {
  const projects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <FadeIn className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Repositori Brief</h2>
            <p className="text-sm text-muted">{projects.length} proyek dengan brief</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted">Tidak ada proyek ditemukan. Buat proyek untuk menambahkan brief.</p>
          </div>
        ) : (
          <div className="min-w-[800px]">
            <div className="p-4 border-b border-border bg-surface-light/50 grid grid-cols-12 gap-4">
              <div className="col-span-5 font-semibold text-sm text-muted">Proyek</div>
              <div className="col-span-4 font-semibold text-sm text-muted">Klien</div>
              <div className="col-span-3 font-semibold text-sm text-muted text-right">Status</div>
            </div>
            <div className="divide-y divide-border/50">
              {projects.map(project => (
                <div key={project.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-hover/50 transition-colors group">
                  <div className="col-span-5">
                    <Link href={`/projects/${project.id}`} className="font-medium text-white hover:text-primary group-hover:text-primary transition-colors">
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">{project.description}</p>
                    )}
                  </div>
                  <div className="col-span-4 text-sm text-muted">{project.client.name}</div>
                  <div className="col-span-3 flex justify-end">
                    <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status === "ACTIVE" ? "Aktif" : project.status === "COMPLETED" ? "Selesai" : project.status === "ON_HOLD" ? "Tertunda" : "Dibatalkan"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
