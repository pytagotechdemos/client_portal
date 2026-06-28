import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";

export default async function ChangeRequestsPage() {
  const changeRequests = await prisma.changeRequest.findMany({
    include: {
      project: {
        include: { client: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Change Requests</h2>
      </div>

      <div className="bg-[#18181B] border border-[#3F3F46] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#3F3F46] bg-[#27272A]/30 flex gap-4">
          <div className="flex-1 font-semibold text-white">Request</div>
          <div className="w-64 font-semibold text-white">Project</div>
          <div className="w-32 font-semibold text-white text-right">Status</div>
        </div>
        <div className="divide-y divide-[#3F3F46]">
          {changeRequests.map(cr => (
            <div key={cr.id} className="p-4 flex gap-4 items-center hover:bg-[#27272A] transition-colors">
              <div className="flex-1">
                <p className="font-medium text-white">{cr.title}</p>
                <p className="text-sm text-[#A1A1AA] mt-1 line-clamp-1">{cr.description}</p>
              </div>
              <div className="w-64">
                <Link href={`/projects/${cr.projectId}`} className="text-sm text-[#06B6D4] hover:underline">
                  {cr.project.name}
                </Link>
                <p className="text-xs text-[#A1A1AA]">{cr.project.client.name}</p>
              </div>
              <div className="w-32 text-right">
                <span className={`text-xs px-2 py-1 rounded-full border ${cr.status === 'PENDING' ? 'bg-[#450A0A] border-[#B91C1C] text-[#FCA5A5]' : 'bg-[#022C22] border-[#059669] text-[#6EE7B7]'}`}>
                  {cr.status}
                </span>
              </div>
            </div>
          ))}
          {changeRequests.length === 0 && (
            <div className="p-8 text-center text-[#A1A1AA]">No change requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
