import { clsx, type ClassValue } from "clsx";

/** Concatène des classes conditionnelles (wrapper clsx, point d'extension unique). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
