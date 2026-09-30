import Image from "next/image";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://placehold.co/1200x1600/12141c/2a2438.png?text=%20"
          alt=""
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-plasma-dim/30" />
        <div className="grain absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-plasma to-plasma-dim">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-white">
              Game<span className="text-plasma-soft">Vault</span>
            </span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Tvoje herní<br />odysea začíná zde.
            </h2>
            <p className="mt-4 max-w-sm text-white/60">
              Sleduj svou herní kolekci, piš recenze a objevuj nové tituly společně s komunitou hráčů.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-plasma to-plasma-dim">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-text-primary">
              Game<span className="text-plasma-soft">Vault</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-text-primary">{title}</h1>
          <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
