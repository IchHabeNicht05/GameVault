import { prisma } from "@/lib/prisma";

export async function getUserProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { followers: true, following: true, reviews: true, libraryEntries: true },
      },
      achievements: { include: { achievement: true }, orderBy: { unlockedAt: "desc" } },
      libraryEntries: {
        include: { game: { select: { id: true, title: true, slug: true, coverUrl: true, genres: { include: { genre: true } } } } },
        orderBy: { updatedAt: "desc" },
      },
      wishlist: {
        include: { game: { select: { id: true, title: true, slug: true, coverUrl: true, releaseDate: true } } },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          game: { select: { id: true, title: true, slug: true, coverUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export interface UserStats {
  gamesOwned: number;
  gamesCompleted: number;
  hoursPlayed: number;
  favoriteGenre: string | null;
  averageRating: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [entries, ratings] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId },
      include: { game: { include: { genres: { include: { genre: true } } } } },
    }),
    prisma.rating.findMany({ where: { userId }, select: { value: true } }),
  ]);

  const gamesOwned = entries.length;
  const gamesCompleted = entries.filter((e) => e.status === "COMPLETED").length;
  const hoursPlayed = entries.reduce((sum, e) => sum + e.hoursPlayed, 0);

  const genreCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const g of entry.game.genres) {
      genreCounts.set(g.genre.name, (genreCounts.get(g.genre.name) ?? 0) + 1);
    }
  }
  let favoriteGenre: string | null = null;
  let max = 0;
  for (const [name, count] of genreCounts) {
    if (count > max) {
      max = count;
      favoriteGenre = name;
    }
  }

  const averageRating =
    ratings.length > 0 ? ratings.reduce((s, r) => s + r.value, 0) / ratings.length : 0;

  return { gamesOwned, gamesCompleted, hoursPlayed, favoriteGenre, averageRating };
}

export async function isFollowing(followerId: string, followingId: string) {
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!follow;
}

export async function getActivityFeed(userIds: string[], take = 30) {
  return prisma.activity.findMany({
    where: { userId: { in: userIds } },
    include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getFollowingIds(userId: string) {
  const follows = await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
  return follows.map((f) => f.followingId);
}
