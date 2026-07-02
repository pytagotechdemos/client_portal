import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { GitPullRequest, Clock, CheckCircle } from "lucide-react";

export default async function ChangeRequestsPage() {
  const changeRequests = await prisma.changeRequest.findMany({
    include: {
      project: {
        include: { client: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = changeRequests.filter(cr => cr.status === "PENDING").length;
  const resolvedCount = changeRequests.filter(cr => cr.status !== "PENDING").length;

  return (
    <FadeIn className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <GitPullRequest className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Permintaan Perubahan</h2>
            <p className="text-sm text-muted">{changeRequests.length} total permintaan</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-amber-500">
              <Clock className="w-4 h-4" /> {pendingCount} Tertunda
            </span>
            <span className="text-muted">|</span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle className="w-4 h-4" /> {resolvedCount} Selesai
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {changeRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
              <GitPullRequest className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted">Tidak ada permintaan perubahan.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border bg-surface-light/50 grid grid-cols-12 gap-4">
              <div className="col-span-5 font-semibold text-sm text-muted">Permintaan</div>
              <div className="col-span-4 font-semibold text-sm text-muted">Proyek</div>
              <div className="col-span-3 font-semibold text-sm text-muted text-center">Status</div>
            </div>
            <div className="divide-y divide-border/50">
              {changeRequests.map(cr => (
                <div key={cr.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-hover/50 transition-colors group">
                  <div className="col-span-5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${cr.status === "PENDING" ? "bg-amber-500" : "bg-emerald-500"}`}></div>
                      <p className="font-medium text-white text-sm">Dari {cr.requestedBy}</p>
                    </div>
                    <p className="text-xs text-muted line-clamp-1 ml-4">{cr.description}</p>
                  </div>
                  <div className="col-span-4">
                    <Link href={`/projects/${cr.projectId}`} className="text-sm text-primary hover:text-primary-hover">
                      {cr.project.name}
                    </Link>
                    <p className="text-xs text-muted">{cr.project.client.name}</p>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      cr.status === "PENDING"
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {cr.status === "PENDING" ? (
                        <Clock className="w-3 h-3 mr-1" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {cr.status === "PENDING" ? 'Tertunda' : 'Selesai'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </FadeIn>
  );
}
