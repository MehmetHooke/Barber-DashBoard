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
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function isUnauthorized(err: any) {
  return err?.response?.status === 401;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const token = localStorage.getItem("token");

    // ✅ token yoksa me çağırma
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await http.get("/auth/me");
      setUser(res.data.user);
    } catch (err: any) {
      // ✅ token geçersizse temizle
      if (isUnauthorized(err)) {
        localStorage.removeItem("token");
      }
      setUser(null);
    }
  };

  // sayfa yenilenince token varsa kullanıcıyı çek
  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await http.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      // ✅ token yazıldıktan sonra me
      await refreshMe();

      // refreshMe user'ı null yaptıysa (me fail) token’ı temizle (güvenlik)
      if (!user && !localStorage.getItem("token")) {
        // token zaten temizlenmiş olabilir
      }
    } catch (err) {
      // login fail -> token olmasın
      localStorage.removeItem("token");
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    try {
      const res = await http.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);

      await refreshMe();
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
