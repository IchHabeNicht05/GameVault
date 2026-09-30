import { Suspense } from "react";
import { searchGames, getAllGenres, type SearchFilters as Filters } from "@/lib/data/games";
import { SearchFilters } from "@/components/games/search-filters";
import { GameCard } from "@/components/games/game-card";
import { SearchX } from "lucide-react";

export const metadata = { title: "Hledat hry" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; platform?: string; year?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const filters: Filters = {
    query: params.q,
    genre: params.genre,
    platformFamily: params.platform,
    year: params.year,
    sort: (params.sort as Filters["sort"]) ?? "newest",
  };
  const page = Number(params.page ?? "1");

  const [{ games, total }, genres] = await Promise.all([searchGames(filters, page, 24), getAllGenres()]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 lg:px-10">
      <h1 className="font-display text-3xl font-semibold text-text-primary">Hledat hry</h1>
      <p className="mt-1 text-text-muted">{total} her odpovídá tvému hledání.</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense>
          <SearchFilters
            genres={genres}
            currentQuery={params.q ?? ""}
            currentGenre={params.genre ?? ""}
            currentPlatform={params.platform ?? ""}
            currentYear={params.year ?? ""}
            currentSort={params.sort ?? "newest"}
          />
        </Suspense>

        <div>
          {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-soft py-24 text-center">
              <SearchX className="h-10 w-10 text-text-muted" />
              <p className="mt-4 text-text-secondary">Žádné hry neodpovídají zadaným filtrům.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {games.map((game) => (
                <GameCard key={game.id} game={game} className="w-full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
