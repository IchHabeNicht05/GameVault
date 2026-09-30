"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Recenze odstraněna.");
        router.refresh();
      }
    });
  }

  return (
    <Button size="sm" variant="destructive" onClick={remove} disabled={isPending} className="gap-1.5">
      <Trash2 className="h-3.5 w-3.5" /> Smazat
    </Button>
  );
}
