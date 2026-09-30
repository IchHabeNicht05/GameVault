import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivityFeed, getFollowingIds } from "@/lib/data/users";
import { ActivityFeed } from "@/components/social/activity-feed";
import { GameCarousel } from "@/components/games/game-carousel";
import { getTrendingGames } from "@/lib/data/games";
import { Users } from "lucide-react";

export const metadata = { title: "Objevovat" };

export default async function DiscoverPage() {
  const session = await auth();
  const trending = await getTrendingGames(12);

  let activities: Awaited<ReturnType<typeof getActivityFeed>> = [];
  let suggestedUsers: { id: string; username: string; name: string | null; avatarUrl: string | null; _count: { followers: number } }[] = [];

  if (session?.user) {
    const followingIds = await getFollowingIds(session.user.id);
    const feedUserIds = followingIds.length > 0 ? [...followingIds, session.user.id] : await prisma.user
      .findMany({ take: 30, select: { id: true } })
      .then((users) => users.map((u) => u.id));
    activities = await getActivityFeed(feedUserIds, 30);

    suggestedUsers = await prisma.user.findMany({
      where: { id: { notIn: [...followingIds, session.user.id] } },
      select: { id: true, username: true, name: true, avatarUrl: true, _count: { select: { followers: true } } },
      orderBy: { followers: { _count: "desc" } },
      take: 5,
    });
  } else {
    const allUserIds = await prisma.user.findMany({ take: 30, select: { id: true } });
    activities = await getActivityFeed(allUserIds.map((u) => u.id), 30);
  }

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-[1600px] px-5 pt-12 lg:px-10">
        <h1 className="font-display text-3xl font-semibold text-text-primary">Objevovat</h1>
        <p className="mt-1 text-text-muted">Co dělá komunita hráčů právě teď.</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border-soft bg-panel/40 p-3">
            <ActivityFeed activities={activities} />
          </div>

          {suggestedUsers.length > 0 && (
            <aside className="h-fit rounded-2xl border border-border-soft bg-panel/60 p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-text-primary">
                <Users className="h-4 w-4" /> Doporučení hráči
              </h3>
              <div className="mt-4 space-y-3">
                {suggestedUsers.map((u) => (
                  <a key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.04]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-plasma-dim to-panel-raised text-xs font-semibold text-text-primary">
                      {(u.name ?? u.username).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{u.name ?? u.username}</p>
                      <p className="text-xs text-text-muted">{u._count.followers} sledujících</p>
                    </div>
                  </a>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      <div className="mt-12">
        <GameCarousel title="Trending mezi hráči" games={trending} accent="ember" />
      </div>
    </div>
  );
}
