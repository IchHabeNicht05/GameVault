"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "low" | "medium" | "high";

export interface DeviceCapabilities {
  tier: DeviceTier;
  dpr: [number, number];
  particleCount: number;
  enableShadows: boolean;
  reducedMotion: boolean;
  ready: boolean;
}

/**
 * Zjistí, co si zařízení může dovolit, aby 3D scéna byla device-aware:
 * na slabších zařízeních snižujeme rozlišení (DPR), počet částic a vypínáme
 * stíny. Detekce běží až po mountu (potřebuje `window`), proto `ready` —
 * scéna se nemá renderovat dřív, než známe tier, jinak bychom na mobilu
 * krátce vykreslili "high" variantu.
 */
export function useDeviceTier(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>({
    tier: "medium",
    dpr: [1, 1.5],
    particleCount: 500,
    enableShadows: false,
    reducedMotion: false,
    ready: false,
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 768;

    let tier: DeviceTier = "high";
    if (coarsePointer || narrow || cores <= 4 || memory <= 4) tier = "medium";
    if (cores <= 2 || memory <= 2) tier = "low";

    setCaps({
      tier,
      dpr: tier === "high" ? [1, 2] : tier === "medium" ? [1, 1.5] : [0.75, 1],
      particleCount: tier === "high" ? 1400 : tier === "medium" ? 600 : 250,
      enableShadows: tier === "high",
      reducedMotion,
      ready: true,
    });
  }, []);

  return caps;
}