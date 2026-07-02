import { createClient } from "@/app/actions/client";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Link from "next/link";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tambah Klien Baru</h2>
        <Link href="/clients" className="text-muted hover:text-white transition-colors">Batal</Link>
      </div>
      
      <form action={createClient} className="space-y-6 bg-surface border border-border p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Nama Tampilan *</label>
          <input required name="name" type="text" placeholder="misal: Acme Corp" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Nama Resmi Perusahaan</label>
          <input name="companyName" type="text" placeholder="misal: PT Acme Indonesia" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nama Kontak *</label>
            <input required name="contactName" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Telepon Kontak</label>
            <input name="phone" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1">Email Kontak *</label>
          <input required name="contactEmail" type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
        </div>

        <div className="pt-4 flex justify-end">
          <SubmitButton label="Buat Klien" />
        </div>
      </form>
    </div>
  );
}
