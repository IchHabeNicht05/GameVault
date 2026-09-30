"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ArrowRight, Compass, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KineticHeading } from "@/components/effects/kinetic-heading";

// WebGL scéna se nesmí renderovat na serveru (potřebuje `window`/canvas),
// a zároveň ji nechceme v initial bundlu — dynamic import s ssr:false.
const VaultScene = dynamic(
  () => import("@/components/3d/vault-scene").then((m) => m.VaultScene),
  { ssr: false }
);

/**
 * Scroll-driven cinematic intro: "ENTER THE VAULT".
 *
 * Kontejner je vysoký 300vh a uvnitř drží sticky viewport s 3D scénou.
 * Postup scrollu (0→1) se předává do scény přes plain ref (žádný re-render)
 * a zároveň řídí tři textové "kapitoly", které se prolínají přes sebe:
 *
 *   0.00–0.35  Kapitola 1 — headline + CTA
 *   0.35–0.70  Kapitola 2 — čím GameVault je
 *   0.70–1.00  Kapitola 3 — pozvánka dál do katalogu
 *
 * Výsledek působí jako průlet trezorem, ne jako statický hero s obrázkem.
 */
export function VaultHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Scéna čte ref v useFrame — scroll tak nikdy nespustí React render.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  // Kapitola 1
   const act1Opacity = useTransform(scrollYProgress, [0, 0.20, 0.28], [1, 1, 0]);
  const act1Y = useTransform(scrollYProgress, [0, 0.32], [0, -60]);
  // Kapitola 2
    const act2Opacity = useTransform(scrollYProgress, [0.36, 0.46, 0.62, 0.70], [0, 1, 1, 0]);
  const act2Y = useTransform(scrollYProgress, [0.34, 0.7], [50, -50]);
  // Kapitola 3
    const act3Opacity = useTransform(scrollYProgress, [0.78, 0.88, 1], [0, 1, 1]);
  const act3Y = useTransform(scrollYProgress, [0.72, 1], [50, 0]);
  // Scroll hint zmizí hned po startu
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // Pojistka proti prosvítání: jakmile je kapitola plně průhledná, vyřadíme ji
  // i z vykreslování. Samotná opacity nestačí — stačí zlomek procenta a text
  // za jádrem je pořád matně čitelný.
  const act1Visibility = useTransform(act1Opacity, (v) => (v < 0.02 ? "hidden" : "visible"));
  const act2Visibility = useTransform(act2Opacity, (v) => (v < 0.02 ? "hidden" : "visible"));
  const act3Visibility = useTransform(act3Opacity, (v) => (v < 0.02 ? "hidden" : "visible"));

  // Vinětace se se scrollem přitahuje → pocit sestupu do hloubky
  const vignetteBackground = useTransform(
    scrollYProgress,
    [0, 1],
    [
      "radial-gradient(ellipse at center, transparent 35%, rgba(8,9,13,0.35) 100%)",
      "radial-gradient(ellipse at center, transparent 35%, rgba(8,9,13,0.72) 100%)",
    ]
  );

  return (
    <section ref={containerRef} className="relative -mt-18 h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D vrstva */}
        <div className="absolute inset-0">
          <VaultScene progressRef={progressRef} />
        </div>

        {/* Atmosférická vinětace nad scénou */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: vignetteBackground }} />
        <div className="grain pointer-events-none absolute inset-0" />

        {/* Měkký scrim přímo pod textem — jádro svítí a bílá typografie by se
            přes něj jinak ztrácela. Radiální, aby nebyl vidět jako obdélník. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(8,9,13,0.72) 0%, rgba(8,9,13,0.45) 45%, transparent 75%)",
          }}
        />

        {/* ── Kapitola 1 ─────────────────────────────────── */}
        <motion.div
          style={{ opacity: act1Opacity, y: act1Y, visibility: act1Visibility }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <span className="mb-5 rounded-full border border-plasma/30 bg-plasma/10 px-4 py-1.5 font-stat text-[11px] uppercase tracking-[0.2em] text-plasma-soft">
            Enter the Vault
          </span>
          <h1 className="max-w-4xl font-display text-[10vw] font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-8xl">
            <KineticHeading text="DISCOVER YOUR NEXT WORLD." />
          </h1>
          <p className="mt-6 max-w-lg text-base text-white/60 sm:text-lg">
            Jedno místo pro každou hru, kterou miluješ.
          </p>
          <div className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/search">
                Prozkoumat katalog <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass" className="gap-2">
              <Link href="/discover">
                <Compass className="h-4 w-4" /> Objevovat komunitu
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* ── Kapitola 2 ─────────────────────────────────── */}
        <motion.div
          style={{ opacity: act2Opacity, y: act2Y, visibility: act2Visibility }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Tvoje knihovna. Tvůj postup.
            <br />
            <span className="text-gradient-plasma">Tvoje herní identita.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55">
            Sleduj, co hraješ, co jsi dohrál a co tě teprve čeká. Hodnoť, recenzuj a porovnávej
            svůj vkus s ostatními hráči.
          </p>
        </motion.div>

        {/* ── Kapitola 3 ─────────────────────────────────── */}
        <motion.div
          style={{ opacity: act3Opacity, y: act3Y, visibility: act3Visibility }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Trezor je otevřený.
          </h2>
          <p className="mt-5 max-w-lg text-base text-white/55">
            Níže čeká katalog — od legend po tituly, které teprve vyjdou.
          </p>
          <ChevronDown className="mt-8 h-6 w-6 animate-bounce text-plasma-soft" />
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="font-stat text-[10px] uppercase tracking-[0.25em] text-white/40">Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}