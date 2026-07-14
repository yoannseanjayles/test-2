import { getAuth } from "@/lib/auth";

/** Handler universel Better Auth (connexion, inscription, session, déconnexion). */
async function handler(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export { handler as GET, handler as POST };
