import { useContext } from "react"; // Add this import
import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import { AuthContext } from "@/context/auth-context"; // Adjust import if filename is different

function RouteGuard({ element }) {
  const { authState } = useContext(AuthContext);
  const { authenticate, role } = authState; // Use role directly from authState
  const location = useLocation();

  if (!authenticate && !location.pathname.includes("/auth")) {
    return <Navigate to="/auth" />;
  }

  if (
    authenticate &&
    role !== "instructor" &&
    (location.pathname.includes("instructor") ||
      location.pathname.includes("/auth"))
  ) {
    return <Navigate to="/home" />;
  }

  if (authenticate && role === "instructor" && !location.pathname.includes("instructor")) {
    return <Navigate to="/instructor" />;
  }

  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;
