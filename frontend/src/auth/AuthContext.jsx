import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { clearTokens, getRefresh, hasAccess } from "./tokens";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const loadMe = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refresh = getRefresh();
      if (refresh) {
        await api.post("/api/auth/logout/", { refresh });
      }
    } catch {
      // ignore
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      if (hasAccess()) {
        await loadMe();
      }
      setBooting(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, booting, loadMe, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
