import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { createBrief } from "@/app/actions/brief";
import { createChangeRequest } from "@/app/actions/changeRequest";
import { CommentSection } from "@/components/shared/CommentSection";

export default async function ClientPortalDashboard({ params, searchParams }: { params: { projectToken: string }, searchParams: { tab?: string } }) {
  const project = await prisma.project.findUnique({
    where: { portalToken: params.projectToken },
    include: {
      client: true,
      deliverables: true,
      briefs: {
        orderBy: { uploadedAt: "desc" }
      },
      changeRequests: {
        orderBy: { createdAt: "desc" }
      },
      invoices: {
        orderBy: { createdAt: "desc" }
      },
      comments: {
        orderBy: { createdAt: "asc" }
      }
    },
  });

  if (!project) notFound();

  const approvedCount = project.deliverables.filter((d) => d.status === "APPROVED").length;
  const totalCount = project.deliverables.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((approvedCount / totalCount) * 100);

  const needsReview = project.deliverables.filter((d) => d.status === "REVIEW");
  const others = project.deliverables.filter((d) => d.status !== "REVIEW");

  const currentTab = searchParams.tab || "deliverables";

  async function handleCreateBrief(formData: FormData) {
    "use server";
    await createBrief(formData);
  }

  async function handleCreateCR(formData: FormData) {
    "use server";
    await createChangeRequest(formData);
  }

  return (
    <div>
      {/* Hero Card */}
      <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] shadow-sm mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">{project.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-[#64748B] mb-1">Status</p>
            <StatusBadge status={project.status.toLowerCase()} />
          </div>
          <div>
            <p className="text-sm text-[#64748B] mb-1">Deadline</p>
            <p className="font-medium text-foreground">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "TBD"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-[#64748B] mb-1">Progress: {approvedCount} of {totalCount} approved</p>
            <div className="w-full bg-[#E2E8F0] rounded-full h-2.5 mt-2">
              <div className="bg-[#10B981] h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] mb-8 overflow-x-auto whitespace-nowrap">
        <Link href={`/portal/${project.portalToken}?tab=deliverables`} className={`px-6 py-3 font-medium ${currentTab === "deliverables" ? "text-primary-hover border-b-2 border-primary-hover" : "text-[#64748B] hover:text-foreground"}`}>Deliverables</Link>
        <Link href={`/portal/${project.portalToken}?tab=briefs`} className={`px-6 py-3 font-medium ${currentTab === "briefs" ? "text-primary-hover border-b-2 border-primary-hover" : "text-[#64748B] hover:text-foreground"}`}>Briefs & Assets</Link>
        <Link href={`/portal/${project.portalToken}?tab=changes`} className={`px-6 py-3 font-medium ${currentTab === "changes" ? "text-primary-hover border-b-2 border-primary-hover" : "text-[#64748B] hover:text-foreground"}`}>Change Requests</Link>
        <Link href={`/portal/${project.portalToken}?tab=invoices`} className={`px-6 py-3 font-medium ${currentTab === "invoices" ? "text-primary-hover border-b-2 border-primary-hover" : "text-[#64748B] hover:text-foreground"}`}>Invoices</Link>
        <Link href={`/portal/${project.portalToken}?tab=discussion`} className={`px-6 py-3 font-medium ${currentTab === "discussion" ? "text-primary-hover border-b-2 border-primary-hover" : "text-[#64748B] hover:text-foreground"}`}>Discussion</Link>
      </div>

      {currentTab === "discussion" && (
        <div className="max-w-3xl">
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-6">Project Discussion</h3>
            <CommentSection 
              projectId={project.id} 
              comments={project.comments} 
              currentUser={{ name: project.client.contactName, role: "CLIENT" }} 
              theme="light"
            />
          </div>
        </div>
      )}

      {currentTab === "deliverables" && (
        <>
          {/* Needs Review Section */}
          {needsReview.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                Awaiting Your Review
              </h3>
              <div className="grid gap-4">
                {needsReview.map((del) => (
                  <div key={del.id} className="bg-white border-2 border-[#FCD34D] rounded-lg p-6 flex justify-between items-center shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{del.name}</h4>
                      <p className="text-sm text-[#64748B] mt-1">v{del.currentVersion} is ready for your feedback.</p>
                    </div>
                    <Link 
                      href={`/portal/${project.portalToken}/deliverable/${del.id}`}
                      className="bg-primary-hover hover:bg-[#6D28D9] text-white px-6 py-2 rounded-md font-medium transition-colors"
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
            <h3 className="text-xl font-bold text-foreground mb-4">All Deliverables</h3>
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              {project.deliverables.length === 0 ? (
                <div className="p-8 text-center text-[#64748B]">
                  No deliverables have been added yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {others.map((del) => (
                    <div key={del.id} className="p-4 flex justify-between items-center hover:bg-[#F8FAFC] hover:-translate-y-0.5 hover:shadow-sm transition-all relative">
                      <div className="flex items-center gap-4">
                        <StatusBadge status={del.status.toLowerCase()} />
                        <div>
                          <p className="font-medium text-foreground">{del.name}</p>
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
        </>
      )}

      {currentTab === "briefs" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-foreground mb-4">Project Briefs</h3>
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              {project.briefs.length === 0 ? (
                <div className="p-8 text-center text-[#64748B]">
                  No briefs or reference documents uploaded yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {project.briefs.map(brief => (
                    <div key={brief.id} className="p-4 flex justify-between items-center hover:bg-[#F8FAFC] hover:-translate-y-0.5 hover:shadow-sm transition-all relative">
                      <div>
                        <p className="font-medium text-foreground">{brief.title}</p>
                        <p className="text-xs text-[#64748B]">
                          {brief.category} • Uploaded by {brief.uploadedBy} on {new Date(brief.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a href={brief.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7C3AED] hover:underline font-medium">
                        View &rarr;
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-foreground mb-4">Upload Asset</h3>
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
              <form action={handleCreateBrief} className="space-y-4">
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="portalToken" value={project.portalToken} />
                <input type="hidden" name="uploadedBy" value={project.client.contactName} />
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                  <input required name="title" className="w-full bg-white border border-[#E2E8F0] rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary-hover" placeholder="e.g. Logo Reference" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select required name="category" className="w-full bg-white border border-[#E2E8F0] rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary-hover">
                    <option value="Visual Brief">Visual Reference</option>
                    <option value="Copy Brief">Text/Copy Asset</option>
                    <option value="Brand Guideline">Brand Guideline</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Link URL</label>
                  <input required type="url" name="fileUrl" className="w-full bg-white border border-[#E2E8F0] rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary-hover" placeholder="https://..." />
                </div>
                
                <button type="submit" className="w-full bg-primary-hover hover:bg-[#6D28D9] text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Upload Asset
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {currentTab === "changes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-foreground mb-4">Change Requests</h3>
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              {project.changeRequests.length === 0 ? (
                <div className="p-8 text-center text-[#64748B]">
                  No change requests submitted.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {project.changeRequests.map(cr => (
                    <div key={cr.id} className="p-6 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <StatusBadge status={cr.status.toLowerCase()} />
                          <p className="text-foreground mt-2">{cr.description}</p>
                          <p className="text-xs text-[#64748B] mt-1">Submitted on {new Date(cr.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {cr.responseNote && (
                        <div className="bg-[#F8FAFC] rounded p-4 border border-[#E2E8F0] mt-2">
                          <p className="text-sm text-foreground"><span className="text-[#64748B] font-medium">Agency Note:</span> {cr.responseNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-foreground mb-4">New Request</h3>
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
              <p className="text-sm text-[#64748B] mb-4">Submit a request for work outside the original scope. We will review and discuss it with you.</p>
              <form action={handleCreateCR} className="space-y-4">
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="portalToken" value={project.portalToken} />
                <input type="hidden" name="requestedBy" value={project.client.contactName} />
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea 
                    required 
                    name="description" 
                    rows={4}
                    className="w-full bg-white border border-[#E2E8F0] rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary-hover" 
                    placeholder="Describe the new requirement..." 
                  />
                </div>
                
                <button type="submit" className="w-full bg-primary-hover hover:bg-[#6D28D9] text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {currentTab === "invoices" && (
        <div className="max-w-3xl">
          <h3 className="text-xl font-bold text-foreground mb-4">Invoices & Billing</h3>
          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
            {project.invoices.length === 0 ? (
              <div className="p-8 text-center text-[#64748B]">
                No invoices found for this project.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {project.invoices.map(invoice => (
                  <div key={invoice.id} className="p-5 flex justify-between items-center hover:bg-[#F8FAFC] transition-colors">
                    <div>
                      <p className="font-bold text-foreground text-lg">{invoice.title}</p>
                      <p className="text-sm text-[#64748B] mt-1">
                        Issued on {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-foreground">${invoice.amount.toFixed(2)}</p>
                        <p className={`text-xs font-medium uppercase mt-1 ${invoice.status === 'PAID' ? 'text-[#10B981]' : invoice.status === 'OVERDUE' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                          {invoice.status}
                        </p>
                      </div>
                      <Link 
                        href={`/portal/${project.portalToken}/invoice/${invoice.id}`}
                        className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-foreground font-medium px-4 py-2 rounded-md shadow-sm transition-colors text-sm"
                      >
                        View Invoice
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
