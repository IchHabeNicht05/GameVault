import type { Metadata } from "next";

export const metadata: Metadata = { title: "Podmínky služby" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-display text-3xl font-semibold text-text-primary">Podmínky služby</h1>
      <p className="mt-2 text-sm text-text-muted">Platné od {new Date().toLocaleDateString("cs-CZ")}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">1. Úvod</h2>
          <p>
            Používáním platformy GameVault souhlasíš s těmito podmínkami. Pokud s nimi nesouhlasíš,
            prosím službu nepoužívej.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">2. Uživatelský účet</h2>
          <p>
            Za bezpečnost přihlašovacích údajů ke svému účtu odpovídáš ty. Jsi povinen(na) uvádět
            pravdivé údaje při registraci a neprodleně nás informovat o jakémkoli neoprávněném
            použití tvého účtu.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">3. Obsah vytvářený uživateli</h2>
          <p>
            Za recenze, komentáře a další obsah, který na platformě zveřejníš, neseš odpovědnost ty.
            Zavazuješ se nezveřejňovat obsah, který je nezákonný, urážlivý, porušuje práva třetích
            stran nebo jinak porušuje tyto podmínky. Vyhrazujeme si právo takový obsah odstranit a
            účet, který ho zveřejnil, v odůvodněných případech omezit nebo zablokovat.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">4. Herní data</h2>
          <p>
            Metadata o hrách (názvy, obrázky, popisy) pocházejí z veřejných databází (např. RAWG) nebo
            jsou kurátorovaná pro účely demonstrace platformy. Ochranné známky a autorská práva k
            uvedeným hrám náleží jejich příslušným vlastníkům.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">5. Omezení odpovědnosti</h2>
          <p>
            Platforma je poskytována &bdquo;tak jak je&ldquo; bez záruk jakéhokoli druhu. Nezaručujeme
            nepřetržitou dostupnost ani bezchybný provoz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">6. Změny podmínek</h2>
          <p>
            Tyto podmínky můžeme čas od času aktualizovat. O podstatných změnách tě budeme informovat
            prostřednictvím platformy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-medium text-text-primary">7. Kontakt</h2>
          <p>S dotazy ohledně těchto podmínek nás kontaktuj na e-mailu uvedeném v patičce webu.</p>
        </section>
      </div>
    </div>
  );
}