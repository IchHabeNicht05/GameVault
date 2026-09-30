import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });
  const { id: reviewId } = await params;

  const existing = await prisma.like.findUnique({
    where: { userId_reviewId: { userId: session.user.id, reviewId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { userId: session.user.id, reviewId } });
  return NextResponse.json({ liked: true });
}
