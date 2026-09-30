"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PLATFORM_FAMILIES = ["PC", "PlayStation", "Xbox", "Nintendo"];

export function SearchFilters({
  genres,
  currentQuery,
  currentGenre,
  currentPlatform,
  currentYear,
  currentSort,
}: {
  genres: { slug: string; name: string }[];
  currentQuery: string;
  currentGenre: string;
  currentPlatform: string;
  currentYear: string;
  currentSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function onSubmitQuery(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", query);
  }

  const years = Array.from({ length: 16 }, (_, i) => String(new Date().getFullYear() + 1 - i));

  return (
    <div className="space-y-4 rounded-2xl border border-border-soft bg-panel/60 p-5">
      <form onSubmit={onSubmitQuery} className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hledat podle názvu…" className="pl-10" />
      </form>

      <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
        <SlidersHorizontal className="h-4 w-4" /> Filtry
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select value={currentGenre || "all"} onValueChange={(v) => updateParam("genre", v === "all" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Žánr" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny žánry</SelectItem>
            {genres.map((g) => (
              <SelectItem key={g.slug} value={g.slug}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentYear || "all"} onValueChange={(v) => updateParam("year", v === "all" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Rok" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny roky</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSort || "newest"} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger><SelectValue placeholder="Řadit" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Nejnovější</SelectItem>
            <SelectItem value="az">A–Z</SelectItem>
          </SelectContent>
        </Select>

        <div className="col-span-2 flex gap-1.5 sm:col-span-4">
          {PLATFORM_FAMILIES.map((p) => (
            <button
              key={p}
              onClick={() => updateParam("platform", currentPlatform === p ? "" : p)}
              className={cn(
                "flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                currentPlatform === p
                  ? "border-plasma bg-plasma/15 text-plasma-soft"
                  : "border-border-soft text-text-muted hover:border-border-strong hover:text-text-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {(currentGenre || currentPlatform || currentYear || currentQuery) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => router.push(pathname)}
        >
          Vymazat filtry
        </Button>
      )}
    </div>
  );
}
