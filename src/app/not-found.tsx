import Link from "next/link";
import { Compass, Home, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-plasma/10">
        <Ghost className="h-10 w-10 text-plasma-soft" />
      </div>
      <span className="font-stat text-sm uppercase tracking-[0.2em] text-text-muted">Chyba 404</span>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary sm:text-4xl">
        Tahle stránka v trezoru není.
      </h1>
      <p className="mt-3 max-w-md text-text-muted">
        Buď jsi zabloudil(a), nebo hledaná hra/profil neexistuje (možná už byl(a) odstraněn(a)).
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" /> Zpět na Domů
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2">
          <Link href="/search">
            <Compass className="h-4 w-4" /> Prohledat katalog
          </Link>
        </Button>
      </div>
    </div>
  );
}