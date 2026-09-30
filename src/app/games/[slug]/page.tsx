import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Calendar, Users, Bookmark, Building2, Award } from "lucide-react";
import { getGameBySlug, averageRating } from "@/lib/data/games";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/games/game-card";
import { GameActions } from "@/components/games/game-actions";
import { ReviewSection } from "@/components/games/review-section";
import { ScreenshotGallery } from "@/components/games/screenshot-gallery";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return {};
  return {
    title: game.title,
    description: game.description.slice(0, 160),
  };
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const session = await auth();
  let libraryStatus = null;
  let wishlisted = false;
  let userRating: number | null = null;

  if (session?.user) {
    const [entry, wish, rating] = await Promise.all([
      prisma.libraryEntry.findUnique({ where: { userId_gameId: { userId: session.user.id, gameId: game.id } } }),
      prisma.wishlist.findUnique({ where: { userId_gameId: { userId: session.user.id, gameId: game.id } } }),
      prisma.rating.findUnique({ where: { userId_gameId: { userId: session.user.id, gameId: game.id } } }),
    ]);
    libraryStatus = entry?.status ?? null;
    wishlisted = !!wish;
    userRating = rating?.value ?? null;
  }

  const rating = averageRating(game.ratings);

  return (
    <div className="pb-24">
      {/* ── Cinematic backdrop hero ──────────────────────────── */}
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
        <Image src={game.backdropUrl ?? game.coverUrl} alt={game.title} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/20 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-[1600px] items-end gap-8 px-5 pb-14 pt-32 lg:px-10">
          <div className="hidden shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl sm:block">
            <Image src={game.coverUrl} alt={game.title} width={220} height={293} className="h-[293px] w-[220px] object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {game.genres.map((g) => (
                <Badge key={g.genreId} variant="outline">
                  {g.genre.name}
                </Badge>
              ))}
              {game.esrbRating && <Badge variant="default">{game.esrbRating}</Badge>}
            </div>

            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {game.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/70">
              {rating > 0 && (
                <span className="flex items-center gap-2">
                  <StarRating value={(rating / 10) * 5} size="md" />
                  <span className="font-stat font-semibold text-gold">{rating.toFixed(1)}</span>
                  <span className="text-white/50">({game.ratings.length})</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(game.releaseDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {game._count.libraryEntries} hráčů
              </span>
              <span className="flex items-center gap-1.5">
                <Bookmark className="h-4 w-4" /> {game._count.wishlistedBy} na seznamu přání
              </span>
            </div>

            <div className="mt-8">
              <GameActions
                gameId={game.id}
                initialStatus={libraryStatus}
                initialWishlisted={wishlisted}
                initialRating={userRating}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-5 pt-12 lg:grid-cols-[1fr_320px] lg:px-10">
        {/* ── Main column ──────────────────────────────────────── */}
        <div className="space-y-14">
          <section>
            <h2 className="font-display text-2xl font-medium text-text-primary">O hře</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-text-secondary">{game.description}</p>
          </section>

          {game.trailerUrl && (
            <section id="trailer">
              <h2 className="mb-4 font-display text-2xl font-medium text-text-primary">Trailer</h2>
              <div className="aspect-video overflow-hidden rounded-2xl border border-border-soft bg-black">
                <iframe
                  src={game.trailerUrl}
                  title={`${game.title} trailer`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {game.screenshots.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-medium text-text-primary">Screenshoty</h2>
              <ScreenshotGallery screenshots={game.screenshots} title={game.title} />
            </section>
          )}

          <ReviewSection
            gameId={game.id}
            reviews={game.reviews.map((r) => ({
              id: r.id,
              title: r.title,
              content: r.content,
              isSpoiler: r.isSpoiler,
              createdAt: r.createdAt,
              playtimeAtReview: r.playtimeAtReview,
              user: r.user,
              _count: r._count,
            }))}
          />
        </div>

        {/* ── Sidebar metadata ─────────────────────────────────── */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border-soft bg-panel/60 p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
              Informace o hře
            </h3>
            <dl className="mt-4 space-y-4 text-sm">
              <InfoRow icon={<Building2 className="h-4 w-4" />} label="Vývojáři">
                {game.developers.map((d) => d.developer.name).join(", ") || "—"}
              </InfoRow>
              <InfoRow icon={<Award className="h-4 w-4" />} label="Vydavatelé">
                {game.publishers.map((p) => p.publisher.name).join(", ") || "—"}
              </InfoRow>
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Datum vydání">
                {formatDate(game.releaseDate)}
              </InfoRow>
              {game.metacritic && (
                <InfoRow icon={<Star className="h-4 w-4" />} label="Metacritic">
                  <span
                    className={cn(
                      "font-stat font-bold",
                      game.metacritic >= 75 ? "text-emerald" : game.metacritic >= 50 ? "text-gold" : "text-ember"
                    )}
                  >
                    {game.metacritic}
                  </span>
                </InfoRow>
              )}
            </dl>

            <div className="mt-5 border-t border-border-soft pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Platformy</h4>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {game.platforms.map((p) => (
                  <Badge key={p.platformId} variant="default">
                    {p.platform.name}
                  </Badge>
                ))}
              </div>
            </div>

            {game.website && (
              <Link
                href={game.website}
                target="_blank"
                className="mt-5 block rounded-lg border border-border-strong py-2.5 text-center text-sm font-semibold text-text-primary transition-colors hover:border-plasma/40 hover:text-plasma-soft"
              >
                Oficiální web ↗
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-text-muted">
        {icon} {label}
      </span>
      <span className="text-right text-text-primary">{children}</span>
    </div>
  );
}
