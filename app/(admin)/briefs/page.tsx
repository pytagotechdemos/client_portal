import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { FileText, FolderKanban } from "lucide-react";
import { SearchBar } from "@/components/admin/SearchBar";

export default async function BriefsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q || "";

  // Get all briefs grouped by project
  const projects = await prisma.project.findMany({
    where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
    include: {
      briefs: {
        orderBy: { uploadedAt: "desc" }
      },
      client: true
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter projects that have briefs when searching
  const projectsWithBriefs = q
    ? projects.filter(p => p.briefs.length > 0)
    : projects;

  const totalBriefs = projectsWithBriefs.reduce((acc, p) => acc + p.briefs.length, 0);

  return (
    <FadeIn className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Repositori Brief</h2>
            <p className="text-sm text-muted">{totalBriefs} brief dari {projectsWithBriefs.length} proyek</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <SearchBar placeholder="Cari proyek atau brief..." />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        {projectsWithBriefs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted">Tidak ada brief ditemukan.</p>
          </div>
        ) : (
          <div className="min-w-[800px]">
            {projectsWithBriefs.map(project => (
              <div key={project.id} className="border-b border-border last:border-0">
                {/* Project Header */}
                <div className="p-4 bg-surface-light/50">
                  <Link href={`/projects/${project.id}`} className="font-medium text-white hover:text-primary transition-colors">
                    {project.name}
                  </Link>
                  <p className="text-xs text-muted">{project.client.name} • {project.briefs.length} brief</p>
                </div>
                {/* Briefs List */}
                {project.briefs.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {project.briefs.map(brief => (
                      <div key={brief.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-hover/50 transition-colors">
                        <div className="col-span-5">
                          <p className="font-medium text-white">{brief.title}</p>
                          <p className="text-xs text-muted">{brief.category} • {brief.uploadedBy}</p>
                        </div>
                        <div className="col-span-4 text-sm text-muted">
                          {new Date(brief.uploadedAt).toLocaleDateString('id-ID')}
                        </div>
                        <div className="col-span-3 flex justify-end gap-2">
                          <a href={brief.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            Lihat
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted text-sm">
                    Tidak ada brief untuk proyek ini
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
