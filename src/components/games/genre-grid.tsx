import Link from "next/link";
import { cn } from "@/lib/utils";

const GENRE_GRADIENTS = [
  "from-plasma/30 to-plasma-dim/10",
  "from-ember/30 to-ember/5",
  "from-gold/25 to-gold/5",
  "from-emerald/25 to-emerald/5",
  "from-plasma-soft/25 to-panel",
  "from-ember-soft/25 to-panel",
];

export function GenreGrid({ genres }: { genres: { slug: string; name: string; _count: { games: number } }[] }) {
  if (genres.length === 0) return null;
  return (
    <section className="px-5 py-6 lg:px-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-emerald" />
        <h2 className="font-display text-xl font-medium text-text-primary sm:text-2xl">Procházet žánry</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {genres.slice(0, 12).map((genre, i) => (
          <Link
            key={genre.slug}
            href={`/search?genre=${genre.slug}`}
            className={cn(
              "group relative flex h-24 flex-col justify-end overflow-hidden rounded-xl border border-border-soft bg-gradient-to-br p-4 transition-transform hover:-translate-y-1",
              GENRE_GRADIENTS[i % GENRE_GRADIENTS.length]
            )}
          >
            <span className="font-display text-sm font-medium text-text-primary">{genre.name}</span>
            <span className="text-xs text-text-muted">{genre._count.games} her</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
