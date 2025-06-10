import React from "react";
import { Navigate } from "react-router-dom";

export default function ReportsRedirect() {
  return <Navigate to="/reports/profit-loss" replace />;
}
