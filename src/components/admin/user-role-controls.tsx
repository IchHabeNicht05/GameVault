"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

export function UserRoleControls({ userId, role, isBanned }: { userId: string; role: Role; isBanned: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateRole(next: Role) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (res.ok) {
        toast.success("Role aktualizována.");
        router.refresh();
      } else {
        toast.error("Nemáš oprávnění tuto akci provést.");
      }
    });
  }

  function toggleBan() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !isBanned }),
      });
      if (res.ok) {
        toast.success(isBanned ? "Uživatel odblokován." : "Uživatel zablokován.");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={(v) => updateRole(v as Role)}>
        <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="USER">USER</SelectItem>
          <SelectItem value="MODERATOR">MODERATOR</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" variant={isBanned ? "outline" : "destructive"} onClick={toggleBan} disabled={isPending}>
        {isBanned ? "Odblokovat" : "Zablokovat"}
      </Button>
    </div>
  );
}
