"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Gamepad2, Menu, X, Library, User, Shield, LogOut, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { initials, cn } from "@/lib/utils";
import { CommandSearchTrigger } from "@/components/search/command-search";

const NAV_LINKS = [
  { href: "/discover", label: "Objevovat" },
  { href: "/search", label: "Hledat" },
  { href: "/genres", label: "Žánry" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "glass shadow-[0_8px_32px_-16px_rgba(0,0,0,0.8)]" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-5 py-3 lg:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-plasma to-plasma-dim shadow-[0_0_20px_-4px_rgba(124,92,255,0.8)] transition-transform group-hover:scale-105">
              <Gamepad2 className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-text-primary">
              Game<span className="text-plasma-soft">Vault</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <CommandSearchTrigger className="hidden max-w-sm flex-1 items-center gap-2.5 rounded-full border border-border-soft bg-white/[0.04] px-4 h-10 text-sm text-text-muted transition-colors hover:border-plasma/30 hover:bg-white/[0.07] md:flex" />

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Link href="/library">
                  <Library className="h-5 w-5" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-transparent transition-all hover:ring-plasma/40">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image ?? undefined} alt={session.user.username} />
                      <AvatarFallback>{initials(session.user.name ?? session.user.username)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>@{session.user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session.user.username}`}>
                      <User className="h-4 w-4" /> Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library">
                      <Library className="h-4 w-4" /> Knihovna
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/discover">
                      <Compass className="h-4 w-4" /> Objevovat
                    </Link>
                  </DropdownMenuItem>
                  {(session.user.role === "ADMIN" || session.user.role === "MODERATOR") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="h-4 w-4" /> Admin panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="h-4 w-4" /> Odhlásit se
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Přihlásit se</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Vytvořit účet</Link>
              </Button>
            </div>
          )}

          <button
            className="rounded-lg p-2 text-text-secondary hover:bg-white/[0.06] lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border-soft glass lg:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              <CommandSearchTrigger className="mb-2 flex h-10 w-full items-center gap-2.5 rounded-full border border-border-soft bg-white/[0.04] px-4 text-sm text-text-muted focus:outline-none" />
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/[0.06] hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}
              {!session?.user && (
                <div className="mt-2 flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/login">Přihlásit se</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/register">Vytvořit účet</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}