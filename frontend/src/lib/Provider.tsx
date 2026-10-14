import { useEffect, useRef, useState, type ReactNode } from "react";
import { api, ApiError } from "./api";
import type { Journal, User } from "./types";
import { Context } from "./context";
export function Provider({ children }: { children: ReactNode }) {
  const authEpoch = useRef(0);
  const [user, updateUser] = useState<User | null>(null),
    [journal, setJournal] = useState<Journal | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, notify] = useState("");
  const setUser = (u: User | null) => {
    authEpoch.current += 1;
    updateUser(u);
    setJournal(null);
    setError("");
  };
  async function refresh() {
    const epoch = authEpoch.current;
    try {
      const result = await api<Journal>("/journal");
      if (epoch !== authEpoch.current) return;
      setJournal(result);
      setError("");
    } catch (e) {
      if (epoch !== authEpoch.current) return;
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
        notify("Your session has ended. Please sign in again.");
      } else setError((e as Error).message);
      throw e;
    }
  }
  useEffect(() => {
    let active = true;
    const epoch = authEpoch.current;
    api<User>("/user")
      .then((u) => {
        if (active && epoch === authEpoch.current) updateUser(u);
      })
      .catch((e) => {
        if (active && epoch === authEpoch.current && e.status !== 401)
          setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (user) {
      api<Journal>("/journal")
        .then((result) => {
          if (active) setJournal(result);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }
    return () => {
      active = false;
    };
  }, [user]);
  return (
    <Context.Provider
      value={{
        user,
        setUser,
        journal,
        refresh,
        loading,
        error,
        notice,
        notify,
      }}
    >
      {children}
    </Context.Provider>
  );
}
