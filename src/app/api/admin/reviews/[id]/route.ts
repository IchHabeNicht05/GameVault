import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });

  const { id } = await params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
