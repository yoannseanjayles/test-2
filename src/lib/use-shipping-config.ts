"use client";

import { useEffect, useState } from "react";
import { getShippingConfig } from "@/lib/admin-settings";
import { defaultShippingConfig, type ShippingConfig } from "@/lib/shipping";

/** Cache module : une seule lecture serveur par session de navigation. */
let cached: ShippingConfig | null = null;

/**
 * Config livraison côté client (panier, checkout, rappels de seuil) —
 * valeurs par défaut immédiates, puis réglages de la base (jalon 4).
 */
export function useShippingConfig(): ShippingConfig {
  const [config, setConfig] = useState<ShippingConfig>(cached ?? defaultShippingConfig);
  useEffect(() => {
    if (cached) return;
    getShippingConfig()
      .then((c) => {
        cached = c;
        setConfig(c);
      })
      .catch(() => {});
  }, []);
  return config;
}
