import Link from "next/link";
import { Users, Gamepad2, MessageSquareWarning, Flag, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Přehled", icon: LayoutDashboard },
  { href: "/admin/users", label: "Uživatelé", icon: Users },
  { href: "/admin/games", label: "Hry", icon: Gamepad2 },
  { href: "/admin/reviews", label: "Recenze", icon: MessageSquareWarning },
  { href: "/admin/reports", label: "Nahlášení", icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1600px] gap-8 px-5 py-10 lg:px-10">
      <aside className="hidden w-56 shrink-0 lg:block">
        <h2 className="mb-4 px-2 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
          Admin panel
        </h2>
        <nav className="space-y-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
            >
              <link.icon className="h-4 w-4" /> {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
