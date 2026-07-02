/* eslint-disable @next/next/no-img-element */
import { Inter } from "next/font/google";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.agencySettings.findFirst();
  const primaryColor = settings?.primaryColor || "#7C3AED";
  
  return (
    <div className={`min-h-screen bg-background text-foreground ${inter.className}`}>
      <style suppressHydrationWarning>{`
        :root {
          --primary: ${primaryColor};
          --primary-hover: ${primaryColor};
        }
      `}</style>

      {/* Client Header placeholder */}
      <header className="bg-surface border-b border-border px-8 py-4 flex justify-between items-center">
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt={settings?.agencyName || "Agency Logo"} className="h-8 object-contain" />
        ) : (
          <h1 className="text-xl font-bold text-primary">{settings?.agencyName || "Pytagotech"}</h1>
        )}
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-muted">Client Portal</span>
          <button className="text-sm font-medium border border-border hover:bg-surface-hover text-white h-10 px-4 rounded-md transition-colors">Logout</button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
