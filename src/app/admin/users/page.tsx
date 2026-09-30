import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRoleControls } from "@/components/admin/user-role-controls";
import { initials } from "@/lib/utils";

export const metadata = { title: "Admin · Uživatelé" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, username: true, name: true, email: true, avatarUrl: true, role: true, isBanned: true,
      _count: { select: { reviews: true, libraryEntries: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Uživatelé</h1>
      <p className="mt-1 text-text-muted">{users.length} registrovaných účtů.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel-raised text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Uživatel</th>
              <th className="px-4 py-3">Recenze</th>
              <th className="px-4 py-3">Knihovna</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {users.map((u) => (
              <tr key={u.id} className="bg-panel/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatarUrl ?? undefined} />
                      <AvatarFallback>{initials(u.name ?? u.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-text-primary">@{u.username}</p>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{u._count.reviews}</td>
                <td className="px-4 py-3 text-text-secondary">{u._count.libraryEntries}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.isBanned ? "ember" : "emerald"}>{u.isBanned ? "Zablokován" : "Aktivní"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <UserRoleControls userId={u.id} role={u.role} isBanned={u.isBanned} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
