import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/review";
import { logActivity } from "@/lib/activity";
import { checkAndUnlockAchievements } from "@/lib/achievements";

import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  // 10 recenzí za hodinu na uživatele — reálný hráč tolik nenapíše najednou,
  // ale zastaví to skript, co by chtěl zaplavit katalog spamem.
  const limit = await checkRateLimit("review", session.user.id, 10, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Příliš mnoho recenzí najednou. Zkus to za chvíli." }, { status: 429 });
  }

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data." }, { status: 400 });
  }
  const { gameId, title, content, isSpoiler } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { title: true, slug: true } });
  if (!game) return NextResponse.json({ error: "Hra nenalezena." }, { status: 404 });

  const libraryEntry = await prisma.libraryEntry.findUnique({
    where: { userId_gameId: { userId: session.user.id, gameId } },
  });

  const review = await prisma.review.upsert({
    where: { userId_gameId: { userId: session.user.id, gameId } },
    create: {
      userId: session.user.id,
      gameId,
      title,
      content,
      isSpoiler,
      playtimeAtReview: libraryEntry?.hoursPlayed ?? 0,
    },
    update: { title, content, isSpoiler },
  });

  await logActivity(session.user.id, "REVIEW_POSTED", { gameTitle: game.title, gameSlug: game.slug, reviewTitle: title });
  await checkAndUnlockAchievements(session.user.id);

  return NextResponse.json({ review }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Chybí id." }, { status: 400 });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Recenze nenalezena." }, { status: 404 });
  if (review.userId !== session.user.id && session.user.role === "USER") {
    return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });
  }

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
