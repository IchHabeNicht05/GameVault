import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Dynamický sitemap — statické stránky + všechny hry z katalogu.
 * Next.js ho automaticky vystaví na /sitemap.xml a re-generuje při buildu
 * (respektive on-demand v produkci podle revalidate nastavení route handlerů,
 * které tu nejsou potřeba — hry se nemění tak často, aby to bylo kritické).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gamevault.example.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/discover`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${baseUrl}/search`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/genres`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const games = await prisma.game.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const gameRoutes: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: game.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...gameRoutes];
}