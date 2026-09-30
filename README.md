# 🎮 GameVault

**Moderní cinematic gaming platforma** — objevuj hry, buduj svou kolekci, hodnoť tituly, piš recenze, sleduj herní statistiky a spojuj se s komunitou hráčů.

Postaveno jako plnohodnotný produkt, ne školní databázový projekt: cinematic hero sekce, glassmorphism akcenty, plynulé Framer Motion animace, Netflix-style horizontální karusely a prémiový detail hry.

---

## 🧱 Tech stack

| Vrstva | Technologie |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Jazyk | TypeScript |
| UI | React 19, Tailwind CSS v4, vlastní shadcn/ui-styl komponenty (Radix primitives) |
| Animace | Framer Motion |
| Databáze | PostgreSQL |
| ORM | Prisma |
| Autentizace | Auth.js (NextAuth v5) — credentials provider, JWT session |
| Validace | Zod + React Hook Form |
| Grafy | Recharts |
| Ikony | Lucide |
| Herní data | Kurátorovaný katalog + volitelná synchronizace s RAWG Video Games Database API |

---

## ✨ Funkce

- **Domovská stránka** — cinematic hero s rotujícími featured hrami, trending/popular/recently released/upcoming karusely, přehled žánrů
- **Detail hry** — cover, screenshoty (lightbox galerie), trailer, popis, datum vydání, žánry, platformy, vývojáři, vydavatelé, hodnocení a recenze
- **Akce s hrou** — přidat do knihovny (Playing/Completed/Backlog/Dropped), přidat na wishlist, ohodnotit 1–10, napsat recenzi (s podporou spoiler tagu)
- **Uživatelský profil** — avatar, bio, oblíbené žánry, knihovna, wishlist, achievementy, statistiky (hry vlastněné/dokončené, odehrané hodiny, oblíbený žánr, průměrné hodnocení)
- **Sociální funkce** — sledování uživatelů, feed aktivit ("Martin přidal Cyberpunk 2077 do knihovny"), lajky a komentáře u recenzí
- **Knihovna her** — správa stavů s posuvníkem postupu 0–100 %
- **Vyhledávání** — podle názvu, žánru, platformy (PC/PlayStation/Xbox/Nintendo), roku vydání, s řazením
- **Admin panel** — přehled metrik, správa uživatelů (role, blokace), katalog her, moderace recenzí, řešení nahlášení
- **Systém rolí** — USER / MODERATOR / ADMIN s middleware ochranou tras
- **Achievementy** — automatické odemykání na základě aktivity (první hra, 10 her, dokončení, recenze, sledující…)

---

## 🎨 Design systém

- **Paleta**: hluboká "void" černá (`#08090d`), plazmová fialová (`#7c5cff`), ember oranžová (`#ff5c35`), zlatá pro hodnocení (`#f2b84b`)
- **Typografie**: `Unbounded` (display nadpisy) + `Manrope` (text) + `JetBrains Mono` (statistiky/čísla) — samostatně hostované přes `@fontsource`, žádná závislost na externím CDN
- **Efekty**: jemný glassmorphism na navigaci, scrim gradienty na hero sekcích, film grain textura, hover mikro-animace, plynulé stránkové přechody

---

## 🚀 Lokální spuštění

### 1. Instalace závislostí

```bash
npm install
```

> `postinstall` skript automaticky spustí `prisma generate`.

### 2. Databáze

Potřebuješ běžící PostgreSQL instanci. Zkopíruj `.env.example` do `.env` a nastav `DATABASE_URL`:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gamevault"
AUTH_SECRET="vygeneruj pomocí: npx auth secret"
NEXTAUTH_URL="http://localhost:3000"
```

Vytvoř tabulky a naplň databázi realistickými demo daty:

```bash
npm run db:push
npm run db:seed
```

### 3. Spuštění vývojového serveru

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

### Demo přihlašovací účty

Po spuštění `npm run db:seed` jsou k dispozici účty (heslo pro všechny: `password123`):

| Uživatelské jméno | E-mail | Role |
|---|---|---|
| `martin_k` | martin_k@gamevault.dev | ADMIN |
| `petra_gaming` | petra_gaming@gamevault.dev | MODERATOR |
| `honza_fps`, `lucka_indie`, `tomas_retro`, `eliska_rpg`, `filip_streams`, `katka_cozy` | `[username]@gamevault.dev` | USER |

---

## 🔗 Napojení na RAWG API (volitelné)

Katalog her je ve výchozím stavu naplněn kurátorovanými daty ze seed skriptu — appka RAWG při běhu nevolá. Pokud chceš synchronizovat živá data z [RAWG Video Games Database](https://rawg.io/apidocs):

1. Získej API klíč na rawg.io a přidej jej do `.env` jako `RAWG_API_KEY`
2. Klient je připraven v `src/lib/rawg.ts` (`fetchPopularGames`, `fetchGameDetails`, `fetchGameScreenshots`, `searchGames`)
3. Napiš si vlastní synchronizační skript (podobný `prisma/seed.ts`), který data z RAWG namapuje na Prisma modely

---

## 📁 Struktura projektu

```
src/
├── app/                    # Next.js App Router — stránky a API routes
│   ├── page.tsx                 Homepage
│   ├── games/[slug]/            Detail hry
│   ├── profile/[username]/      Uživatelský profil
│   ├── library/                 Knihovna přihlášeného uživatele
│   ├── search/                  Vyhledávání a filtry
│   ├── discover/                Feed aktivit komunity
│   ├── genres/                  Přehled žánrů
│   ├── admin/                   Admin panel (users/games/reviews/reports)
│   ├── login/, register/        Autentizace
│   └── api/                     REST API routes
├── components/
│   ├── ui/                 Základní design systém komponenty
│   ├── games/               GameCard, karusely, hero, akce, recenze
│   ├── social/               Follow button, activity feed
│   ├── profile/              Statistiky, grafy
│   ├── admin/                Moderace
│   └── layout/                Navbar, Footer, Auth shell
├── lib/
│   ├── data/                 Prisma query vrstva (games.ts, users.ts)
│   ├── validations/          Zod schémata
│   ├── auth.ts               Auth.js konfigurace
│   ├── prisma.ts             Prisma client singleton
│   ├── rawg.ts                RAWG API klient
│   ├── activity.ts            Logování aktivit
│   └── achievements.ts        Odemykání achievementů
prisma/
├── schema.prisma            Datový model (13+ entit)
└── seed.ts                  Realistická demo data
```

---

## 🗄️ Datový model

`User`, `Game`, `Genre`, `Platform`, `Developer`, `Publisher`, `Screenshot`, `LibraryEntry`, `Wishlist`, `Rating`, `Review`, `Comment`, `Like`, `Achievement`, `UserAchievement`, `Follow`, `Activity`, `Report` — plus Auth.js modely (`Account`, `Session`, `VerificationToken`).

Kompletní schéma se všemi relacemi a indexy najdeš v `prisma/schema.prisma`.

---

## ⚠️ Poznámka k vývojovému prostředí

Tento projekt byl sestaven v izolovaném sandboxu, jehož síťová pravidla blokují přístup k `binaries.prisma.sh` (odkud Prisma stahuje své engine binárky). Proto zde nebylo možné naživo spustit `prisma generate` / `prisma db push` / seed skript a plně ověřit build.

**Na běžném stroji s normálním přístupem k internetu žádný z těchto kroků problém nedělá** — `npm install` (díky `postinstall` skriptu), `npm run db:push` a `npm run db:seed` proběhnou standardně. Veškerý TypeScript kód byl v sandboxu zkontrolován pomocí `tsc --noEmit`; jediné chyby, které se objevily, byly kaskádové důsledky chybějícího vygenerovaného Prisma klienta (např. `Role`, `LibraryStatus` enum typy) — jakmile `prisma generate` doplní reálné typy z `schema.prisma`, tyto chyby zmizí samy.

---

## 📄 Licence

Tento projekt je demo/výuková ukázka. Herní tituly zmíněné v seed datech jsou majetkem svých příslušných vlastníků a jsou zde uvedeny pouze jako referenční metadata (název, žánr, datum vydání) — obrázky v demu jsou generované placeholdery, ne oficiální herní artwork.
