"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Flame } from "lucide-react";
import { averageRating, type GameCardData } from "@/lib/data/games";

/**
 * Trending žebříček — horizontální rail, kde pořadí nese obří číslice
 * zapuštěná za artwork (01, 02, 03…). Číslo je součást kompozice, ne odznak
 * v rohu, takže sekce má jiný vizuální rytmus než běžné karuselové řady
 * a nesplývá s nimi.
 */
export function TrendingRail({ games }: { games: GameCardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (games.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mb-8 flex items-end justify-between px-5 lg:px-10">
        <div>
          <span className="flex items-center gap-2 font-stat text-[11px] uppercase tracking-[0.2em] text-ember">
            <Flame className="h-3.5 w-3.5" /> Trending
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Co komunita hraje právě teď
          </h2>
        </div>
      </div>

      <div ref={scrollRef} className="no-scrollbar flex gap-10 overflow-x-auto px-5 pb-4 pt-6 lg:px-10">
        {games.slice(0, 10).map((game, i) => {
          const rating = averageRating(game.ratings);
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex shrink-0 items-end gap-2"
            >
              {/* Obří pořadové číslo — zapuštěné za artwork */}
              <span
                aria-hidden
                className="select-none font-display text-[7rem] font-bold leading-[0.7] text-transparent sm:text-[9rem]"
                style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.16)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <Link
                href={`/games/${game.slug}`}
                data-cursor="view"
                data-cursor-label="Otevřít"
                className="group -ml-14 block w-[170px] sm:w-[200px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border-soft shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:-translate-y-2">
                  <Image
                    src={game.coverUrl}
                    alt={game.title}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  {rating > 0 && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 font-stat text-[11px] font-bold text-gold backdrop-blur-md">
                      <Star className="h-3 w-3 fill-gold" />
                      {rating.toFixed(1)}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="font-display text-sm font-medium leading-tight text-white line-clamp-2">
                      {game.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-white/55">
                      {new Date(game.releaseDate).getFullYear()}
                      {game.genres[0] && ` · ${game.genres[0].genre.name}`}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}