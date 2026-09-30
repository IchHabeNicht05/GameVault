/**
 * GameVault — doplnění chybějících cover obrázků
 *
 * `prisma/seed.ts` naplní katalog kurátorovanými hrami s placeholder covery
 * (placehold.co) a `prisma/sync-rawg.ts` stáhne populární hry podle žebříčku
 * — ale ne každá kurátorovaná hra se do žebříčku "trefí". Tenhle skript projde
 * všechny hry, které ještě mají placeholder cover, vyhledá je na RAWG podle
 * názvu a doplní jim skutečný obrázek (cover, backdrop, screenshoty).
 *
 * Bezpečné spouštět opakovaně — hry se skutečným coverem přeskakuje.
 *
 * Spuštění:
 *   npm run db:fix-covers
 */
import { PrismaClient } from "@prisma/client";
import { searchGames, fetchGameScreenshots } from "../src/lib/rawg";

const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    where: { coverUrl: { contains: "placehold.co" } },
  });

  if (games.length === 0) {
    console.log("✅ Všechny hry už mají skutečný cover, není co doplňovat.");
    return;
  }

  console.log(`🔍 Hledám skutečné obrázky pro ${games.length} her…`);

  let fixed = 0;
  let notFound = 0;

  for (const game of games) {
    try {
      const { results } = await searchGames(game.title);
      // Bereme první výsledek, který má vyplněný background_image.
      const match = results.find((r) => r.background_image);

      if (!match) {
        console.log(`  ⚠️  "${game.title}" — na RAWG nenalezen žádný obrázek, ponechávám placeholder`);
        notFound++;
        continue;
      }

      const screenshots = await fetchGameScreenshots(match.id).catch(() => ({ results: [] }));

      await prisma.$transaction([
        prisma.game.update({
          where: { id: game.id },
          data: {
            coverUrl: match.background_image!,
            backdropUrl: match.background_image_additional ?? match.background_image!,
            rawgId: game.rawgId ?? match.id,
          },
        }),
        prisma.screenshot.deleteMany({ where: { gameId: game.id } }),
        ...(screenshots.results.length > 0
          ? [
              prisma.screenshot.createMany({
                data: screenshots.results.map((s) => ({ gameId: game.id, url: s.image })),
              }),
            ]
          : []),
      ]);

      console.log(`  ✅ ${game.title} → doplněn skutečný obrázek`);
      fixed++;
    } catch (err) {
      console.error(`  ❌ Chyba u "${game.title}":`, err instanceof Error ? err.message : err);
    }
    // Jemný rate-limit pro RAWG free tier.
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n✅ Hotovo — doplněno ${fixed} obrázků, ${notFound} her na RAWG nenalezeno.`);
}

main()
  .catch((e) => {
    console.error("❌ Skript selhal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });