import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Users } from "lucide-react";
import { DeleteClientButton } from "@/components/admin/DeleteClientButton";
import { FadeIn } from "@/components/shared/FadeIn";
import { SearchBar } from "@/components/admin/SearchBar";

export default async function ClientsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q || "";

  const clients = await prisma.agencyClient.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { contactEmail: { contains: q, mode: 'insensitive' } }
      ]
    } : undefined,
    include: {
      projects: true
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <FadeIn className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Klien</h2>
            <p className="text-sm text-muted">{clients.length} total klien</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <SearchBar placeholder="Cari klien..." />
          <Link href="/clients/new" className="btn btn-primary h-10 text-sm px-4 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> Tambah Klien
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted mb-4">Belum ada klien ditemukan.</p>
            <Link href="/clients/new" className="text-primary hover:text-primary-hover font-medium">
              Tambahkan klien pertama Anda
            </Link>
          </div>
        ) : (
          <div className="min-w-[800px]">
            <div className="p-4 border-b border-border bg-surface-light/50 grid grid-cols-12 gap-4">
              <div className="col-span-4 font-semibold text-sm text-muted">Klien</div>
              <div className="col-span-4 font-semibold text-sm text-muted">Kontak</div>
              <div className="col-span-2 font-semibold text-sm text-muted text-center">Proyek</div>
              <div className="col-span-2 font-semibold text-sm text-muted text-right">Aksi</div>
            </div>
            <div className="divide-y divide-border/50">
              {clients.map(client => (
                <div key={client.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-hover/50 transition-colors group">
                  <div className="col-span-4">
                    <Link href={`/clients/${client.id}`} className="font-medium text-white group-hover:text-primary transition-colors hover:underline">
                      {client.name}
                    </Link>
                    {client.companyName && client.companyName !== client.name && (
                      <p className="text-xs text-muted">{client.companyName}</p>
                    )}
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm text-white">{client.contactName}</p>
                    <a href={`mailto:${client.contactEmail}`} className="text-xs text-primary hover:underline">{client.contactEmail}</a>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {client.projects.length}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Link href={`/clients/${client.id}`} className="px-3 py-1.5 text-xs font-medium text-white bg-surface-hover hover:bg-primary hover:text-white rounded-lg transition-colors border border-border hover:border-primary flex items-center justify-center">
                      Lihat
                    </Link>
                    <Link href={`/clients/${client.id}/edit`} className="p-2 text-muted hover:text-white hover:bg-surface-light rounded-lg transition-colors" title="Edit Klien">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteClientButton id={client.id} clientName={client.name} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
