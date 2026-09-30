import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ratingSchema } from "@/lib/validations/review";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const parsed = ratingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neplatná data." }, { status: 400 });
  const { gameId, value } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { title: true, slug: true } });
  if (!game) return NextResponse.json({ error: "Hra nenalezena." }, { status: 404 });

  const rating = await prisma.rating.upsert({
    where: { userId_gameId: { userId: session.user.id, gameId } },
    create: { userId: session.user.id, gameId, value },
    update: { value },
  });

  await logActivity(session.user.id, "RATING_POSTED", { gameTitle: game.title, gameSlug: game.slug, rating: value });

  return NextResponse.json({ rating });
}
