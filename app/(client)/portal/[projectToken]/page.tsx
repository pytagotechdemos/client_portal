import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";

export default async function ClientPortalDashboard({ params }: { params: { projectToken: string } }) {
  const project = await prisma.project.findUnique({
    where: { portalToken: params.projectToken },
    include: {
      client: true,
      deliverables: true,
    },
  });

  if (!project) notFound();

  const approvedCount = project.deliverables.filter((d) => d.status === "APPROVED").length;
  const totalCount = project.deliverables.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((approvedCount / totalCount) * 100);

  const needsReview = project.deliverables.filter((d) => d.status === "REVIEW");
  const others = project.deliverables.filter((d) => d.status !== "REVIEW");

  return (
    <div>
      {/* Hero Card */}
      <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] shadow-sm mb-8">
        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">{project.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-[#64748B] mb-1">Status</p>
            <StatusBadge status={project.status.toLowerCase()} />
          </div>
          <div>
            <p className="text-sm text-[#64748B] mb-1">Deadline</p>
            <p className="font-medium text-[#0F172A]">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "TBD"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-[#64748B] mb-1">Progress: {approvedCount} of {totalCount} approved</p>
            <div className="w-full bg-[#E2E8F0] rounded-full h-2.5 mt-2">
              <div className="bg-[#10B981] h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Needs Review Section */}
      {needsReview.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] animate-pulse"></span>
            Awaiting Your Review
          </h3>
          <div className="grid gap-4">
            {needsReview.map((del) => (
              <div key={del.id} className="bg-white border-2 border-[#FCD34D] rounded-lg p-6 flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="text-lg font-bold text-[#0F172A]">{del.name}</h4>
                  <p className="text-sm text-[#64748B] mt-1">v{del.currentVersion} is ready for your feedback.</p>
                </div>
                <Link 
                  href={`/portal/${project.portalToken}/deliverable/${del.id}`}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Review Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Deliverables Section */}
      <div>
        <h3 className="text-xl font-bold text-[#0F172A] mb-4">All Deliverables</h3>
        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
          {project.deliverables.length === 0 ? (
            <div className="p-8 text-center text-[#64748B]">
              No deliverables have been added yet.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {others.map((del) => (
                <div key={del.id} className="p-4 flex justify-between items-center hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-4">
                    <StatusBadge status={del.status.toLowerCase()} />
                    <div>
                      <p className="font-medium text-[#0F172A]">{del.name}</p>
                      <p className="text-xs text-[#64748B]">Type: {del.type}</p>
                    </div>
                  </div>
                  {del.status !== "NOT_STARTED" && (
                    <Link 
                      href={`/portal/${project.portalToken}/deliverable/${del.id}`}
                      className="text-sm text-[#7C3AED] hover:underline font-medium"
                    >
                      View Details &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
