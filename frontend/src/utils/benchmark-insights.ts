// Type definitions for the enhanced benchmark insights

// Percentile Rank type
export interface PercentileRank {
  percentile: number;
  interpretation: string;
}

// Trend Forecast types
export interface TrendForecast {
  metric_name: string;
  current_value: number;
  trend_direction: string;
  projected_value: number;
  projected_change_percent: number;
  explanation: string;
}

export interface TrendForecasts {
  forecasts: TrendForecast[];
  overall_trend: string;
  time_horizon: string;
  methodology: string;
}

// Recommendation types
export interface CategoryRecommendation {
  priority: string;
  avg_percentile?: number;
  actions: string[];
  metrics: string[];
}

export interface MetricRecommendation {
  metric_name: string;
  display_name: string;
  difference_percent: number;
  recommendations: string[];
  priority: string;
}

export interface ConsolidatedRecommendation {
  recommendation: string;
  category: string;
  priority: string;
  affected_metrics: string[];
}

export interface RecommendationData {
  category_recommendations: Record<string, CategoryRecommendation>;
  metric_recommendations: MetricRecommendation[];
  consolidated_recommendations: ConsolidatedRecommendation[];
  priority_focus_areas: string[];
  competitive_advantages: string[];
}

// Main insight interface
export interface BenchmarkInsightData {
  company_name: string;
  industry_name: string;
  performance_summary: string;
  performance_category: string;
  overall_percentile?: number;
  overall_difference?: number;
  trend_forecast: TrendForecasts;
  recommendations: RecommendationData;
  generated_at: string;
  analysis_version: string;
}

// Extended MetricComparison with forecast
export interface EnhancedMetricComparison {
  metric_name: string;
  company_value: number;
  benchmark_value: number;
  difference: number;
  difference_percent: number;
  percentile_rank?: PercentileRank;
  is_favorable?: boolean;
  trend?: Record<string, any>;
  data_points_count: number;
  description?: string;
  forecast?: Record<string, any>;
}

// Extended BenchmarkComparisonResponse with insights
export interface EnhancedBenchmarkComparisonResponse {
  company_name: string;
  industry_name: string;
  industry_code?: string;
  benchmark_source: string;
  year: string;
  comparisons: EnhancedMetricComparison[];
  overall_score?: number;
  recommendations?: string[];
  metadata: {
    benchmark_data_points: number;
    matched_metrics: number;
    source_id: string;
    comparison_method: string;
    insights?: BenchmarkInsightData;
  };
}
