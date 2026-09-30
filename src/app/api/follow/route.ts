import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({ targetUserId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const limit = await checkRateLimit("follow", session.user.id, 60, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Příliš mnoho akcí najednou. Zkus to za chvíli." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neplatná data." }, { status: 400 });
  const { targetUserId } = parsed.data;

  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "Nemůžeš sledovat sám sebe." }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: session.user.id, followingId: targetUserId },
  });

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { username: true } });
  await logActivity(session.user.id, "FOLLOW", { targetUsername: target?.username });
  await checkAndUnlockAchievements(targetUserId);

  return NextResponse.json({ following: true });
}
