import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createBrief } from "@/app/actions/brief";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function NewBriefPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
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
          &larr; Kembali ke Proyek
        </Link>
        <h1 className="text-3xl font-bold text-white">Unggah Brief</h1>
        <p className="text-muted mt-2">Tambahkan brief atau dokumen referensi baru ke {project.name}</p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <form action={handleCreateBrief} className="space-y-6">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="uploadedBy" value={session?.user?.name || "Admin"} />

          <div>
            <label className="block text-sm font-medium text-white mb-2">Judul Brief</label>
            <input 
              required 
              name="title" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
              placeholder="Contoh: Referensi Logo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Kategori</label>
            <select 
              required 
              name="category" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="Visual Brief">Referensi Visual</option>
              <option value="Copy Brief">Aset Teks/Copy</option>
              <option value="Brand Guideline">Brand Guideline</option>
              <option value="Meeting Notes">Catatan Rapat</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Tautan File URL</label>
            <input 
              required 
              type="url"
              name="fileUrl" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
              placeholder="https://..."
            />
            <p className="text-xs text-muted mt-2">Berikan tautan langsung ke file (Google Drive, Dropbox, dll.)</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link 
              href={`/projects/${project.id}?tab=briefs`}
              className="px-4 py-2 text-white bg-surface-hover hover:bg-muted border border-border rounded-md transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
            >
              Unggah Brief
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
