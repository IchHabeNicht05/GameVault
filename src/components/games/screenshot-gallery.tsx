"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Asymetrická screenshot galerie s lightboxem.
 *
 * Místo uniformní mřížky se opakuje rytmus 5 dlaždic (velká → dvě malé →
 * široká → malá), takže kompozice působí redakčně, ne "bootstrapově".
 * Lightbox podporuje klávesnici (←/→/Esc) a je zavíratelný klikem na pozadí.
 */
const TILE_SPANS = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
];

export function ScreenshotGallery({
  screenshots,
  title,
}: {
  screenshots: { id: string; url: string }[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i !== null ? (i - 1 + screenshots.length) % screenshots.length : null)),
    [screenshots.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i !== null ? (i + 1) % screenshots.length : null)),
    [screenshots.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, prev, next]);

  if (screenshots.length === 0) return null;

  return (
    <>
      <div className="grid auto-rows-[120px] grid-cols-3 gap-3 sm:auto-rows-[160px] sm:grid-cols-4">
        {screenshots.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setOpenIndex(i)}
            data-cursor="view"
            data-cursor-label="Zvětšit"
            aria-label={`Zobrazit screenshot ${i + 1} z ${screenshots.length}`}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border-soft",
              TILE_SPANS[i % TILE_SPANS.length]
            )}
          >
            <Image
              src={s.url}
              alt={`${title} — screenshot ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute bottom-2.5 right-2.5 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Expand className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — prohlížeč screenshotů`}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/92 p-4 backdrop-blur-lg sm:p-10"
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Zavřít"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Předchozí"
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <motion.div
              key={openIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={screenshots[openIndex].url}
                alt={`${title} — screenshot ${openIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Další"
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3.5 py-1.5 font-stat text-xs text-white/80 backdrop-blur-md">
              {openIndex + 1} / {screenshots.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}