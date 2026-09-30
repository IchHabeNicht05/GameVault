"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Vlastní kurzor: tenký prstenec sleduje myš s jemným zpožděním (spring),
 * uvnitř plave malá tečka 1:1 s pointerem. Nad libovolným prvkem s
 * `data-cursor="pointer"` (odkazy, tlačítka, karty) se prstenec zvětší a
 * "nasákne" barvou — nad `data-cursor="view"` se místo toho objeví label.
 *
 * Na dotykových zařízeních se vůbec nerenderuje (žádný `mousemove` = žádný smysl).
 */
export function MagneticCursor() {
  const [isTouch, setIsTouch] = useState(true);
  const [variant, setVariant] = useState<"default" | "pointer" | "view">("default");
  const [label, setLabel] = useState<string | null>(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const ringX = useSpring(mouseX, { stiffness: 500, damping: 40, mass: 0.5 });
  const ringY = useSpring(mouseY, { stiffness: 500, damping: 40, mass: 0.5 });

  const frame = useRef<number | null>(null);

  useEffect(() => {
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    setIsTouch(!hasFinePointer);
    if (!hasFinePointer) return;

    function onMove(e: MouseEvent) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        const target = el?.closest("[data-cursor]") as HTMLElement | null;
        const kind = (target?.dataset.cursor as "pointer" | "view" | undefined) ?? "default";
        setVariant(kind);
        setLabel(target?.dataset.cursorLabel ?? null);
      });
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  if (isTouch) return null;

  return (
    <>
      {/* Rychlá tečka — 1:1 s pointerem */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[999] h-1.5 w-1.5 rounded-full bg-plasma-soft mix-blend-difference"
        style={{ x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Pomalejší prstenec — spring dojezd */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[998] flex items-center justify-center rounded-full border mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: variant === "default" ? 32 : variant === "pointer" ? 56 : 84,
          height: variant === "default" ? 32 : variant === "pointer" ? 56 : 84,
          borderColor: "rgba(255,255,255,0.9)",
          backgroundColor: variant === "view" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.02)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {variant === "view" && label && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-black">{label}</span>
        )}
      </motion.div>
    </>
  );
}