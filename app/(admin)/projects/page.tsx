import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FadeIn } from "@/components/shared/FadeIn";
import { Plus, FolderKanban, ArrowRight, Calendar, CheckCircle } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      deliverables: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <FadeIn className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Proyek</h2>
            <p className="text-sm text-muted">{projects.length} total proyek</p>
          </div>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          <Plus className="w-4 h-4" /> Proyek Baru
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-muted" />
          </div>
          <p className="text-muted mb-4">Belum ada proyek.</p>
          <Link href="/projects/new" className="text-primary hover:text-primary-hover font-medium">
            Buat proyek pertama Anda
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => {
            const approvedCount = project.deliverables.filter(d => d.status === "APPROVED").length;
            const totalCount = project.deliverables.length;
            const progressPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
            const deadlineWarning = project.deadline && new Date(project.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${project.status === "ACTIVE" ? "bg-emerald-500" : "bg-zinc-500"}`}></div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{project.name}</h3>
                        <p className="text-sm text-muted">{project.client.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-sm text-muted mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Progres</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-white">{progressPercent}%</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-2 text-sm text-muted mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>Tenggat Waktu</span>
                        </div>
                        <p className={`text-sm font-medium ${deadlineWarning ? "text-red-400" : "text-white"}`}>
                          {project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID') : "Tanpa Tenggat Waktu"}
                        </p>
                      </div>

                      <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status === "ACTIVE" ? "Aktif" : project.status === "COMPLETED" ? "Selesai" : project.status === "ON_HOLD" ? "Ditunda" : "Dibatalkan"} />

                      <ArrowRight className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </FadeIn>
  );
}
