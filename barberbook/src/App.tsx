import Login from "./pages/Login";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="p-6">Loading...</p>;

  if (!user) return <Login />;

  return (
    <div className="p-6">
      <p>
        Hoş geldin 👋 <b>{user.role}</b>
      </p>
      <button onClick={logout} className="mt-4 rounded bg-red-500 px-4 py-2 text-white">
        Logout
      </button>
    </div>
  );
}
