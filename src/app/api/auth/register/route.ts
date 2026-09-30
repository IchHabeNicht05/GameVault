import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Registrace je nejcitlivější endpoint — bez limitu jde snadno naspamovat
  // databázi falešnými účty. 5 registrací / hodinu / IP je dost i pro
  // domácnost s víc lidmi, ale zastaví hromadné bot účty.
  const ip = getClientIp(req);
  const limit = await checkRateLimit("register", ip, 5, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Příliš mnoho pokusů o registraci. Zkus to prosím později." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data." }, { status: 400 });
  }
  const { username, email, password } = parsed.data;

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);
  if (existingEmail) {
    return NextResponse.json({ error: "Tento e-mail je již zaregistrován." }, { status: 409 });
  }
  if (existingUsername) {
    return NextResponse.json({ error: "Toto uživatelské jméno je již obsazené." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      name: username,
      avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username)}`,
    },
    select: { id: true, username: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
