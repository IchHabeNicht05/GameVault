import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Gamepad2, Star, Heart, UserPlus, CheckCircle2, PenSquare } from "lucide-react";
import { initials, timeAgo, cn } from "@/lib/utils";
import { describeActivity, type ActivityMetadata } from "@/lib/activity";
import type { ActivityType } from "@prisma/client";

interface ActivityItem {
  id: string;
  type: ActivityType;
  metadata: unknown;
  createdAt: Date;
  user: { id: string; username: string; name: string | null; avatarUrl: string | null };
}

const ICONS: Record<ActivityType, React.ReactNode> = {
  LIBRARY_ADD: <Gamepad2 className="h-4 w-4" />,
  WISHLIST_ADD: <Heart className="h-4 w-4" />,
  REVIEW_POSTED: <PenSquare className="h-4 w-4" />,
  RATING_POSTED: <Star className="h-4 w-4" />,
  GAME_COMPLETED: <CheckCircle2 className="h-4 w-4" />,
  FOLLOW: <UserPlus className="h-4 w-4" />,
  ACHIEVEMENT_UNLOCKED: <Trophy className="h-4 w-4" />,
};

const COLORS: Record<ActivityType, string> = {
  LIBRARY_ADD: "text-plasma-soft bg-plasma/10",
  WISHLIST_ADD: "text-ember-soft bg-ember/10",
  REVIEW_POSTED: "text-emerald bg-emerald/10",
  RATING_POSTED: "text-gold bg-gold/10",
  GAME_COMPLETED: "text-emerald bg-emerald/10",
  FOLLOW: "text-plasma-soft bg-plasma/10",
  ACHIEVEMENT_UNLOCKED: "text-gold bg-gold/10",
};

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-soft p-8 text-center text-sm text-text-muted">
        Zatím žádná aktivita. Sleduj hráče, ať vidíš, co hrají!
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const metadata = activity.metadata as ActivityMetadata;
        return (
          <div key={activity.id} className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.03]">
            <Link href={`/profile/${activity.user.username}`}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatarUrl ?? undefined} />
                <AvatarFallback>{initials(activity.user.name ?? activity.user.username)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 text-sm">
              <span>
                <Link href={`/profile/${activity.user.username}`} className="font-semibold text-text-primary hover:text-plasma-soft">
                  {activity.user.name ?? activity.user.username}
                </Link>{" "}
                <span className="text-text-secondary">{describeActivity(activity.type, metadata)}</span>
              </span>
              <div className="mt-0.5 text-xs text-text-muted">{timeAgo(activity.createdAt)}</div>
            </div>
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", COLORS[activity.type])}>
              {ICONS[activity.type]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
