"use client";

import { createAuthClient } from "better-auth/react";

/** Client Better Auth — hooks de session et actions e-mail/mot de passe. */
export const authClient = createAuthClient();
export const { useSession, signIn, signUp, signOut } = authClient;
