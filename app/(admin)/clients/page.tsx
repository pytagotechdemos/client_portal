import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
      </div>

      <div className="bg-[#18181B] border border-[#3F3F46] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#3F3F46] bg-[#27272A]/30 flex gap-4">
          <div className="flex-1 font-semibold text-white">Client Name</div>
          <div className="w-64 font-semibold text-white">Contact Person</div>
          <div className="w-32 font-semibold text-white text-right">Projects</div>
        </div>
        <div className="divide-y divide-[#3F3F46]">
          {clients.map(client => (
            <div key={client.id} className="p-4 flex gap-4 items-center hover:bg-[#27272A] transition-colors">
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
            </div>
          ))}
          {clients.length === 0 && (
            <div className="p-8 text-center text-[#A1A1AA]">No clients found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
