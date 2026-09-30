import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { MagneticCursor } from "@/components/effects/magnetic-cursor";
import { CommandSearch } from "@/components/search/command-search";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata: Metadata = {
  title: {
    default: "GameVault — Objevuj. Sbírej. Hraj.",
    template: "%s · GameVault",
  },
  description:
    "GameVault je moderní platforma pro hráče — objevuj hry, buduj svou kolekci, hodnoť tituly, piš recenze a sleduj herní statistiky s komunitou hráčů.",
  keywords: ["hry", "gaming", "herní databáze", "recenze her", "herní knihovna"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="cs" className="dark">
      <body className="min-h-screen bg-void font-body antialiased cursor-none-desktop">
        <AuroraBackground />
        <MagneticCursor />
        <CommandSearch />
        <AuthProvider session={session}>
          <TooltipProvider delayDuration={200}>
            <div className="relative z-10">
              <Navbar />
              <main className="min-h-screen pt-18 pb-20 lg:pb-0">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <BottomNav />
            </div>
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}