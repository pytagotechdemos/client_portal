import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createBrief } from "@/app/actions/brief";

export default async function NewBriefPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) notFound();

  async function handleCreateBrief(formData: FormData) {
    "use server";
    await createBrief(formData);
    redirect(`/projects/${project!.id}?tab=briefs`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/projects/${project.id}?tab=briefs`} className="text-[#06B6D4] hover:underline mb-4 inline-block">
          &larr; Back to Project
        </Link>
        <h1 className="text-3xl font-bold text-white">Upload Brief</h1>
        <p className="text-muted mt-2">Add a new brief or reference document to {project.name}</p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <form action={handleCreateBrief} className="space-y-6">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="uploadedBy" value="Admin" />

          <div>
            <label className="block text-sm font-medium text-white mb-2">Brief Title</label>
            <input 
              required 
              name="title" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" 
              placeholder="e.g. Q3 Campaign Visual Guidelines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <select 
              required 
              name="category" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="Visual Brief">Visual Brief</option>
              <option value="Copy Brief">Copy Brief</option>
              <option value="Brand Guideline">Brand Guideline</option>
              <option value="Meeting Notes">Meeting Notes</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">File URL</label>
            <input 
              required 
              type="url"
              name="fileUrl" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" 
              placeholder="https://..."
            />
            <p className="text-xs text-muted mt-2">For the MVP, please provide a direct link to the file (Google Drive, Dropbox, etc.)</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link 
              href={`/projects/${project.id}?tab=briefs`}
              className="px-4 py-2 text-white bg-surface-hover hover:bg-muted border border-border rounded-md transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md transition-colors"
            >
              Upload Brief
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
