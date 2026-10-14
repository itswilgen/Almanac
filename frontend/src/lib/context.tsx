import { createContext, useContext } from "react";
import type { Journal, User } from "./types";
export const Context = createContext<{
  user: User | null;
  setUser: (u: User | null) => void;
  journal: Journal | null;
  refresh: () => Promise<void>;
  loading: boolean;
  error: string;
  notice: string;
  notify: (s: string) => void;
} | null>(null);
export function useApp() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing provider");
  return c;
}
