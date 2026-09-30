import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({ status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neplatná data." }, { status: 400 });

  const report = await prisma.report.update({
    where: { id },
    data: { status: parsed.data.status, resolvedAt: new Date() },
  });
  return NextResponse.json({ report });
}
