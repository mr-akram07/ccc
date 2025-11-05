import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("ccc_user"));

  // If no user or token → redirect to login
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
