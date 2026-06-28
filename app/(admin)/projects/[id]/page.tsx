import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      deliverables: {
        orderBy: { createdAt: "asc" }
      },
    },
  });

  if (!project) notFound();

  async function addDeliverable(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const type = formData.get("type") as any; // DeliverableType
    
    await prisma.deliverable.create({
      data: {
        projectId: project!.id,
        name,
        type,
      }
    });
    revalidatePath(`/projects/${project!.id}`);
  }

  return (
    <div>
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <StatusBadge status={project.status === "ACTIVE" ? "in_progress" : "not_started"} label={project.status} />
          </div>
          <p className="text-[#A1A1AA]">Client: {project.client.name} | Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "None"}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#18181B] border border-[#3F3F46] hover:bg-[#27272A] text-white px-4 py-2 rounded-md transition-colors">
            Copy Portal Link
          </button>
          <button className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-md transition-colors">
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content: Tabs / Deliverables */}
        <div className="col-span-2 space-y-6">
          {/* Tabs placeholder */}
          <div className="flex border-b border-[#3F3F46]">
            <button className="px-4 py-2 text-white border-b-2 border-[#8B5CF6]">Deliverables</button>
            <button className="px-4 py-2 text-[#A1A1AA] hover:text-white">Briefs</button>
            <button className="px-4 py-2 text-[#A1A1AA] hover:text-white">Change Requests</button>
          </div>

          <div className="bg-[#18181B] border border-[#3F3F46] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#3F3F46] flex justify-between items-center bg-[#27272A]/30">
              <h3 className="font-semibold text-white">Project Deliverables</h3>
            </div>
            
            {project.deliverables.length === 0 ? (
              <div className="p-8 text-center text-[#A1A1AA]">
                No deliverables yet. Create the first one below.
              </div>
            ) : (
              <div className="divide-y divide-[#3F3F46]">
                {project.deliverables.map(del => (
                  <Link href={`/projects/${project.id}/deliverables/${del.id}`} key={del.id} className="block p-4 hover:bg-[#27272A] transition-colors group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={del.status.toLowerCase()} />
                        <div>
                          <p className="text-white font-medium group-hover:text-[#8B5CF6] transition-colors">{del.name}</p>
                          <p className="text-xs text-[#A1A1AA] mt-1">{del.type} • v{del.currentVersion}</p>
                        </div>
                      </div>
                      <div className="text-sm text-[#06B6D4]">View &rarr;</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Deliverable Form */}
          <form action={addDeliverable} className="bg-[#18181B] border border-[#3F3F46] rounded-lg p-4 flex gap-3">
            <input required name="name" placeholder="New deliverable name (e.g. Logo Final)" className="flex-1 bg-[#0F0F11] border border-[#3F3F46] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
            <select name="type" className="bg-[#0F0F11] border border-[#3F3F46] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]">
              <option value="DESIGN">Design</option>
              <option value="DOCUMENT">Document</option>
              <option value="VIDEO">Video</option>
              <option value="COPY">Copy</option>
              <option value="OTHER">Other</option>
            </select>
            <button type="submit" className="bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-white px-4 py-2 rounded-md transition-colors">
              Add
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[#18181B] border border-[#3F3F46] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-4">Client Contact</h3>
            <div className="space-y-3">
              <div>
                <p className="text-white font-medium">{project.client.contactName}</p>
                <p className="text-sm text-[#A1A1AA]">{project.client.name}</p>
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Email</p>
                <a href={`mailto:${project.client.contactEmail}`} className="text-sm text-[#06B6D4] hover:underline">{project.client.contactEmail}</a>
              </div>
            </div>
          </div>
          
          <div className="bg-[#18181B] border border-[#3F3F46] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-4">Project Portal</h3>
            <p className="text-sm text-[#A1A1AA] mb-3">Client can access this project via:</p>
            <div className="bg-[#0F0F11] p-2 rounded border border-[#3F3F46] text-xs text-[#06B6D4] font-mono break-all">
              {`/portal/${project.portalToken}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
