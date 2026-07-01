import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/client/PrintButton";

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
      <div className="print:hidden flex justify-between items-center mb-8">
        <Link 
          href={`/portal/${params.projectToken}?tab=invoices`} 
          className="text-[#64748B] hover:text-foreground font-medium flex items-center gap-2"
        >
          &larr; Back to Portal
        </Link>
        <PrintButton />
      </div>

      {/* Invoice Paper */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-10 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Studio Volta</h1>
            <p className="text-[#64748B] mt-2">123 Creative Street<br/>Design City, DC 10001<br/>hello@studiovolta.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-foreground uppercase tracking-wide">Invoice</h2>
            <p className="text-[#64748B] font-medium mt-2">INV-{invoice.id.substring(invoice.id.length - 6).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-2">Billed To</p>
            <p className="font-bold text-foreground text-lg">{project.client.companyName || project.client.name}</p>
            <p className="text-foreground">{project.client.contactName}</p>
            <p className="text-foreground">{project.client.contactEmail}</p>
            {project.client.phone && <p className="text-foreground">{project.client.phone}</p>}
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-1">Date Issued</p>
              <p className="font-medium text-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-1">Due Date</p>
              <p className="font-medium text-foreground">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Upon Receipt"}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-2">Project Reference</p>
          <p className="font-medium text-foreground">{project.name}</p>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="py-3 text-left font-bold text-foreground">Description</th>
              <th className="py-3 text-right font-bold text-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#E2E8F0]">
              <td className="py-4 text-foreground">{invoice.title}</td>
              <td className="py-4 text-right font-medium text-foreground">${invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
          <div className="w-64">
            <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0]">
              <span className="font-medium text-[#64748B]">Subtotal</span>
              <span className="font-medium text-foreground">${invoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b-2 border-foreground">
              <span className="font-bold text-foreground text-lg">Total Due</span>
              <span className="font-bold text-foreground text-xl">${invoice.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E2E8F0] text-[#64748B] text-sm">
          <p className="font-bold mb-2 text-foreground">Payment Instructions</p>
          <p className="mb-1">Please remit payment via Bank Transfer or PayPal to payments@studiovolta.com.</p>
          <p>If you have any questions about this invoice, please contact us.</p>
        </div>
      </div>
    </div>
  );
}
