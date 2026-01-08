import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Barber Booking</h1>
          <button
            onClick={logout}
            className="rounded-lg bg-black px-3 py-2 text-sm text-white"
          >
            Logout
          </button>
        </div>

        <p className="mt-3 text-gray-700">
          Hoş geldin: <b>{user?.role}</b>
        </p>

        <div className="mt-6 flex gap-3">
          <Link className="rounded-lg border px-3 py-2" to="/book">
            Book
          </Link>

          <Link className="rounded-lg border px-3 py-2" to="/my">
            My Appointments
          </Link>

          <Link className="rounded-lg border px-3 py-2" to="/barber">
            Barber Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
