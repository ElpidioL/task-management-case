import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function PublicOnlyRoute() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <main className="container">Loading session...</main>;
  }

  if (user) {
    return <Navigate to="/tasks" replace />;
  }

  return <Outlet />;
}
