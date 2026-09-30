"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { averageRating, type GameCardData } from "@/lib/data/games";
import { formatDate } from "@/lib/utils";
import { KineticHeading } from "@/components/effects/kinetic-heading";
import { Hero3DScene } from "@/components/effects/hero-3d-scene";

export function CinematicHero({ games }: { games: GameCardData[] }) {
  const [index, setIndex] = useState(0);
  const game = games[index];

  const next = useCallback(() => setIndex((i) => (i + 1) % games.length), [games.length]);
  const prev = () => setIndex((i) => (i - 1 + games.length) % games.length);

  useEffect(() => {
    if (games.length <= 1) return;
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next, games.length]);

  if (!game) return null;
  const rating = averageRating(game.ratings);

  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={game.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={game.backdropUrl ?? game.coverUrl}
            alt={game.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Ambientní WebGL 3D vrstva — jen na větších obrazovkách (výkon + prostor) */}
      <Hero3DScene className="absolute inset-0 hidden lg:block" />

      {/* Cinematic gradient scrims */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-void via-void/60 to-transparent sm:via-void/30" />
      <div className="grain absolute inset-0" />

      <div className="relative flex h-full max-w-[1600px] flex-col justify-end px-5 pb-28 pt-32 lg:px-10 lg:pb-36 mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="plasma">Doporučujeme</Badge>
              {game.genres.slice(0, 3).map((g) => (
                <Badge key={g.genreId} variant="outline">
                  {g.genre.name}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              <KineticHeading text={game.title} keyProp={game.id} />
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/70">
              {rating > 0 && (
                <span className="flex items-center gap-1.5 font-semibold text-gold">
                  <Star className="h-4 w-4 fill-gold" /> {rating.toFixed(1)} / 10
                </span>
              )}
              <span>{formatDate(game.releaseDate)}</span>
              <span className="hidden sm:inline">
                {game.platforms.slice(0, 4).map((p) => p.platform.name).join(" · ")}
              </span>
            </div>

            <p className="mt-5 line-clamp-3 max-w-xl text-base leading-relaxed text-white/75">
              {game.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2.5">
                <Link href={`/games/${game.slug}`}>
                  <Play className="h-4.5 w-4.5 fill-current" /> Zobrazit detail
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass" className="gap-2.5">
                <Link href={`/games/${game.slug}#trailer`}>
                  <Info className="h-4.5 w-4.5" /> Více informací
                </Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicators */}
        {games.length > 1 && (
          <div className="mt-14 flex items-center gap-6">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {games.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setIndex(i)}
                  className="group relative h-1 w-10 overflow-hidden rounded-full bg-white/20"
                >
                  {i === index && (
                    <motion.span
                      key={game.id}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 7, ease: "linear" }}
                      style={{ originX: 0 }}
                      className="absolute inset-0 bg-plasma-soft"
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
