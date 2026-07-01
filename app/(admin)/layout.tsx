import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-background text-foreground ${inter.className}`}>
      {/* Sidebar placeholder */}
      <div className="flex">
        <aside className="w-64 bg-surface border-r border-border min-h-screen p-6">
          <h1 className="text-xl font-bold text-white mb-8">Studio Volta</h1>
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="px-3 py-2 text-muted hover:bg-surface-hover hover:text-white rounded-md transition-colors">Dashboard</Link>
            <Link href="/projects" className="px-3 py-2 text-muted hover:bg-surface-hover hover:text-white rounded-md transition-colors">Projects</Link>
            <Link href="/clients" className="px-3 py-2 text-muted hover:bg-surface-hover hover:text-white rounded-md transition-colors">Clients</Link>
            <Link href="/briefs" className="px-3 py-2 text-muted hover:bg-surface-hover hover:text-white rounded-md transition-colors">Brief Repository</Link>
            <Link href="/change-requests" className="px-3 py-2 text-muted hover:bg-surface-hover hover:text-white rounded-md transition-colors flex justify-between items-center">
              Change Requests
            </Link>
            <Link href="/invoices" className="px-3 py-2 text-muted hover:bg-surface-hover hover:text-white rounded-md transition-colors">Invoices</Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
