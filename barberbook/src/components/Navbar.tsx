import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2 text-sm",
    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link to="/" className="font-semibold">
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

                <button
                  onClick={logout}
                  className="ml-2 rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
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
