"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function ClientLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-sm font-medium border border-border hover:bg-surface-hover text-white h-10 px-4 rounded-md transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
