import { prisma } from "@/lib/prisma";
import { Users, Gamepad2, Star, Flag } from "lucide-react";
import { StatCard } from "@/components/profile/stat-card";

export const metadata = { title: "Admin přehled" };

export default async function AdminOverviewPage() {
  const [userCount, gameCount, reviewCount, pendingReports] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.review.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Přehled platformy</h1>
      <p className="mt-1 text-text-muted">Klíčové metriky GameVault v reálném čase.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Uživatelé" value={String(userCount)} accent="plasma" />
        <StatCard icon={<Gamepad2 className="h-5 w-5" />} label="Hry v katalogu" value={String(gameCount)} accent="emerald" />
        <StatCard icon={<Star className="h-5 w-5" />} label="Recenze" value={String(reviewCount)} accent="gold" />
        <StatCard icon={<Flag className="h-5 w-5" />} label="Čekající nahlášení" value={String(pendingReports)} accent="ember" />
      </div>
    </div>
  );
}
