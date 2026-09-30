import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

export type ActivityMetadata = {
  gameTitle?: string;
  gameSlug?: string;
  gameCoverUrl?: string;
  rating?: number;
  reviewTitle?: string;
  achievementName?: string;
  achievementTier?: string;
  targetUsername?: string;
};

export async function logActivity(userId: string, type: ActivityType, metadata: ActivityMetadata) {
  return prisma.activity.create({
    data: { userId, type, metadata },
  });
}

/** Human-readable Czech label rendered by the activity feed. */
export function describeActivity(type: ActivityType, metadata: ActivityMetadata): string {
  switch (type) {
    case "LIBRARY_ADD":
      return `přidal(a) hru „${metadata.gameTitle}“ do knihovny`;
    case "WISHLIST_ADD":
      return `přidal(a) hru „${metadata.gameTitle}“ na seznam přání`;
    case "REVIEW_POSTED":
      return `napsal(a) recenzi na hru „${metadata.gameTitle}“`;
    case "RATING_POSTED":
      return `ohodnotil(a) hru „${metadata.gameTitle}“ na ${metadata.rating}/10`;
    case "GAME_COMPLETED":
      return `dokončil(a) hru „${metadata.gameTitle}“`;
    case "FOLLOW":
      return `začal(a) sledovat @${metadata.targetUsername}`;
    case "ACHIEVEMENT_UNLOCKED":
      return `odemkl(a) achievement „${metadata.achievementName}“`;
    default:
      return "provedl(a) akci";
  }
}
