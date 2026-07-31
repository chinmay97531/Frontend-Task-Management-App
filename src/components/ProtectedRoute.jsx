import { Navigate, useSearchParams } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const [searchParams] = useSearchParams();
  const oauthToken = searchParams.get("token");
  const hasToken = Boolean(localStorage.getItem("token") || oauthToken);

  if (!hasToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}
