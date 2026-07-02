import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { FilePreview } from "@/components/client/FilePreview";
import { submitReview } from "@/app/actions/review";
import { ReviewSubmitButtons } from "@/components/client/ReviewSubmitButtons";

export default async function ClientReviewPage({
  params,
}: {
  params: { projectToken: string; did: string };
}) {
  const project = await prisma.project.findUnique({
    where: { portalToken: params.projectToken },
    include: { client: true },
  });

  if (!project) notFound();

  const deliverable = await prisma.deliverable.findUnique({
    where: { id: params.did },
    include: {
      versions: {
        orderBy: { version: "desc" },
      },
    },
  });

  if (!deliverable || deliverable.projectId !== project.id) notFound();

  const latestVersion = deliverable.versions[0];
  const isPendingReview = deliverable.status === "REVIEW";

  return (
    <div>
      <div className="mb-4 text-sm text-[#64748B]">
        <Link href={`/portal/${params.projectToken}`} className="hover:text-[#7C3AED]">Dashboard</Link>
        {" > "}
        <span className="text-foreground font-medium">{deliverable.name}</span>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{deliverable.name}</h2>
          <p className="text-sm text-[#64748B]">Versi {deliverable.currentVersion}</p>
        </div>
        <StatusBadge status={deliverable.status.toLowerCase()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Area */}
        <div className="lg:col-span-2">
          {latestVersion ? (
            <div className="bg-white p-5 md:p-6 rounded-xl border border-[#E2E8F0] shadow-md mb-6">
              <FilePreview fileUrl={latestVersion.fileUrl} linkUrl={latestVersion.linkUrl} title={deliverable.name} />
              
              {latestVersion.pmNotes && (
                <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#64748B] uppercase mb-1">Catatan dari Tim</p>
                  <p className="text-sm text-foreground">{latestVersion.pmNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] shadow-md text-center text-[#64748B]">
              Belum ada file yang diunggah.
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Review Form */}
          {isPendingReview && latestVersion && (
            <div className="bg-white p-5 md:p-6 rounded-xl border-2 border-[#7C3AED] shadow-md sticky top-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Tinjauan Anda</h3>
              
              <form action={submitReview} className="space-y-4">
                <input type="hidden" name="deliverableId" value={deliverable.id} />
                <input type="hidden" name="versionId" value={latestVersion.id} />
                <input type="hidden" name="portalToken" value={params.projectToken} />
                
                <ReviewSubmitButtons />
              </form>
            </div>
          )}

          {/* Revision History */}
          <div className="bg-white p-5 md:p-6 rounded-xl border border-[#E2E8F0] shadow-md">
            <h3 className="font-bold text-foreground mb-4">Riwayat Revisi</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E2E8F0] before:to-transparent">
              {deliverable.versions.map((ver) => (
                <div key={ver.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#E2E8F0] bg-white text-[#64748B] text-xs font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                    {ver.version}
                  </div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] py-2">
                    <p className="text-sm font-bold text-foreground">v{ver.version}</p>
                    <p className="text-xs text-[#64748B]">{new Date(ver.uploadedAt).toLocaleDateString('id-ID')}</p>
                    {ver.clientAction && (
                      <p className={`mt-1 text-xs font-medium ${ver.clientAction === 'APPROVED' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {ver.clientAction === 'APPROVED' ? 'Disetujui' : 'Revisi Diminta'}
                      </p>
                    )}
                    {ver.clientFeedback && (
                      <div className="mt-2 bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
                        <p className="text-xs font-medium text-[#64748B] mb-1">Catatan Anda:</p>
                        <p className="text-xs text-foreground">{ver.clientFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
