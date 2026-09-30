"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GameCard } from "./game-card";
import type { GameCardData } from "@/lib/data/games";
import { cn } from "@/lib/utils";

export function GameCarousel({
  title,
  subtitle,
  games,
  accent = "plasma",
}: {
  title: string;
  subtitle?: string;
  games: GameCardData[];
  accent?: "plasma" | "ember" | "gold";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }

  useEffect(() => {
    updateScrollState();
  }, [games]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (games.length === 0) return null;

  const accentClass = accent === "ember" ? "bg-ember" : accent === "gold" ? "bg-gold" : "bg-plasma";

  return (
    <section className="relative py-6">
      <div className="mb-4 flex items-end justify-between px-5 lg:px-10">
        <div className="flex items-center gap-3">
          <span className={cn("h-6 w-1 rounded-full", accentClass)} />
          <div>
            <h2 className="font-display text-xl font-medium text-text-primary sm:text-2xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-text-secondary transition-all hover:border-plasma/40 hover:text-plasma-soft disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-text-secondary transition-all hover:border-plasma/40 hover:text-plasma-soft disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-5 pb-2 lg:px-10"
      >
        {games.map((game) => (
          <GameCard key={game.id} game={game} className="w-[42vw] sm:w-[220px]" />
        ))}
      </div>
    </section>
  );
}
