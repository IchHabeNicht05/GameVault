"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Plus, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, ratingToStars } from "@/lib/utils";
import { averageRating, type GameCardData } from "@/lib/data/games";
import { TiltCard } from "@/components/effects/tilt-card";

export function GameCard({ game, className }: { game: GameCardData; className?: string }) {
  const rating = averageRating(game.ratings);
  const year = new Date(game.releaseDate).getFullYear();
  const genreNames = game.genres.slice(0, 2).map((g) => g.genre.name);

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn("group block shrink-0", className)}
      data-cursor="view"
      data-cursor-label="Zobrazit"
    >
      <TiltCard className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border-soft bg-panel shadow-[0_0_0_0_rgba(124,92,255,0)] transition-shadow duration-300 group-hover:shadow-[0_20px_60px_-15px_rgba(124,92,255,0.5)]">
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="absolute inset-0">
          <Image
            src={game.coverUrl}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 45vw, (max-width: 1200px) 22vw, 16vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

          {game.isTrending && (
            <Badge variant="ember" className="absolute left-2.5 top-2.5 backdrop-blur-md">
              🔥 Trending
            </Badge>
          )}

          {rating > 0 && (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-gold backdrop-blur-md">
              <Star className="h-3 w-3 fill-gold" />
              {rating.toFixed(1)}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3.5" style={{ transform: "translateZ(40px)" }}>
            <h3 className="font-display text-sm font-medium leading-tight text-white line-clamp-2">
              {game.title}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-white/60">
              <span>{year}</span>
              {genreNames.length > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="truncate">{genreNames.join(", ")}</span>
                </>
              )}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-plasma text-white shadow-lg">
              <Plus className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md">
              <Bookmark className="h-4 w-4" />
            </span>
          </div>
        </motion.div>
      </TiltCard>
    </Link>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="aspect-[3/4] w-full shrink-0 animate-pulse rounded-xl bg-panel-raised" />
  );
}

export function StarRating({ value, max = 5, size = "sm" }: { value: number; max?: number; size?: "sm" | "md" | "lg" }) {
  const stars = Array.from({ length: max });
  const sizeClass = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((_, i) => {
        const filled = i < Math.floor(value);
        const half = !filled && i < value;
        return (
          <Star
            key={i}
            className={cn(
              sizeClass,
              filled ? "fill-gold text-gold" : half ? "fill-gold/50 text-gold" : "fill-transparent text-white/20"
            )}
          />
        );
      })}
    </div>
  );
}

export { ratingToStars };