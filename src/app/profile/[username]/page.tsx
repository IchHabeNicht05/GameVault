import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gamepad2, CheckCircle2, Clock, Star, Heart } from "lucide-react";
import { getUserProfile, getUserStats, isFollowing } from "@/lib/data/users";
import { prisma } from "@/lib/prisma";
import { AchievementCard } from "@/components/profile/achievement-card";
import { auth } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/profile/stat-card";
import { LibraryStatusChart } from "@/components/profile/library-status-chart";
import { FollowButton } from "@/components/social/follow-button";
import { GameCard } from "@/components/games/game-card";
import { initials, formatHours, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getUserProfile(username);
  if (!profile) notFound();

    const [session, stats, allAchievements] = await Promise.all([
    auth(),
    getUserStats(profile.id),
    prisma.achievement.findMany({ orderBy: { tier: "asc" } }),
  ]);

  const unlockedMap = new Map(profile.achievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

  const following = session?.user ? await isFollowing(session.user.id, profile.id) : false;

  const statusCounts = {
    PLAYING: profile.libraryEntries.filter((e) => e.status === "PLAYING").length,
    COMPLETED: profile.libraryEntries.filter((e) => e.status === "COMPLETED").length,
    BACKLOG: profile.libraryEntries.filter((e) => e.status === "BACKLOG").length,
    DROPPED: profile.libraryEntries.filter((e) => e.status === "DROPPED").length,
  };

  return (
    <div className="pb-24">
      {/* ── Banner ────────────────────────────────────────────── */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <Image
          src={profile.bannerUrl ?? "https://placehold.co/1600x400/12141c/1f2330.png?text=%20"}
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-void/60" />
      </div>

      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <div className="-mt-16 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-32 w-32 border-4 border-void shadow-2xl">
              <AvatarImage src={profile.avatarUrl ?? undefined} />
              <AvatarFallback className="text-2xl">{initials(profile.name ?? profile.username)}</AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                {profile.name ?? profile.username}
              </h1>
              <p className="text-text-muted">@{profile.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-4 text-sm">
              <span>
                <strong className="font-stat text-text-primary">{profile._count.followers}</strong>{" "}
                <span className="text-text-muted">sledujících</span>
              </span>
              <span>
                <strong className="font-stat text-text-primary">{profile._count.following}</strong>{" "}
                <span className="text-text-muted">sleduje</span>
              </span>
            </div>
            {session?.user && <FollowButton targetUserId={profile.id} initialFollowing={following} />}
          </div>
        </div>

        {profile.bio && <p className="mt-5 max-w-2xl text-text-secondary">{profile.bio}</p>}
        <p className="mt-2 text-xs text-text-muted">Na GameVault od {formatDate(profile.createdAt)}</p>

        {/* ── Stats grid ──────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={<Gamepad2 className="h-5 w-5" />} label="Her ve knihovně" value={String(stats.gamesOwned)} accent="plasma" />
          <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Dokončeno" value={String(stats.gamesCompleted)} accent="emerald" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Odehráno" value={formatHours(stats.hoursPlayed)} accent="gold" />
          <StatCard icon={<Heart className="h-5 w-5" />} label="Oblíbený žánr" value={stats.favoriteGenre ?? "—"} accent="ember" />
          <StatCard icon={<Star className="h-5 w-5" />} label="Průměrné hodnocení" value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"} accent="gold" />
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="mt-12">
          <Tabs defaultValue="library">
            <TabsList>
              <TabsTrigger value="library">Knihovna</TabsTrigger>
              <TabsTrigger value="wishlist">Seznam přání</TabsTrigger>
              <TabsTrigger value="reviews">Recenze</TabsTrigger>
              <TabsTrigger value="achievements">Achievementy</TabsTrigger>
            </TabsList>

            <TabsContent value="library">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
                <div className="flex flex-wrap gap-4">
                  {profile.libraryEntries.length === 0 && (
                    <p className="text-sm text-text-muted">Knihovna je zatím prázdná.</p>
                  )}
                  {profile.libraryEntries.map((entry) => (
                    <Link key={entry.id} href={`/games/${entry.game.slug}`} className="w-[140px] shrink-0">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border-soft">
                        <Image src={entry.game.coverUrl} alt={entry.game.title} fill className="object-cover" />
                        <Badge className="absolute left-1.5 top-1.5 text-[9px]" variant={entry.status === "COMPLETED" ? "emerald" : entry.status === "PLAYING" ? "plasma" : "default"}>
                          {entry.status === "PLAYING" ? "Hraji" : entry.status === "COMPLETED" ? "Hotovo" : entry.status === "BACKLOG" ? "Plán" : "Odloženo"}
                        </Badge>
                      </div>
                      <p className="mt-1.5 truncate text-xs text-text-secondary">{entry.game.title}</p>
                    </Link>
                  ))}
                </div>
                <div className="rounded-2xl border border-border-soft bg-panel/60 p-5">
                  <h3 className="mb-3 font-display text-sm font-semibold text-text-primary">Rozložení knihovny</h3>
                  <LibraryStatusChart
                    data={[
                      { name: "Právě hraji", value: statusCounts.PLAYING },
                      { name: "Dokončeno", value: statusCounts.COMPLETED },
                      { name: "V plánu", value: statusCounts.BACKLOG },
                      { name: "Odloženo", value: statusCounts.DROPPED },
                    ]}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wishlist">
              <div className="flex flex-wrap gap-4">
                {profile.wishlist.length === 0 && <p className="text-sm text-text-muted">Seznam přání je prázdný.</p>}
                {profile.wishlist.map((w) => (
                  <Link key={w.id} href={`/games/${w.game.slug}`} className="w-[140px] shrink-0">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border-soft">
                      <Image src={w.game.coverUrl} alt={w.game.title} fill className="object-cover" />
                    </div>
                    <p className="mt-1.5 truncate text-xs text-text-secondary">{w.game.title}</p>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {profile.reviews.length === 0 && <p className="text-sm text-text-muted">Zatím žádné recenze.</p>}
                {profile.reviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/games/${review.game.slug}`}
                    className="flex gap-4 rounded-xl border border-border-soft bg-panel/60 p-4 transition-colors hover:border-border-strong"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg">
                      <Image src={review.game.coverUrl} alt={review.game.title} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">{review.game.title}</p>
                      <h4 className="font-display font-medium text-text-primary">{review.title}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{review.content}</p>
                      <div className="mt-2 flex gap-3 text-xs text-text-muted">
                        <span>❤ {review._count.likes}</span>
                        <span>💬 {review._count.comments}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <p className="mb-5 text-sm text-text-muted">
                Odemčeno{" "}
                <span className="font-stat text-text-primary">
                  {profile.achievements.length}/{allAchievements.length}
                </span>{" "}
                achievementů
              </p>
              <div className="tilt-perspective grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {allAchievements.map((achievement) => {
                  const unlockedAt = unlockedMap.get(achievement.id);
                  return (
                    <AchievementCard
                      key={achievement.id}
                      achievement={{ ...achievement, unlockedAt }}
                      locked={!unlockedAt}
                    />
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
