import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

/**
 * Vyhodnotí, zda uživatel splnil podmínky pro nějaký achievement, a pokud ano,
 * odemkne jej (idempotentně — díky @@unique([userId, achievementId])).
 * Voláno po klíčových akcích (přidání do knihovny, recenze, dokončení hry…).
 */
export async function checkAndUnlockAchievements(userId: string) {
  const [libraryCount, completedCount, reviewCount, followerCount] = await Promise.all([
    prisma.libraryEntry.count({ where: { userId } }),
    prisma.libraryEntry.count({ where: { userId, status: "COMPLETED" } }),
    prisma.review.count({ where: { userId } }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);

  const checks: { slug: string; unlocked: boolean }[] = [
    { slug: "first-steps", unlocked: libraryCount >= 1 },
    { slug: "collector", unlocked: libraryCount >= 10 },
    { slug: "curator", unlocked: libraryCount >= 50 },
    { slug: "finisher", unlocked: completedCount >= 1 },
    { slug: "completionist", unlocked: completedCount >= 10 },
    { slug: "critic", unlocked: reviewCount >= 1 },
    { slug: "top-voice", unlocked: reviewCount >= 10 },
    { slug: "influencer", unlocked: followerCount >= 5 },
  ];

  const toUnlock = checks.filter((c) => c.unlocked);
  if (toUnlock.length === 0) return;

  const achievements = await prisma.achievement.findMany({
    where: { slug: { in: toUnlock.map((c) => c.slug) } },
  });

  const existing = await prisma.userAchievement.findMany({
    where: { userId, achievementId: { in: achievements.map((a) => a.id) } },
    select: { achievementId: true },
  });
  const existingIds = new Set(existing.map((e) => e.achievementId));

  for (const achievement of achievements) {
    if (existingIds.has(achievement.id)) continue;
    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    await logActivity(userId, "ACHIEVEMENT_UNLOCKED", {
      achievementName: achievement.name,
      achievementTier: achievement.tier,
    });
  }
}
