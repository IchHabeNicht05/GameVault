/**
 * Lehký klient pro RAWG Video Games Database API (https://rawg.io/apidocs).
 *
 * GameVault používá RAWG jako zdroj herních dat pro synchronizační skript
 * (`prisma/sync-rawg.ts`), který stahuje hry a ukládá je do vlastní databáze —
 * aplikace samotná se při běhu na RAWG nedotazuje, pracuje jen s lokálními daty.
 *
 * Bez nastaveného RAWG_API_KEY tato funkce vyhodí chybu se srozumitelnou
 * hláškou; seed skript (`prisma/seed.ts`) funguje nezávisle na RAWG a obsahuje
 * kurátorovaná data pro okamžitý běh platformy bez API klíče.
 */

const RAWG_BASE_URL = "https://api.rawg.io/api";

export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  description_raw?: string;
  background_image: string | null;
  background_image_additional?: string | null;
  released: string | null;
  metacritic: number | null;
  esrb_rating: { name: string } | null;
  website?: string;
  genres: { id: number; slug: string; name: string }[];
  platforms: { platform: { id: number; slug: string; name: string } }[];
  developers: { id: number; slug: string; name: string }[];
  publishers: { id: number; slug: string; name: string }[];
  short_screenshots?: { id: number; image: string }[];
}

interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function requireApiKey(): string {
  const key = process.env.RAWG_API_KEY;
  if (!key) {
    throw new Error(
      "RAWG_API_KEY není nastaven. Přidej jej do .env pro synchronizaci s RAWG.io, " +
        "nebo použij `npm run db:seed`, který funguje s lokálními kurátorovanými daty bez API klíče."
    );
  }
  return key;
}

async function rawgFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = requireApiKey();
  const url = new URL(`${RAWG_BASE_URL}${path}`);
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`RAWG API chyba ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPopularGames(page = 1, pageSize = 20) {
  return rawgFetch<RawgListResponse<RawgGame>>("/games", {
    ordering: "-added",
    page: String(page),
    page_size: String(pageSize),
  });
}

export async function fetchGameDetails(slugOrId: string | number) {
  return rawgFetch<RawgGame>(`/games/${slugOrId}`);
}

export async function fetchGameScreenshots(slugOrId: string | number) {
  return rawgFetch<RawgListResponse<{ id: number; image: string }>>(
    `/games/${slugOrId}/screenshots`
  );
}

export async function searchGames(query: string, page = 1) {
  return rawgFetch<RawgListResponse<RawgGame>>("/games", {
    search: query,
    page: String(page),
  });
}
