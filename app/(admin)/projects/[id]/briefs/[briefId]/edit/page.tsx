import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateBrief } from "@/app/actions/brief";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { ArrowLeft } from "lucide-react";

export default async function EditBriefPage({ params }: { params: { id: string, briefId: string } }) {
  const brief = await prisma.brief.findUnique({
    where: { id: params.briefId }
  });

  if (!brief) notFound();

  return (
    <FadeIn className="max-w-2xl mx-auto space-y-6">
      <Link href={`/projects/${params.id}?tab=briefs`} className="inline-flex items-center text-sm text-muted hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Project
      </Link>
      
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Edit Brief</h2>
        <form action={updateBrief} className="space-y-4">
          <input type="hidden" name="id" value={brief.id} />
          <input type="hidden" name="projectId" value={params.id} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Title</label>
            <input required name="title" defaultValue={brief.title} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:border-primary focus:outline-none" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Category</label>
            <input required name="category" defaultValue={brief.category} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:border-primary focus:outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">File URL</label>
            <input required type="url" name="fileUrl" defaultValue={brief.fileUrl} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:border-primary focus:outline-none" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href={`/projects/${params.id}?tab=briefs`} className="btn btn-secondary text-sm">Cancel</Link>
            <SubmitButton>Save Changes</SubmitButton>
          </div>
        </form>
      </div>
    </FadeIn>
  );
}
