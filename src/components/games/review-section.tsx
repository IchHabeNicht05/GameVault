"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Heart, MessageCircle, AlertTriangle, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { initials, timeAgo, cn } from "@/lib/utils";

interface ReviewUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface ReviewData {
  id: string;
  title: string;
  content: string;
  isSpoiler: boolean;
  createdAt: Date;
  playtimeAtReview: number;
  user: ReviewUser;
  _count: { likes: number; comments: number };
}

export function ReviewSection({ gameId, reviews }: { gameId: string; reviews: ReviewData[] }) {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const alreadyReviewed = reviews.some((r) => r.user.id === session?.user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-medium text-text-primary">
          Recenze <span className="text-text-muted">({reviews.length})</span>
        </h2>
        {session?.user && !alreadyReviewed && !showForm && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowForm(true)}>
            <PenSquare className="h-4 w-4" /> Napsat recenzi
          </Button>
        )}
      </div>

      {showForm && (
        <ReviewForm gameId={gameId} onDone={() => setShowForm(false)} />
      )}

      {reviews.length === 0 && !showForm && (
        <p className="rounded-xl border border-dashed border-border-soft p-8 text-center text-sm text-text-muted">
          Zatím žádné recenze. Buď první, kdo se podělí o svůj názor!
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ gameId, onDone }: { gameId: string; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { gameId, isSpoiler: false, title: "", content: "" },
  });

  function onSubmit(data: ReviewInput) {
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Recenze byla publikována!");
        onDone();
        router.refresh();
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.error ?? "Něco se nepovedlo.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border-soft bg-panel/60 p-5">
      <div>
        <Input placeholder="Název tvé recenze…" {...register("title")} />
        {errors.title && <p className="mt-1.5 text-xs text-ember">{errors.title.message}</p>}
      </div>
      <div>
        <Textarea rows={5} placeholder="Co si o téhle hře myslíš?" {...register("content")} />
        {errors.content && <p className="mt-1.5 text-xs text-ember">{errors.content.message}</p>}
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <Checkbox checked={watch("isSpoiler")} onCheckedChange={(v) => setValue("isSpoiler", v === true)} />
          Obsahuje spoilery
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Zrušit
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Publikuji…" : "Publikovat recenzi"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [revealed, setRevealed] = useState(!review.isSpoiler);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleLike() {
    if (!session?.user) {
      toast.error("Nejdřív se přihlas.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/reviews/${review.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount((c) => c + (data.liked ? 1 : -1));
      }
    });
  }

  function submitComment() {
    if (!session?.user) {
      toast.error("Nejdřív se přihlas.");
      return;
    }
    if (!comment.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, content: comment }),
      });
      if (res.ok) {
        setComment("");
        toast.success("Komentář přidán.");
        router.refresh();
      }
    });
  }

  return (
    <article className="rounded-2xl border border-border-soft bg-panel/60 p-5 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${review.user.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user.avatarUrl ?? undefined} />
            <AvatarFallback>{initials(review.user.name ?? review.user.username)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/profile/${review.user.username}`} className="font-semibold text-text-primary hover:text-plasma-soft">
              @{review.user.username}
            </Link>
            <span className="text-xs text-text-muted">{timeAgo(review.createdAt)}</span>
            {review.playtimeAtReview > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {Math.round(review.playtimeAtReview)}h odehráno
              </Badge>
            )}
            {review.isSpoiler && (
              <Badge variant="ember" className="gap-1 text-[10px]">
                <AlertTriangle className="h-3 w-3" /> Spoiler
              </Badge>
            )}
          </div>
          <h3 className="mt-2 font-display text-base font-medium text-text-primary">{review.title}</h3>

          {revealed ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{review.content}</p>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="mt-2 rounded-lg border border-dashed border-border-strong px-4 py-3 text-sm text-text-muted hover:text-text-secondary"
            >
              Tato recenze obsahuje spoilery. Klikni pro zobrazení.
            </button>
          )}

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={toggleLike}
              disabled={isPending}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                liked ? "text-ember" : "text-text-muted hover:text-ember-soft"
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {likeCount}
            </button>
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              <MessageCircle className="h-4 w-4" /> {review._count.comments}
            </button>
          </div>

          {showComments && (
            <div className="mt-4 space-y-3 border-t border-border-soft pt-4">
              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Napiš komentář…"
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                />
                <Button size="sm" onClick={submitComment} disabled={isPending}>
                  Odeslat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
