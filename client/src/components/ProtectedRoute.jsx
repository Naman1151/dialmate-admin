// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 ml-[240px]">
        {children}
      </div>
    </div>
  );
}

export default ProtectedRoute;