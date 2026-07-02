import { prisma } from "@/lib/prisma";
import { updateClient } from "@/app/actions/client";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await prisma.agencyClient.findUnique({
    where: { id: params.id }
  });

  if (!client) {
    notFound();
  }

  // We bind the id to the action
  const updateClientWithId = updateClient.bind(null, client.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Klien: {client.name}</h2>
        <Link href="/clients" className="text-muted hover:text-white transition-colors">Batal</Link>
      </div>
      
      <form action={updateClientWithId} className="space-y-6 bg-surface border border-border p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Nama Tampilan *</label>
          <input required name="name" defaultValue={client.name} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Nama Resmi Perusahaan</label>
          <input name="companyName" defaultValue={client.companyName || ""} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nama Kontak *</label>
            <input required name="contactName" defaultValue={client.contactName} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Telepon Kontak</label>
            <input name="phone" defaultValue={client.phone || ""} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1">Email Kontak *</label>
          <input required name="contactEmail" defaultValue={client.contactEmail} type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" />
        </div>

        <div className="pt-4 flex justify-end">
          <SubmitButton className="w-full">Simpan Perubahan</SubmitButton>
        </div>
      </form>
    </div>
  );
}
