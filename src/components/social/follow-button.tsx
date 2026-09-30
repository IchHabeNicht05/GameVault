"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FollowButton({ targetUserId, initialFollowing }: { targetUserId: string; initialFollowing: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  if (session?.user?.id === targetUserId) return null;

  function toggle() {
    if (!session?.user) {
      toast.error("Nejdřív se přihlas.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        router.refresh();
      }
    });
  }

  return (
    <Button variant={following ? "outline" : "default"} onClick={toggle} disabled={isPending} className="gap-2">
      {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? "Sleduješ" : "Sledovat"}
    </Button>
  );
}
