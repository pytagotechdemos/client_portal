import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateInvoice } from "@/app/actions/invoice";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { ArrowLeft } from "lucide-react";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id }
  });

  if (!invoice) notFound();

  return (
    <FadeIn className="max-w-2xl mx-auto space-y-6">
      <Link href={`/projects/${invoice.projectId}?tab=invoices`} className="inline-flex items-center text-sm text-muted hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Project
      </Link>
      
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Edit Invoice {invoice.invoiceNumber}</h2>
        <form action={updateInvoice} className="space-y-4">
          <input type="hidden" name="id" value={invoice.id} />
          <input type="hidden" name="projectId" value={invoice.projectId} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Total Amount (Rp)</label>
            <input required type="number" step="0.01" name="totalAmount" defaultValue={Number(invoice.totalAmount)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary focus:outline-none" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Status</label>
            <select name="status" defaultValue={invoice.status} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary focus:outline-none">
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href={`/projects/${invoice.projectId}?tab=invoices`} className="btn btn-secondary text-sm">Cancel</Link>
            <SubmitButton>Save Changes</SubmitButton>
          </div>
        </form>
      </div>
    </FadeIn>
  );
}
