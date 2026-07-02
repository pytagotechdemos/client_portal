"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export function SearchBar({ placeholder = "Cari..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams?.get("q") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, pathname, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 bg-surface-light border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary transition-colors w-full sm:w-64"
      />
    </div>
  );
}
