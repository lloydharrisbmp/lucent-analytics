import React from "react";
import { Navigate } from "react-router-dom";

export default function AnalyticsRedirect() {
  return <Navigate to="/analytics/performance" replace />;
}
