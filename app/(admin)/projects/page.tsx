import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDistanceToNow } from "date-fns";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      deliverables: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Projects</h2>
        <Link 
          href="/projects/new" 
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="text-muted mb-4">No active projects found.</p>
          <Link href="/projects/new" className="text-[#06B6D4] hover:underline">Create your first project</Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {projects.map(project => {
            const approvedCount = project.deliverables.filter(d => d.status === "APPROVED").length;
            const totalCount = project.deliverables.length;
            const deadlineWarning = project.deadline && new Date(project.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
            
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-surface border border-border rounded-lg p-5 flex items-center hover:border-[#8B5CF6] hover:-translate-y-1 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden">
                  {/* Status Bar Left */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${project.status === "ACTIVE" ? "bg-[#06B6D4]" : "bg-[#52525B]"}`}></div>
                  
                  <div className="flex-1 ml-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#8B5CF6] transition-colors">{project.name}</h3>
                    <p className="text-sm text-muted">{project.client.name}</p>
                  </div>
                  
                  <div className="w-48">
                    <p className="text-sm text-muted">Progress</p>
                    <p className="text-sm text-white">{approvedCount} / {totalCount} approved</p>
                  </div>
                  
                  <div className="w-48">
                    <p className="text-sm text-muted">Deadline</p>
                    <p className={`text-sm ${deadlineWarning ? "text-[#EF4444]" : "text-white"}`}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}
                    </p>
                  </div>
                  
                  <div className="w-32 text-right">
                    <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
