import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage";
import { sendEmail } from "@/lib/email";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DeliverableDetailPage({
  params,
}: {
  params: { id: string; did: string };
}) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: params.did },
    include: {
      project: true,
      versions: {
        orderBy: { version: "desc" },
      },
    },
  });

  if (!deliverable || deliverable.projectId !== params.id) notFound();

  async function uploadVersion(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    const file = formData.get("file") as File;
    const linkUrl = formData.get("linkUrl") as string;
    const pmNotes = formData.get("pmNotes") as string;

    let fileUrl = null;
    
    // Only upload if a real file is provided (File object with size > 0)
    if (file && file.size > 0) {
      const fileName = `${deliverable!.id}-v${deliverable!.currentVersion + 1}-${file.name}`;
      const { url, error } = await uploadFile(file, "deliverables", fileName);
      if (!error && url) {
        fileUrl = url;
      }
    }

    const newVersionNum = deliverable!.currentVersion + 1;

    // Create the new version
    await prisma.deliverableVersion.create({
      data: {
        deliverableId: deliverable!.id,
        version: newVersionNum,
        fileUrl,
        linkUrl: linkUrl || null,
        pmNotes: pmNotes || null,
        uploadedBy: session?.user?.name || "Admin",
      },
    });

    // Update deliverable status to REVIEW and increment version
    await prisma.deliverable.update({
      where: { id: deliverable!.id },
      data: {
        currentVersion: newVersionNum,
        status: "REVIEW",
      },
    });

    const clientAccess = await prisma.projectAccess.findFirst({
      where: { projectId: deliverable!.projectId },
      include: { user: true }
    });

    // Get portalToken for the project
    const project = await prisma.project.findUnique({
      where: { id: deliverable!.projectId },
      select: { portalToken: true }
    });

    if (clientAccess?.user?.email && project?.portalToken) {
      const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/${project.portalToken}`;
      await sendEmail({
        to: clientAccess.user.email,
        subject: `New Version Uploaded: ${deliverable!.name}`,
        html: `
          <h2>A new version is ready for your review!</h2>
          <p>Project: ${deliverable!.project.name}</p>
          <p>Deliverable: ${deliverable!.name}</p>
          <br/>
          <a href="${portalUrl}" style="padding: 10px 20px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 5px;">Review Deliverable</a>
        `
      });
    }

    revalidatePath(`/projects/${deliverable!.projectId}/deliverables/${deliverable!.id}`);
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted mb-4">
        <Link href="/projects" className="hover:text-white">Projects</Link> &gt;{" "}
        <Link href={`/projects/${deliverable.projectId}`} className="hover:text-white">{deliverable.project.name}</Link> &gt;{" "}
        <span className="text-white">{deliverable.name}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{deliverable.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={deliverable.status.toLowerCase()} />
            <span className="text-muted text-sm">Type: {deliverable.type}</span>
            {deliverable.assignedTo && (
              <span className="text-muted text-sm bg-surface-hover px-2 py-1 rounded-md border border-border">
                Assigned to: <span className="text-white font-medium">{deliverable.assignedTo}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">Version History</h3>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#3F3F46] before:to-transparent">
            {deliverable.versions.length === 0 ? (
              <p className="text-muted">No versions uploaded yet.</p>
            ) : (
              deliverable.versions.map((ver) => (
                <div key={ver.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface text-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    v{ver.version}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-surface">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">Version {ver.version}</p>
                          <p className="text-xs text-muted mb-2">
                            Uploaded by {ver.uploadedBy} on {new Date(ver.uploadedAt).toLocaleString()}
                          </p>
                          
                          <div className="mt-2 space-y-3">
                            {ver.pmNotes && (
                              <p className="text-sm text-[#E2E8F0]">
                                <span className="font-medium text-[#94A3B8]">Notes:</span> {ver.pmNotes}
                              </p>
                            )}
                            
                            {ver.clientFeedback && (
                              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-md p-3 mt-3">
                                <p className="text-sm text-[#991B1B] font-medium mb-1">Client Feedback:</p>
                                <p className="text-sm text-[#7F1D1D] whitespace-pre-wrap">{ver.clientFeedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                    <div className="flex gap-2 mt-4">
                      {ver.fileUrl && (
                        <a href={ver.fileUrl} target="_blank" className="text-xs bg-surface-hover hover:bg-muted text-white px-2 py-1 rounded transition-colors">
                          View File
                        </a>
                      )}
                      {ver.linkUrl && (
                        <a href={ver.linkUrl} target="_blank" className="text-xs bg-surface-hover hover:bg-muted text-white px-2 py-1 rounded transition-colors">
                          Open Link
                        </a>
                      )}
                    </div>

                    {ver.clientFeedback && (
                      <div className={`mt-3 p-2 rounded text-xs ${ver.clientAction === "APPROVED" ? "bg-[#022C22] border border-[#059669]" : "bg-[#450A0A] border border-[#B91C1C]"}`}>
                        <span className="font-bold block mb-1">{ver.clientAction === "APPROVED" ? "Approved" : "Revision Requested"}</span>
                        {ver.clientFeedback}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upload Panel */}
        <div className="col-span-1">
          <div className="bg-surface border border-border rounded-lg p-5 sticky top-6">
            <h3 className="font-bold text-white mb-4">Upload New Version</h3>
            <form action={uploadVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">File Upload</label>
                <input type="file" name="file" className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-surface-hover file:text-foreground hover:file:bg-muted" />
              </div>
              <div className="flex items-center text-xs text-[#71717A] my-2">
                <hr className="flex-1 border-border" />
                <span className="px-2">OR</span>
                <hr className="flex-1 border-border" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">External Link (Figma, Docs, etc)</label>
                <input type="url" name="linkUrl" placeholder="https://" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Notes for Client (Optional)</label>
                <textarea name="pmNotes" rows={2} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors text-sm">
                Upload & Request Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
