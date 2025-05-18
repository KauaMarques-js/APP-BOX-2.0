import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, roleRequired }) {
  const role = localStorage.getItem("role");

  if (!role) {
   
    return <Navigate to="/" />;
  }

  if (roleRequired && role !== roleRequired) {
    
    return <Navigate to="/" />;
  }

  return children;
}
