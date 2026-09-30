/**
 * GameVault — synchronizace s RAWG.io
 *
 * Stáhne populární hry z RAWG Video Games Database a uloží je do lokální
 * databáze (upsert podle `rawgId`, takže skript je bezpečné spouštět opakovaně).
 * Na rozdíl od `prisma/seed.ts` (kurátorovaná demo data) tento skript volá
 * živé REST API — spusť ho, když chceš katalog rozšířit o aktuální/reálná data.
 *
 * Spuštění:
 *   RAWG_API_KEY musí být nastaven v .env (viz .env.example)
 *   npm run db:sync-rawg -- --pages=2 --pageSize=20
 */
import { PrismaClient } from "@prisma/client";
import {
  fetchPopularGames,
  fetchGameDetails,
  fetchGameScreenshots,
  type RawgGame,
} from "../src/lib/rawg";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Mapuje RAWG platformní sloty na naši zjednodušenou "rodinu" platforem. */
function platformFamily(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("playstation")) return "PlayStation";
  if (lower.includes("xbox")) return "Xbox";
  if (lower.includes("nintendo") || lower.includes("switch")) return "Nintendo";
  return "PC";
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (name: string, fallback: number) => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));
    return arg ? Number(arg.split("=")[1]) : fallback;
  };
  return { pages: get("pages", 2), pageSize: get("pageSize", 20) };
}

/**
 * Najde existující záznam podle `slug`, případně podle `name` (kvůli kolizím
 * mezi RAWG slugy a kurátorovanými daty z `seed.ts`, které mohou mít stejný
 * název, ale jiný slug). Pokud nic nenajde, vytvoří nový záznam.
 *
 * Typ delegáta je záměrně `any` — jde o interní pomocný skript sdílený mezi
 * Genre/Platform/Developer/Publisher modely, jejichž vygenerované Prisma typy
 * (`GenreWhereUniqueInput` apod.) se navzájem strukturálně neshodují natolik,
 * aby šly vyjádřit jedním společným typem bez zbytečné komplexity.
 */
async function findOrCreate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delegate: any,
  slug: string,
  name: string,
  extraCreateData: Record<string, unknown> = {}
): Promise<string> {
  const bySlug = await delegate.findUnique({ where: { slug } });
  if (bySlug) return bySlug.id as string;

  const byName = await delegate.findUnique({ where: { name } });
  if (byName) return byName.id as string;

  const created = await delegate.create({ data: { slug, name, ...extraCreateData } });
  return created.id as string;
}

async function upsertGenres(genres: RawgGame["genres"]) {
  const ids: string[] = [];
  for (const g of genres) {
    ids.push(await findOrCreate(prisma.genre, g.slug, g.name));
  }
  return ids;
}

async function upsertPlatforms(platforms: RawgGame["platforms"]) {
  const ids: string[] = [];
  for (const { platform: p } of platforms) {
    ids.push(await findOrCreate(prisma.platform, p.slug, p.name, { family: platformFamily(p.name) }));
  }
  return ids;
}

async function upsertDevelopers(developers: RawgGame["developers"]) {
  const ids: string[] = [];
  for (const d of developers) {
    ids.push(await findOrCreate(prisma.developer, d.slug, d.name));
  }
  return ids;
}

async function upsertPublishers(publishers: RawgGame["publishers"]) {
  const ids: string[] = [];
  for (const p of publishers) {
    ids.push(await findOrCreate(prisma.publisher, p.slug, p.name));
  }
  return ids;
}

async function syncGame(summary: RawgGame) {
  // Detail endpoint má bohatší popis a metadata než list endpoint.
  const detail = await fetchGameDetails(summary.id).catch(() => summary);
  const screenshots = await fetchGameScreenshots(summary.id).catch(() => ({ results: [] }));

  const [genreIds, platformIds, developerIds, publisherIds] = await Promise.all([
    upsertGenres(detail.genres ?? []),
    upsertPlatforms(detail.platforms ?? []),
    upsertDevelopers(detail.developers ?? []),
    upsertPublishers(detail.publishers ?? []),
  ]);

    const slug = detail.slug || slugify(detail.name);
  const description = detail.description_raw?.trim() || `${detail.name} — popis zatím není k dispozici.`;

  // RAWG pro danou hru v tomto konkrétním requestu obrázek vrátit nemusí
  // (typicky u nevydaných/méně indexovaných titulů) — `undefined` v Prisma
  // update znamená "toto pole nech beze změny", takže se tím NIKDY nepřepíše
  // existující dobrý cover placeholderem. Placeholder je fallback jen pro
  // úplně nový záznam, který ještě žádný cover nemá.
  const coverUrl = detail.background_image ?? undefined;
  const backdropUrl = detail.background_image_additional ?? detail.background_image ?? undefined;

  const sharedData = {
    rawgId: detail.id,
    title: detail.name,
    description,
    metacritic: detail.metacritic ?? null,
    esrbRating: detail.esrb_rating?.name ?? null,
    website: detail.website ?? null,
  };

  // Hledáme nejdřív podle rawgId (hra už byla synchronizována dřív), pak podle
  // slug (hra existuje z `seed.ts` — kurátorovaná data mají rawgId null a při
  // shodném názvu by jinak vznikl duplicitní slug). Až když nic nenajdeme,
  // vytvoříme nový záznam.
  const existing =
    (await prisma.game.findUnique({ where: { rawgId: detail.id } })) ??
    (await prisma.game.findUnique({ where: { slug } }));

  const game = existing
    ? await prisma.game.update({
        where: { id: existing.id },
        data: { ...sharedData, coverUrl, backdropUrl },
      })
    : await prisma.game.create({
        data: {
          ...sharedData,
          slug,
          coverUrl: coverUrl ?? "https://placehold.co/600x800/12141c/f4f5f7.png?text=%20",
          backdropUrl: backdropUrl ?? null,
          releaseDate: detail.released ? new Date(detail.released) : new Date(),
          genres: { create: genreIds.map((genreId) => ({ genreId })) },
          platforms: { create: platformIds.map((platformId) => ({ platformId })) },
          developers: { create: developerIds.map((developerId) => ({ developerId })) },
          publishers: { create: publisherIds.map((publisherId) => ({ publisherId })) },
        },
      });

    // M:N relace (žánry/platformy/vývojáři/vydavatelé) přepisujeme od nuly při
  // KAŽDÉM syncu — ty RAWG vrací spolehlivě, takže není důvod se bát regrese.
  //
  // Screenshoty jsou jiný případ: pokud je tento request nevrátil (prázdné
  // pole — rate limit, dočasný výpadek, netextovaná hra), NESMÍME smazat ty,
  // co už v DB jsou. Proto mazání i vkládání screenshotů děláme jen tehdy,
  // když skutečně máme čím nahradit.
  const operations = [
    prisma.genreOnGame.deleteMany({ where: { gameId: game.id } }),
    prisma.platformOnGame.deleteMany({ where: { gameId: game.id } }),
    prisma.developerOnGame.deleteMany({ where: { gameId: game.id } }),
    prisma.publisherOnGame.deleteMany({ where: { gameId: game.id } }),
    prisma.genreOnGame.createMany({ data: genreIds.map((genreId) => ({ gameId: game.id, genreId })) }),
    prisma.platformOnGame.createMany({ data: platformIds.map((platformId) => ({ gameId: game.id, platformId })) }),
    prisma.developerOnGame.createMany({ data: developerIds.map((developerId) => ({ gameId: game.id, developerId })) }),
    prisma.publisherOnGame.createMany({ data: publisherIds.map((publisherId) => ({ gameId: game.id, publisherId })) }),
  ];

  if (screenshots.results.length > 0) {
    operations.push(
      prisma.screenshot.deleteMany({ where: { gameId: game.id } }),
      prisma.screenshot.createMany({ data: screenshots.results.map((s) => ({ gameId: game.id, url: s.image })) })
    );
  }

  await prisma.$transaction(operations);

  return game;
}

async function main() {
  const { pages, pageSize } = parseArgs();
  console.log(`🔄 Synchronizuji RAWG.io — ${pages} stránek × ${pageSize} her…`);

  let synced = 0;
  for (let page = 1; page <= pages; page++) {
    console.log(`\n📄 Stránka ${page}/${pages}`);
    const { results } = await fetchPopularGames(page, pageSize);

    for (const summary of results) {
      try {
        const game = await syncGame(summary);
        synced++;
        console.log(`  ✅ ${game.title}`);
      } catch (err) {
        console.error(`  ⚠️  Přeskakuji "${summary.name}":`, err instanceof Error ? err.message : err);
      }
      // Jemný rate-limit, ať nepřetěžujeme RAWG free tier.
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log(`\n✅ Hotovo — synchronizováno ${synced} her.`);
}

main()
  .catch((e) => {
    console.error("❌ Synchronizace selhala:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });