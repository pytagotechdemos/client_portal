import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { FilePreview } from "@/components/client/FilePreview";
import { submitReview } from "@/app/actions/review";

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
          <p className="text-sm text-[#64748B]">Version {deliverable.currentVersion}</p>
        </div>
        <StatusBadge status={deliverable.status.toLowerCase()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Area */}
        <div className="lg:col-span-2">
          {latestVersion ? (
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm mb-6">
              <FilePreview fileUrl={latestVersion.fileUrl} linkUrl={latestVersion.linkUrl} />
              
              {latestVersion.pmNotes && (
                <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#64748B] uppercase mb-1">Notes from Team</p>
                  <p className="text-sm text-foreground">{latestVersion.pmNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] text-center text-[#64748B]">
              No files have been uploaded yet.
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Review Form */}
          {isPendingReview && latestVersion && (
            <div className="bg-white p-6 rounded-xl border-2 border-[#7C3AED] shadow-md sticky top-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Your Review</h3>
              
              <form action={submitReview} className="space-y-4">
                <input type="hidden" name="deliverableId" value={deliverable.id} />
                <input type="hidden" name="versionId" value={latestVersion.id} />
                <input type="hidden" name="portalToken" value={params.projectToken} />
                
                <button 
                  type="submit" 
                  name="action" 
                  value="APPROVED" 
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-lg font-bold shadow transition-colors flex justify-center items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Approve Deliverable
                </button>

                <button 
                  type="submit" 
                  name="action" 
                  value="APPROVED_WITH_TWEAKS" 
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-2 rounded-lg font-bold shadow transition-colors flex justify-center items-center gap-2"
                >
                  Approve (with minor tweaks)
                </button>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-[#64748B]">OR</span></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Feedback or Revision Notes</label>
                  <textarea 
                    name="feedback" 
                    rows={4} 
                    placeholder="Please specify what needs to be changed..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  name="action" 
                  value="REVISION_REQUESTED" 
                  className="w-full bg-white border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] py-2 rounded-lg font-medium transition-colors"
                >
                  Submit Revision Request
                </button>
              </form>
            </div>
          )}

          {/* Revision History */}
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="font-bold text-foreground mb-4">Revision History</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E2E8F0] before:to-transparent">
              {deliverable.versions.map((ver) => (
                <div key={ver.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#E2E8F0] bg-white text-[#64748B] text-xs font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {ver.version}
                  </div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] py-2">
                    <p className="text-sm font-bold text-foreground">v{ver.version}</p>
                    <p className="text-xs text-[#64748B]">{new Date(ver.uploadedAt).toLocaleDateString()}</p>
                    {ver.clientAction && (
                      <p className={`mt-1 text-xs font-medium ${ver.clientAction === 'APPROVED' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {ver.clientAction === 'APPROVED' ? 'Approved' : 'Revision Requested'}
                      </p>
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
