"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { LibraryStatus } from "@prisma/client";

export interface LibraryEntryCardData {
  id: string;
  gameId: string;
  status: LibraryStatus;
  progress: number;
  hoursPlayed: number;
  game: { title: string; slug: string; coverUrl: string };
}

const STATUS_LABELS: Record<LibraryStatus, string> = {
  PLAYING: "Právě hraji",
  COMPLETED: "Dokončeno",
  BACKLOG: "V plánu",
  DROPPED: "Odloženo",
};

export function LibraryEntryCard({ entry }: { entry: LibraryEntryCardData }) {
  const router = useRouter();
  const [progress, setProgress] = useState(entry.progress);
  const [isPending, startTransition] = useTransition();

  function updateProgress(value: number) {
    setProgress(value);
    startTransition(async () => {
      await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: entry.gameId,
          status: value >= 100 ? "COMPLETED" : entry.status === "BACKLOG" ? "PLAYING" : entry.status,
          progress: value,
        }),
      });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await fetch(`/api/library?gameId=${entry.gameId}`, { method: "DELETE" });
      toast.success("Odebráno z knihovny.");
      router.refresh();
    });
  }

  return (
    <div className="group flex gap-4 rounded-xl border border-border-soft bg-panel/60 p-4 transition-colors hover:border-border-strong">
      <Link href={`/games/${entry.game.slug}`} className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg">
        <Image src={entry.game.coverUrl} alt={entry.game.title} fill className="object-cover" />
      </Link>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/games/${entry.game.slug}`} className="font-display font-medium text-text-primary hover:text-plasma-soft">
              {entry.game.title}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={entry.status === "COMPLETED" ? "emerald" : entry.status === "PLAYING" ? "plasma" : "default"}>
                {STATUS_LABELS[entry.status]}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock className="h-3 w-3" /> {entry.hoursPlayed}h
              </span>
            </div>
          </div>
          <button onClick={remove} disabled={isPending} className="rounded-md p-1.5 text-text-muted opacity-0 transition-opacity hover:bg-white/10 hover:text-ember group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
            <span>Postup</span>
            <span className="font-stat text-text-secondary">{progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => updateProgress(Number(e.target.value))}
            className="w-full accent-plasma"
          />
          <Progress value={progress} className="mt-1" />
        </div>
      </div>
    </div>
  );
}
