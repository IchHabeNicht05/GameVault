"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Home, Compass, Library, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mobilní spodní navigace — na mobilu nechceme jen zmenšený desktop navbar,
 * ale nativně působící tab bar v dosahu palce. Aktivní položka je zvýrazněna
 * sdíleným `layoutId` indikátorem, který mezi taby plynule "přeteče".
 *
 * Skrytá na `lg:` a výš, kde roli přebírá horní navigace.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const items = [
    { href: "/", label: "Domů", icon: Home },
    { href: "/discover", label: "Objevovat", icon: Compass },
    { href: "/library", label: "Knihovna", icon: Library },
    session?.user
      ? { href: `/profile/${session.user.username}`, label: "Profil", icon: User }
      : { href: "/login", label: "Přihlásit", icon: LogIn },
  ];

  return (
    <nav
      aria-label="Hlavní navigace"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft glass pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium"
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-plasma"
                  />
                )}
                <item.icon
                  className={cn("h-5 w-5 transition-colors", active ? "text-plasma-soft" : "text-text-muted")}
                />
                <span className={cn("transition-colors", active ? "text-text-primary" : "text-text-muted")}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}