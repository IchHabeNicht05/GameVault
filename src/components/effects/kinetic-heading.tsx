"use client";

import { motion } from "framer-motion";

/**
 * Rozdělí nadpis na slova a při mountu je postupně "vystřelí" do pozice
 * s lehkým 3D naklopením a odostřením (blur → sharp) — použito pro hero
 * nadpis, aby první dojem z homepage/game detailu nebyl statický text,
 * ale krátká kinetická sekvence.
 *
 * `keyProp` (typicky slug/id aktuální hry) vynutí remount a přehrání
 * animace při každé změně obsahu, např. při rotaci hero karuselu.
 */
export function KineticHeading({
  text,
  className,
  keyProp,
}: {
  text: string;
  className?: string;
  keyProp?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className} key={keyProp}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 pr-[0.28em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotateX: -40, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: "0%", rotateX: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.7,
              delay: 0.05 * i,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ transformOrigin: "bottom" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}