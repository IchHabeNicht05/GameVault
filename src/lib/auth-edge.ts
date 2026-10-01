import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Odlehčená instance Auth.js jen pro middleware — umí přečíst JWT session
 * cookie a nic víc. Žádný adapter, žádné providery, takže se do Edge Function
 * bundlu nenatáhne Prisma ani bcrypt.
 */
export const { auth } = NextAuth(authConfig);