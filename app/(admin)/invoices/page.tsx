import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      project: {
        include: { client: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Invoices</h2>
      </div>

      <div className="bg-[#18181B] border border-[#3F3F46] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#3F3F46] bg-[#27272A]/30 flex gap-4">
          <div className="w-32 font-semibold text-white">Invoice #</div>
          <div className="flex-1 font-semibold text-white">Project / Client</div>
          <div className="w-32 font-semibold text-white text-right">Amount</div>
          <div className="w-32 font-semibold text-white text-right">Status</div>
        </div>
        <div className="divide-y divide-[#3F3F46]">
          {invoices.map(invoice => (
            <div key={invoice.id} className="p-4 flex gap-4 items-center hover:bg-[#27272A] transition-colors">
              <div className="w-32 text-sm text-[#06B6D4]">#{invoice.id.substring(0,8).toUpperCase()}</div>
              <div className="flex-1">
                <Link href={`/projects/${invoice.projectId}`} className="font-medium text-white hover:text-[#8B5CF6]">
                  {invoice.project.name}
                </Link>
                <p className="text-sm text-[#A1A1AA] mt-1">{invoice.project.client.name}</p>
              </div>
              <div className="w-32 text-right text-white font-medium">
                Rp {invoice.amount.toLocaleString('id-ID')}
              </div>
              <div className="w-32 text-right">
                <span className={`text-xs px-2 py-1 rounded-full border ${invoice.status === 'PAID' ? 'bg-[#022C22] border-[#059669] text-[#6EE7B7]' : 'bg-[#450A0A] border-[#B91C1C] text-[#FCA5A5]'}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="p-8 text-center text-[#A1A1AA]">No invoices generated yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
