// Cash flow optimization utility functions

export type CashFlowTimingRecommendation = {
  entity_id: string;
  entity_name: string;
  entity_type: "customer" | "vendor";
  amount: number;
  original_date: string;
  recommended_date: string;
  days_shift: number;
  impact: number;
  confidence: number;
  reasoning: string;
};

export type WorkingCapitalRecommendation = {
  category: "receivables" | "payables" | "inventory" | "cash_management" | "financing";
  recommendation_type: string;
  title: string;
  description: string;
  potential_impact: number;
  implementation_difficulty: "low" | "medium" | "high";
  timeframe: "immediate" | "short_term" | "long_term";
  confidence: number;
  action_items: string[];
};

export type CashShortfallAlert = {
  alert_date: string;
  shortfall_amount: number;
  confidence: number;
  contributing_factors: string[];
  mitigation_options: string[];
  severity: "low" | "medium" | "high" | "critical";
};

export type CashFlowOptimizationResponse = {
  timing_recommendations: CashFlowTimingRecommendation[];
  working_capital_recommendations: WorkingCapitalRecommendation[];
  cash_shortfall_alerts: CashShortfallAlert[];
  expected_cash_impact: number;
  recommendation_date: string;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Get severity color
export const getSeverityColor = (severity: "low" | "medium" | "high" | "critical"): string => {
  switch (severity) {
    case "low":
      return "bg-blue-100 text-blue-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get difficulty color
export const getDifficultyColor = (difficulty: "low" | "medium" | "high"): string => {
  switch (difficulty) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get timeframe color
export const getTimeframeColor = (timeframe: "immediate" | "short_term" | "long_term"): string => {
  switch (timeframe) {
    case "immediate":
      return "bg-purple-100 text-purple-800";
    case "short_term":
      return "bg-indigo-100 text-indigo-800";
    case "long_term":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get entity type color
export const getEntityTypeColor = (type: "customer" | "vendor"): string => {
  switch (type) {
    case "customer":
      return "bg-emerald-100 text-emerald-800";
    case "vendor":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get category color
export const getCategoryColor = (
  category: "receivables" | "payables" | "inventory" | "cash_management" | "financing"
): string => {
  switch (category) {
    case "receivables":
      return "bg-emerald-100 text-emerald-800";
    case "payables":
      return "bg-amber-100 text-amber-800";
    case "inventory":
      return "bg-blue-100 text-blue-800";
    case "cash_management":
      return "bg-purple-100 text-purple-800";
    case "financing":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Format impact as positive/negative number with currency
export const formatImpact = (impact: number): string => {
  const prefix = impact >= 0 ? "+" : "";
  return `${prefix}${formatCurrency(impact)}`;
};

// Format days shift as positive/negative number
export const formatDaysShift = (days: number): string => {
  if (days === 0) return "0 days";
  return days > 0 ? `+${days} days` : `${days} days`;
};
