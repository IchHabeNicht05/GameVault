import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations/review";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nejsi přihlášen(a)." }, { status: 401 });

  const limit = await checkRateLimit("comment", session.user.id, 30, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Příliš mnoho komentářů najednou. Zkus to za chvíli." }, { status: 429 });
  }

  const parsed = commentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { userId: session.user.id, reviewId: parsed.data.reviewId, content: parsed.data.content },
    include: { user: { select: { username: true, name: true, avatarUrl: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
