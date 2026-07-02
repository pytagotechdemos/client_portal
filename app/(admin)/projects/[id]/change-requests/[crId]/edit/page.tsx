import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateChangeRequest } from "@/app/actions/changeRequest";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { ArrowLeft } from "lucide-react";

export default async function EditChangeRequestPage({ params }: { params: { id: string, crId: string } }) {
  const cr = await prisma.changeRequest.findUnique({
    where: { id: params.crId }
  });

  if (!cr) notFound();

  return (
    <FadeIn className="max-w-2xl mx-auto space-y-6">
      <Link href={`/projects/${params.id}?tab=changes`} className="inline-flex items-center text-sm text-muted hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Project
      </Link>
      
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Edit Change Request</h2>
        <form action={updateChangeRequest} className="space-y-4">
          <input type="hidden" name="id" value={cr.id} />
          <input type="hidden" name="projectId" value={params.id} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description</label>
            <textarea required name="description" defaultValue={cr.description} rows={4} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary focus:outline-none" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Status</label>
            <select name="status" defaultValue={cr.status} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary focus:outline-none">
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="DISCUSSED">Need Discussion</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Response Note</label>
            <input name="responseNote" defaultValue={cr.responseNote || ""} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary focus:outline-none" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href={`/projects/${params.id}?tab=changes`} className="btn btn-secondary text-sm">Cancel</Link>
            <SubmitButton>Save Changes</SubmitButton>
          </div>
        </form>
      </div>
    </FadeIn>
  );
}
