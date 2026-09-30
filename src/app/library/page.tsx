import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LibraryEntryCard } from "@/components/games/library-entry-card";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Moje knihovna" };

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/library");

  const [entries, wishlist] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId: session.user.id },
      include: { game: { select: { title: true, slug: true, coverUrl: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: { game: { select: { title: true, slug: true, coverUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const byStatus = {
    PLAYING: entries.filter((e) => e.status === "PLAYING"),
    COMPLETED: entries.filter((e) => e.status === "COMPLETED"),
    BACKLOG: entries.filter((e) => e.status === "BACKLOG"),
    DROPPED: entries.filter((e) => e.status === "DROPPED"),
  };

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12 lg:px-10">
      <h1 className="font-display text-3xl font-semibold text-text-primary">Moje knihovna</h1>
      <p className="mt-1 text-text-muted">Sleduj svůj herní pokrok napříč všemi tituly.</p>

      <div className="mt-8">
        <Tabs defaultValue="playing">
          <TabsList>
            <TabsTrigger value="playing">Hraji ({byStatus.PLAYING.length})</TabsTrigger>
            <TabsTrigger value="completed">Dokončeno ({byStatus.COMPLETED.length})</TabsTrigger>
            <TabsTrigger value="backlog">Backlog ({byStatus.BACKLOG.length})</TabsTrigger>
            <TabsTrigger value="dropped">Odloženo ({byStatus.DROPPED.length})</TabsTrigger>
            <TabsTrigger value="wishlist">Přání ({wishlist.length})</TabsTrigger>
          </TabsList>

          {(["playing", "completed", "backlog", "dropped"] as const).map((key) => {
            const statusKey = key.toUpperCase() as keyof typeof byStatus;
            const list = byStatus[statusKey];
            return (
              <TabsContent key={key} value={key}>
                <div className="space-y-3">
                  {list.length === 0 && <p className="text-sm text-text-muted">Zatím nic tady.</p>}
                  {list.map((entry) => (
                    <LibraryEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </TabsContent>
            );
          })}

          <TabsContent value="wishlist">
            <div className="flex flex-wrap gap-4">
              {wishlist.length === 0 && <p className="text-sm text-text-muted">Seznam přání je prázdný.</p>}
              {wishlist.map((w) => (
                <Link key={w.id} href={`/games/${w.game.slug}`} className="w-[140px] shrink-0">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border-soft">
                    <Image src={w.game.coverUrl} alt={w.game.title} fill className="object-cover" />
                  </div>
                  <p className="mt-1.5 truncate text-xs text-text-secondary">{w.game.title}</p>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
