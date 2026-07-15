import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db";
import * as authSchema from "@/db/auth-schema";

/**
 * Better Auth (6.0/D-051) — e-mail + mot de passe, sessions en base,
 * plus connexion Google quand GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 * sont posés (URI de redirection : <site>/api/auth/callback/google).
 * Instance paresseuse : elle attend le client Drizzle (Neon ou PGlite).
 */

async function createAuth() {
  const db = await getDb();
  const google =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }
      : null;
  return betterAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    database: drizzleAdapter(db as any, { provider: "pg", schema: authSchema }),
    emailAndPassword: { enabled: true },
    ...(google ? { socialProviders: { google } } : {}),
    // Liaison de comptes : une connexion Google avec le même e-mail rejoint
    // le compte existant (Google fournit des e-mails vérifiés) au lieu d'en
    // créer un doublon.
    account: {
      accountLinking: { enabled: true, trustedProviders: ["google"] },
    },
    // Secret de développement uniquement — BETTER_AUTH_SECRET requis en production.
    secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-chien-et-chat",
    // Sans BETTER_AUTH_URL, l'URL de base est inférée de la requête entrante.
    ...(process.env.BETTER_AUTH_URL ? { baseURL: process.env.BETTER_AUTH_URL } : {}),
  });
}

type Auth = Awaited<ReturnType<typeof createAuth>>;
const globalStore = globalThis as unknown as { __chienEtChatAuth?: Promise<Auth> };

/** Singleton via globalThis — même raison que getDb() (copies de module par bundle). */
export function getAuth(): Promise<Auth> {
  globalStore.__chienEtChatAuth ??= createAuth();
  return globalStore.__chienEtChatAuth;
}

/** Session courante côté serveur (RSC / Server Actions). */
export async function getSessionUser(headers: Headers) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers });
  return session?.user ?? null;
}
