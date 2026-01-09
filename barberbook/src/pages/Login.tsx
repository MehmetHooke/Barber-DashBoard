import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type Mode = "login" | "register";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name.trim(), email, password);
      }
      navigate("/", { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background text-foreground">
      <div className="mx-auto flex max-w-sm flex-col px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          {/* Tabs */}
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={[
                "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-500 ease-in-out",
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setMode("register")}
              className={[
                "flex-1  rounded-lg py-2 text-sm font-medium transition-all duration-500 ease-in-out",
                mode === "register"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Register
            </button>
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            {isRegister ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister
              ? "Yeni hesap oluştur ve randevu al."
              : "Giriş yap ve devam et."}
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {isRegister && (
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Mehmet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="mail@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              disabled={loading}
              className={[
                "mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium transition",
                "bg-primary text-primary-foreground hover:opacity-90",
                "disabled:opacity-50",
              ].join(" ")}
            >
              {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo Barber: <b className="text-foreground">barber@demo.com</b> /{" "}
            <b className="text-foreground">123456</b>
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            User Test: <b className="text-foreground">user@test.com</b> /{" "}
            <b className="text-foreground">user123</b>
          </p>
        </div>
      </div>
    </div>
  );
}
