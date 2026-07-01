import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { DeleteClientButton } from "@/components/admin/DeleteClientButton";

export default async function ClientsPage() {
  const clients = await prisma.agencyClient.findMany({
    include: {
      projects: true
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Clients</h2>
        <Link href="/clients/new" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Client
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-hover/30 flex gap-4">
          <div className="flex-1 font-semibold text-white">Client Name</div>
          <div className="w-64 font-semibold text-white">Contact Person</div>
          <div className="w-32 font-semibold text-white text-right">Projects</div>
          <div className="w-24 font-semibold text-white text-right">Actions</div>
        </div>
        <div className="divide-y divide-[#3F3F46]">
          {clients.map(client => (
            <div key={client.id} className="p-4 flex gap-4 items-center hover:bg-surface-hover transition-colors">
              <div className="flex-1">
                <p className="font-medium text-white">{client.name}</p>
              </div>
              <div className="w-64">
                <p className="text-sm text-white">{client.contactName}</p>
                <a href={`mailto:${client.contactEmail}`} className="text-xs text-[#06B6D4] hover:underline">{client.contactEmail}</a>
              </div>
              <div className="w-32 text-right text-white">
                {client.projects.length}
              </div>
              <div className="w-24 flex justify-end gap-2">
                <Link href={`/clients/${client.id}/edit`} className="p-2 text-muted hover:text-white hover:bg-surface-light rounded-md transition-colors" title="Edit Client">
                  <Edit className="w-4 h-4" />
                </Link>
                <DeleteClientButton id={client.id} clientName={client.name} />
              </div>
            </div>
          ))}
          {clients.length === 0 && (
            <div className="p-8 text-center text-muted">No clients found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
