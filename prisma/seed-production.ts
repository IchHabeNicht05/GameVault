/**
 * GameVault — produkční seed skript
 *
 * Na rozdíl od `seed.ts` (plný demo dataset s veřejně známým heslem
 * `password123`) tenhle skript vytvoří JEN:
 *   1. reálný katalog her/žánrů/platforem/vývojářů/vydavatelů/achievementů
 *   2. jeden admin účet s náhodně vygenerovaným heslem, které se vypíše
 *      do konzole PŘESNĚ JEDNOU a nikam se needukládá
 *
 * Žádná demo data, žádné falešné recenze, žádné heslo, které bys omylem
 * nechal v README nebo v chatu s AI asistentem. Spouštěj JEN JEDNOU na
 * čerstvě vytvořené produkční databázi.
 *
 * Spuštění: npm run db:seed-production
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  slugify,
  cover,
  backdrop,
  screenshot,
  avatar,
  GENRES,
  PLATFORMS,
  DEVELOPERS,
  PUBLISHERS,
  GAMES,
  ACHIEVEMENTS,
} from "./data/catalog";

const prisma = new PrismaClient();

/** Kryptograficky bezpečné náhodné heslo — 24 znaků, base64url (bez padding). */
function generateSecurePassword(): string {
  return crypto.randomBytes(18).toString("base64url");
}

async function main() {
  const existingGames = await prisma.game.count();
  const existingAdmins = await prisma.user.count({ where: { role: "ADMIN" } });

  if (existingGames > 0 || existingAdmins > 0) {
    console.log("⚠️  Databáze už obsahuje data (hry a/nebo admin účet).");
    console.log("   Tenhle skript je určený jen pro PRVNÍ spuštění na čisté databázi,");
    console.log("   aby nehrozilo omylem přepsat existující produkční data.");
    console.log("   Pokud opravdu chceš pokračovat, smaž data ručně a spusť znovu.");
    process.exit(1);
  }

  console.log("🎮 Vytvářím žánry, platformy, vývojáře a vydavatele…");
  const genreMap = new Map<string, string>();
  for (const name of GENRES) {
    const g = await prisma.genre.create({ data: { name, slug: slugify(name) } });
    genreMap.set(name, g.id);
  }

  const platformMap = new Map<string, string>();
  for (const p of PLATFORMS) {
    const created = await prisma.platform.create({ data: { name: p.name, slug: slugify(p.name), family: p.family } });
    platformMap.set(p.name, created.id);
  }

  const developerMap = new Map<string, string>();
  for (const name of DEVELOPERS) {
    const d = await prisma.developer.create({ data: { name, slug: slugify(name) } });
    developerMap.set(name, d.id);
  }

  const publisherMap = new Map<string, string>();
  for (const name of PUBLISHERS) {
    const p = await prisma.publisher.create({ data: { name, slug: slugify(name) } });
    publisherMap.set(name, p.id);
  }

  console.log("🕹️  Vytvářím katalog her…");
  let gameCount = 0;
  for (const g of GAMES) {
    await prisma.game.create({
      data: {
        slug: slugify(g.title),
        title: g.title,
        description: g.description,
        coverUrl: cover(g.title),
        backdropUrl: backdrop(g.title),
        trailerUrl: g.trailerUrl,
        releaseDate: new Date(g.releaseDate),
        metacritic: g.metacritic || null,
        esrbRating: g.esrbRating,
        isFeatured: !!g.featured,
        isTrending: !!g.trending,
        genres: { create: g.genres.map((name) => ({ genreId: genreMap.get(name)! })) },
        platforms: { create: g.platforms.map((name) => ({ platformId: platformMap.get(name)! })) },
        developers: { create: g.developers.map((name) => ({ developerId: developerMap.get(name)! })) },
        publishers: { create: g.publishers.map((name) => ({ publisherId: publisherMap.get(name)! })) },
        screenshots: { create: Array.from({ length: 4 }, (_, i) => ({ url: screenshot(g.title, i + 1) })) },
      },
    });
    gameCount++;
  }

  console.log("🏆 Vytvářím achievementy…");
  await prisma.achievement.createMany({ data: ACHIEVEMENTS });

  console.log("👤 Vytvářím admin účet…");
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminEmail = process.env.SEED_ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("❌ Chybí SEED_ADMIN_EMAIL — nastav ho v .env před spuštěním (e-mail, na který se budeš přihlašovat).");
    process.exit(1);
  }

  const password = generateSecurePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      password: passwordHash,
      name: "Admin",
      role: "ADMIN",
      avatarUrl: avatar(adminUsername),
      emailVerified: new Date(),
    },
  });

  console.log("\n✅ Produkční seed dokončen!");
  console.log(`   → ${gameCount} her v katalogu, 0 demo účtů, 0 falešných recenzí`);
  console.log("\n" + "═".repeat(60));
  console.log("🔐 PŘIHLAŠOVACÍ ÚDAJE ADMINA (zobrazí se JEN TEĎ — ulož si je!)");
  console.log("═".repeat(60));
  console.log(`   E-mail:   ${adminEmail}`);
  console.log(`   Heslo:    ${password}`);
  console.log("═".repeat(60));
  console.log("⚠️  Po prvním přihlášení doporučujeme heslo změnit (Nastavení → Profil).");
}

main()
  .catch((e) => {
    console.error("❌ Produkční seed selhal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });