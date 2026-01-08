import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ModeToggle } from "./mode-toggle";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2 text-sm transition-colors",
    "text-muted-foreground hover:text-foreground hover:bg-primary",
    isActive ? "bg-primary text-primary-foreground" : "",
  ].join(" ");
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          className="font-semibold tracking-tight text-foreground hover:opacity-90"
        >
          BarberBook
        </Link>

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
                  Home
                </NavLink>
                <NavLink to="/book" className={navClass}>
                  Book
                </NavLink>
                <NavLink to="/my" className={navClass}>
                  My Appointments
                </NavLink>

                {user.role === "BARBER" && (
                  <NavLink to="/barber" className={navClass}>
                    Barber
                  </NavLink>
                )}

                <ModeToggle />

                <button
                  onClick={logout}
                  className={[
                    "ml-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    "bg-destructive text-destructive-foreground hover:opacity-70",
                  ].join(" ")}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
