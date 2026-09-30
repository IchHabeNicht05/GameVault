"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Trophy, Lock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

/**
 * Achievement jako sběratelská karta. Tier (bronze/silver/gold/platinum)
 * určuje barevné schéma, intenzitu záře i odlesk — platinum má navíc
 * "holografický" přeliv, který se posouvá při hoveru, jako u sběratelských
 * karet natočených ke světlu.
 *
 * Nezískaný achievement se vykreslí odbarvený a se zámkem, aby bylo vidět,
 * co jde ještě odemknout (a šlo to použít i jako katalog cílů).
 */
const TIERS = {
  bronze: {
    label: "Bronze",
    ring: "border-[#a97142]/40",
    glow: "shadow-[0_0_30px_-12px_rgba(169,113,66,0.8)]",
    chip: "bg-[#a97142]/15 text-[#d29a6a]",
    iconBg: "from-[#a97142]/30 to-transparent",
  },
  silver: {
    label: "Silver",
    ring: "border-[#b8c0cc]/40",
    glow: "shadow-[0_0_30px_-12px_rgba(184,192,204,0.8)]",
    chip: "bg-[#b8c0cc]/15 text-[#d5dbe4]",
    iconBg: "from-[#b8c0cc]/30 to-transparent",
  },
  gold: {
    label: "Gold",
    ring: "border-gold/45",
    glow: "shadow-[0_0_34px_-10px_rgba(242,184,75,0.9)]",
    chip: "bg-gold/15 text-gold",
    iconBg: "from-gold/30 to-transparent",
  },
  platinum: {
    label: "Platinum",
    ring: "border-plasma-soft/50",
    glow: "shadow-[0_0_40px_-8px_rgba(167,139,250,0.9)]",
    chip: "bg-plasma/20 text-plasma-soft",
    iconBg: "from-plasma/40 to-transparent",
  },
} as const;

type Tier = keyof typeof TIERS;

export interface AchievementCardData {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  unlockedAt?: Date | null;
}

export function AchievementCard({ achievement, locked = false }: { achievement: AchievementCardData; locked?: boolean }) {
  const tier = (achievement.tier in TIERS ? achievement.tier : "bronze") as Tier;
  const style = TIERS[tier];

  // Lucide exportuje ikony pod jménem z DB (např. "Trophy"); fallback na Trophy.
  const iconMap = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const Icon = (!locked && iconMap[achievement.icon]) || Trophy;

  return (
    <motion.div
      whileHover={locked ? undefined : { y: -6, rotateX: 6, rotateY: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={{ transformStyle: "preserve-3d" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-panel/70 p-5 text-center",
        locked ? "border-border-soft opacity-55 grayscale" : cn(style.ring, style.glow)
      )}
    >
      {/* Holografický přeliv — jen platinum, jen při hoveru */}
      {!locked && tier === "platinum" && (
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}

      <div
        className={cn(
          "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br",
          locked ? "from-white/[0.06] to-transparent" : style.iconBg
        )}
      >
        {locked ? <Lock className="h-6 w-6 text-text-muted" /> : <Icon className="h-6 w-6 text-text-primary" />}
      </div>

      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", locked ? "bg-white/[0.06] text-text-muted" : style.chip)}>
        {style.label}
      </span>

      <h4 className="mt-2 font-display text-sm font-medium text-text-primary">{achievement.name}</h4>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">{achievement.description}</p>

      {!locked && achievement.unlockedAt && (
        <p className="mt-3 border-t border-border-soft pt-2.5 font-stat text-[10px] text-text-muted">
          Odemčeno {formatDate(achievement.unlockedAt)}
        </p>
      )}
      {locked && (
        <p className="mt-3 border-t border-border-soft pt-2.5 font-stat text-[10px] text-text-muted">
          Zatím nezískáno
        </p>
      )}
    </motion.div>
  );
}