import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RoleRoute({
  role,
  children,
}: {
  role: "USER" | "BARBER";
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
