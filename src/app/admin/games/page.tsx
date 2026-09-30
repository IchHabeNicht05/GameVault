import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Hry" };

export default async function AdminGamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reviews: true, libraryEntries: true, wishlistedBy: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Katalog her</h1>
      <p className="mt-1 text-text-muted">{games.length} her v databázi.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel-raised text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Hra</th>
              <th className="px-4 py-3">Vydáno</th>
              <th className="px-4 py-3">Recenze</th>
              <th className="px-4 py-3">V knihovnách</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {games.map((g) => (
              <tr key={g.id} className="bg-panel/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-8 overflow-hidden rounded">
                      <Image src={g.coverUrl} alt={g.title} fill className="object-cover" />
                    </div>
                    <span className="font-medium text-text-primary">{g.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{new Date(g.releaseDate).getFullYear()}</td>
                <td className="px-4 py-3 text-text-secondary">{g._count.reviews}</td>
                <td className="px-4 py-3 text-text-secondary">{g._count.libraryEntries}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {g.isFeatured && <Badge variant="plasma">Featured</Badge>}
                    {g.isTrending && <Badge variant="ember">Trending</Badge>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
