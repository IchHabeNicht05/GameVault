import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
  isBanned: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Pouze administrátoři mohou upravovat role." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neplatná data." }, { status: 400 });

  const user = await prisma.user.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ user });
}
