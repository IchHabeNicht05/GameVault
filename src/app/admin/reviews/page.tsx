import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ReviewDeleteButton } from "@/components/admin/review-delete-button";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Recenze" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { username: true } },
      game: { select: { title: true, slug: true } },
      _count: { select: { likes: true, comments: true, reports: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Moderace recenzí</h1>
      <p className="mt-1 text-text-muted">{reviews.length} nejnovějších recenzí.</p>

      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-border-soft bg-panel/40 p-4">
            <div>
              <p className="text-xs text-text-muted">
                @{r.user.username} ·{" "}
                <Link href={`/games/${r.game.slug}`} className="hover:text-plasma-soft">{r.game.title}</Link> · {timeAgo(r.createdAt)}
              </p>
              <h3 className="mt-1 font-display font-medium text-text-primary">{r.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{r.content}</p>
              <div className="mt-2 flex gap-3 text-xs text-text-muted">
                <span>❤ {r._count.likes}</span>
                <span>💬 {r._count.comments}</span>
                {r._count.reports > 0 && <span className="text-ember">🚩 {r._count.reports} nahlášení</span>}
              </div>
            </div>
            <ReviewDeleteButton reviewId={r.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
