"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ReportStatus } from "@prisma/client";

export function ReportStatusControls({ reportId, status }: { reportId: string; status: ReportStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function update(next: ReportStatus) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        toast.success("Nahlášení aktualizováno.");
        router.refresh();
      }
    });
  }

  if (status !== "PENDING") return null;

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => update("RESOLVED")} disabled={isPending}>
        Vyřešit
      </Button>
      <Button size="sm" variant="ghost" onClick={() => update("DISMISSED")} disabled={isPending}>
        Zamítnout
      </Button>
    </div>
  );
}
