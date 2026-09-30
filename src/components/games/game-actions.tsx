"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Bookmark, Check, ChevronDown, Star, Gamepad2, Library } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { LibraryStatus } from "@prisma/client";

const STATUS_LABELS: Record<LibraryStatus, string> = {
  PLAYING: "Právě hraji",
  COMPLETED: "Dokončeno",
  BACKLOG: "V plánu",
  DROPPED: "Odloženo",
};

const STATUS_ICONS: Record<LibraryStatus, React.ReactNode> = {
  PLAYING: <Gamepad2 className="h-4 w-4" />,
  COMPLETED: <Check className="h-4 w-4" />,
  BACKLOG: <Library className="h-4 w-4" />,
  DROPPED: <Library className="h-4 w-4" />,
};

export function GameActions({
  gameId,
  initialStatus,
  initialWishlisted,
  initialRating,
}: {
  gameId: string;
  initialStatus: LibraryStatus | null;
  initialWishlisted: boolean;
  initialRating: number | null;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<LibraryStatus | null>(initialStatus);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function requireAuth(): boolean {
    if (!session?.user) {
      toast.error("Nejdřív se přihlas.", {
        action: { label: "Přihlásit se", onClick: () => router.push("/login") },
      });
      return false;
    }
    return true;
  }

  function setLibraryStatus(next: LibraryStatus) {
    if (!requireAuth()) return;
    startTransition(async () => {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, status: next, progress: next === "COMPLETED" ? 100 : undefined }),
      });
      if (res.ok) {
        setStatus(next);
        toast.success(`Přidáno do knihovny: ${STATUS_LABELS[next]}`);
        router.refresh();
      } else {
        toast.error("Něco se nepovedlo.");
      }
    });
  }

  function toggleWishlist() {
    if (!requireAuth()) return;
    startTransition(async () => {
      const method = wishlisted ? "DELETE" : "POST";
      const url = wishlisted ? `/api/wishlist?gameId=${gameId}` : "/api/wishlist";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({ gameId }) : undefined,
      });
      if (res.ok) {
        setWishlisted((v) => !v);
        toast.success(wishlisted ? "Odebráno ze seznamu přání." : "Přidáno na seznam přání!");
        router.refresh();
      }
    });
  }

  function submitRating(value: number) {
    if (!requireAuth()) return;
    startTransition(async () => {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, value }),
      });
      if (res.ok) {
        setRating(value);
        toast.success(`Ohodnoceno: ${value}/10`);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="lg" className="gap-2" disabled={isPending}>
            {status ? STATUS_ICONS[status] : <Library className="h-4.5 w-4.5" />}
            {status ? STATUS_LABELS[status] : "Přidat do knihovny"}
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {(Object.keys(STATUS_LABELS) as LibraryStatus[]).map((s) => (
            <DropdownMenuItem key={s} onSelect={() => setLibraryStatus(s)} className={cn(status === s && "text-plasma-soft")}>
              {STATUS_ICONS[s]} {STATUS_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="lg"
        variant={wishlisted ? "default" : "outline"}
        className="gap-2"
        onClick={toggleWishlist}
        disabled={isPending}
      >
        <Bookmark className={cn("h-4.5 w-4.5", wishlisted && "fill-current")} />
        {wishlisted ? "Na seznamu přání" : "Přidat do přání"}
      </Button>

      <div className="flex items-center gap-1 rounded-full border border-border-soft bg-white/[0.03] px-3 py-2">
        {Array.from({ length: 10 }).map((_, i) => {
          const value = i + 1;
          const active = (hoverRating ?? rating ?? 0) >= value;
          return (
            <motion.button
              key={value}
              whileTap={{ scale: 0.85 }}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => submitRating(value)}
              className="p-0.5"
              aria-label={`Ohodnotit ${value}/10`}
            >
              <Star className={cn("h-4 w-4 transition-colors", active ? "fill-gold text-gold" : "text-white/20")} />
            </motion.button>
          );
        })}
        {rating && <span className="ml-1.5 font-stat text-xs text-gold">{rating}/10</span>}
      </div>
    </div>
  );
}
