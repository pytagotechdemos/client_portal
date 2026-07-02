"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/clients", label: "Clients" },
    { href: "/briefs", label: "Brief Repository" },
    { href: "/change-requests", label: "Change Requests" },
    { href: "/invoices", label: "Invoices" },
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
        
        <nav className="flex flex-col space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={closeSidebar}
              className={`px-3 py-2 rounded-md transition-colors ${
                pathname === link.href ? "bg-surface-hover text-white font-medium" : "text-muted hover:bg-surface-hover hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-border">
            <Link 
              href="/settings" 
              onClick={closeSidebar}
              className={`px-3 py-2 rounded-md transition-colors block ${
                pathname === "/settings" ? "bg-surface-hover text-white font-medium" : "text-muted hover:bg-surface-hover hover:text-white"
              }`}
            >
              Settings
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
