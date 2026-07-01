import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      project: {
        include: {
          client: true
        }
      }
    },
  });

  if (!invoice) notFound();

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Non-printable header */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="text-sm text-muted">
          <Link href="/invoices" className="hover:text-white transition-colors">
            &larr; Back to Invoices
          </Link>
        </div>
        <button 
          id="print-btn"
          className="bg-[#0F172A] border border-border hover:bg-[#1E293B] text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Download PDF / Print
        </button>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('print-btn').addEventListener('click', () => window.print());
        `
      }} />

      {/* Printable Invoice Container */}
      <div className="bg-white text-black p-10 rounded-lg shadow-sm border border-gray-200 print:border-none print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-500 text-sm font-medium">#{invoice.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">Pytagotech</h2>
            <p className="text-gray-500 text-sm mt-1">123 Creative Street<br/>Design City, DC 10101<br/>hello@pytagotech.com</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
            <h3 className="font-bold text-gray-900 text-lg">{invoice.project.client.name}</h3>
            <p className="text-gray-600 mt-1 text-sm">{invoice.project.client.contactName}<br/>{invoice.project.client.contactEmail}</p>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-medium text-gray-900">{new Date(invoice.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Project</p>
          <p className="font-medium text-gray-900 text-lg">{invoice.project.name}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-12 text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* For MVP we don't have line items, just the total amount */}
            <tr className="border-b border-gray-100">
              <td className="py-4 text-gray-900">Services rendered for project: {invoice.project.name}</td>
              <td className="py-4 text-gray-900 text-right font-medium">${Number(invoice.totalAmount).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Total & Status */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
            {/* Print version of status badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block border
              ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-200' : 
                invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800 border-red-200' : 
                'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
              {invoice.status}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Due</p>
            <p className="text-4xl font-black text-gray-900">${Number(invoice.totalAmount).toLocaleString()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your business. Please remit payment by the due date.</p>
        </div>

      </div>
    </div>
  );
}
