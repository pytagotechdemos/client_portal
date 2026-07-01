import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-foreground ${inter.className}`}>
      {/* Client Header placeholder */}
      <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#7C3AED]">Studio Volta</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-[#64748B]">Client Portal</span>
          <button className="text-sm border border-[#E2E8F0] px-3 py-1 rounded">Logout</button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
