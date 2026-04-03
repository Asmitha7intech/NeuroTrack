import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { isLoggedIn } from "../utils/auth";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
