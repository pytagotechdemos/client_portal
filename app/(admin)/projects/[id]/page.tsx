import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { updateChangeRequestStatus } from "@/app/actions/changeRequest";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { DeleteDeliverableButton } from "@/components/admin/DeleteDeliverableButton";
import { DeleteInvoiceButton } from "@/components/admin/DeleteInvoiceButton";
import { DeleteChangeRequestButton } from "@/components/admin/DeleteChangeRequestButton";
import { CommentSection } from "@/components/shared/CommentSection";
import { CopyPortalLink } from "@/components/admin/CopyPortalLink";
import { DeleteBriefButton } from "@/components/admin/DeleteBriefButton";
import { ArrowLeft, Edit, Box, FileText, GitPullRequest, Receipt } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/components";
import NewDeliverableEmail from "@/emails/NewDeliverableEmail";

export default async function ProjectDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { tab?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) notFound();

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
      },
      comments: {
        orderBy: { createdAt: "asc" }
      }
    },
  });

  const adminUsers = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true }
  });

  if (!project) notFound();

  async function addDeliverable(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const type = formData.get("type") as "DESIGN" | "DOCUMENT" | "VIDEO" | "COPY" | "OTHER"; // DeliverableType
    const assignedTo = formData.get("assignedTo") as string;
    
    await prisma.deliverable.create({
      data: {
        projectId: project!.id,
        name,
        type,
        assignedTo: assignedTo || null,
      }
    });

    const settings = await prisma.agencySettings.findFirst();
    const portalUrl = `${process.env.NEXTAUTH_URL}/portal/${project!.portalToken}`;

    const html = await render(
      <NewDeliverableEmail 
        clientName={project!.client.contactName}
        projectName={project!.name}
        deliverableName={name}
        portalUrl={portalUrl}
        agencyName={settings?.agencyName || "Pytagotech"}
      />
    );

    try {
      await sendEmail({
        to: project!.client.contactEmail,
        subject: `New Deliverable Ready: ${name}`,
        html,
      });
    } catch (error) {
      console.error("Failed to send email", error);
    }

    revalidatePath(`/projects/${project!.id}`);
  }

  const currentTab = searchParams.tab || "deliverables";

  return (
    <div>
      {/* Top Bar */}
      <div className="mb-4">
        <Link href="/projects" className="inline-flex items-center text-sm text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status} />
          </div>
          <p className="text-muted">Klien: {project.client.name} | Tenggat Waktu: {project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID') : "Belum ditentukan"}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <CopyPortalLink portalPath={`/portal/${project.portalToken}`} />
          <Link href={`/projects/${project.id}/edit`} className="bg-surface-hover hover:bg-muted text-white px-4 h-10 rounded-md transition-colors text-sm font-medium border border-border flex items-center justify-center whitespace-nowrap">
            Edit Proyek
          </Link>
          <Link href={`/projects/${project.id}/invoices/new`} className="bg-[#10B981] hover:bg-[#059669] text-white px-4 h-10 rounded-md transition-colors text-sm font-medium flex items-center justify-center whitespace-nowrap">
            Buat Tagihan
          </Link>
          <DeleteProjectButton id={project.id} projectName={project.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Tabs / Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-border mb-6 overflow-x-auto">
            <Link href={`/projects/${project.id}?tab=deliverables`} className={`px-4 py-2 whitespace-nowrap ${currentTab === "deliverables" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"}`}>Hasil Pekerjaan</Link>
            <Link href={`/projects/${project.id}?tab=briefs`} className={`px-4 py-2 whitespace-nowrap ${currentTab === "briefs" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"}`}>Brief</Link>
            <Link href={`/projects/${project.id}?tab=changes`} className={`px-4 py-2 whitespace-nowrap ${currentTab === "changes" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"}`}>Permintaan Perubahan</Link>
            <Link href={`/projects/${project.id}?tab=invoices`} className={`px-4 py-2 whitespace-nowrap ${currentTab === "invoices" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"}`}>Tagihan</Link>
            <Link href={`/projects/${project.id}?tab=discussion`} className={`px-4 py-2 whitespace-nowrap ${currentTab === "discussion" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"}`}>Diskusi</Link>
          </div>

          {currentTab === "discussion" && (
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-white mb-6">Diskusi Proyek</h3>
              <CommentSection 
                projectId={project.id} 
                comments={project.comments} 
                currentUser={{ name: session.user.name || "Admin", role: "ADMIN" }} 
                theme="dark"
              />
            </div>
          )}

          {currentTab === "deliverables" && (
            <>
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-hover/30 gap-4">
                  <h3 className="font-semibold text-white">Hasil Pekerjaan Proyek</h3>
                </div>
                
                <div className="p-4 border-b border-border bg-background/50">
                  <form action={addDeliverable} className="flex flex-col md:flex-row gap-3">
                    <input data-testid="add-deliverable-name" required name="name" placeholder="Nama pekerjaan (misal: Desain Logo)" className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    <select data-testid="add-deliverable-type" name="type" className="bg-surface border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary md:w-32">
                      <option value="DESIGN">Desain</option>
                      <option value="DOCUMENT">Dokumen</option>
                      <option value="VIDEO">Video</option>
                      <option value="COPY">Teks</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                    <select data-testid="add-deliverable-assigned" name="assignedTo" className="bg-surface border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary md:w-40">
                      <option value="">Belum Ditugaskan</option>
                      {adminUsers.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                    <button data-testid="add-deliverable-button" type="submit" className="bg-primary hover:bg-primary-hover border border-border text-white px-4 h-10 rounded-md transition-colors text-sm font-medium whitespace-nowrap">
                      Tambah
                    </button>
                  </form>
                </div>
                
                {project.deliverables.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                    <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                      <Box className="w-6 h-6 text-muted" />
                    </div>
                    Belum ada hasil pekerjaan. Buat yang pertama di atas.
                  </div>
                ) : (
                  <div className="divide-y divide-[#3F3F46]">
                    {project.deliverables.map(del => (
                      <Link href={`/projects/${project.id}/deliverables/${del.id}`} key={del.id} className="block p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-md transition-all relative group">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <StatusBadge status={del.status.toLowerCase()} />
                            <div>
                              <p className="text-white font-medium group-hover:text-primary transition-colors">{del.name}</p>
                              <p className="text-xs text-muted mt-1">{del.type} • v{del.currentVersion}{del.assignedTo ? ` • Ditugaskan ke: ${del.assignedTo}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Link href={`/projects/${project.id}/deliverables/${del.id}/edit`} className="text-muted hover:text-white transition-colors" title="Edit Deliverable">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <Link href={`/projects/${project.id}/deliverables/${del.id}`} className="text-sm text-[#06B6D4] hover:underline">Lihat &rarr;</Link>
                            <div className="z-10 relative">
                              <DeleteDeliverableButton id={del.id} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>


            </>
          )}

          {currentTab === "briefs" && (
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover/30">
                <h3 className="font-semibold text-white">Brief Proyek</h3>
                <Link href={`/projects/${project.id}/briefs/new`} className="text-sm bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded transition-colors">
                  Unggah Brief
                </Link>
              </div>
              
              {project.briefs.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                  <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-muted" />
                  </div>
                  Belum ada brief yang diunggah.
                </div>
              ) : (
                <div className="divide-y divide-[#3F3F46]">
                  {project.briefs.map(brief => (
                    <div key={brief.id} className="p-4 hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-md transition-all relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-white font-medium">{brief.title}</p>
                        <p className="text-xs text-muted mt-1">{brief.category} • Diunggah oleh {brief.uploadedBy} pada {new Date(brief.uploadedAt).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <a href={brief.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#06B6D4] hover:underline">
                          Lihat File &rarr;
                        </a>
                        <Link href={`/projects/${project.id}/briefs/${brief.id}/edit`} className="text-muted hover:text-white transition-colors" title="Edit Brief">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <div className="z-10 relative">
                          <DeleteBriefButton id={brief.id} projectId={project.id} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === "changes" && (
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover/30">
                <h3 className="font-semibold text-white">Permintaan Perubahan</h3>
              </div>
              
              {project.changeRequests.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                  <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                    <GitPullRequest className="w-6 h-6 text-muted" />
                  </div>
                  Tidak ada permintaan perubahan.
                </div>
              ) : (
                <div className="divide-y divide-[#3F3F46]">
                  {project.changeRequests.map(cr => (
                    <div key={cr.id} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <StatusBadge status={cr.status.toLowerCase()} />
                          <p className="text-white mt-2">{cr.description}</p>
                          <p className="text-xs text-muted mt-1">Diajukan oleh {cr.requestedBy} pada {new Date(cr.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Link href={`/projects/${project.id}/change-requests/${cr.id}/edit`} className="text-muted hover:text-white transition-colors" title="Edit Change Request">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteChangeRequestButton id={cr.id} />
                        </div>
                      </div>

                      {cr.responseNote && (
                        <div className="bg-background rounded p-3 border border-[#3F3F46]">
                          <p className="text-sm text-white"><span className="text-muted font-medium">Catatan PM:</span> {cr.responseNote}</p>
                        </div>
                      )}

                      {cr.status === "PENDING" && (
                        <form action={updateChangeRequestStatus} className="flex flex-col sm:flex-row gap-2 mt-2">
                          <input type="hidden" name="changeRequestId" value={cr.id} />
                          <input type="hidden" name="projectId" value={project.id} />
                          <input type="hidden" name="respondedBy" value={session.user.name || "Admin"} />
                          <input 
                            name="responseNote" 
                            className="flex-1 bg-background border border-border rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                            placeholder="Alasan / Catatan (opsional)"
                          />
                          <select name="status" className="bg-background border border-border rounded-md h-10 px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                            <option value="ACCEPTED">Terima</option>
                            <option value="REJECTED">Tolak</option>
                            <option value="DISCUSSED">Perlu Diskusi</option>
                          </select>
                          <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-sm h-10 px-4 rounded-md transition-colors font-medium flex items-center justify-center">
                            Perbarui
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
                <h3 className="font-semibold text-white">Tagihan</h3>
              </div>
              
              {project.invoices.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                  <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-muted" />
                  </div>
                  Belum ada tagihan yang dibuat.
                </div>
              ) : (
                <div className="divide-y divide-[#3F3F46]">
                  {project.invoices.map(inv => (
                    <div key={inv.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-surface-hover transition-colors gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={inv.status.toLowerCase()} />
                          <p className="text-white font-medium">{inv.invoiceNumber}</p>
                        </div>
                        <p className="text-xs text-muted mt-1">Diterbitkan: {new Date(inv.issueDate).toLocaleDateString('id-ID')} • Jatuh Tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <p className="text-lg font-bold text-emerald-500">Rp {Number(inv.totalAmount).toLocaleString('id-ID')}</p>
                        <Link href={`/invoices/${inv.id}/edit`} className="text-muted hover:text-white transition-colors" title="Edit Invoice">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteInvoiceButton id={inv.id} />
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
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Kontak Klien</h3>
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
          
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Portal Proyek</h3>
            <p className="text-sm text-muted mb-3">Klien dapat mengakses proyek ini melalui:</p>
            <div className="bg-background p-3 rounded border border-border text-xs text-[#06B6D4] font-mono break-all selection:bg-[#06B6D4]/30">
              {`/portal/${project.portalToken}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
