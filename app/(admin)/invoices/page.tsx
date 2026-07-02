import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { Receipt, CheckCircle, Clock } from "lucide-react";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      project: {
        include: { client: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const paidCount = invoices.filter(i => i.status === "PAID").length;
  const pendingCount = invoices.filter(i => i.status !== "PAID").length;

  return (
    <FadeIn className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Tagihan</h2>
            <p className="text-sm text-muted">{invoices.length} total tagihan</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle className="w-4 h-4" /> {paidCount} Lunas
            </span>
            <span className="text-muted">|</span>
            <span className="flex items-center gap-1.5 text-amber-500">
              <Clock className="w-4 h-4" /> {pendingCount} Tertunda
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted">Belum ada tagihan yang dibuat.</p>
          </div>
        ) : (
          <div className="min-w-[800px]">
            <div className="p-4 border-b border-border bg-surface-light/50 grid grid-cols-12 gap-4">
              <div className="col-span-2 font-semibold text-sm text-muted">No. Tagihan</div>
              <div className="col-span-4 font-semibold text-sm text-muted">Proyek / Klien</div>
              <div className="col-span-2 font-semibold text-sm text-muted text-center">Tanggal</div>
              <div className="col-span-2 font-semibold text-sm text-muted text-right">Jumlah</div>
              <div className="col-span-2 font-semibold text-sm text-muted text-center">Status</div>
            </div>
            <div className="divide-y divide-border/50">
              {invoices.map(invoice => (
                <div key={invoice.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-hover/50 transition-colors group">
                  <div className="col-span-2">
                    <Link href={`/invoices/${invoice.id}`} className="text-primary hover:text-primary-hover font-medium text-sm">
                      #{invoice.id.substring(0,8).toUpperCase()}
                    </Link>
                  </div>
                  <div className="col-span-4">
                    <Link href={`/projects/${invoice.projectId}`} className="font-medium text-white hover:text-primary group-hover:text-primary transition-colors">
                      {invoice.project.name}
                    </Link>
                    <p className="text-xs text-muted">{invoice.project.client.name}</p>
                  </div>
                  <div className="col-span-2 text-center text-sm text-muted">
                    {new Date(invoice.createdAt).toLocaleDateString('id-ID')}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-white font-semibold">{formatRupiah(Number(invoice.totalAmount))}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {invoice.status === 'PAID' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {invoice.status === 'PAID' ? 'Lunas' : invoice.status === 'SENT' ? 'Terkirim' : invoice.status === 'OVERDUE' ? 'Jatuh Tempo' : invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
