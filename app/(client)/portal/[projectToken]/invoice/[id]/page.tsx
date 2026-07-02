import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PDFExportButton } from "@/components/client/PDFExportButton";
import { DuitkuPaymentButton } from "@/components/client/DuitkuPaymentButton";

export default async function ClientInvoicePage({
  params,
}: {
  params: { projectToken: string; id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { portalToken: params.projectToken },
    include: { client: true },
  });

  if (!project) notFound();

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
  });

  if (!invoice || invoice.projectId !== project.id) notFound();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Navigation (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-8">
        <Link 
          href={`/portal/${params.projectToken}?tab=invoices`} 
          className="text-[#64748B] hover:text-foreground font-medium flex items-center gap-2 transition-colors"
        >
          &larr; Kembali ke Portal
        </Link>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <PDFExportButton invoice={invoice} project={project} />
          {invoice.status !== "PAID" && (
            <DuitkuPaymentButton invoiceId={invoice.id} projectId={project.id} />
          )}
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-10 print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start border-b border-[#E2E8F0] pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Pytagotech</h1>
            <p className="text-[#64748B] mt-2">123 Creative Street<br/>Design City, DC 10001<br/>hello@pytagotech.com</p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-bold text-foreground uppercase tracking-wide">Faktur</h2>
            <p className="text-[#64748B] font-medium mt-2">{invoice.invoiceNumber || `INV-${invoice.id.substring(0, 8).toUpperCase()}`}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-2">Ditagihkan Kepada</p>
            <p className="font-bold text-foreground text-lg">{project.client.companyName || project.client.name}</p>
            <p className="text-foreground">{project.client.contactName}</p>
            <p className="text-foreground">{project.client.contactEmail}</p>
            {project.client.phone && <p className="text-foreground">{project.client.phone}</p>}
          </div>
          <div className="text-left sm:text-right">
            <div className="mb-4">
              <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-1">Tanggal Terbit</p>
              <p className="font-medium text-foreground">{new Date(invoice.createdAt).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-1">Jatuh Tempo</p>
              <p className="font-medium text-foreground">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('id-ID') : "Saat Diterima"}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-2">Referensi Proyek</p>
          <p className="font-medium text-foreground">{project.name}</p>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="py-3 text-left font-bold text-foreground">Deskripsi</th>
                <th className="py-3 text-right font-bold text-foreground">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items as { name: string, price: number }[]).map((item, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0]">
                  <td className="py-4 text-foreground">{item.name}</td>
                  <td className="py-4 text-right font-medium text-foreground">Rp {Number(item.price).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-full sm:w-64">
            <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0]">
               <span className="font-medium text-[#64748B]">Subtotal</span>
               <span className="font-medium text-foreground">Rp {Number(invoice.totalAmount).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b-2 border-foreground">
               <span className="font-bold text-foreground text-lg">Total Tagihan</span>
               <span className="font-bold text-foreground text-xl">Rp {Number(invoice.totalAmount).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E2E8F0] text-[#64748B] text-sm">
          <p className="font-bold mb-2 text-foreground">Instruksi Pembayaran</p>
          <p className="mb-1">Silakan lakukan pembayaran melalui Transfer Bank ke rekening resmi Pytagotech atau melalui gateway pembayaran yang tersedia.</p>
          <p>Jika Anda memiliki pertanyaan tentang faktur ini, silakan hubungi kami.</p>
        </div>
      </div>
    </div>
  );
}
