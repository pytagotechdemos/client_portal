import { prisma } from "@/lib/prisma";
import { RevenueChart, ProjectStatusChart, InvoiceStatusChart } from "@/components/admin/DashboardCharts";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FadeIn } from "@/components/shared/FadeIn";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DollarSign, TrendingUp, Briefcase, Users, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const allProjects = await prisma.project.findMany({
    select: { status: true }
  });
  const activeProjects = allProjects.filter(p => p.status === "ACTIVE").length;

  const totalClients = await prisma.agencyClient.count();

  const invoices = await prisma.invoice.findMany({
    select: { totalAmount: true, status: true, createdAt: true, invoiceNumber: true }
  });

  const paidInvoices = invoices.filter(inv => inv.status === "PAID");
  const totalRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
  const pendingInvoices = invoices.filter(inv => inv.status === "SENT" || inv.status === "OVERDUE");
  const outstandingRevenue = pendingInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);

  const recentProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: true }
  });

  const myTasks = await prisma.deliverable.findMany({
    where: {
      assignedTo: session?.user?.name || "",
      status: { notIn: ["APPROVED"] }
    },
    include: { project: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <FadeIn className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ringkasan Dashboard</h2>
          <p className="text-sm text-muted mt-1">Selamat datang kembali, {session?.user?.name || 'Admin'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs text-emerald-500/70 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{formatRupiah(totalRevenue)}</p>
          <p className="text-xs text-muted">Total Pendapatan</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs text-amber-500/70 font-medium">Tertunda</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{formatRupiah(outstandingRevenue)}</p>
          <p className="text-xs text-muted">Belum Dibayar</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-primary/70 font-medium">Aktif</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{activeProjects}</p>
          <p className="text-xs text-muted">Proyek Aktif</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 hover:border-cyan-500/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs text-cyan-500/70 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{totalClients}</p>
          <p className="text-xs text-muted">Total Klien</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-white">Tren Pendapatan</h3>
            </div>
            <span className="text-xs text-muted">{invoices.length} tagihan</span>
          </div>
          <div className="h-72">
            <RevenueChart invoices={invoices.map(i => ({...i, amount: Number(i.totalAmount)}))} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-white">Status Proyek</h3>
          </div>
          <div className="flex-1 min-h-[280px]">
             <ProjectStatusChart projects={allProjects} />
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold text-white">Status Tagihan</h3>
          </div>
          <div className="flex-1 min-h-[280px]">
             <InvoiceStatusChart invoices={invoices.map(i => ({...i, amount: Number(i.totalAmount)}))} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-white">Tugas Saya</h3>
            </div>
            <span className="text-xs text-muted">{myTasks.length} tertunda</span>
          </div>
          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm text-muted">Tidak ada tugas yang ditugaskan.</p>
              </div>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-surface-light transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div>
                      <Link href={`/projects/${task.projectId}/deliverables/${task.id}`} className="font-medium text-white hover:text-primary text-sm group-hover:text-primary transition-colors">
                        {task.name}
                      </Link>
                      <p className="text-xs text-muted">{task.project.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status.toLowerCase()} />
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-white">Proyek Terbaru</h3>
            </div>
            <Link href="/projects" className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map(project => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-surface-light transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${project.status === "ACTIVE" ? "bg-emerald-500" : "bg-zinc-500"}`}></div>
                  <div>
                    <Link href={`/projects/${project.id}`} className="font-medium text-white hover:text-primary text-sm transition-colors">
                      {project.name}
                    </Link>
                    <p className="text-xs text-muted">{project.client.name}</p>
                  </div>
                </div>
                <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status === "ACTIVE" ? "Aktif" : project.status === "COMPLETED" ? "Selesai" : project.status === "ON_HOLD" ? "Tertunda" : "Dibatalkan"} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-white">Tagihan Tertunda</h3>
            </div>
            <Link href="/invoices" className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingInvoices.slice(0, 5).map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-surface-light transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${inv.status === "OVERDUE" ? "bg-red-500" : "bg-amber-500"}`}></div>
                  <div>
                    <p className="text-sm text-white font-medium">Invoice #{inv.invoiceNumber?.slice(-6) || idx + 1}</p>
                    <p className="text-xs text-muted">{inv.status === "SENT" ? "Terkirim" : inv.status === "OVERDUE" ? "Jatuh Tempo" : inv.status}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-amber-500">{formatRupiah(Number(inv.totalAmount))}</p>
              </div>
            ))}
            {pendingInvoices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm text-muted">Semua tagihan telah dibayar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
