import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InvoiceForm from "@/components/admin/InvoiceForm";

export default async function NewInvoicePage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      deliverables: {
        where: {
          status: "APPROVED"
        }
      }
    }
  });

  if (!project) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/projects/${project.id}`} className="text-[#06B6D4] hover:underline mb-4 inline-block">
          &larr; Kembali ke Proyek
        </Link>
        <h1 className="text-3xl font-bold text-white">Buat Tagihan</h1>
        <p className="text-muted mt-2">Tagihan untuk {project.name}</p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <InvoiceForm projectId={project.id} deliverables={project.deliverables} />
      </div>
    </div>
  );
}
