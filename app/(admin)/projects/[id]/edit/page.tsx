import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { updateProject } from "@/app/actions/project";
import Link from "next/link";
import { SubmitButton } from "@/components/shared/SubmitButton";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/api/auth/signin");
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { client: true }
  });

  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Proyek</h1>
          <p className="text-muted mt-2">Ubah informasi untuk proyek {project.name}</p>
        </div>
        <Link href={`/projects/${project.id}`} className="text-sm text-muted hover:text-white transition-colors">
          &larr; Kembali ke Proyek
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <form action={updateProject} className="space-y-6">
          <input type="hidden" name="id" value={project.id} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nama Proyek</label>
            <input 
              name="name" 
              defaultValue={project.name}
              required 
              className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Deskripsi Singkat</label>
            <textarea 
              name="description" 
              defaultValue={project.description || ""}
              rows={3} 
              className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Status</label>
              <select 
                name="status" 
                defaultValue={project.status}
                className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="PAUSED">Ditunda</option>
                <option value="COMPLETED">Selesai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Tanggal Mulai</label>
              <input 
                name="startDate" 
                type="date" 
                defaultValue={new Date(project.startDate).toISOString().split('T')[0]}
                required 
                className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Tenggat Waktu (Opsional)</label>
              <input 
                name="deadline" 
                type="date"
                defaultValue={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ""}
                className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Link href={`/projects/${project.id}`} className="px-4 py-2 text-white bg-surface-hover rounded-md transition-colors font-medium">
              Batal
            </Link>
            <SubmitButton className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
              Simpan Perubahan
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
