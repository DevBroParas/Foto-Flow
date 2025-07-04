import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

const ProtectedRoute = () => {
  // Use both isAuthenticated and status from the auth state
  const { isAuthenticated, status } = useAppSelector((state) => state.auth);

  // While the session is being verified, show a loading indicator.
  // This is the key to preventing the premature redirect.
  if (status === "loading" || status === "idle") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Loading session...</h2>
      </div>
    );
  }

  // After the check, if the user is authenticated, render the nested routes.
  // Otherwise, redirect to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
