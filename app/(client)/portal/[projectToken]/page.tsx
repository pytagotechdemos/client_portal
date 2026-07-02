import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { createBrief } from "@/app/actions/brief";
import { createChangeRequest } from "@/app/actions/changeRequest";
import { CommentSection } from "@/components/shared/CommentSection";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { Box, FileText, GitPullRequest, Receipt } from "lucide-react";
import { DeleteBriefButton } from "@/components/admin/DeleteBriefButton";
import { DeleteChangeRequestButton } from "@/components/admin/DeleteChangeRequestButton";

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
      <div className="bg-surface p-6 md:p-8 rounded-xl border border-border shadow-md mb-8 relative overflow-hidden">
        {/* Subtle Gradient background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
        
        <h2 className="text-3xl font-bold text-white mb-4 relative z-10">{project.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          <div>
            <p className="text-sm text-muted mb-1">Status</p>
            <StatusBadge status={project.status.toLowerCase()} />
          </div>
          <div>
            <p className="text-sm text-muted mb-1">Tenggat Waktu</p>
            <p className="font-medium text-white">{project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID') : "TBD"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted mb-1">Progres: {approvedCount} dari {totalCount} disetujui</p>
            <div className="w-full bg-surface-hover rounded-full h-2.5 mt-2">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
        <Link href={`/portal/${project.portalToken}?tab=deliverables`} className={`px-4 md:px-6 py-3 font-medium ${currentTab === "deliverables" ? "text-primary-hover border-b-2 border-primary-hover" : "text-muted hover:text-white"}`}>Hasil Pekerjaan</Link>
        <Link href={`/portal/${project.portalToken}?tab=briefs`} className={`px-4 md:px-6 py-3 font-medium ${currentTab === "briefs" ? "text-primary-hover border-b-2 border-primary-hover" : "text-muted hover:text-white"}`}>Brief & Aset</Link>
        <Link href={`/portal/${project.portalToken}?tab=changes`} className={`px-4 md:px-6 py-3 font-medium ${currentTab === "changes" ? "text-primary-hover border-b-2 border-primary-hover" : "text-muted hover:text-white"}`}>Permintaan Perubahan</Link>
        <Link href={`/portal/${project.portalToken}?tab=invoices`} className={`px-4 md:px-6 py-3 font-medium ${currentTab === "invoices" ? "text-primary-hover border-b-2 border-primary-hover" : "text-muted hover:text-white"}`}>Tagihan</Link>
        <Link href={`/portal/${project.portalToken}?tab=discussion`} className={`px-4 md:px-6 py-3 font-medium ${currentTab === "discussion" ? "text-primary-hover border-b-2 border-primary-hover" : "text-muted hover:text-white"}`}>Diskusi</Link>
      </div>

      {currentTab === "discussion" && (
        <div className="max-w-3xl">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-white mb-6">Diskusi Proyek</h3>
            <CommentSection 
              projectId={project.id} 
              comments={project.comments} 
              currentUser={{ name: project.client.contactName, role: "CLIENT" }} 
              theme="dark"
            />
          </div>
        </div>
      )}

      {currentTab === "deliverables" && (
        <>
          {/* Needs Review Section */}
          {needsReview.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Menunggu Tinjauan Anda
              </h3>
              <div className="grid gap-4">
                {needsReview.map((del) => (
                  <div key={del.id} className="bg-surface border-2 border-amber-500/50 rounded-xl p-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center shadow-md hover:-translate-y-1 transition-all">
                    <div>
                      <h4 className="text-lg font-bold text-white">{del.name}</h4>
                      <p className="text-sm text-muted mt-1">v{del.currentVersion} siap untuk ditinjau.</p>
                    </div>
                    <Link 
                      href={`/portal/${project.portalToken}/deliverable/${del.id}`}
                      className="bg-primary-hover hover:bg-[#6D28D9] text-white h-10 px-4 flex items-center justify-center rounded-md font-medium transition-colors text-sm w-full sm:w-auto"
                    >
                      Tinjau Sekarang
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Deliverables Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Semua Hasil Pekerjaan</h3>
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-md">
              {project.deliverables.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                  <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                    <Box className="w-6 h-6 text-muted" />
                  </div>
                  Belum ada hasil pekerjaan yang ditambahkan.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {others.map((del) => (
                    <div key={del.id} className="p-5 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center hover:bg-surface-hover transition-colors">
                      <div className="flex items-center gap-4">
                        <StatusBadge status={del.status.toLowerCase()} />
                        <div>
                          <p className="font-medium text-white">{del.name}</p>
                          <p className="text-xs text-muted">Tipe: {del.type}</p>
                        </div>
                      </div>
                      {del.status !== "NOT_STARTED" && (
                        <Link 
                          href={`/portal/${project.portalToken}/deliverable/${del.id}`}
                          className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors w-full sm:w-auto"
                        >
                          Lihat Detail &rarr;
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
            <h3 className="text-xl font-bold text-white mb-4">Brief Proyek</h3>
            <div className="bg-surface border border-border rounded-xl shadow-md overflow-hidden">
              {project.briefs.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                  <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-muted" />
                  </div>
                  Belum ada brief atau dokumen referensi yang diunggah.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {project.briefs.map(brief => (
                    <div key={brief.id} className="p-5 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center hover:bg-surface-hover transition-colors">
                      <div>
                        <p className="font-medium text-white">{brief.title}</p>
                        <p className="text-xs text-muted">
                          {brief.category} • Diunggah oleh {brief.uploadedBy} pada {new Date(brief.uploadedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <a href={brief.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors w-full sm:w-auto">
                          Lihat &rarr;
                        </a>
                        <DeleteBriefButton id={brief.id} projectId={project.id} portalToken={project.portalToken} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Unggah Aset</h3>
            <div className="bg-surface border border-border rounded-xl p-6 shadow-md">
              <form action={handleCreateBrief} className="space-y-4">
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="portalToken" value={project.portalToken} />
                <input type="hidden" name="uploadedBy" value={project.client.contactName} />
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Judul</label>
                  <input required name="title" className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" placeholder="Contoh: Referensi Logo" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Kategori</label>
                  <select required name="category" className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover">
                    <option value="Visual Brief">Referensi Visual</option>
                    <option value="Copy Brief">Aset Teks/Copy</option>
                    <option value="Brand Guideline">Brand Guideline</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Tautan URL</label>
                  <input required type="url" name="fileUrl" className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" placeholder="https://..." />
                </div>
                
                <SubmitButton className="w-full bg-primary-hover hover:bg-[#6D28D9] text-white h-10 px-4 text-sm rounded-md font-medium transition-colors">
                  Unggah Aset
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}

      {currentTab === "changes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">Permintaan Perubahan</h3>
            <div className="bg-surface border border-border rounded-xl shadow-md overflow-hidden">
              {project.changeRequests.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                  <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                    <GitPullRequest className="w-6 h-6 text-muted" />
                  </div>
                  Belum ada permintaan perubahan.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {project.changeRequests.map(cr => (
                    <div key={cr.id} className="p-6 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <StatusBadge status={cr.status.toLowerCase()} />
                          <p className="text-white mt-2">{cr.description}</p>
                          <p className="text-xs text-muted mt-1">Diajukan pada {new Date(cr.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <DeleteChangeRequestButton id={cr.id} portalToken={project.portalToken} />
                      </div>
                      {cr.responseNote && (
                        <div className="bg-surface-hover rounded p-4 border border-border mt-2">
                          <p className="text-sm text-white"><span className="text-muted font-medium">Catatan Agensi:</span> {cr.responseNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Permintaan Baru</h3>
            <div className="bg-surface border border-border rounded-xl shadow-md p-6">
              <p className="text-sm text-muted mb-4">Ajukan permintaan untuk pekerjaan di luar ruang lingkup awal. Kami akan meninjau dan mendiskusikannya dengan Anda.</p>
              <form action={handleCreateCR} className="space-y-4">
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="portalToken" value={project.portalToken} />
                <input type="hidden" name="requestedBy" value={project.client.contactName} />
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Deskripsi</label>
                  <textarea 
                    required 
                    name="description" 
                    rows={4}
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
                    placeholder="Deskripsikan kebutuhan baru..." 
                  />
                </div>
                
                <SubmitButton className="w-full bg-primary-hover hover:bg-[#6D28D9] text-white h-10 px-4 text-sm rounded-md font-medium transition-colors">
                  Ajukan Permintaan
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}

      {currentTab === "invoices" && (
        <div className="max-w-3xl">
          <h3 className="text-xl font-bold text-white mb-4">Faktur & Tagihan</h3>
          <div className="bg-surface border border-border rounded-xl shadow-md overflow-hidden">
            {project.invoices.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center text-muted">
                <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                  <Receipt className="w-6 h-6 text-muted" />
                </div>
                Tidak ada tagihan untuk proyek ini.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {project.invoices.map(invoice => (
                  <div key={invoice.id} className="p-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center hover:bg-surface-hover transition-colors">
                    <div>
                      <p className="font-bold text-white text-lg">{invoice.invoiceNumber || invoice.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted mt-1">
                        Diterbitkan pada {new Date(invoice.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-white">Rp {Number(invoice.totalAmount).toLocaleString('id-ID')}</p>
                        <p className={`text-xs font-medium uppercase mt-1 ${invoice.status === 'PAID' ? 'text-emerald-500' : invoice.status === 'OVERDUE' ? 'text-red-500' : 'text-amber-500'}`}>
                          {invoice.status === 'PAID' ? 'LUNAS' : invoice.status === 'SENT' ? 'TERKIRIM' : invoice.status === 'OVERDUE' ? 'JATUH TEMPO' : 'DRAFT'}
                        </p>
                      </div>
                      <Link
                        href={`/portal/${project.portalToken}/invoice/${invoice.id}`}
                        className="bg-surface border border-border hover:bg-surface-hover text-white font-medium h-10 px-4 flex items-center justify-center rounded-md shadow-sm transition-colors text-sm whitespace-nowrap w-full sm:w-auto"
                      >
                        Lihat Tagihan
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
