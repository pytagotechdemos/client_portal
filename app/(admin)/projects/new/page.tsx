import { createProject } from "@/app/actions/project";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Buat Proyek Baru</h2>
      
      <form action={createProject} className="space-y-8 bg-surface border border-border p-6 rounded-lg">
        {/* Project Info */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Informasi Proyek</h3>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nama Proyek *</label>
            <input data-testid="project-name-input" required name="name" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Deskripsi / Ruang Lingkup</label>
            <textarea data-testid="project-desc-input" name="description" rows={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tanggal Mulai *</label>
              <input data-testid="project-start-input" required name="startDate" type="date" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6] color-scheme-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tenggat Waktu</label>
              <input data-testid="project-end-input" name="deadline" type="date" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6] color-scheme-dark" />
            </div>
          </div>
        </section>

        {/* Client Info */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Detail Klien & Akses Portal</h3>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Perusahaan / Nama Klien *</label>
            <input data-testid="project-client-name" required name="clientName" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Nama Kontak *</label>
              <input data-testid="project-contact-name" required name="contactName" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Alamat Email *</label>
              <input data-testid="project-contact-email" required name="contactEmail" type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Kata Sandi Portal untuk Klien *</label>
            <input data-testid="project-client-password" required name="clientPassword" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" placeholder="misal: Rahasia123" />
          </div>
        </section>

        <div className="pt-4 flex flex-wrap justify-end gap-3">
          <Link href="/projects" className="h-10 text-sm px-4 flex items-center justify-center text-muted hover:text-white transition-colors border border-transparent">Batal</Link>
          <SubmitButton data-testid="project-submit" className="h-10 text-sm px-4 bg-primary hover:bg-primary-hover text-white rounded-md">Buat Proyek</SubmitButton>
        </div>
      </form>
    </div>
  );
}
