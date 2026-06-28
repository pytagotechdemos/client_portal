import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage";

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
        uploadedBy: "Admin", // TODO: Get from NextAuth session
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

    revalidatePath(`/projects/${deliverable!.projectId}/deliverables/${deliverable!.id}`);
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumbs */}
      <div className="text-sm text-[#A1A1AA] mb-4">
        <Link href="/projects" className="hover:text-white">Projects</Link> &gt;{" "}
        <Link href={`/projects/${deliverable.projectId}`} className="hover:text-white">{deliverable.project.name}</Link> &gt;{" "}
        <span className="text-white">{deliverable.name}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{deliverable.name}</h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={deliverable.status.toLowerCase()} />
            <span className="text-[#A1A1AA] text-sm">Type: {deliverable.type}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">Version History</h3>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#3F3F46] before:to-transparent">
            {deliverable.versions.length === 0 ? (
              <p className="text-[#A1A1AA]">No versions uploaded yet.</p>
            ) : (
              deliverable.versions.map((ver) => (
                <div key={ver.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    v{ver.version}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-[#3F3F46] bg-[#18181B]">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-white">Version {ver.version}</span>
                      <span className="text-xs text-[#A1A1AA]">{new Date(ver.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    {ver.pmNotes && <p className="text-sm text-[#A1A1AA] mb-3">PM Note: {ver.pmNotes}</p>}
                    
                    <div className="flex gap-2">
                      {ver.fileUrl && (
                        <a href={ver.fileUrl} target="_blank" className="text-xs bg-[#27272A] hover:bg-[#3F3F46] text-white px-2 py-1 rounded transition-colors">
                          View File
                        </a>
                      )}
                      {ver.linkUrl && (
                        <a href={ver.linkUrl} target="_blank" className="text-xs bg-[#27272A] hover:bg-[#3F3F46] text-white px-2 py-1 rounded transition-colors">
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
          <div className="bg-[#18181B] border border-[#3F3F46] rounded-lg p-5 sticky top-6">
            <h3 className="font-bold text-white mb-4">Upload New Version</h3>
            <form action={uploadVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">File Upload</label>
                <input type="file" name="file" className="w-full text-sm text-[#A1A1AA] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#27272A] file:text-white hover:file:bg-[#3F3F46]" />
              </div>
              <div className="flex items-center text-xs text-[#71717A] my-2">
                <hr className="flex-1 border-[#3F3F46]" />
                <span className="px-2">OR</span>
                <hr className="flex-1 border-[#3F3F46]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">External Link (Figma, Docs, etc)</label>
                <input type="url" name="linkUrl" placeholder="https://" className="w-full bg-[#0F0F11] border border-[#3F3F46] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8B5CF6]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Notes for Client (Optional)</label>
                <textarea name="pmNotes" rows={2} className="w-full bg-[#0F0F11] border border-[#3F3F46] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8B5CF6]"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-md font-medium transition-colors text-sm">
                Upload & Request Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
