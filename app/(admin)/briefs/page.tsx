import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function BriefsPage() {
  const projects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Brief Repository</h2>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-hover/30 flex gap-4">
          <div className="flex-1 font-semibold text-white">Project</div>
          <div className="w-64 font-semibold text-white">Client</div>
          <div className="w-32 font-semibold text-white text-right">Status</div>
        </div>
        <div className="divide-y divide-[#3F3F46]">
          {projects.map(project => (
            <div key={project.id} className="p-4 flex gap-4 items-center hover:bg-surface-hover transition-colors">
              <div className="flex-1">
                <Link href={`/projects/${project.id}`} className="font-medium text-white hover:text-[#8B5CF6]">
                  {project.name}
                </Link>
                {project.description && (
                  <p className="text-sm text-muted mt-1 line-clamp-1">{project.description}</p>
                )}
              </div>
              <div className="w-64 text-sm text-muted">{project.client.name}</div>
              <div className="w-32 text-right">
                <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status} />
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="p-8 text-center text-muted">No projects found. Create a project to add briefs.</div>
          )}
        </div>
      </div>
    </div>
  );
}
