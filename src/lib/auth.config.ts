import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe část Auth.js konfigurace — žádný Prisma adapter, žádný bcrypt
 * (Credentials provider). Middleware běží ve Vercel Edge Runtime, kde ani
 * jedno z toho nefunguje a navíc by to nabobtnalo Edge Function přes
 * Vercelův 1 MB limit.
 *
 * Plná konfigurace (s adaptérem, providery a bcrypt) je v `auth.ts`, který
 * běží jen v Node.js runtime (API routes, Server Components) — tam žádný
 * limit na velikost není.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;