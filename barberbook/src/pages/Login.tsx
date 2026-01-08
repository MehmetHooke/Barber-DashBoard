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
    <div className="mx-auto mt-20 max-w-sm p-4">
      <div className="rounded-2xl bg-white p-6 shadow">
        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={[
              "flex-1 rounded-lg  py-2 text-sm font-medium",
              mode === "login" ? "bg-white border" : "text-gray-600",
            ].join(" ")}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={[
              "flex-1 rounded-lg py-2 text-sm font-medium",
              mode === "register" ? "bg-white border" : "text-gray-600",
            ].join(" ")}
          >
            Register
          </button>
        </div>

        <h1 className="mt-4 text-xl font-semibold">
          {isRegister ? "Create account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isRegister
            ? "Yeni hesap oluştur ve randevu al."
            : "Giriş yap ve devam et."}
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {isRegister && (
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="mt-1 w-full rounded-lg border p-2"
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
              className="mt-1 w-full rounded-lg border p-2"
              placeholder="mail@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-lg border p-2"
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
            className="mt-2 w-full rounded-lg bg-black py-2 text-white disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Demo Barber: <b>barber@demo.com</b> / <b>123456</b>
        </p>
      </div>
    </div>
  );
}
