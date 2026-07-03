import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Building, Mail, Phone, Calendar, Edit, FolderOpen } from "lucide-react";
import { FadeIn } from "@/components/shared/FadeIn";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.agencyClient.findUnique({
    where: { id: params.id },
    include: {
      projects: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <FadeIn className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/clients" className="inline-flex items-center text-sm text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Klien
        </Link>
        <Link href={`/clients/${client.id}/edit`} className="btn btn-secondary h-9 text-sm px-4">
          <Edit className="w-4 h-4 mr-2" />
          Edit Klien
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{client.name}</h1>
            {client.companyName && (
              <div className="flex items-center text-muted">
                <Building className="w-4 h-4 mr-2" />
                {client.companyName}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Informasi Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Users className="w-4 h-4 text-muted mt-0.5" />
                <div>
                  <p className="text-white">{client.contactName}</p>
                  <p className="text-muted text-xs">Kontak Utama</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted" />
                <a href={`mailto:${client.contactEmail}`} className="text-primary hover:underline">{client.contactEmail}</a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted" />
                  <a href={`tel:${client.phone}`} className="text-white hover:text-primary transition-colors">{client.phone}</a>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Detail Klien</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted" />
                <span className="text-muted">Ditambahkan:</span>
                <span className="text-white">{new Date(client.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FolderOpen className="w-4 h-4 text-muted" />
                <span className="text-muted">Total Proyek:</span>
                <span className="text-white">{client.projects.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Proyek</h2>
        {client.projects.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-muted mb-4">Tidak ada proyek untuk klien ini.</p>
            <Link href={`/projects/new?clientId=${client.id}`} className="btn btn-primary text-sm">
              Buat Proyek
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.projects.map(project => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group block"
              >
                <h3 className="text-white font-medium mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                <p className="text-sm text-muted line-clamp-2 mb-4">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className={`px-2 py-1 rounded-full ${
                    project.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                    project.status === 'ON_HOLD' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-surface-light text-muted'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
