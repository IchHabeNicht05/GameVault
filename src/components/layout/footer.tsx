import Link from "next/link";
import { Gamepad2, Globe, MessageCircle, Rss } from "lucide-react";

const COLUMNS = [
  {
    title: "Platforma",
    links: [
      { href: "/discover", label: "Objevovat hry" },
      { href: "/search", label: "Hledat" },
      { href: "/genres", label: "Žánry" },
    ],
  },
  {
    title: "Komunita",
    links: [
      { href: "/discover", label: "Aktivita hráčů" },
      { href: "/register", label: "Vytvořit účet" },
      { href: "/login", label: "Přihlásit se" },
    ],
  },
    {
    title: "Společnost",
    links: [
      { href: "/terms", label: "Podmínky služby" },
      { href: "/privacy", label: "Ochrana soukromí" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border-soft bg-panel/40">
      <div className="mx-auto max-w-[1600px] px-5 py-16 lg:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-plasma to-plasma-dim">
                <Gamepad2 className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="font-display text-lg font-semibold text-text-primary">
                Game<span className="text-plasma-soft">Vault</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Objevuj, sbírej a hodnoť hry. Sleduj svůj herní pokrok a spojuj se s komunitou hráčů
              po celém světě.
            </p>
            <div className="mt-6 flex gap-3">
              {[Globe, Rss, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-text-muted transition-colors hover:border-plasma/40 hover:text-plasma-soft"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-text-primary">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-plasma-soft">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border-soft pt-8 text-xs text-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} GameVault. Všechna práva vyhrazena.</p>
          <p>Herní data poskytována s podporou RAWG Video Games Database.</p>
        </div>
      </div>
    </footer>
  );
}
