import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const gameCardInclude = {
  genres: { include: { genre: true } },
  platforms: { include: { platform: true } },
  ratings: { select: { value: true } },
  _count: { select: { reviews: true, wishlistedBy: true, libraryEntries: true } },
} satisfies Prisma.GameInclude;

export type GameCardData = Prisma.GameGetPayload<{ include: typeof gameCardInclude }>;

export function averageRating(ratings: { value: number }[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;
}

export async function getFeaturedGames(take = 5) {
  return prisma.game.findMany({
    where: { isFeatured: true },
    include: gameCardInclude,
    orderBy: { releaseDate: "desc" },
    take,
  });
}

export async function getTrendingGames(take = 12) {
  return prisma.game.findMany({
    where: { isTrending: true },
    include: gameCardInclude,
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function getPopularGames(take = 12) {
  const games = await prisma.game.findMany({
    include: gameCardInclude,
    take: 60,
  });
  return games
    .sort((a, b) => b._count.libraryEntries + b.ratings.length - (a._count.libraryEntries + a.ratings.length))
    .slice(0, take);
}

export async function getRecentlyReleasedGames(take = 12) {
  return prisma.game.findMany({
    where: { releaseDate: { lte: new Date() } },
    include: gameCardInclude,
    orderBy: { releaseDate: "desc" },
    take,
  });
}

export async function getUpcomingGames(take = 12) {
  return prisma.game.findMany({
    where: { releaseDate: { gt: new Date() } },
    include: gameCardInclude,
    orderBy: { releaseDate: "asc" },
    take,
  });
}

export async function getAllGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { games: true } } },
  });
}

export async function getAllPlatforms() {
  return prisma.platform.findMany({ orderBy: { name: "asc" } });
}

export const gameDetailInclude = {
  genres: { include: { genre: true } },
  platforms: { include: { platform: true } },
  developers: { include: { developer: true } },
  publishers: { include: { publisher: true } },
  screenshots: true,
  ratings: { select: { value: true } },
  reviews: {
    include: {
      user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
  _count: { select: { wishlistedBy: true, libraryEntries: true } },
} satisfies Prisma.GameInclude;

export async function getGameBySlug(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    include: gameDetailInclude,
  });
}

export interface SearchFilters {
  query?: string;
  genre?: string;
  platformFamily?: string;
  year?: string;
  sort?: "popular" | "newest" | "rating" | "az";
}

export async function searchGames(filters: SearchFilters, page = 1, pageSize = 24) {
  const where: Prisma.GameWhereInput = {};

  if (filters.query) {
    where.title = { contains: filters.query, mode: "insensitive" };
  }
  if (filters.genre) {
    where.genres = { some: { genre: { slug: filters.genre } } };
  }
  if (filters.platformFamily) {
    where.platforms = { some: { platform: { family: filters.platformFamily } } };
  }
  if (filters.year) {
    const year = Number(filters.year);
    where.releaseDate = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    };
  }

  const orderBy: Prisma.GameOrderByWithRelationInput =
    filters.sort === "newest"
      ? { releaseDate: "desc" }
      : filters.sort === "az"
        ? { title: "asc" }
        : { createdAt: "desc" };

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      include: gameCardInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.game.count({ where }),
  ]);

  return { games, total, pages: Math.ceil(total / pageSize) };
}
