import Link from "next/link";
import { getAllGenres } from "@/lib/data/games";

export const metadata = { title: "Žánry" };

const GRADIENTS = [
  "from-plasma/30 to-plasma-dim/10",
  "from-ember/30 to-ember/5",
  "from-gold/25 to-gold/5",
  "from-emerald/25 to-emerald/5",
  "from-plasma-soft/25 to-panel",
  "from-ember-soft/25 to-panel",
];

export default async function GenresPage() {
  const genres = await getAllGenres();
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 lg:px-10">
      <h1 className="font-display text-3xl font-semibold text-text-primary">Procházet žánry</h1>
      <p className="mt-1 text-text-muted">Najdi svůj další oblíbený titul podle žánru.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((genre, i) => (
          <Link
            key={genre.slug}
            href={`/search?genre=${genre.slug}`}
            className={`group relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl border border-border-soft bg-gradient-to-br p-5 transition-transform hover:-translate-y-1 ${GRADIENTS[i % GRADIENTS.length]}`}
          >
            <span className="font-display text-lg font-medium text-text-primary">{genre.name}</span>
            <span className="text-sm text-text-muted">{genre._count.games} her</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
