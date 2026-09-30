"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Gamepad2, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface QuickResult {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  releaseDate: string;
  genres: { genre: { name: string } }[];
}

/**
 * Globální ⌘K / Ctrl+K vyhledávací overlay ("GameVault Command Search").
 * Mountuje se jednou v root layoutu; naslouchá klávesové zkratce odkudkoli
 * v appce. Debounced fetch na /api/search/quick, plná klávesová navigace
 * (šipky + Enter + Escape), focus trap řeší Radix Dialog.
 */
export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setQuery("");
        setResults([]);
        setActiveIndex(0);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/quick?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.games ?? []);
        setActiveIndex(0);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigateToResult = useCallback(
    (slug: string) => {
      setOpen(false);
      router.push(`/games/${slug}`);
    },
    [router]
  );

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigateToResult(results[activeIndex].slug);
    } else if (e.key === "Enter" && query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
          />
        </Dialog.Overlay>

        <Dialog.Content
          asChild
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[14vh] z-[201] w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border-strong bg-panel-raised/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <Dialog.Title className="sr-only">GameVault Command Search</Dialog.Title>
            <Dialog.Description className="sr-only">
              Hledej hry podle názvu a přejdi rovnou na jejich detail.
            </Dialog.Description>

            <div className="flex items-center gap-3 border-b border-border-soft px-5 py-4">
              {loading ? (
                <Loader2 className="h-4.5 w-4.5 shrink-0 animate-spin text-plasma-soft" />
              ) : (
                <Search className="h-4.5 w-4.5 shrink-0 text-text-muted" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Hledej hry, žánry, platformy…"
                className="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded-md border border-border-soft bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-text-muted sm:inline">
                ESC
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim().length < 2 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-text-muted">
                  <Gamepad2 className="h-6 w-6 opacity-50" />
                  Začni psát pro vyhledání her v katalogu GameVault
                </div>
              )}

              {query.trim().length >= 2 && !loading && results.length === 0 && (
                <div className="py-10 text-center text-sm text-text-muted">
                  Nic jsme nenašli pro „{query}“
                </div>
              )}

              {results.map((game, i) => (
                <button
                  key={game.id}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => navigateToResult(game.slug)}
                  className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-plasma/15" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-panel">
                    <Image src={game.coverUrl} alt={game.title} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-medium text-text-primary">{game.title}</p>
                    <p className="truncate text-xs text-text-muted">
                      {new Date(game.releaseDate).getFullYear()}
                      {game.genres.length > 0 && ` · ${game.genres.map((g) => g.genre.name).join(", ")}`}
                    </p>
                  </div>
                  {i === activeIndex && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-plasma-soft" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-border-soft px-5 py-3 text-[11px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" /> Navigace
              </span>
              <span className="flex items-center gap-1.5">
                <CornerDownLeft className="h-3 w-3" /> Otevřít
              </span>
              <span className="ml-auto font-stat">GameVault Command Search</span>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Vizuální spouštěč pro navbar — klik i vizuální hint na zkratku. */
export function CommandSearchTrigger({ className }: { className?: string }) {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  function openPalette() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  }

  return (
    <button
      onClick={openPalette}
      data-cursor="pointer"
      className={
        className ??
        "flex h-10 w-full max-w-sm items-center gap-2.5 rounded-full border border-border-soft bg-white/[0.04] px-4 text-sm text-text-muted transition-colors hover:border-plasma/30 hover:bg-white/[0.07]"
      }
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Hledat hry…</span>
      <kbd className="rounded-md border border-border-soft bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold">
        {isMac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}