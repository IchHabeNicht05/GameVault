"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Obalí libovolný obsah (typicky GameCard) 3D náklonem podle pozice kurzoru
 * a pohyblivým "leskem" — jemným radiálním highlightem, co sleduje myš po
 * povrchu karty, jako by odrážel světlo. Na dotykových zařízeních (žádný
 * `mousemove`) zůstává karta plochá — žádná degradace, jen bez efektu.
 */
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [0, 1], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-10, 10]), springConfig);
  const glareX = useSpring(useTransform(x, [0, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(y, [0, 1], [0, 100]), springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div className="tilt-perspective">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("relative", className)}
      >
        {children}
        <TiltGlare glareX={glareX} glareY={glareY} />
      </motion.div>
    </div>
  );
}

function TiltGlare({ glareX, glareY }: { glareX: MotionValue<number>; glareY: MotionValue<number> }) {
  const background = useTransform([glareX, glareY], ([gx, gy]) =>
    `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.25), transparent 55%)`
  );

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background }}
    />
  );
}