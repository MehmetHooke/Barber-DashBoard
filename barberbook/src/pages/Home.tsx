import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Welcome</h1>
        <p className="mt-2 text-gray-700">
          Logged in as: <b>{user?.role}</b>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Use the navbar to book appointments or manage the barber dashboard.
        </p>
      </div>
    </div>
  );
}
