"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminAuthCtx {
  pin:     string;
  loaded:  boolean;
  login:   (p: string) => void;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx>({
  pin: "", loaded: false, login: () => {}, signOut: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [pin, setPin_]   = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPin_(sessionStorage.getItem("admin_pin") ?? "");
    setLoaded(true);
  }, []);

  function login(p: string) {
    sessionStorage.setItem("admin_pin", p);
    setPin_(p);
  }

  function signOut() {
    sessionStorage.removeItem("admin_pin");
    setPin_("");
  }

  return (
    <AdminAuthContext.Provider value={{ pin, loaded, login, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
