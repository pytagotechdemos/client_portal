import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateDeliverable } from "@/app/actions/deliverable";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { ArrowLeft } from "lucide-react";

export default async function EditDeliverablePage({ params }: { params: { id: string, did: string } }) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: params.did }
  });
  
  const adminUsers = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true }
  });

  if (!deliverable) notFound();

  return (
    <FadeIn className="max-w-2xl mx-auto space-y-6">
      <Link href={`/projects/${params.id}?tab=deliverables`} className="inline-flex items-center text-sm text-muted hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Project
      </Link>
      
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Edit Deliverable</h2>
        <form action={updateDeliverable} className="space-y-4">
          <input type="hidden" name="id" value={deliverable.id} />
          <input type="hidden" name="projectId" value={params.id} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Name</label>
            <input required name="name" defaultValue={deliverable.name} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:border-primary focus:outline-none" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Type</label>
            <select name="type" defaultValue={deliverable.type} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:border-primary focus:outline-none">
              <option value="DESIGN">Design</option>
              <option value="DOCUMENT">Document</option>
              <option value="VIDEO">Video</option>
              <option value="COPY">Copy</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Assigned To</label>
            <select name="assignedTo" defaultValue={deliverable.assignedTo || ""} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:border-primary focus:outline-none">
              <option value="">Unassigned</option>
              {adminUsers.map(u => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href={`/projects/${params.id}?tab=deliverables`} className="btn btn-secondary text-sm">Cancel</Link>
            <SubmitButton>Save Changes</SubmitButton>
          </div>
        </form>
      </div>
    </FadeIn>
  );
}
