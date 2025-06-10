/**
 * Types and interfaces for financial reports
 */

// Date range types
export type DateRangeType = 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
  type: DateRangeType;
  startDate: Date;
  endDate: Date;
  label: string;
}

// Profit & Loss Statement types
export interface PLItem {
  name: string;
  amount: number;
  parentId?: string;
  id: string;
  type: 'revenue' | 'expense' | 'costOfSales' | 'total' | 'subtotal';
  children?: PLItem[];
}

export interface ProfitAndLossStatement {
  period: DateRange;
  revenue: PLItem[];
  costOfSales: PLItem[];
  expenses: PLItem[];
  grossProfit: number;
  netIncome: number;
}

// Balance Sheet types
export interface BSItem {
  name: string;
  amount: number;
  parentId?: string;
  id: string;
  type: 'asset' | 'liability' | 'equity' | 'total' | 'subtotal';
  children?: BSItem[];
}

export interface BalanceSheet {
  asOf: Date;
  assets: BSItem[];
  liabilities: BSItem[];
  equity: BSItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

// Cash Flow Statement types
export interface CFItem {
  name: string;
  amount: number;
  parentId?: string;
  id: string;
  type: 'operating' | 'investing' | 'financing' | 'total' | 'subtotal';
  children?: CFItem[];
}

export interface CashFlowStatement {
  period: DateRange;
  operatingActivities: CFItem[];
  investingActivities: CFItem[];
  financingActivities: CFItem[];
  netCashFlow: number;
  beginningCashBalance: number;
  endingCashBalance: number;
}

// KPI types
export interface KPI {
  name: string;
  value: number;
  unit: string;
  change?: number; // percentage change
  status?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export interface KPIGroup {
  title: string;
  kpis: KPI[];
}

// Forecasting types
export type ForecastPeriod = 'monthly' | 'quarterly' | 'yearly';
export type ForecastModel = 'linear' | 'percentage' | 'manual';

// Advanced forecasting algorithm types
export type ForecastAlgorithm = 'simple' | 'moving-average' | 'exponential-smoothing' | 'seasonal-adjustment' | 'regression' | 'arima' | 'holt-winters';

// Time series decomposition components
export interface TimeSeriesComponents {
  trend: number[];
  seasonal: number[];
  cyclical?: number[];
  residual: number[];
  original: number[];
}

// Seasonal adjustment parameters
export interface SeasonalAdjustmentParams {
  seasonalPeriod: number; // Length of the seasonal cycle (e.g., 12 for monthly data with yearly seasonality)
  method: 'multiplicative' | 'additive';
  decompositionMethod?: 'moving-average' | 'loess';
  includeHistoricalData?: boolean;
}

export interface ForecastAssumption {
  id: string;
  name: string;
  category: 'revenue' | 'costOfSales' | 'expenses';
  itemId: string; // References a specific financial item ID
  growthType: ForecastModel;
  growthRate: number; // Percentage growth rate
  manualValues?: number[]; // For manual entry model
}

export interface ForecastScenario {
  id: string;
  name: string;
  description?: string;
  baseline: ProfitAndLossStatement; // Starting financial data
  assumptions: ForecastAssumption[];
  periods: number; // Number of periods to forecast
  periodType: ForecastPeriod;
  startDate: Date;
}

export interface ForecastPeriodData {
  period: number; // 0-based index of the forecast period
  date: Date; // End date of the forecast period
  label: string; // Display label for the period
  revenue: PLItem[];
  costOfSales: PLItem[];
  expenses: PLItem[];
  grossProfit: number;
  netIncome: number;
}

// Variance analysis interface for comparing forecasts with actuals
export interface ForecastVarianceAnalysis {
  periodLabel: string;
  predicted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  impact: 'high' | 'medium' | 'low';
  factors?: string[];
}

// Forecast accuracy metrics
export interface ForecastAccuracyMetrics {
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  mae: number;  // Mean Absolute Error
  r2?: number;  // R-squared (coefficient of determination)
}

// Advanced forecast with multiple algorithms
export interface AdvancedForecastResult {
  scenarioId: string;
  scenarioName: string;
  periodType: ForecastPeriod;
  startDate: Date;
  periods: ForecastPeriodData[];
  totals: {
    revenue: number;
    costOfSales: number;
    expenses: number;
    grossProfit: number;
    netIncome: number;
  };
  algorithm: ForecastAlgorithm;
  seasonallyAdjusted: boolean;
  timeSeriesComponents?: TimeSeriesComponents;
  accuracyMetrics?: ForecastAccuracyMetrics;
  varianceAnalysis?: ForecastVarianceAnalysis[];
  confidenceIntervals?: {
    lower: number[];
    upper: number[];
    confidence: number; // e.g., 0.95 for 95% confidence
  };
}

export interface ForecastResult {
  scenarioId: string;
  scenarioName: string;
  periodType: ForecastPeriod;
  startDate: Date;
  periods: ForecastPeriodData[];
  totals: {
    revenue: number;
    costOfSales: number;
    expenses: number;
    grossProfit: number;
    netIncome: number;
  };
}

// Seasonality types
export type SeasonType = 'Summer' | 'Autumn' | 'Winter' | 'Spring';
export type ImpactLevel = 'Very Low' | 'Low' | 'Low-Moderate' | 'Moderate' | 'Moderate-High' | 'High' | 'Very High' | 'Variable';

export interface SeasonalPattern {
  season: string;
  impact: ImpactLevel;
  description: string;
  seasonalFactors?: {
    cashReceiptsAdjustment: number; // Percentage adjustment for cash receipts during this season
    cashDisbursementsAdjustment: number; // Percentage adjustment for cash disbursements during this season
  };
}

export interface SeasonalKeyDate {
  date: string;
  event: string;
  description: string;
  cashFlowImpact?: {
    type: 'receipt' | 'disbursement' | 'both';
    estimatedAmount?: number;
    relativeImpact: ImpactLevel;
  };
}

export interface RegionalVariation {
  region: string;
  description: string;
  seasonalAdjustments?: {
    [key in SeasonType]?: number; // Percentage adjustment for each season in this region
  };
}

export interface SeasonalCashFlowAdjustment {
  applied: boolean;
  baseAmount: number;
  adjustedAmount: number;
  adjustmentFactor: number;
  adjustmentReason: string;
}

export interface SeasonalCashFlowItem extends CFItem {
  seasonalAdjustment?: SeasonalCashFlowAdjustment;
  seasonalPattern?: string; // Reference to the season pattern affecting this item
  historicalTrend?: {
    pastYears: {year: number, amount: number}[];
    averageSeasonalVariation: number;
  };
}

export interface SeasonalCashFlowStatement extends CashFlowStatement {
  seasonalityApplied: boolean;
  industry: string;
  operatingActivities: SeasonalCashFlowItem[];
  investingActivities: SeasonalCashFlowItem[];
  financingActivities: SeasonalCashFlowItem[];
  seasonalPatterns: SeasonalPattern[];
  keyDates: SeasonalKeyDate[];
  regionalVariations: RegionalVariation[];
  currentSeason: SeasonType;
  seasonAdjustedNetCashFlow: number;
  seasonalityImpact: number; // Difference between adjusted and non-adjusted cash flow
}

