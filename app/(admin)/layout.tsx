import { Inter } from "next/font/google";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-background text-foreground ${inter.className}`}>
      <div className="flex flex-col md:flex-row min-h-screen">
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
