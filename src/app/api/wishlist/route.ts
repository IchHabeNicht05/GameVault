import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

const schema = z.object({ gameId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neplatná data." }, { status: 400 });
  const { gameId } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { title: true, slug: true, coverUrl: true } });
  if (!game) return NextResponse.json({ error: "Hra nenalezena." }, { status: 404 });

  const item = await prisma.wishlist.upsert({
    where: { userId_gameId: { userId: session.user.id, gameId } },
    create: { userId: session.user.id, gameId },
    update: {},
  });

  await logActivity(session.user.id, "WISHLIST_ADD", {
    gameTitle: game.title,
    gameSlug: game.slug,
    gameCoverUrl: game.coverUrl,
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  if (!gameId) return NextResponse.json({ error: "Chybí gameId." }, { status: 400 });

  await prisma.wishlist.deleteMany({ where: { userId: session.user.id, gameId } });
  return NextResponse.json({ ok: true });
}
