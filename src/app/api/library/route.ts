import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { libraryEntrySchema } from "@/lib/validations/library";
import { logActivity } from "@/lib/activity";
import { checkAndUnlockAchievements } from "@/lib/achievements";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = libraryEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data." }, { status: 400 });
  }
  const { gameId, status, progress, hoursPlayed } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { title: true, slug: true, coverUrl: true } });
  if (!game) return NextResponse.json({ error: "Hra nenalezena." }, { status: 404 });

  const existing = await prisma.libraryEntry.findUnique({
    where: { userId_gameId: { userId: session.user.id, gameId } },
  });

  const entry = await prisma.libraryEntry.upsert({
    where: { userId_gameId: { userId: session.user.id, gameId } },
    create: {
      userId: session.user.id,
      gameId,
      status,
      progress: progress ?? (status === "COMPLETED" ? 100 : 0),
      hoursPlayed: hoursPlayed ?? 0,
      startedAt: status === "PLAYING" || status === "COMPLETED" ? new Date() : null,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status,
      progress: progress ?? (status === "COMPLETED" ? 100 : undefined),
      hoursPlayed: hoursPlayed ?? undefined,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
    },
  });

  if (!existing) {
    await logActivity(session.user.id, "LIBRARY_ADD", {
      gameTitle: game.title,
      gameSlug: game.slug,
      gameCoverUrl: game.coverUrl,
    });
  }
  if (status === "COMPLETED" && existing?.status !== "COMPLETED") {
    await logActivity(session.user.id, "GAME_COMPLETED", {
      gameTitle: game.title,
      gameSlug: game.slug,
      gameCoverUrl: game.coverUrl,
    });
  }

  await checkAndUnlockAchievements(session.user.id);

  return NextResponse.json({ entry });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  if (!gameId) return NextResponse.json({ error: "Chybí gameId." }, { status: 400 });

  await prisma.libraryEntry.deleteMany({ where: { userId: session.user.id, gameId } });
  return NextResponse.json({ ok: true });
}
