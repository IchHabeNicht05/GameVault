/**
 * GameVault — seed skript (plný demo dataset)
 * Naplní databázi kurátorovaným katalogem her PLUS falešnými demo uživateli,
 * recenzemi, hodnoceními, knihovnami a aktivitami — pro lokální vývoj a jako
 * portfolio ukázka "živé" komunitní platformy.
 *
 * Pro produkci NEPOUŽÍVEJ tenhle skript — použij `npm run db:seed-production`,
 * který vytvoří jen reálný katalog bez demo účtů se známým heslem.
 *
 * Spuštění: npm run db:seed
 */
import { PrismaClient, LibraryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
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

// ─────────────────────────────────────────────────────────────────
// Demo uživatelé — POUZE pro vývoj/portfolio, nikdy pro produkci
// ─────────────────────────────────────────────────────────────────
const USERS = [
  { username: "martin_k", name: "Martin Kovář", bio: "RPG nadšenec. Vždy hledám další 200hodinovou epopej.", role: "ADMIN" as const },
  { username: "petra_gaming", name: "Petra Nováková", bio: "Souls-like maniak. Elden Ring mě zničil (v dobrém).", role: "MODERATOR" as const },
  { username: "honza_fps", name: "Jan Dvořák", bio: "Competitive FPS hráč. Apex main od S0.", role: "USER" as const },
  { username: "lucka_indie", name: "Lucie Svobodová", bio: "Sbírám indie perly. Hollow Knight je moje religion.", role: "USER" as const },
  { username: "tomas_retro", name: "Tomáš Procházka", bio: "Retro gaming a speedruny na Switchi.", role: "USER" as const },
  { username: "eliska_rpg", name: "Eliška Černá", bio: "Baldur's Gate 3 mě zabralo na 300 hodin a nelituju.", role: "USER" as const },
  { username: "filip_streams", name: "Filip Horák", bio: "Streamuji hardcore hry každý večer v 20:00.", role: "USER" as const },
  { username: "katka_cozy", name: "Kateřina Veselá", bio: "Cozy games only. Žádný stres, jen pohoda.", role: "USER" as const },
];

const REVIEW_TEMPLATES = [
  (title: string) => `${title} předčila všechna moje očekávání. Svět je neskutečně živý a každý detail dává smysl. Rozhodně jedna z nejlepších her tohoto desetiletí.`,
  (title: string) => `Po dohrání ${title} mám smíšené pocity. Příběh je skvělý, ale technické zpracování má co dohánět. I tak doporučuji všem fanouškům žánru.`,
  (title: string) => `Nemůžu přestat hrát ${title}. Gameplay loop je návykový, soundtrack úžasný a atmosféra naprosto pohltí. 10/10 zážitek pro každého hráče.`,
  (title: string) => `${title} je masterpiece. Level design, soubojový systém i vyprávění příběhu — všechno na absolutní špičce. Jedna z mých top her všech dob.`,
  (title: string) => `Docela jsem si užil ${title}, i když závěr byl trochu uspěchaný. Postavy jsou zapamatovatelné a svět stojí za prozkoumání do posledního koutu.`,
];

const REVIEW_TITLES = [
  "Naprosté mistrovské dílo",
  "Stojí to za všechen ten hype",
  "Skvělá hra s pár neduhy",
  "Nejlepší zážitek roku",
  "Musíte si zahrát",
  "Překvapivě hluboký příběh",
  "Vrátil jsem se po roce a stálo to za to",
];

async function main() {
  console.log("🌱 Mažu existující data…");
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.like.deleteMany(),
    prisma.review.deleteMany(),
    prisma.rating.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.libraryEntry.deleteMany(),
    prisma.userAchievement.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.report.deleteMany(),
    prisma.screenshot.deleteMany(),
    prisma.genreOnGame.deleteMany(),
    prisma.platformOnGame.deleteMany(),
    prisma.developerOnGame.deleteMany(),
    prisma.publisherOnGame.deleteMany(),
    prisma.achievement.deleteMany(),
    prisma.game.deleteMany(),
    prisma.genre.deleteMany(),
    prisma.platform.deleteMany(),
    prisma.developer.deleteMany(),
    prisma.publisher.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

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
  const createdGames = [];
  for (const g of GAMES) {
    const game = await prisma.game.create({
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
        screenshots: {
          create: Array.from({ length: 4 }, (_, i) => ({ url: screenshot(g.title, i + 1) })),
        },
      },
    });
    createdGames.push(game);
  }

  console.log("🏆 Vytvářím achievementy…");
  await prisma.achievement.createMany({ data: ACHIEVEMENTS });

  console.log("👥 Vytvářím uživatele…");
  const passwordHash = await bcrypt.hash("password123", 12);
  const createdUsers = [];
  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        username: u.username,
        email: `${u.username}@gamevault.dev`,
        password: passwordHash,
        name: u.name,
        bio: u.bio,
        role: u.role,
        avatarUrl: avatar(u.username),
        emailVerified: new Date(),
      },
    });
    createdUsers.push(user);
  }
  const martin = createdUsers[0];

  console.log("📚 Vytvářím knihovny, wishlisty, hodnocení a recenze…");
  const statuses: LibraryStatus[] = ["PLAYING", "COMPLETED", "BACKLOG", "DROPPED"];

  for (const user of createdUsers) {
    const shuffled = [...createdGames].sort(() => Math.random() - 0.5);
    const libraryGames = shuffled.slice(0, 8 + Math.floor(Math.random() * 6));
    const wishlistGames = shuffled.slice(libraryGames.length, libraryGames.length + 3);

    for (const game of libraryGames) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const hoursPlayed = Math.round(Math.random() * 80 * 10) / 10;
      const progress = status === "COMPLETED" ? 100 : status === "BACKLOG" ? 0 : Math.floor(Math.random() * 90);

      await prisma.libraryEntry.create({
        data: {
          userId: user.id,
          gameId: game.id,
          status,
          progress,
          hoursPlayed,
          startedAt: status !== "BACKLOG" ? new Date(Date.now() - Math.random() * 90 * 86400000) : null,
          completedAt: status === "COMPLETED" ? new Date(Date.now() - Math.random() * 30 * 86400000) : null,
        },
      });

      await prisma.activity.create({
        data: {
          userId: user.id,
          type: "LIBRARY_ADD",
          metadata: { gameTitle: game.title, gameSlug: game.slug, gameCoverUrl: game.coverUrl },
          createdAt: new Date(Date.now() - Math.random() * 20 * 86400000),
        },
      });

      if (Math.random() > 0.45) {
        const value = 5 + Math.floor(Math.random() * 6);
        await prisma.rating.create({ data: { userId: user.id, gameId: game.id, value } });
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: "RATING_POSTED",
            metadata: { gameTitle: game.title, gameSlug: game.slug, rating: value },
            createdAt: new Date(Date.now() - Math.random() * 15 * 86400000),
          },
        });
      }

      if (Math.random() > 0.7) {
        const title = REVIEW_TITLES[Math.floor(Math.random() * REVIEW_TITLES.length)];
        const content = REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)](game.title);
        await prisma.review.create({
          data: {
            userId: user.id,
            gameId: game.id,
            title,
            content,
            isSpoiler: Math.random() > 0.85,
            playtimeAtReview: hoursPlayed,
          },
        });
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: "REVIEW_POSTED",
            metadata: { gameTitle: game.title, gameSlug: game.slug, reviewTitle: title },
            createdAt: new Date(Date.now() - Math.random() * 10 * 86400000),
          },
        });
      }
    }

    for (const game of wishlistGames) {
      await prisma.wishlist.create({ data: { userId: user.id, gameId: game.id } });
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: "WISHLIST_ADD",
          metadata: { gameTitle: game.title, gameSlug: game.slug, gameCoverUrl: game.coverUrl },
          createdAt: new Date(Date.now() - Math.random() * 25 * 86400000),
        },
      });
    }
  }

  console.log("💬 Přidávám lajky a komentáře k recenzím…");
  const allReviews = await prisma.review.findMany();
  for (const review of allReviews) {
    const likers = createdUsers.filter((u) => u.id !== review.userId && Math.random() > 0.5);
    for (const liker of likers) {
      await prisma.like.create({ data: { userId: liker.id, reviewId: review.id } }).catch(() => {});
    }
    if (Math.random() > 0.6) {
      const commenter = createdUsers.find((u) => u.id !== review.userId);
      if (commenter) {
        await prisma.comment.create({
          data: { userId: commenter.id, reviewId: review.id, content: "Naprostý souhlas, skvěle napsáno! 🎮" },
        });
      }
    }
  }

  console.log("🤝 Vytvářím follow vztahy…");
  for (const follower of createdUsers) {
    const others = createdUsers.filter((u) => u.id !== follower.id);
    const toFollow = others.sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3));
    for (const target of toFollow) {
      await prisma.follow.create({ data: { followerId: follower.id, followingId: target.id } }).catch(() => {});
      await prisma.activity.create({
        data: {
          userId: follower.id,
          type: "FOLLOW",
          metadata: { targetUsername: target.username },
          createdAt: new Date(Date.now() - Math.random() * 30 * 86400000),
        },
      });
    }
  }

  console.log("🏅 Vyhodnocuji achievementy…");
  for (const user of createdUsers) {
    const [libraryCount, completedCount, reviewCount, followerCount] = await Promise.all([
      prisma.libraryEntry.count({ where: { userId: user.id } }),
      prisma.libraryEntry.count({ where: { userId: user.id, status: "COMPLETED" } }),
      prisma.review.count({ where: { userId: user.id } }),
      prisma.follow.count({ where: { followingId: user.id } }),
    ]);
    const checks: { slug: string; unlocked: boolean }[] = [
      { slug: "first-steps", unlocked: libraryCount >= 1 },
      { slug: "collector", unlocked: libraryCount >= 10 },
      { slug: "finisher", unlocked: completedCount >= 1 },
      { slug: "completionist", unlocked: completedCount >= 5 },
      { slug: "critic", unlocked: reviewCount >= 1 },
      { slug: "influencer", unlocked: followerCount >= 3 },
    ];
    const toUnlock = checks.filter((c) => c.unlocked).map((c) => c.slug);
    const achievements = await prisma.achievement.findMany({ where: { slug: { in: toUnlock } } });
    for (const a of achievements) {
      await prisma.userAchievement.create({ data: { userId: user.id, achievementId: a.id } }).catch(() => {});
    }
  }

  console.log("✅ Seed dokončen!");
  console.log(`   → ${createdGames.length} her, ${createdUsers.length} uživatelů`);
  console.log(`   → Přihlašovací demo účet: ${martin.email} / password123`);
  console.log(`   ⚠️  Tento dataset má PUBLIC ZNÁMÉ heslo — nepoužívej ho na produkčním nasazení!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed selhal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });