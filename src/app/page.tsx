import { VaultHero } from "@/components/sections/vault-hero";
import { TrendingRail } from "@/components/sections/trending-rail";
import { CinematicHero } from "@/components/games/cinematic-hero";
import { GameCarousel } from "@/components/games/game-carousel";
import { GenreGrid } from "@/components/games/genre-grid";
import {
  getFeaturedGames,
  getTrendingGames,
  getPopularGames,
  getRecentlyReleasedGames,
  getUpcomingGames,
  getAllGenres,
} from "@/lib/data/games";

export default async function HomePage() {
  const [featured, trending, popular, recent, upcoming, genres] = await Promise.all([
    getFeaturedGames(5),
    getTrendingGames(12),
    getPopularGames(12),
    getRecentlyReleasedGames(12),
    getUpcomingGames(12),
    getAllGenres(),
  ]);

  return (
    <div className="pb-20">
      {/* Akt I — scroll-driven 3D intro do trezoru */}
      <VaultHero />

      {/* Akt II — trending žebříček s pořadím */}
      <TrendingRail games={trending} />

      {/* Akt III — cinematic featured karusel */}
      <CinematicHero games={featured} />

      {/* Akt IV — katalog */}
      <div className="relative z-10 -mt-16">
        <GameCarousel title="Nejoblíbenější" subtitle="Co hraje celá komunita" games={popular} accent="plasma" />
        <GenreGrid genres={genres} />
        <GameCarousel title="Nedávno vydané" subtitle="Čerstvě na trhu" games={recent} accent="gold" />
        <GameCarousel title="Připravované hry" subtitle="Na co se těšit" games={upcoming} accent="plasma" />
      </div>
    </div>
  );
}