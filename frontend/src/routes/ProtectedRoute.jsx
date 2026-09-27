import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  console.log("USER:", user);
  console.log("ROLE:", user?.role);
  console.log("ALLOWED:", allowedRoles);

  // Wait until authentication is checked
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;