"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary pro segmenty pod root layoutem (Next.js App Router konvence
 * — soubor `error.tsx` MUSÍ být Client Component). Zachytí neošetřenou
 * chybu při renderu stránky a nabídne uživateli cestu ven, místo aby appka
 * zůstala na bílé/prázdné obrazovce.
 *
 * Chybu jen logujeme do konzole — na produkci sem časem přijde Sentry apod.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("GameVault — neošetřená chyba:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-ember/10">
        <AlertTriangle className="h-10 w-10 text-ember-soft" />
      </div>
      <span className="font-stat text-sm uppercase tracking-[0.2em] text-text-muted">Neočekávaná chyba</span>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary sm:text-4xl">Něco se pokazilo.</h1>
      <p className="mt-3 max-w-md text-text-muted">
        Omlouváme se, nastala neočekávaná chyba. Zkus to prosím znovu — pokud problém přetrvává, napiš nám.
      </p>
      {error.digest && (
        <p className="mt-2 font-stat text-xs text-text-muted/60">Chybový kód: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="gap-2" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Zkusit znovu
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" /> Zpět na Domů
          </Link>
        </Button>
      </div>
    </div>
  );
}