"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Animal, Gabarit } from "@/lib/catalog";

/**
 * Compte client — démo locale (jalon 4). L'authentification réelle et la
 * persistance serveur arrivent en Phase 6. Pas de connexion sociale (H23).
 */

type User = { email: string; firstName: string };

type AuthState = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
};

export const useAuth = create<AuthState>()(
  persist((set) => ({ user: null, signIn: (user) => set({ user }), signOut: () => set({ user: null }) }), {
    name: "chien-et-chat-auth",
  }),
);

/** Profil animal (D-015/D-036) — max 5 (H24), photo privée non gérée en démo (H25). */
export type Pet = {
  id: string;
  name: string;
  species: Animal;
  gabarit: Gabarit;
};

export const MAX_PETS = 5;

type PetsState = {
  pets: Pet[];
  addPet: (pet: Omit<Pet, "id">) => boolean;
  removePet: (id: string) => void;
};

export const usePets = create<PetsState>()(
  persist(
    (set, get) => ({
      pets: [],
      addPet: (pet) => {
        if (get().pets.length >= MAX_PETS) return false;
        set((state) => ({
          pets: [...state.pets, { ...pet, id: `${pet.name}-${state.pets.length}-${Math.random().toString(36).slice(2, 7)}` }],
        }));
        return true;
      },
      removePet: (id) => set((state) => ({ pets: state.pets.filter((p) => p.id !== id) })),
    }),
    { name: "chien-et-chat-pets" },
  ),
);

/** Statuts de commande (D-016). */
export const orderStatuses = ["Payée", "En préparation", "Expédiée", "Livrée", "Clôturée"] as const;
