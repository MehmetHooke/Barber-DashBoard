import { createContext, useContext, useEffect, useState } from "react";
import { http } from "../api/http";

type User = {
  id: string;
  role: "USER" | "BARBER";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // sayfa yenilenince token varsa kullanıcıyı çek
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await http.get("/auth/me");
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  async function login(email: string, password: string) {
    const res = await http.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);

    const me = await http.get("/auth/me");
    setUser(me.data.user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await http.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);

    const me = await http.get("/auth/me");
    setUser(me.data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
