/**
 * Sdílená katalogová data GameVault — žánry, platformy, vývojáři, vydavatelé,
 * hry a achievementy. Používá je jak `seed.ts` (plný demo dataset s falešnými
 * uživateli pro vývoj/portfolio ukázku), tak `seed-production.ts` (jen reálný
 * katalog, bez demo účtů, pro ostrý provoz).
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cover(title: string): string {
  return `https://placehold.co/600x800/12141c/f4f5f7.png?text=${encodeURIComponent(title)}`;
}
export function backdrop(title: string): string {
  return `https://placehold.co/1920x1080/0d0e13/2a2438.png?text=${encodeURIComponent(title)}`;
}
export function screenshot(title: string, n: number): string {
  return `https://placehold.co/1280x720/191c26/8b5cf6.png?text=${encodeURIComponent(title + " — " + n)}`;
}
export function avatar(seed: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=191c26,12141c`;
}

export const GENRES = [
  "Akční", "RPG", "Adventura", "Strategie", "Simulace", "Sportovní",
  "Závodní", "Střílečka", "Horor", "Plošinovka", "Sandbox", "Battle Royale",
  "MOBA", "Puzzle", "Tahová strategie",
];

export const PLATFORMS: { name: string; family: string }[] = [
  { name: "PC (Windows)", family: "PC" },
  { name: "PlayStation 5", family: "PlayStation" },
  { name: "PlayStation 4", family: "PlayStation" },
  { name: "Xbox Series X/S", family: "Xbox" },
  { name: "Xbox One", family: "Xbox" },
  { name: "Nintendo Switch", family: "Nintendo" },
];

export const DEVELOPERS = [
  "CD Projekt Red", "FromSoftware", "Rockstar Games", "Larian Studios",
  "Insomniac Games", "Naughty Dog", "Respawn Entertainment", "Bethesda Game Studios",
  "Guerrilla Games", "Santa Monica Studio", "Mojang Studios", "Supergiant Games",
  "Team Cherry", "id Software", "Remedy Entertainment",
  "EA Vancouver", "Playground Games", "Firaxis Games",
];

export const PUBLISHERS = [
  "CD Projekt", "Bandai Namco", "Take-Two Interactive", "Sony Interactive Entertainment",
  "Electronic Arts", "Bethesda Softworks", "Microsoft Studios", "Nintendo",
  "Devolver Digital", "Epic Games Publishing", "505 Games",
  "Larian Studios", "Team Cherry",
];

export interface SeedGame {
  title: string;
  description: string;
  releaseDate: string;
  metacritic: number;
  esrbRating: string;
  genres: string[];
  platforms: string[];
  developers: string[];
  publishers: string[];
  featured?: boolean;
  trending?: boolean;
  trailerUrl?: string;
}

export const GAMES: SeedGame[] = [
  {
    title: "Cyberpunk 2077",
    description:
      "Otevřený svět zasazený do Night City, megalopole posedlé mocí, slávou a tělesnou modifikací. Hraješ za V, žoldáka na cestě za jedinečným implantátem, klíčem k nesmrtelnosti.",
    releaseDate: "2020-12-10",
    metacritic: 86,
    esrbRating: "M",
    genres: ["Akční", "RPG", "Střílečka"],
    platforms: ["PC (Windows)", "PlayStation 5", "Xbox Series X/S"],
    developers: ["CD Projekt Red"],
    publishers: ["CD Projekt"],
    featured: true,
    trending: true,
    trailerUrl: "https://www.youtube.com/embed/8X2kIfS6fb8",
  },
  {
    title: "Elden Ring",
    description:
      "Fantasy akční RPG odehrávající se v rozlehlém světě plném nebezpečí. Vytvoř si vlastní postavu a objevuj Mezikruží, zemi napůl zapomenutou, roztříštěnou Elden Ringem.",
    releaseDate: "2022-02-25",
    metacritic: 96,
    esrbRating: "M",
    genres: ["Akční", "RPG"],
    platforms: ["PC (Windows)", "PlayStation 5", "PlayStation 4", "Xbox Series X/S"],
    developers: ["FromSoftware"],
    publishers: ["Bandai Namco"],
    featured: true,
    trending: true,
    trailerUrl: "https://www.youtube.com/embed/E3Huy2cdih0",
  },
  {
    title: "Red Dead Redemption 2",
    description:
      "Epický příběh cti a loajality v éře konce divokého amerického Západu. Arthur Morgan a gang Van der Linde prchají přes rozlehlou krajinu Ameriky.",
    releaseDate: "2018-10-26",
    metacritic: 97,
    esrbRating: "M",
    genres: ["Akční", "Adventura"],
    platforms: ["PC (Windows)", "PlayStation 4", "Xbox One"],
    developers: ["Rockstar Games"],
    publishers: ["Take-Two Interactive"],
    featured: true,
    trailerUrl: "https://www.youtube.com/embed/gmA6MrX81z4",
  },
  {
    title: "Baldur's Gate 3",
    description:
      "Sbírej si partu společníků a vrať se do světa Faerûnu v příběhu zrady, moci a vykoupení, kde tvá volba utváří příběh o parazitovi ve tvém mozku.",
    releaseDate: "2023-08-03",
    metacritic: 96,
    esrbRating: "M",
    genres: ["RPG", "Tahová strategie", "Adventura"],
    platforms: ["PC (Windows)", "PlayStation 5"],
    developers: ["Larian Studios"],
    publishers: ["Larian Studios"],
    featured: true,
    trending: true,
    trailerUrl: "https://www.youtube.com/embed/1X-x_kk-Fmc",
  },
  {
    title: "Marvel's Spider-Man 2",
    description:
      "Peter Parker a Miles Morales se vrací jako Spider-Mani v epickém příběhu o rodině, přátelství a odpovědnosti, aby zastavili Kravena Lovce a Venoma.",
    releaseDate: "2023-10-20",
    metacritic: 90,
    esrbRating: "T",
    genres: ["Akční", "Adventura"],
    platforms: ["PlayStation 5"],
    developers: ["Insomniac Games"],
    publishers: ["Sony Interactive Entertainment"],
    trending: true,
    trailerUrl: "https://www.youtube.com/embed/nXJcXyM8lFc",
  },
  {
    title: "The Last of Us Part II",
    description:
      "Pět let po svém nebezpečném putování napříč postapokalyptickou Amerikou se Ellie a Joel usadili v Jacksonu, Wyomingu. Poklidný život je přerušen násilným činem.",
    releaseDate: "2020-06-19",
    metacritic: 93,
    esrbRating: "M",
    genres: ["Akční", "Adventura", "Horor"],
    platforms: ["PlayStation 4", "PlayStation 5"],
    developers: ["Naughty Dog"],
    publishers: ["Sony Interactive Entertainment"],
    trailerUrl: "https://www.youtube.com/embed/vhII1qlcbG4",
  },
  {
    title: "Apex Legends",
    description:
      "Free-to-play battle royale střílečka hrdinů, kde legendární soutěžníci bojují o slávu a bohatství na okraji Frontier. Zvládni jedinečné schopnosti postav a týmovou synergii.",
    releaseDate: "2019-02-04",
    metacritic: 88,
    esrbRating: "T",
    genres: ["Battle Royale", "Střílečka"],
    platforms: ["PC (Windows)", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch"],
    developers: ["Respawn Entertainment"],
    publishers: ["Electronic Arts"],
    trending: true,
    trailerUrl: "https://www.youtube.com/embed/innmNewjkuk",
  },
  {
    title: "The Elder Scrolls V: Skyrim",
    description:
      "Rozlehlá fantasy RPG ságy o boji s drakem, který ohrožuje zničit svět. Prozkoumej provincii Skyrim ve své vlastní legendě, staň se čímkoli si zvolíš.",
    releaseDate: "2011-11-11",
    metacritic: 94,
    esrbRating: "M",
    genres: ["RPG", "Adventura"],
    platforms: ["PC (Windows)", "PlayStation 4", "Xbox One", "Nintendo Switch"],
    developers: ["Bethesda Game Studios"],
    publishers: ["Bethesda Softworks"],
    trailerUrl: "https://www.youtube.com/embed/PDSCsZKA_hA",
  },
  {
    title: "Horizon Forbidden West",
    description:
      "Aloy se vydává do dalekého Zakázaného západu — obrovské oblasti plné nebezpečných strojů a lidských frakcí, aby zjistila příčinu smrtelné bouře ničící zemi.",
    releaseDate: "2022-02-18",
    metacritic: 88,
    esrbRating: "T",
    genres: ["Akční", "RPG", "Adventura"],
    platforms: ["PlayStation 5", "PlayStation 4"],
    developers: ["Guerrilla Games"],
    publishers: ["Sony Interactive Entertainment"],
    trailerUrl: "https://www.youtube.com/embed/Lq2ZceCEzeE",
  },
  {
    title: "God of War Ragnarök",
    description:
      "Kratos a Atreus se musí vydat na nebezpečnou cestu napříč devíti světy, aby našli odpovědi před nadcházejícím Ragnarökem — konečnou zkouškou přežití.",
    releaseDate: "2022-11-09",
    metacritic: 94,
    esrbRating: "M",
    genres: ["Akční", "Adventura"],
    platforms: ["PlayStation 5", "PlayStation 4"],
    developers: ["Santa Monica Studio"],
    publishers: ["Sony Interactive Entertainment"],
    trending: true,
    trailerUrl: "https://www.youtube.com/embed/EE-4GvjKcPs",
  },
  {
    title: "Minecraft",
    description:
      "Sandboxová hra, kde těžíš, stavíš a přežíváš v nekonečném procedurálně generovaném světě plném bloků, nestvůr a nekonečných možností tvorby.",
    releaseDate: "2011-11-18",
    metacritic: 93,
    esrbRating: "E10+",
    genres: ["Sandbox", "Adventura", "Simulace"],
    platforms: ["PC (Windows)", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch"],
    developers: ["Mojang Studios"],
    publishers: ["Microsoft Studios"],
    trailerUrl: "https://www.youtube.com/embed/MmB9b5njVbA",
  },
  {
    title: "Hades",
    description:
      "Roguelike akční RPG, kde jako princ podsvětí bojuješ o únik z podsvětí boha Hádese, přičemž ti pomáhají olympští bohové s mocnými dary.",
    releaseDate: "2020-09-17",
    metacritic: 93,
    esrbRating: "T",
    genres: ["Akční", "RPG", "Plošinovka"],
    platforms: ["PC (Windows)", "Nintendo Switch", "PlayStation 5", "Xbox Series X/S"],
    developers: ["Supergiant Games"],
    publishers: ["Devolver Digital"],
    trailerUrl: "https://www.youtube.com/embed/Jsh_qy7bBoY",
  },
  {
    title: "Hollow Knight",
    description:
      "Prozkoumej rozvětvenou opuštěnou říši hmyzu a hrdinů v tradiční 2D metroidvanii plné okouzlujícího ručně kresleného světa a náročných soubojů.",
    releaseDate: "2017-02-24",
    metacritic: 90,
    esrbRating: "E10+",
    genres: ["Plošinovka", "Adventura", "Akční"],
    platforms: ["PC (Windows)", "Nintendo Switch", "PlayStation 4", "Xbox One"],
    developers: ["Team Cherry"],
    publishers: ["Team Cherry"],
    trailerUrl: "https://www.youtube.com/embed/UAO2urG23S4",
  },
  {
    title: "DOOM Eternal",
    description:
      "Peklo napadlo Zemi. Staň se nejmocnější bytostí ve vesmíru a bojuj proti démonickým hordám v rychlé, brutální akci z pohledu první osoby.",
    releaseDate: "2020-03-20",
    metacritic: 88,
    esrbRating: "M",
    genres: ["Střílečka", "Akční"],
    platforms: ["PC (Windows)", "PlayStation 4", "Xbox One", "Nintendo Switch"],
    developers: ["id Software"],
    publishers: ["Bethesda Softworks"],
    trailerUrl: "https://www.youtube.com/embed/FkklG9MA0vM",
  },
  {
    title: "Alan Wake 2",
    description:
      "Survival horor pokračování, kde se spisovatel Alan Wake, uvězněný v temném alternativním realitě, a FBI agentka Saga Anderson snaží uniknout hororové noční můře.",
    releaseDate: "2023-10-27",
    metacritic: 89,
    esrbRating: "M",
    genres: ["Horor", "Akční", "Adventura"],
    platforms: ["PC (Windows)", "PlayStation 5", "Xbox Series X/S"],
    developers: ["Remedy Entertainment"],
    publishers: ["Epic Games Publishing"],
    trending: true,
    trailerUrl: "https://www.youtube.com/embed/2LOEzsJ2c2c",
  },
  {
    title: "EA Sports FC 25",
    description:
      "Nejautentičtější fotbalový zážitek s tisíci licencovanými týmy, hráči a ligami z celého světa. Buduj svůj tým a soutěž online i offline.",
    releaseDate: "2024-09-27",
    metacritic: 78,
    esrbRating: "E",
    genres: ["Sportovní", "Simulace"],
    platforms: ["PC (Windows)", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch"],
    developers: ["EA Vancouver"],
    publishers: ["Electronic Arts"],
    trending: true,
  },
  {
    title: "Forza Horizon 5",
    description:
      "Prozkoumej nádherný a rozmanitý otevřený svět Mexika s vždy proměnlivým prostředím ve svých snových autech v této akční závodní hře.",
    releaseDate: "2021-11-09",
    metacritic: 92,
    esrbRating: "E",
    genres: ["Závodní", "Sportovní"],
    platforms: ["PC (Windows)", "Xbox Series X/S", "Xbox One"],
    developers: ["Playground Games"],
    publishers: ["Microsoft Studios"],
    trailerUrl: "https://www.youtube.com/embed/FQqAoYJvHY0",
  },
  {
    title: "Civilization VII",
    description:
      "Veď civilizaci od starověku po vesmírný věk v epické tahové strategii plné diplomacie, objevů, válčení a budování impéria.",
    releaseDate: "2025-02-11",
    metacritic: 85,
    esrbRating: "E10+",
    genres: ["Tahová strategie", "Strategie"],
    platforms: ["PC (Windows)", "PlayStation 5", "Xbox Series X/S"],
    developers: ["Firaxis Games"],
    publishers: ["Take-Two Interactive"],
  },
  {
    title: "GTA VI",
    description:
      "Návrat do Vice City v největším a nejambicióznějším díle série Grand Theft Auto — rozlehlý otevřený svět plný zločinu, satiry a nekonečných možností.",
    releaseDate: "2026-05-26",
    metacritic: 0,
    esrbRating: "RP",
    genres: ["Akční", "Adventura"],
    platforms: ["PlayStation 5", "Xbox Series X/S"],
    developers: ["Rockstar Games"],
    publishers: ["Take-Two Interactive"],
    trending: true,
  },
  {
    title: "The Witcher IV",
    description:
      "Nová kapitola ságy zaklínačů poháněná Unreal Engine 5. Vydej se s Ciri na cestu plnou nebezpečí, monster a morálních dilemat v otevřeném světě.",
    releaseDate: "2027-01-01",
    metacritic: 0,
    esrbRating: "RP",
    genres: ["RPG", "Akční", "Adventura"],
    platforms: ["PC (Windows)", "PlayStation 5", "Xbox Series X/S"],
    developers: ["CD Projekt Red"],
    publishers: ["CD Projekt"],
    trending: true,
  },
];

export const ACHIEVEMENTS = [
  { slug: "first-steps", name: "První krůčky", description: "Přidej svou první hru do knihovny.", icon: "Footprints", tier: "bronze" },
  { slug: "collector", name: "Sběratel", description: "Přidej 10 her do knihovny.", icon: "Library", tier: "silver" },
  { slug: "curator", name: "Kurátor", description: "Přidej 50 her do knihovny.", icon: "Archive", tier: "gold" },
  { slug: "finisher", name: "Dokončovatel", description: "Dokonči svou první hru.", icon: "Flag", tier: "bronze" },
  { slug: "completionist", name: "Kompletista", description: "Dokonči 10 her.", icon: "Trophy", tier: "gold" },
  { slug: "critic", name: "Kritik", description: "Napiš svou první recenzi.", icon: "PenSquare", tier: "bronze" },
  { slug: "top-voice", name: "Uznávaný hlas", description: "Napiš 10 recenzí.", icon: "Megaphone", tier: "gold" },
  { slug: "influencer", name: "Influencer", description: "Získej 5 sledujících.", icon: "Users", tier: "silver" },
  { slug: "legend", name: "Legenda Vaultu", description: "Dokonči 25 her a napiš 25 recenzí.", icon: "Crown", tier: "platinum" },
];