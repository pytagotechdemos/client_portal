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
            <input data-testid="project-name-input" required name="name" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Deskripsi / Ruang Lingkup</label>
            <textarea data-testid="project-desc-input" name="description" rows={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tanggal Mulai *</label>
              <input data-testid="project-start-input" required name="startDate" type="date" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary color-scheme-dark" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted">Batas Waktu (Deadline)</label>
              <input data-testid="project-end-input" name="deadline" type="date" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary color-scheme-dark" />
            </div>
          </div>
        </section>

        {/* Client Info */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Detail Klien & Akses Portal</h3>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Perusahaan / Nama Klien *</label>
            <input data-testid="project-client-name" required name="clientName" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Nama Kontak *</label>
              <input data-testid="project-contact-name" required name="contactName" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted">Email Kontak</label>
              <input data-testid="project-contact-email" required name="contactEmail" type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Kata Sandi Portal untuk Klien *</label>
            <input data-testid="project-client-password" required name="clientPassword" type="password" autoComplete="new-password" className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Minimal 6 karakter" />
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
