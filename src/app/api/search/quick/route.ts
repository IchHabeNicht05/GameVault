import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Odlehčený search endpoint pro ⌘K Command Search overlay — vrací jen pár
 * nejrelevantnějších her s minimem dat (žádné recenze/hodnocení), aby
 * odpověď byla co nejrychlejší při psaní (typeahead).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ games: [] });
  }

  const games = await prisma.game.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    select: {
      id: true,
      slug: true,
      title: true,
      coverUrl: true,
      releaseDate: true,
      genres: { include: { genre: { select: { name: true } } }, take: 2 },
    },
    orderBy: { title: "asc" },
    take: 8,
  });

  return NextResponse.json({ games });
}