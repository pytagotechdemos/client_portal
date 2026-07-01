import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { updateChangeRequestStatus } from "@/app/actions/changeRequest";

export default async function ProjectDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { tab?: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      deliverables: {
        orderBy: { createdAt: "asc" }
      },
      briefs: {
        orderBy: { uploadedAt: "desc" }
      },
      changeRequests: {
        orderBy: { createdAt: "desc" }
      },
      invoices: {
        orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!project) notFound();

  async function addDeliverable(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const type = formData.get("type") as any; // DeliverableType
    
    await prisma.deliverable.create({
      data: {
        projectId: project!.id,
        name,
        type,
      }
    });
    revalidatePath(`/projects/${project!.id}`);
  }

  const currentTab = searchParams.tab || "deliverables";

  return (
    <div>
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status} />
          </div>
          <p className="text-muted">Client: {project.client.name} | Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "None"}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface border border-border hover:bg-surface-hover text-white px-4 py-2 rounded-md transition-colors">
            Copy Portal Link
          </button>
          <Link href={`/projects/${project.id}/invoices/new`} className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-md transition-colors">
            Generate Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content: Tabs / Deliverables */}
        <div className="col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <Link href={`/projects/${project.id}?tab=deliverables`} className={`px-4 py-2 ${currentTab === "deliverables" ? "text-white border-b-2 border-[#8B5CF6]" : "text-muted hover:text-white"}`}>Deliverables</Link>
            <Link href={`/projects/${project.id}?tab=briefs`} className={`px-4 py-2 ${currentTab === "briefs" ? "text-white border-b-2 border-[#8B5CF6]" : "text-muted hover:text-white"}`}>Briefs</Link>
            <Link href={`/projects/${project.id}?tab=changes`} className={`px-4 py-2 ${currentTab === "changes" ? "text-white border-b-2 border-[#8B5CF6]" : "text-muted hover:text-white"}`}>Change Requests</Link>
            <Link href={`/projects/${project.id}?tab=invoices`} className={`px-4 py-2 ${currentTab === "invoices" ? "text-white border-b-2 border-[#8B5CF6]" : "text-muted hover:text-white"}`}>Invoices</Link>
          </div>

          {currentTab === "deliverables" && (
            <>
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover/30">
                  <h3 className="font-semibold text-white">Project Deliverables</h3>
                </div>
                
                {project.deliverables.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    No deliverables yet. Create the first one below.
                  </div>
                ) : (
                  <div className="divide-y divide-[#3F3F46]">
                    {project.deliverables.map(del => (
                      <Link href={`/projects/${project.id}/deliverables/${del.id}`} key={del.id} className="block p-4 hover:bg-surface-hover transition-colors group">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <StatusBadge status={del.status.toLowerCase()} />
                            <div>
                              <p className="text-white font-medium group-hover:text-[#8B5CF6] transition-colors">{del.name}</p>
                              <p className="text-xs text-muted mt-1">{del.type} • v{del.currentVersion}</p>
                            </div>
                          </div>
                          <div className="text-sm text-[#06B6D4]">View &rarr;</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Add Deliverable Form */}
              <form action={addDeliverable} className="bg-surface border border-border rounded-lg p-4 flex gap-3">
                <input required name="name" placeholder="New deliverable name (e.g. Logo Final)" className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
                <select name="type" className="bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]">
                  <option value="DESIGN">Design</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="VIDEO">Video</option>
                  <option value="COPY">Copy</option>
                  <option value="OTHER">Other</option>
                </select>
                <button type="submit" className="bg-surface-hover hover:bg-muted border border-border text-white px-4 py-2 rounded-md transition-colors">
                  Add
                </button>
              </form>
            </>
          )}

          {currentTab === "briefs" && (
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover/30">
                <h3 className="font-semibold text-white">Project Briefs</h3>
                <Link href={`/projects/${project.id}/briefs/new`} className="text-sm bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-3 py-1.5 rounded transition-colors">
                  Upload Brief
                </Link>
              </div>
              
              {project.briefs.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  No briefs uploaded yet.
                </div>
              ) : (
                <div className="divide-y divide-[#3F3F46]">
                  {project.briefs.map(brief => (
                    <div key={brief.id} className="p-4 hover:bg-surface-hover transition-colors flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{brief.title}</p>
                        <p className="text-xs text-muted mt-1">{brief.category} • Uploaded by {brief.uploadedBy} on {new Date(brief.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <a href={brief.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#06B6D4] hover:underline">
                        View File &rarr;
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === "changes" && (
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover/30">
                <h3 className="font-semibold text-white">Change Requests (Scope Creep)</h3>
              </div>
              
              {project.changeRequests.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  No change requests logged.
                </div>
              ) : (
                <div className="divide-y divide-[#3F3F46]">
                  {project.changeRequests.map(cr => (
                    <div key={cr.id} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <StatusBadge status={cr.status.toLowerCase()} />
                          <p className="text-white mt-2">{cr.description}</p>
                          <p className="text-xs text-muted mt-1">Requested by {cr.requestedBy} on {new Date(cr.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {cr.responseNote && (
                        <div className="bg-background rounded p-3 border border-[#3F3F46]">
                          <p className="text-sm text-white"><span className="text-muted font-medium">PM Note:</span> {cr.responseNote}</p>
                        </div>
                      )}

                      {cr.status === "PENDING" && (
                        <form action={updateChangeRequestStatus} className="flex gap-2 mt-2">
                          <input type="hidden" name="changeRequestId" value={cr.id} />
                          <input type="hidden" name="projectId" value={project.id} />
                          <input type="hidden" name="respondedBy" value="Admin" />
                          <input 
                            name="responseNote" 
                            className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]" 
                            placeholder="Reason / Note (optional)"
                          />
                          <select name="status" className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]">
                            <option value="ACCEPTED">Accept</option>
                            <option value="REJECTED">Reject</option>
                            <option value="DISCUSSED">Need Discussion</option>
                          </select>
                          <button type="submit" className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm px-3 py-1.5 rounded-md transition-colors">
                            Update
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentTab === "invoices" && (
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover/30">
                <h3 className="font-semibold text-white">Invoices</h3>
              </div>
              
              {project.invoices.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  No invoices generated yet.
                </div>
              ) : (
                <div className="divide-y divide-[#3F3F46]">
                  {project.invoices.map(inv => (
                    <div key={inv.id} className="p-4 flex justify-between items-center hover:bg-surface-hover transition-colors">
                      <div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={inv.status.toLowerCase()} />
                          <p className="text-white font-medium">{inv.invoiceNumber}</p>
                        </div>
                        <p className="text-xs text-muted mt-1">Issued: {new Date(inv.issueDate).toLocaleDateString()} • Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#10B981]">${Number(inv.totalAmount).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Client Contact</h3>
            <div className="space-y-3">
              <div>
                <p className="text-white font-medium">{project.client.contactName}</p>
                <p className="text-sm text-muted">{project.client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Email</p>
                <a href={`mailto:${project.client.contactEmail}`} className="text-sm text-[#06B6D4] hover:underline">{project.client.contactEmail}</a>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Project Portal</h3>
            <p className="text-sm text-muted mb-3">Client can access this project via:</p>
            <div className="bg-background p-2 rounded border border-border text-xs text-[#06B6D4] font-mono break-all">
              {`/portal/${project.portalToken}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
