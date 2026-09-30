import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ochrana soukromí" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-display text-3xl font-semibold text-text-primary">Ochrana soukromí</h1>
      <p className="mt-2 text-sm text-text-muted">Platné od {new Date().toLocaleDateString("cs-CZ")}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">1. Jaké údaje sbíráme</h2>
          <p>
            Při registraci ukládáme tvůj e-mail, uživatelské jméno a (v zašifrované podobě) heslo.
            Dále ukládáme obsah, který na platformě vytvoříš — recenze, hodnocení, knihovnu her,
            komentáře a informace o tom, koho sleduješ.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">2. Jak údaje používáme</h2>
          <p>
            Údaje používáme výhradně k provozu platformy — přihlašování, zobrazování tvého profilu a
            aktivity ostatním uživatelům (podle nastavení soukromí), a ke zlepšování služby. Údaje
            neprodáváme třetím stranám.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">3. Cookies</h2>
          <p>
            Používáme nezbytné cookies pro udržení přihlášení (session token). Nepoužíváme sledovací
            ani reklamní cookies třetích stran.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">4. Zabezpečení</h2>
          <p>
            Hesla ukládáme výhradně jako bcrypt hash, nikdy v čitelné podobě. Komunikace mezi tvým
            prohlížečem a serverem je šifrovaná (HTTPS).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">5. Tvá práva</h2>
          <p>
            Máš právo požádat o výmaz svého účtu a souvisejících dat, opravu nepřesných údajů nebo
            export svých dat. Kontaktuj nás na e-mailu uvedeném v patičce webu.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">6. Herní data třetích stran</h2>
          <p>
            Metadata o hrách mohou pocházet z veřejného API RAWG (rawg.io). Při synchronizaci se RAWG
            dotazujeme jen na herní katalog, nikdy neposíláme žádné údaje o uživatelích platformy.
          </p>
        </section>
      </div>
    </div>
  );
}