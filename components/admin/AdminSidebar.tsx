"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, FolderKanban, Users, FileText, GitPullRequest, Receipt, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Proyek", icon: FolderKanban },
    { href: "/clients", label: "Klien", icon: Users },
    { href: "/briefs", label: "Brief Proyek", icon: FileText },
    { href: "/change-requests", label: "Permintaan Perubahan", icon: GitPullRequest },
    { href: "/invoices", label: "Tagihan", icon: Receipt },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-20">
        <h1 className="text-xl font-bold text-white">Pytagotech</h1>
        <button onClick={toggleSidebar} className="text-muted hover:text-white">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Overlay on mobile, Fixed on desktop) */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-border p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:min-h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-white hidden md:block">Pytagotech</h1>
          <button onClick={closeSidebar} className="md:hidden text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex flex-col space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSidebar}
                className={`px-3 py-2.5 rounded-md transition-all flex items-center gap-3 ${
                  pathname === link.href ? "bg-primary/20 text-primary font-medium" : "text-muted hover:bg-surface-hover hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-border">
            <Link
              href="/settings"
              onClick={closeSidebar}
              className={`px-3 py-2.5 rounded-md transition-all flex items-center gap-3 ${
                pathname === "/settings" ? "bg-primary/20 text-primary font-medium" : "text-muted hover:bg-surface-hover hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span>Pengaturan</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
