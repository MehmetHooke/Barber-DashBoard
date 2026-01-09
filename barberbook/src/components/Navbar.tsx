import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "./theme-provider";


function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2 text-sm transition-colors",
    "text-muted-foreground hover:text-foreground hover:bg-primary",
    isActive ? "bg-primary text-primary-foreground" : "",
  ].join(" ");
}
export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const {theme} = useTheme();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {theme === "dark" ? <img className="w-15 h-12" src="/lightLogo.svg" alt="" /> : <img className="w-15 h-12" src="/darkLogo.svg" alt="" />}
          
          <Link
            to="/"
            className="font-semibold tracking-tight text-foreground hover:opacity-90"
          >
            BarberBook
          </Link>
        </div>
        {!loading && (
          <nav className="flex items-center gap-2">
            {!user && (
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
            )}

            {user && (
              <>
                <NavLink to="/" className={navClass}>
                  Anasayfa
                </NavLink>
                <NavLink to="/book" className={navClass}>
                  Randevu Al
                </NavLink>
                <NavLink to="/my" className={navClass}>
                  Randevularım
                </NavLink>

                {user.role === "BARBER" && (
                  <NavLink to="/barber" className={navClass}>
                    Dashboard
                  </NavLink>
                )}

                <ModeToggle />

                <button
                  onClick={logout}
                  className={[
                    "ml-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    "bg-destructive text-white hover:opacity-70",
                  ].join(" ")}
                >
                  Çıkış yap
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
