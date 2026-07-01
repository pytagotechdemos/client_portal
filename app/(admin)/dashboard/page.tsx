import { prisma } from "@/lib/prisma";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function DashboardPage() {
  const activeProjects = await prisma.project.count({
    where: { status: "ACTIVE" }
  });
  
  const totalClients = await prisma.agencyClient.count();
  
  const invoices = await prisma.invoice.findMany({
    select: { amount: true, status: true, createdAt: true }
  });
  
  // Cast Prisma Decimal to number safely, default to 0 if null
  const paidInvoices = invoices.filter(inv => inv.status === "PAID");
  const totalRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
  const pendingInvoices = invoices.filter(inv => inv.status === "SENT" || inv.status === "OVERDUE");
  const outstandingRevenue = pendingInvoices.reduce((acc, inv) => acc + Number(inv.amount || 0), 0);

  // Recent Projects
  const recentProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: true }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface border border-border p-6 rounded-lg">
          <p className="text-sm font-medium text-muted mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
          <p className="text-sm font-medium text-muted mb-2">Outstanding Invoices</p>
          <p className="text-3xl font-bold text-white">${outstandingRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
          <p className="text-sm font-medium text-muted mb-2">Active Projects</p>
          <p className="text-3xl font-bold text-white">{activeProjects}</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
          <p className="text-sm font-medium text-muted mb-2">Total Clients</p>
          <p className="text-3xl font-bold text-white">{totalClients}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-6">Revenue Trend</h3>
          <div className="h-80">
            {/* Since we can't pass raw Decimal from Prisma to a Client Component in Next.js 14, 
                we serialize the data. */}
            <DashboardCharts invoices={invoices.map(i => ({...i, amount: Number(i.amount)}))} />
          </div>
        </div>
        
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Recent Projects</h3>
          <div className="space-y-4">
            {recentProjects.map(project => (
              <div key={project.id} className="border-b border-border pb-4 last:border-0">
                <Link href={`/projects/${project.id}`} className="font-medium text-white hover:text-primary-hover block mb-1">
                  {project.name}
                </Link>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">{project.client.name}</span>
                  <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
