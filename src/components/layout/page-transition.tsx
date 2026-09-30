"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Přechod mezi stránkami — obsah nové route se vynoří zespodu místo tvrdého
 * překliknutí. Klíčováno přes `pathname`, takže se přehraje při navigaci.
 *
 * Záměrně jen `opacity` + `y`, žádný `filter`: CSS filtr na předkovi vytváří
 * nový containing block, což rozbíjí měření `position: sticky` potomků —
 * konkrétně scroll-driven hero, jehož `useScroll` progress pak nedojede
 * na krajní hodnoty a kapitoly se překrývají.
 *
 * Záměrně krátké (0.35s) a decentní: má navigaci zjemnit, ne zdržovat.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}