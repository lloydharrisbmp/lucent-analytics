/** AccountData */
export interface AccountData {
  /**
   * Account Name
   * The name or identifier of the financial account
   */
  account_name: string;
  /**
   * Historical Data
   * List of historical data points for the account
   */
  historical_data: HistoricalAccountPoint[];
}

/** AccountForecastPoint */
export interface AccountForecastPoint {
  /**
   * Forecast Date
   * The date of the forecasted point
   * @format date
   */
  forecast_date: string;
  /**
   * Forecasted Value
   * The forecasted value
   */
  forecasted_value: number;
}

/** AccountForecastRequest */
export interface AccountForecastRequest {
  /**
   * Accounts Data
   * List of accounts and their historical data
   */
  accounts_data: AccountData[];
  /**
   * Periods
   * Number of future periods to forecast
   * @default 6
   */
  periods?: number;
  /**
   * Freq
   * Frequency of the forecast periods ('D', 'W', 'M', 'Q', 'Y')
   * @default "M"
   */
  freq?: string;
  /**
   * Method
   * Forecasting method to use
   * @default "ARIMA"
   */
  method?: "ARIMA" | "Prophet";
}

/** AccountForecastResponse */
export interface AccountForecastResponse {
  /**
   * Forecast Results
   * List of forecast results for each requested account
   */
  forecast_results: SingleAccountForecast[];
}

/** ActionImpact */
export interface ActionImpact {
  /** Metric Name */
  metric_name: string;
  /** Current Value */
  current_value: number;
  /** Projected Value */
  projected_value: number;
  /** Improvement Percentage */
  improvement_percentage: number;
  /** Score Increase */
  score_increase: number;
}

/** Address */
export interface Address {
  /** Line1 */
  line1: string;
  /** Line2 */
  line2?: string | null;
  /** Suburb */
  suburb: string;
  /** State */
  state: string;
  /** Postcode */
  postcode: string;
  /** Country */
  country: string;
}

/** AdvancedForecastRequest */
export interface AdvancedForecastRequest {
  scenario: ForecastScenario;
  /**
   * Algorithm
   * @default "simple"
   */
  algorithm?: string;
  /**
   * Seasonallyadjusted
   * @default false
   */
  seasonallyAdjusted?: boolean;
  /** Seasonalperiod */
  seasonalPeriod?: number | null;
  /**
   * Decompositionmethod
   * @default "multiplicative"
   */
  decompositionMethod?: "multiplicative" | "additive" | null;
  /** Historicaldata */
  historicalData?: number[] | null;
  /** Actualdata */
  actualData?: number[] | null;
  /** Periodlabels */
  periodLabels?: string[] | null;
}

/** AdvancedForecastResult */
export interface AdvancedForecastResult {
  /** Scenarioid */
  scenarioId: string;
  /** Scenarioname */
  scenarioName: string;
  /** Periodtype */
  periodType: "monthly" | "quarterly" | "yearly";
  /**
   * Startdate
   * @format date
   */
  startDate: string;
  /** Periods */
  periods: ForecastPeriodData[];
  /** Totals */
  totals: Record<string, number>;
  /** Algorithm */
  algorithm: string;
  /** Seasonallyadjusted */
  seasonallyAdjusted: boolean;
  timeSeriesComponents?: TimeSeriesComponents | null;
  accuracyMetrics?: ForecastAccuracyMetrics | null;
  /** Varianceanalysis */
  varianceAnalysis?: ForecastVarianceAnalysis[] | null;
  /** Confidenceintervals */
  confidenceIntervals?: Record<string, any> | null;
}

/** AdvancedMonteCarloRequest */
export interface AdvancedMonteCarloRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Parameter Distributions */
  parameter_distributions: Record<string, AppApisScenarioCalculationParameterDistribution>;
  /** Target Metrics */
  target_metrics: string[];
  /**
   * Num Simulations
   * @default 1000
   */
  num_simulations?: number;
  /** Scenario Templates */
  scenario_templates?: string[] | null;
  /** Stress Test Params */
  stress_test_params?: Record<string, number> | null;
  /** Confidence Intervals */
  confidence_intervals?: number[] | null;
  /** Correlation Matrix */
  correlation_matrix?: Record<string, Record<string, number>> | null;
}

/** AdvancedMonteCarloResponse */
export interface AdvancedMonteCarloResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Num Simulations */
  num_simulations: number;
  /** Distributions */
  distributions: AppApisScenarioCalculationMetricDistribution[];
  advanced_results: AdvancedScenarioResult;
}

/** AdvancedScenarioResult */
export interface AdvancedScenarioResult {
  /** Confidence Intervals */
  confidence_intervals: Record<string, Record<string, Record<string, number>>>;
  /** Value At Risk */
  value_at_risk: Record<string, number>;
  /** Tail Event Probabilities */
  tail_event_probabilities: Record<string, number>;
  /** Scenario Comparison */
  scenario_comparison?: Record<string, Record<string, number>> | null;
}

/** AdvancedSensitivityAnalysisRequest */
export interface AdvancedSensitivityAnalysisRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Target Metric */
  target_metric: string;
  /**
   * Parameters To Analyze
   * Leave empty to analyze all parameters
   */
  parameters_to_analyze?: string[];
  /**
   * Variation Range
   * @default 0.2
   */
  variation_range?: number;
  /**
   * Steps
   * @default 5
   */
  steps?: number;
  /** Sector */
  sector?: string | null;
  /** Business Unit */
  business_unit?: string | null;
  /**
   * Include Cross Dependencies
   * @default false
   */
  include_cross_dependencies?: boolean;
}

/** AdvancedSensitivityResponse */
export interface AdvancedSensitivityResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Target Metric */
  target_metric: string;
  /** Sensitivities */
  sensitivities: ParameterSensitivity[];
  /** Parameter Charts */
  parameter_charts: Record<string, Record<string, number[]>>;
  /** Cross Effects */
  cross_effects?: ParameterCrossEffect[] | null;
  /** Stress Test Results */
  stress_test_results?: Record<string, number> | null;
}

/** Anomaly */
export interface Anomaly {
  /**
   * Ds
   * Date of the detected anomaly
   * @format date
   */
  ds: string;
  /**
   * Y
   * Value at the time of the anomaly
   */
  y: number;
  /**
   * Anomaly Type
   * Type of anomaly ('outlier' or 'changepoint')
   */
  anomaly_type: string;
  /**
   * Details
   * Additional details, e.g., forecast value, interval
   */
  details?: Record<string, any> | null;
}

/** AnomalyDetectionResponse */
export interface AnomalyDetectionResponse {
  /**
   * Anomalies
   * List of detected anomalies
   */
  anomalies: Anomaly[];
}

/** ApiKeyCredentialsInput */
export interface ApiKeyCredentialsInput {
  /** Api Key */
  api_key: string;
  /** Api Secret */
  api_secret?: string | null;
}

/** AppendixModel */
export interface AppendixModel {
  /** Documents */
  documents?: Record<string, any>[] | null;
}

/** ApplicationPeriod */
export interface ApplicationPeriod {
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /**
   * Is Ongoing
   * @default false
   */
  is_ongoing?: boolean;
  /** Next Round Expected */
  next_round_expected?: string | null;
}

/** ApplicationRequirement */
export interface ApplicationRequirement {
  /** Requirement Id */
  requirement_id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  estimated_workload: WorkloadEstimate;
  /**
   * Dependencies
   * @default []
   */
  dependencies?: string[];
}

/** ApplicationStatusUpdate */
export interface ApplicationStatusUpdate {
  /** Status */
  status: string;
  /** Notes */
  notes?: string | null;
}

/** ApplicationStep */
export interface ApplicationStep {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /**
   * Status
   * @default "not_started"
   */
  status?: string;
  /** Due Date */
  due_date?: string | null;
  /** Completed At */
  completed_at?: string | null;
  /**
   * Documents
   * @default []
   */
  documents?: Document[];
  /** Notes */
  notes?: string | null;
}

/** Attachment */
export interface Attachment {
  /** Id */
  id: string;
  /** File Name */
  file_name: string;
  /** File Type */
  file_type: string;
  /** File Size */
  file_size: number;
  /**
   * Upload Date
   * @format date-time
   */
  upload_date: string;
  /** Url */
  url: string;
  /** Description */
  description?: string | null;
}

/** AuditLogEntryResponse */
export interface AuditLogEntryResponse {
  /** Logid */
  logId: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Userid */
  userId: string;
  /** Action */
  action: string;
  /** Entitytype */
  entityType?: string | null;
  /** Entityid */
  entityId?: string | null;
  /** Details */
  details?: Record<string, any> | null;
  /** Status */
  status: string;
  /** Clientinfo */
  clientInfo?: Record<string, any> | null;
}

/**
 * BASFieldValue
 * A value for a specific BAS field with metadata
 */
export interface BASFieldValue {
  /** Field Code */
  field_code: string;
  /** Field Name */
  field_name: string;
  /** Amount */
  amount: number;
  /** Section */
  section: "G" | "W" | "F" | "T";
  /** Calculation Notes */
  calculation_notes?: string | null;
}

/**
 * BASGenerationRequest
 * Request model for BAS generation
 */
export interface BASGenerationRequest {
  /** Business entity data for tax calculations */
  entity: BusinessEntityRequest;
  /** Financial data for tax calculations */
  financial_data: FinancialData;
  period: DateRange;
  /**
   * Payg Withholding
   * @default 0
   */
  payg_withholding?: number;
  /**
   * Payg Installments
   * @default 0
   */
  payg_installments?: number;
  /** Additional Data */
  additional_data?: Record<string, any> | null;
}

/** BASStatement */
export interface BASStatement {
  /** Id */
  id: string;
  /** Entity Id */
  entity_id: string;
  period: DateRange;
  /** Status */
  status: "notStarted" | "inProgress" | "readyForReview" | "reviewed" | "lodged" | "processed";
  /**
   * Due Date
   * @format date
   */
  due_date: string;
  /** Lodgement Date */
  lodgement_date?: string | null;
  /** Gst Collected */
  gst_collected: number;
  /** Gst Paid */
  gst_paid: number;
  /** Gst Net Amount */
  gst_net_amount: number;
  /** Sales Total */
  sales_total: number;
  /** Purchases Total */
  purchases_total: number;
  /** Payg Withholding */
  payg_withholding: number;
  /** Payg Installments */
  payg_installments: number;
  /** Total Payable */
  total_payable: number;
  /** Total Refundable */
  total_refundable: number;
  /** Payment Date */
  payment_date?: string | null;
  /** Payment Method */
  payment_method?: string | null;
  /**
   * Attachments
   * @default []
   */
  attachments?: Attachment[];
}

/** BasicAuthCredentialsInput */
export interface BasicAuthCredentialsInput {
  /** Username */
  username: string;
  /** Password */
  password: string;
}

/** BenchmarkComparisonRequest */
export interface BenchmarkComparisonRequest {
  /**
   * Company Metrics
   * List of metrics for the company being analyzed
   */
  company_metrics: CompanyMetric[];
  /**
   * Industry Code
   * ANZSIC code of the company's industry
   */
  industry_code?: string | null;
  /**
   * Industry Name
   * Name of the company's industry (used if code is ambiguous)
   */
  industry_name?: string | null;
  /**
   * Benchmark Source Id
   * Specific benchmark source ID to compare against (optional)
   */
  benchmark_source_id?: string | null;
  /**
   * Comparison Methods
   * Methods to use for comparison
   * @default ["direct_comparison","percentile"]
   */
  comparison_methods?: ComparisonMethod[] | null;
  /**
   * Year
   * Specific year for benchmark data (optional, defaults to latest)
   */
  year?: string | null;
  /**
   * Turnover Range
   * Turnover range to match in benchmarks (optional)
   */
  turnover_range?: string | null;
}

/** BenchmarkComparisonResponse */
export interface BenchmarkComparisonResponse {
  /**
   * Company Industry Identified
   * The industry identified for comparison
   */
  company_industry_identified?: string | null;
  /** The benchmark source used for comparison */
  benchmark_source_used?: BenchmarkSource | null;
  /**
   * Comparison Results
   * List of comparison results for each metric
   */
  comparison_results: MetricComparison[];
  /**
   * Overall Summary
   * A brief textual summary of the comparison
   */
  overall_summary?: string | null;
}

/** BenchmarkDataPoint */
export interface BenchmarkDataPoint {
  /**
   * Industry Code
   * Industry code (e.g., ANZSIC)
   */
  industry_code?: string | null;
  /**
   * Industry Name
   * Name of the industry
   */
  industry_name?: string | null;
  /**
   * Metric Name
   * Name of the benchmark metric
   */
  metric_name: string;
  /**
   * Value
   * The value of the benchmark metric
   */
  value: number;
  /**
   * Year
   * The year the benchmark data applies to
   */
  year?: string | null;
  /**
   * Turnover Range
   * Applicable turnover range for the benchmark
   */
  turnover_range?: string | null;
  /**
   * Source Id
   * ID of the source this data point belongs to
   */
  source_id: string;
  /**
   * Version
   * Version of the benchmark data
   * @default "1.0"
   */
  version?: string | null;
  /**
   * Region
   * Geographic region if applicable
   */
  region?: string | null;
  /**
   * Percentile
   * Percentile value if applicable (e.g., for distributions)
   */
  percentile?: number | null;
}

/** BenchmarkDataResponse */
export interface BenchmarkDataResponse {
  /**
   * Data
   * List of benchmark data points
   */
  data: BenchmarkDataPoint[];
  /**
   * Metadata
   * Metadata about the query (e.g., filters, total records)
   */
  metadata?: Record<string, any> | null;
}

/** BenchmarkMetricDefinition */
export interface BenchmarkMetricDefinition {
  /**
   * Metric Id
   * Unique identifier for the metric definition
   */
  metric_id?: string;
  /**
   * Name
   * Canonical name of the metric (e.g., 'Current Ratio')
   */
  name: string;
  /**
   * Description
   * Explanation of what the metric measures
   */
  description?: string | null;
  /**
   * Formula
   * Mathematical formula used to calculate the metric
   */
  formula?: string | null;
  /**
   * Data Type
   * Data type of the metric value (e.g., 'float', 'percentage', 'ratio')
   * @default "float"
   */
  data_type?: string;
  /**
   * Unit
   * Unit of measurement (e.g., '%', '$', 'days')
   */
  unit?: string | null;
  /**
   * Interpretation
   * Guidance on interpreting the metric (e.g., 'Higher is better')
   */
  interpretation?: string | null;
  /**
   * Category
   * Category the metric belongs to (e.g., 'Liquidity', 'Profitability')
   */
  category?: string | null;
  /**
   * Related Metrics
   * IDs of related metric definitions
   */
  related_metrics?: string[] | null;
}

/** BenchmarkSource */
export interface BenchmarkSource {
  /**
   * Id
   * Unique identifier for the benchmark source
   */
  id: string;
  /**
   * Name
   * Name of the benchmark source (e.g., 'RMA Industry Norms')
   */
  name: string;
  /**
   * Description
   * Description of the data source
   */
  description?: string | null;
  /**
   * Industry Codes
   * List of applicable industry codes (e.g., ANZSIC)
   */
  industry_codes?: string[] | null;
  /**
   * Region
   * Geographic region the benchmark applies to
   */
  region?: string | null;
  /**
   * Last Updated
   * ISO 8601 timestamp of when the source data was last updated
   */
  last_updated?: string | null;
  /**
   * Data Points Key
   * Internal key for storing the associated data points
   */
  data_points_key?: string | null;
}

/** BoardReportingQuery */
export interface BoardReportingQuery {
  /** Industry */
  industry?: string | null;
  /** Entity Size */
  entity_size?: string | null;
  /** Entity Type */
  entity_type?: string | null;
  /** Report Type */
  report_type?: string | null;
}

/** BoardReportingResponse */
export interface BoardReportingResponse {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Best Practices */
  best_practices: Record<string, string>[];
  /** Metric Categories */
  metric_categories: AppApisBoardReportingMetricCategory[];
  /** References */
  references: Record<string, string>[];
}

/** Body_upload_benchmark_data */
export interface BodyUploadBenchmarkData {
  /** Source Id */
  source_id: string;
  /** Year */
  year: string;
  /**
   * Version
   * @default "1.0"
   */
  version?: string;
  /** Description */
  description?: string | null;
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_financial_data */
export interface BodyUploadFinancialData {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_financial_data_legacy */
export interface BodyUploadFinancialDataLegacy {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_fx_rates */
export interface BodyUploadFxRates {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_organization_financial_data */
export interface BodyUploadOrganizationFinancialData {
  /** Organization Id */
  organization_id: string;
  /** Data Type */
  data_type: string;
  /**
   * File
   * @format binary
   */
  file: File;
}

/**
 * BudgetItem
 * Represents a single line item within a budget version.
 */
export interface BudgetItem {
  /**
   * Account Code
   * The account code this budget item relates to.
   */
  account_code: string;
  /**
   * Period
   * The time period (e.g., 'YYYY-MM' or 'YYYY-Q#') this amount applies to.
   */
  period: string;
  /**
   * Amount
   * The budgeted amount.
   */
  amount: number;
  /**
   * Description
   * Optional description for the budget item.
   */
  description?: string | null;
}

/**
 * BudgetVersion
 * Represents a complete budget version, including all items.
 */
export interface BudgetVersion {
  /**
   * Version Id
   * Unique identifier for the budget version.
   */
  version_id: string;
  /**
   * Name
   * User-friendly name for the version (e.g., 'Initial 2024', 'Q1 Revised').
   */
  name: string;
  /**
   * Created At
   * Timestamp when the version was created.
   * @format date-time
   */
  created_at: string;
  /**
   * Items
   * The list of budget line items for this version.
   */
  items: BudgetItem[];
}

/**
 * BudgetVersionMetadata
 * Metadata describing a budget version, used for listing.
 */
export interface BudgetVersionMetadata {
  /**
   * Version Id
   * Unique identifier for the budget version.
   */
  version_id: string;
  /**
   * Name
   * User-friendly name for the version (e.g., 'Initial 2024', 'Q1 Revised').
   */
  name: string;
  /**
   * Created At
   * Timestamp when the version was created.
   * @format date-time
   */
  created_at: string;
}

/** BusinessEntityBase */
export interface BusinessEntityBase {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  business_structure: BusinessStructureType;
  /** Tfn */
  tfn: string;
  /** Registered For Gst */
  registered_for_gst: boolean;
  gst_frequency?: GSTFrequency | null;
  /**
   * Local Currency
   * Local currency code (e.g., AUD, USD)
   */
  local_currency: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Parent Entity Id
   * ID of the parent entity in a hierarchy
   */
  parent_entity_id?: string | null;
  /**
   * Ownership Details
   * Details of entities owned by this entity
   */
  ownership_details?: OwnershipDetail[] | null;
}

/**
 * BusinessEntityCreateRequest
 * Request model for creating a business entity
 */
export interface BusinessEntityCreateRequest {
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  business_structure: BusinessStructureType;
  /** Registered For Gst */
  registered_for_gst: boolean;
  gst_frequency?: GSTFrequency | null;
  /** Tfn */
  tfn?: string | null;
  /** Acn */
  acn?: string | null;
  /** Industry Code */
  industry_code?: string | null;
  /** Description */
  description?: string | null;
  /** Established Date */
  established_date?: string | null;
  address?: Address | null;
  primary_contact?: ContactDetails | null;
  /** Parent Entity Id */
  parent_entity_id?: string | null;
  /** Ownership Details */
  ownership_details?: OwnershipDetail[] | null;
  /**
   * Local Currency
   * Local currency code (e.g., AUD, USD)
   */
  local_currency: string;
}

/**
 * BusinessEntityListResponse
 * Response model for listing business entities
 */
export interface BusinessEntityListResponse {
  /** Entities */
  entities: BusinessEntityBase[];
  /** Total Count */
  total_count: number;
}

/**
 * BusinessEntityRequest
 * Business entity data for tax calculations
 */
export interface BusinessEntityRequest {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  business_structure: BusinessStructureType;
  /** Registered For Gst */
  registered_for_gst: boolean;
  /** Gst Frequency */
  gst_frequency?: "monthly" | "quarterly" | "annually" | null;
}

/**
 * BusinessEntityResponse
 * Response model for business entity operations
 */
export interface BusinessEntityResponse {
  entity: BusinessEntityBase;
  /** Message */
  message: string;
}

/** BusinessEntityValidationRequest */
export interface BusinessEntityValidationRequest {
  /** Entity Id */
  entity_id: string;
  /** Abn */
  abn: string;
  /** Tfn */
  tfn?: string | null;
  /** Business Structure */
  business_structure: string;
  /** Gst Registered */
  gst_registered: boolean;
  /** Gst Frequency */
  gst_frequency?: string | null;
  /** Financial Year End */
  financial_year_end?: string | null;
  /** Additional Data */
  additional_data?: Record<string, any> | null;
}

/** BusinessPlanData */
export interface BusinessPlanData {
  /**
   * Planname
   * @example "My Startup Plan v1"
   */
  planName: string;
  /**
   * Plantype
   * @example "new"
   */
  planType: string;
  /**
   * Versionnotes
   * @example "Initial draft focusing on market"
   */
  versionNotes?: string | null;
  executiveSummary?: ExecutiveSummaryModel | null;
  companyDescription?: CompanyDescriptionModel | null;
  marketAnalysis?: MarketAnalysisModel | null;
  organizationManagement?: OrganizationManagementModel | null;
  productsServices?: ProductsServicesModel | null;
  marketingSalesStrategy?: MarketingSalesStrategyModel | null;
  financialProjections?: FinancialProjectionsModel | null;
  appendix?: AppendixModel | null;
}

/** BusinessPlanMetadata */
export interface BusinessPlanMetadata {
  /** Planid */
  planId: string;
  /** Planname */
  planName: string;
  /** Plantype */
  planType: string;
  /**
   * Lastsavedat
   * @format date-time
   */
  lastSavedAt: string;
  /** Versionnotes */
  versionNotes?: string | null;
}

/**
 * BusinessProfile
 * Business profile model containing characteristics relevant for grant matching
 */
export interface BusinessProfile {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  /** Business Structure */
  business_structure: string;
  /** Industry Sector */
  industry_sector?: string | null;
  /** Annual Turnover */
  annual_turnover?: number | null;
  /** Employee Count */
  employee_count?: number | null;
  /** Years In Business */
  years_in_business?: number | null;
  /** Location */
  location?: Record<string, string> | null;
  /** Has Exported */
  has_exported?: boolean | null;
  /** Export Markets */
  export_markets?: string[] | null;
  /** R And D Activities */
  r_and_d_activities?: boolean | null;
  /** Innovation Focus */
  innovation_focus?: boolean | null;
  /** Sustainability Initiatives */
  sustainability_initiatives?: boolean | null;
  /** Digital Adoption Level */
  digital_adoption_level?: string | null;
}

/** BusinessStructureType */
export enum BusinessStructureType {
  Company = "company",
  Trust = "trust",
  Partnership = "partnership",
  SoleTrader = "soleTrader",
}

/**
 * CalculateCashFlowRequest
 * Request body for the cash flow calculation endpoint.
 */
export interface CalculateCashFlowRequest {
  /** Holds all necessary mapped financial data for a calculation period. */
  period_data: PeriodFinancialsInput;
}

/** CashFlowData */
export interface CashFlowData {
  /** Company Id */
  company_id: string;
  /**
   * Receivables
   * List of receivable items with dates, amounts, and customer info
   */
  receivables: Record<string, string | number>[];
  /**
   * Payables
   * List of payable items with dates, amounts, and vendor info
   */
  payables: Record<string, string | number>[];
  /**
   * Cash Balance
   * Current cash balance
   */
  cash_balance: number;
  /**
   * Min Cash Threshold
   * Minimum cash threshold for alerts
   */
  min_cash_threshold?: number | null;
  /**
   * Monthly Fixed Expenses
   * Monthly fixed expenses
   */
  monthly_fixed_expenses?: number | null;
  /**
   * Historical Payment Data
   * Historical data about customer payment behaviors
   */
  historical_payment_data?: Record<string, Record<string, number>> | null;
  /**
   * Historical Vendor Data
   * Historical data about vendor payment terms
   */
  historical_vendor_data?: Record<string, Record<string, number>> | null;
}

/** CashFlowImpact */
export interface CashFlowImpact {
  /** Type */
  type: "receipt" | "disbursement" | "both";
  /** Estimatedamount */
  estimatedAmount?: number | null;
  /** Relativeimpact */
  relativeImpact: string;
}

/**
 * CashFlowItem
 * Represents a single line item within a cash flow section.
 */
export interface CashFlowItem {
  /** Item Name */
  item_name: string;
  /** Amount */
  amount: number;
}

/** CashFlowOptimizationResponse */
export interface CashFlowOptimizationResponse {
  /** Timing Recommendations */
  timing_recommendations: CashFlowTimingRecommendation[];
  /** Working Capital Recommendations */
  working_capital_recommendations: WorkingCapitalRecommendation[];
  /** Cash Shortfall Alerts */
  cash_shortfall_alerts: CashShortfallAlert[];
  /** Expected Cash Impact */
  expected_cash_impact: number;
  /** Recommendation Date */
  recommendation_date: string;
}

/**
 * CashFlowSection
 * Represents a section of the cash flow statement (Operating, Investing, Financing).
 */
export interface CashFlowSection {
  /** Section Name */
  section_name: string;
  /** Items */
  items: CashFlowItem[];
  /** Sub Total */
  sub_total: number;
}

/**
 * CashFlowStatement
 * Represents the complete cash flow statement.
 */
export interface CashFlowStatement {
  /** Opening Cash */
  opening_cash: number;
  /** Represents a section of the cash flow statement (Operating, Investing, Financing). */
  operating_activities: CashFlowSection;
  /** Represents a section of the cash flow statement (Operating, Investing, Financing). */
  investing_activities: CashFlowSection;
  /** Represents a section of the cash flow statement (Operating, Investing, Financing). */
  financing_activities: CashFlowSection;
  /** Net Change In Cash */
  net_change_in_cash: number;
  /** Closing Cash */
  closing_cash: number;
  /** Reconciliation Difference */
  reconciliation_difference?: number | null;
}

/** CashFlowTimingRecommendation */
export interface CashFlowTimingRecommendation {
  /** Entity Id */
  entity_id: string;
  /** Entity Name */
  entity_name: string;
  /** Entity Type */
  entity_type: "customer" | "vendor";
  /** Amount */
  amount: number;
  /** Original Date */
  original_date: string;
  /** Recommended Date */
  recommended_date: string;
  /** Days Shift */
  days_shift: number;
  /** Impact */
  impact: number;
  /** Confidence */
  confidence: number;
  /** Reasoning */
  reasoning: string;
}

/** CashShortfallAlert */
export interface CashShortfallAlert {
  /** Alert Date */
  alert_date: string;
  /** Shortfall Amount */
  shortfall_amount: number;
  /** Confidence */
  confidence: number;
  /** Contributing Factors */
  contributing_factors: string[];
  /** Mitigation Options */
  mitigation_options: string[];
  /** Severity */
  severity: "low" | "medium" | "high" | "critical";
}

/** CategoryScore */
export interface CategoryScore {
  /** Category */
  category: string;
  /** Score */
  score: number;
  /**
   * Max Score
   * @default 100
   */
  max_score?: number;
  /** Metrics Scores */
  metrics_scores: Record<string, number>;
  /** Interpretation */
  interpretation: string;
  /**
   * Suggestions
   * @default []
   */
  suggestions?: string[];
}

/** CoAMapRule */
export interface CoAMapRule {
  /** Rule Id */
  rule_id?: string;
  map_to_category: FinancialStatementCategory;
  /** Map To Line Item Key */
  map_to_line_item_key: string;
  /** Description */
  description?: string | null;
  /** Account Codes */
  account_codes?: string[] | null;
  /** Account Code Starts With */
  account_code_starts_with?: string[] | null;
  /**
   * Is Contra Account
   * @default false
   */
  is_contra_account?: boolean;
  /** Notes */
  notes?: string | null;
}

/** CoAMapping */
export interface CoAMapping {
  /** Mapping Id */
  mapping_id?: string;
  /** Name */
  name: string;
  /** Organization Id */
  organization_id: string;
  /**
   * Rules
   * @default []
   */
  rules?: CoAMapRule[];
  /**
   * Created At
   * @format date-time
   */
  created_at?: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at?: string;
}

/** CoAMappingCreatePayload */
export interface CoAMappingCreatePayload {
  /** Name */
  name: string;
  /** Organization Id */
  organization_id: string;
  /**
   * Rules
   * @default []
   */
  rules?: CoAMapRule[];
}

/** CoAMappingListResponse */
export interface CoAMappingListResponse {
  /** Mappings */
  mappings: CoAMapping[];
}

/** CoAMappingUpdatePayload */
export interface CoAMappingUpdatePayload {
  /** Name */
  name?: string | null;
  /** Rules */
  rules?: CoAMapRule[] | null;
}

/**
 * CoaCashFlowMappingsResponse
 * Response body for returning the mappings for an organization.
 */
export interface CoaCashFlowMappingsResponse {
  /**
   * Mappings
   * A dictionary mapping CoA account IDs to their cash flow category.
   */
  mappings: Record<string, "OPERATING" | "INVESTING" | "FINANCING" | "UNASSIGNED">;
  /** Organization Id */
  organization_id: string;
  /** Updated At */
  updated_at?: string | null;
}

/**
 * CoaCashFlowMappingsUpdate
 * Request body for updating the mappings for an organization.
 */
export interface CoaCashFlowMappingsUpdate {
  /**
   * Mappings
   * A dictionary mapping CoA account IDs to their cash flow category.
   */
  mappings: Record<string, "OPERATING" | "INVESTING" | "FINANCING" | "UNASSIGNED">;
}

/** ColumnMapping */
export interface ColumnMapping {
  /** Source Column */
  source_column: string;
  /** Target Field */
  target_field?: string | null;
  /** User Metric Name */
  user_metric_name?: string | null;
}

/** CommentCreate */
export interface CommentCreate {
  /**
   * Text
   * The content of the comment.
   */
  text: string;
  /**
   * Contexttype
   * Type of entity the comment is attached to (e.g., 'report', 'dashboardWidget').
   */
  contextType: string;
  /**
   * Contextid
   * ID of the specific entity instance.
   */
  contextId: string;
  /**
   * Contextsubid
   * Further identifier within the context (e.g., a specific data point ID).
   */
  contextSubId?: string | null;
  /**
   * Mentions
   * List of Firebase Auth UIDs extracted from @-mentions.
   * @default []
   */
  mentions?: string[] | null;
  /**
   * Parentid
   * ID of the comment this is a direct reply to. Null for top-level comments.
   */
  parentId?: string | null;
}

/** CommentRead */
export interface CommentRead {
  /**
   * Text
   * The content of the comment.
   */
  text: string;
  /**
   * Contexttype
   * Type of entity the comment is attached to (e.g., 'report', 'dashboardWidget').
   */
  contextType: string;
  /**
   * Contextid
   * ID of the specific entity instance.
   */
  contextId: string;
  /**
   * Contextsubid
   * Further identifier within the context (e.g., a specific data point ID).
   */
  contextSubId?: string | null;
  /**
   * Mentions
   * List of Firebase Auth UIDs extracted from @-mentions.
   * @default []
   */
  mentions?: string[] | null;
  /**
   * Parentid
   * ID of the comment this is a direct reply to. Null for top-level comments.
   */
  parentId?: string | null;
  /**
   * Id
   * Firestore document ID of the comment.
   */
  id: string;
  /**
   * Userid
   * Firebase Auth UID of the user who posted the comment.
   */
  userId: string;
  /**
   * Timestamp
   * Server timestamp of when the comment was created.
   * @format date-time
   */
  timestamp: string;
  /**
   * Threadid
   * ID of the root comment in the thread.
   */
  threadId: string;
  /**
   * Lastreplytimestamp
   * Timestamp of the last reply (only on root comment).
   */
  lastReplyTimestamp?: string | null;
  /**
   * Replycount
   * Number of replies (only on root comment).
   * @default 0
   */
  replyCount?: number | null;
  /**
   * Deleted
   * Flag indicating if the comment is soft-deleted.
   * @default false
   */
  deleted?: boolean | null;
}

/** CommentUpdate */
export interface CommentUpdate {
  /**
   * Text
   * The updated content of the comment.
   */
  text?: string | null;
}

/** Company */
export interface Company {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  /** Business Structure */
  business_structure: "company";
  /** Tfn */
  tfn: string;
  /** Registered For Gst */
  registered_for_gst: boolean;
  gst_frequency?: GSTFrequency | null;
  /**
   * Local Currency
   * Local currency code (e.g., AUD, USD)
   */
  local_currency: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Parent Entity Id
   * ID of the parent entity in a hierarchy
   */
  parent_entity_id?: string | null;
  /**
   * Ownership Details
   * Details of entities owned by this entity
   */
  ownership_details?: OwnershipDetail[] | null;
  /** Acn */
  acn: string;
  /** Directors */
  directors: Director[];
  /** Company Type */
  company_type: "proprietary" | "public" | "notForProfit";
  /** Substituted Accounting Period */
  substituted_accounting_period: boolean;
  /** Sap Start Date */
  sap_start_date?: string | null;
  /** Sap End Date */
  sap_end_date?: string | null;
}

/** CompanyData */
export interface CompanyData {
  /** Company Id */
  company_id: string;
  /** Industry */
  industry: string;
  /**
   * Size
   * Size of the business: 'small', 'medium', or 'large'
   */
  size: string;
  /** Metrics */
  metrics: AppApisFinancialScoringFinancialMetric[];
}

/** CompanyDescriptionModel */
export interface CompanyDescriptionModel {
  /** Mission */
  mission?: string | null;
  /** Vision */
  vision?: string | null;
  /** Values */
  values?: string[] | null;
  /** Legalstructure */
  legalStructure?: string | null;
  /** History */
  history?: string | null;
}

/** CompanyMetric */
export interface CompanyMetric {
  /**
   * Metric Name
   * Name of the company's metric
   */
  metric_name: string;
  /**
   * Value
   * The company's value for the metric
   */
  value: number;
  /**
   * Year
   * Year the metric applies to
   */
  year?: string | null;
}

/**
 * CompanyTaxDataRequest
 * Company-specific tax data
 */
export interface CompanyTaxDataRequest {
  /** Acn */
  acn: string;
  /** Company Type */
  company_type: "proprietary" | "public" | "notForProfit";
  /**
   * Substituted Accounting Period
   * @default false
   */
  substituted_accounting_period?: boolean;
  /** Sap Start Date */
  sap_start_date?: string | null;
  /** Sap End Date */
  sap_end_date?: string | null;
  /**
   * Foreign Income
   * @default 0
   */
  foreign_income?: number | null;
  /**
   * Franking Credits
   * @default 0
   */
  franking_credits?: number | null;
  /**
   * R And D Expenditure
   * @default 0
   */
  r_and_d_expenditure?: number | null;
}

/** CompareToBaseline */
export interface CompareToBaseline {
  /** Tax Savings */
  tax_savings: number;
  /** Cashflow Improvement */
  cashflow_improvement: number;
}

/** ComparisonMethod */
export enum ComparisonMethod {
  Percentile = "percentile",
  DirectComparison = "direct_comparison",
  TrendAnalysis = "trend_analysis",
}

/** ConnectionCreateInput */
export interface ConnectionCreateInput {
  /** Organization Id */
  organization_id: string;
  /** Source Type */
  source_type: string;
  /** Credential Type */
  credential_type: "oauth2" | "api_key" | "basic_auth";
  /** Credentials */
  credentials: OAuth2CredentialsInput | ApiKeyCredentialsInput | BasicAuthCredentialsInput;
}

/** ConnectionOutput */
export interface ConnectionOutput {
  /** Id */
  _id: string;
  /** Organization Id */
  organization_id: string;
  /** User Id */
  user_id: string;
  /** Source Type */
  source_type: string;
  /** Credential Type */
  credential_type: "oauth2" | "api_key" | "basic_auth";
  /** Status */
  status: string;
  /** Last Used At */
  last_used_at?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Scopes */
  scopes?: string | string[] | null;
  /** Expires At */
  expires_at?: string | null;
}

/** ConnectionTestResult */
export interface ConnectionTestResult {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Details */
  details?: Record<string, any> | null;
}

/** ConnectionUpdateInput */
export interface ConnectionUpdateInput {
  /** Status */
  status?: "active" | "inactive" | "requires_reauth" | "error" | null;
  /** Credentials */
  credentials?: OAuth2CredentialsInput | ApiKeyCredentialsInput | BasicAuthCredentialsInput | null;
}

/** ConsolidatedFinancials */
export interface ConsolidatedFinancials {
  /** Period */
  period: string;
  /** Reporting Currency */
  reporting_currency: string;
  /** Consolidated Trial Balance */
  consolidated_trial_balance: Record<string, number>;
  /** Elimination Details */
  elimination_details?: Record<string, number> | null;
  /** Elimination Mismatch */
  elimination_mismatch?: Record<string, number> | null;
  /** Non Controlling Interest */
  non_controlling_interest?: Record<string, number> | null;
  /** Currency Translation Adjustment */
  currency_translation_adjustment?: number | null;
  /** Account Level Entity Contributions */
  account_level_entity_contributions?: Record<string, Record<string, number>> | null;
}

/** ConsolidationRequest */
export interface ConsolidationRequest {
  /** Consolidation Group Id */
  consolidation_group_id: string;
  /** Organization Id */
  organization_id: string;
  /** Period */
  period: string;
  /** Data Type */
  data_type: string;
  entity_structure_override?: EntityStructure | null;
  /** Entity Financial Data Override */
  entity_financial_data_override?: Record<string, Record<string, any>[]> | null;
  /** Coa Mapping Id */
  coa_mapping_id?: string | null;
}

/** ContactDetails */
export interface ContactDetails {
  /** Email */
  email: string;
  /** Phone */
  phone?: string | null;
  address: Address;
  postal_address?: Address | null;
}

/** ContentPermissionsResponse */
export interface ContentPermissionsResponse {
  /**
   * User Ids
   * List of user IDs who have access to the specified content.
   */
  user_ids: string[];
}

/** ContingencyPlan */
export interface ContingencyPlan {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Trigger Conditions */
  trigger_conditions: string[];
  /** Action Plan */
  action_plan: string[];
  /** Responsible Parties */
  responsible_parties: string[];
  /** Communication Plan */
  communication_plan: string[];
  /** Resource Requirements */
  resource_requirements: Record<string, any>;
  /** Recovery Time Objective */
  recovery_time_objective?: number | null;
}

/** CreateApplicationRequest */
export interface CreateApplicationRequest {
  /** Grant Id */
  grant_id: string;
  /** Business Id */
  business_id?: string | null;
  /** Contact Name */
  contact_name?: string | null;
  /** Contact Email */
  contact_email?: string | null;
  /** Contact Phone */
  contact_phone?: string | null;
  /** Notes */
  notes?: string | null;
}

/**
 * CreateBudgetVersionRequest
 * Request body for creating a new budget version.
 */
export interface CreateBudgetVersionRequest {
  /**
   * Name
   * Name for the new version.
   */
  name: string;
  /**
   * Items
   * List of budget items.
   */
  items: BudgetItem[];
}

/** CreateCheckoutSessionRequest */
export interface CreateCheckoutSessionRequest {
  /** Price Id */
  price_id: string;
  /** Organization Id */
  organization_id: string;
  /** Success Url */
  success_url?: string | null;
  /** Cancel Url */
  cancel_url?: string | null;
}

/** CreateMetricDefinitionPayload */
export interface CreateMetricDefinitionPayload {
  /**
   * Name
   * Canonical name of the metric
   */
  name: string;
  /**
   * Description
   * Explanation of the metric
   */
  description?: string | null;
  /**
   * Formula
   * Calculation formula
   */
  formula?: string | null;
  /**
   * Data Type
   * Data type
   * @default "float"
   */
  data_type?: string | null;
  /**
   * Unit
   * Unit of measurement
   */
  unit?: string | null;
  /**
   * Interpretation
   * Interpretation guide
   */
  interpretation?: string | null;
  /**
   * Category
   * Metric category
   */
  category?: string | null;
  /**
   * Related Metrics
   * Related metric IDs
   */
  related_metrics?: string[] | null;
}

/** CreateSourcePayload */
export interface CreateSourcePayload {
  /**
   * Name
   * Name of the new benchmark source
   */
  name: string;
  /**
   * Description
   * Description of the source
   */
  description?: string | null;
  /**
   * Industry Codes
   * Applicable industry codes
   */
  industry_codes?: string[] | null;
  /**
   * Region
   * Geographic region
   */
  region?: string | null;
}

/** DashboardCreate */
export interface DashboardCreate {
  /**
   * Name
   * User-defined name for the dashboard
   * @maxLength 100
   */
  name: string;
  /**
   * Description
   * Optional description
   */
  description?: string | null;
  /** Layout */
  layout?: DashboardLayoutItem[];
  /** Widgets */
  widgets?: WidgetConfiguration[];
}

/** DashboardLayoutItem */
export interface DashboardLayoutItem {
  /**
   * I
   * Widget ID, links to widgets array
   */
  i: string;
  /** X */
  x: number;
  /** Y */
  y: number;
  /** W */
  w: number;
  /** H */
  h: number;
  /**
   * Static
   * @default false
   */
  static?: boolean | null;
}

/** DashboardResponse */
export interface DashboardResponse {
  /**
   * Name
   * User-defined name for the dashboard
   * @maxLength 100
   */
  name: string;
  /**
   * Description
   * Optional description
   */
  description?: string | null;
  /** Layout */
  layout?: DashboardLayoutItem[];
  /** Widgets */
  widgets?: WidgetConfiguration[];
  /**
   * Dashboardid
   * Unique identifier for the dashboard
   */
  dashboardId: string;
  /**
   * Ownerid
   * ID of the user who owns this dashboard
   */
  ownerId: string;
}

/** DashboardSummary */
export interface DashboardSummary {
  /** Dashboardid */
  dashboardId: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
}

/** DashboardUpdate */
export interface DashboardUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Layout */
  layout?: DashboardLayoutItem[] | null;
  /** Widgets */
  widgets?: WidgetConfiguration[] | null;
}

/** DateRange */
export interface DateRange {
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
  /** Label */
  label?: string | null;
}

/** DeliveryMethod */
export enum DeliveryMethod {
  Email = "email",
  Notification = "notification",
  Download = "download",
}

/**
 * DetailedFinancialData
 * Detailed financial data for BAS calculations
 */
export interface DetailedFinancialData {
  /** Sales */
  sales?: Record<string, number>;
  /**
   * Export Sales
   * @default 0
   */
  export_sales?: number;
  /**
   * Gst Free Sales
   * @default 0
   */
  gst_free_sales?: number;
  /**
   * Capital Purchases
   * @default 0
   */
  capital_purchases?: number;
  /**
   * Non Capital Purchases
   * @default 0
   */
  non_capital_purchases?: number;
  /** Payroll */
  payroll?: Record<string, number>;
  /**
   * Other Withholding
   * @default 0
   */
  other_withholding?: number;
  /**
   * Instalment Income
   * @default 0
   */
  instalment_income?: number;
}

/** Director */
export interface Director {
  /** Id */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /**
   * Date Of Birth
   * @format date
   */
  date_of_birth: string;
  /** Tfn */
  tfn: string;
  /** Residency Status */
  residency_status: "resident" | "foreignResident" | "workingHolidayMaker" | "other";
  contact_details: ContactDetails;
  /** Director Id */
  director_id: string;
  /**
   * Appointment Date
   * @format date
   */
  appointment_date: string;
  /** Cessor Date */
  cessor_date?: string | null;
  /** Shareholding */
  shareholding?: Shareholding[] | null;
}

/** Document */
export interface Document {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: string;
  /**
   * Uploaded At
   * @format date-time
   */
  uploaded_at: string;
  /** File Key */
  file_key: string;
  /**
   * Status
   * @default "pending"
   */
  status?: string;
  /** Notes */
  notes?: string | null;
}

/** DocumentUploadRequest */
export interface DocumentUploadRequest {
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Step Id */
  step_id?: string | null;
}

/** Driver */
export interface Driver {
  /**
   * Organizationid
   * ID of the organization this driver belongs to.
   */
  organizationId: string;
  /**
   * Name
   * Unique name of the driver within the organization.
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /**
   * Unit
   * Unit of measurement (e.g., 'Headcount', 'Units Sold', 'Visits', 'USD', '%').
   * @maxLength 50
   */
  unit: string;
  /**
   * Description
   * Optional description of the driver.
   */
  description?: string | null;
  /**
   * Id
   * Unique ID of the driver.
   */
  id: string;
  /**
   * Createdat
   * ISO timestamp of creation.
   */
  createdAt: string;
  /**
   * Updatedat
   * ISO timestamp of last update.
   */
  updatedAt: string;
}

/** DriverCreate */
export interface DriverCreate {
  /**
   * Organizationid
   * ID of the organization this driver belongs to.
   */
  organizationId: string;
  /**
   * Name
   * Unique name of the driver within the organization.
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /**
   * Unit
   * Unit of measurement (e.g., 'Headcount', 'Units Sold', 'Visits', 'USD', '%').
   * @maxLength 50
   */
  unit: string;
  /**
   * Description
   * Optional description of the driver.
   */
  description?: string | null;
}

/** DriverDefinition */
export interface DriverDefinition {
  /**
   * Target Account
   * The account name this driver affects (e.g., 'Revenue', 'Marketing Spend')
   */
  target_account: string;
  /**
   * Driver Type
   * How the driver affects the target account
   */
  driver_type: "percentage_growth" | "fixed_value";
  /**
   * Monthly Values
   * List of driver values for each period. Length must match num_periods.
   */
  monthly_values: number[];
}

/** DriverUpdate */
export interface DriverUpdate {
  /** Name */
  name?: string | null;
  /** Unit */
  unit?: string | null;
  /** Description */
  description?: string | null;
}

/** EconomicScenario */
export interface EconomicScenario {
  /**
   * Scenario Id
   * Unique identifier for the scenario
   */
  scenario_id: string;
  /** The type of economic scenario */
  scenario_type: ScenarioType;
  /**
   * Parameters
   * List of parameters defining the scenario
   */
  parameters: ScenarioParameter[];
  /**
   * Description
   * Description of the scenario
   */
  description?: string | null;
  /** Time horizon */
  time_horizon?: TimeHorizon | null;
}

/** EligibilityCriteria */
export interface EligibilityCriteria {
  /** Business Types */
  business_types: string[];
  /** Turnover Range */
  turnover_range?: string | null;
  /** Employee Count Range */
  employee_count_range?: string | null;
  /** Industry Sectors */
  industry_sectors?: string[] | null;
  /** Location Requirements */
  location_requirements?: string[] | null;
  /** Years In Business */
  years_in_business?: string | null;
  /** Additional Requirements */
  additional_requirements?: string[] | null;
}

/**
 * EnhancedBASRequest
 * Enhanced request for BAS generation with detailed financial data
 */
export interface EnhancedBASRequest {
  /** Business entity data for tax calculations */
  entity: BusinessEntityRequest;
  period: DateRange;
  /** Detailed financial data for BAS calculations */
  financial_data: DetailedFinancialData;
  /**
   * Report Method
   * @default "standard"
   */
  report_method?: "standard" | "calculation_worksheet" | "GST_instalment";
  /**
   * Payment Method
   * @default "direct_credit"
   */
  payment_method?: "direct_credit" | "bpay" | "card" | "other";
  /** Additional Notes */
  additional_notes?: string | null;
}

/**
 * EnhancedBASResponse
 * Enhanced BAS response with detailed breakdown and fields
 */
export interface EnhancedBASResponse {
  /** Bas Id */
  bas_id: string;
  /** Entity Id */
  entity_id: string;
  period: DateRange;
  /** Status */
  status: string;
  /**
   * Due Date
   * @format date
   */
  due_date: string;
  /** Fields */
  fields: BASFieldValue[];
  /** Totals */
  totals: Record<string, number>;
  /** Payment Required */
  payment_required: boolean;
  /** Refund Due */
  refund_due: boolean;
  /** Net Amount */
  net_amount: number;
  /**
   * Generation Date
   * @format date-time
   */
  generation_date: string;
  /** Submission Date */
  submission_date?: string | null;
  /**
   * Attachments
   * @default []
   */
  attachments?: string[];
}

/**
 * EntitySpecificTaxData
 * Entity-specific tax data based on business structure
 */
export interface EntitySpecificTaxData {
  company_data?: CompanyTaxDataRequest | null;
  trust_data?: TrustTaxDataRequest | null;
  partnership_data?: PartnershipTaxDataRequest | null;
  sole_trader_data?: SoleTraderTaxDataRequest | null;
}

/**
 * EntityStructure
 * Explicit model for entity structure, mirroring get_entity_structure output
 */
export interface EntityStructure {
  /** Entities */
  entities: Record<string, any>[];
  /** Ownership */
  ownership: Record<string, Record<string, any>[]>;
}

/** ExecutiveSummaryModel */
export interface ExecutiveSummaryModel {
  /** Content */
  content?: string | null;
}

/** ExportRequest */
export interface ExportRequest {
  reportType: ReportType;
  /** Reportname */
  reportName?: string | null;
  /** @default "pdf" */
  format?: ReportFormat;
  /** Parameters */
  parameters?: Record<string, any> | null;
}

/** ExportResponse */
export interface ExportResponse {
  /** Reportid */
  reportId: string;
  /** Downloadurl */
  downloadUrl: string;
  /**
   * Expiresat
   * @format date-time
   */
  expiresAt: string;
}

/**
 * FXRateEntry
 * Represents a single FX rate entry.
 */
export interface FXRateEntry {
  /**
   * Rate Date
   * @format date
   */
  rate_date: string;
  /** From Currency */
  from_currency: string;
  /** To Currency */
  to_currency: string;
  /** Rate */
  rate: number;
}

/**
 * FXRateListResponse
 * Response for listing FX rates.
 */
export interface FXRateListResponse {
  /** Rates */
  rates: FXRateEntry[];
}

/**
 * FXRateUploadResponse
 * Response after uploading FX rates.
 */
export interface FXRateUploadResponse {
  /** Message */
  message: string;
  /** Rows Added */
  rows_added: number;
  /** Total Rows After Upload */
  total_rows_after_upload: number;
}

/** FailurePattern */
export interface FailurePattern {
  /** Pattern Name */
  pattern_name: string;
  /** Description */
  description: string;
  /** Warning Signs */
  warning_signs: string[];
  /** Affected Industries */
  affected_industries: string[];
  /** Affected Metrics */
  affected_metrics: string[];
  /** Mitigation Strategies */
  mitigation_strategies: string[];
}

/** FeedbackQuestion */
export interface FeedbackQuestion {
  /** Id */
  id: string;
  /** Question */
  question: string;
  /**
   * Questiontype
   * @default "rating"
   */
  questionType?: string;
}

/** FetchWidgetDataResponse */
export interface FetchWidgetDataResponse {
  /** Data */
  data: any;
}

/**
 * FinancialData
 * Financial data for tax calculations
 */
export interface FinancialData {
  /** Revenue */
  revenue: Record<string, any>[];
  /** Cost Of Sales */
  cost_of_sales: Record<string, any>[];
  /** Expenses */
  expenses: Record<string, any>[];
  /** Gross Profit */
  gross_profit: number;
  /** Net Income */
  net_income: number;
}

/** FinancialDataPoint */
export interface FinancialDataPoint {
  /** Date */
  date: string;
  /** Value */
  value: number;
  /** Category */
  category?: string | null;
  /** Label */
  label?: string | null;
}

/** FinancialDataType */
export enum FinancialDataType {
  TrialBalance = "trial_balance",
  ProfitLoss = "profit_loss",
  BalanceSheet = "balance_sheet",
}

/** FinancialImport */
export interface FinancialImport {
  /** Import Id */
  import_id: string;
  /** File Name */
  file_name: string;
  /** Data Type */
  data_type: string;
  /** Import Date */
  import_date: string;
  /** Status */
  status: string;
  /** Row Count */
  row_count: number;
  /** User Id */
  user_id?: string | null;
  /** Organization Id */
  organization_id: string;
}

/** FinancialProjectionsModel */
export interface FinancialProjectionsModel {
  /** Startupcosts */
  startupCosts?: Record<string, any>[] | null;
  /** Historicalsummary */
  historicalSummary?: string | null;
  /** Salesforecast */
  salesForecast?: Record<string, any>[] | null;
  /** Fundingrequest */
  fundingRequest?: Record<string, any> | null;
}

/** FinancialStatementCategory */
export enum FinancialStatementCategory {
  Revenue = "Revenue",
  CostOfSales = "Cost_of_Sales",
  OperatingExpenses = "Operating_Expenses",
  OtherIncome = "Other_Income",
  OtherExpenses = "Other_Expenses",
  FinanceIncome = "Finance_Income",
  FinanceCosts = "Finance_Costs",
  IncomeTaxExpense = "Income_Tax_Expense",
  NonCurrentAssets = "Non_Current_Assets",
  CurrentAssets = "Current_Assets",
  Equity = "Equity",
  NonCurrentLiabilities = "Non_Current_Liabilities",
  CurrentLiabilities = "Current_Liabilities",
  CashInflowOperating = "Cash_Inflow_Operating",
  CashOutflowOperating = "Cash_Outflow_Operating",
  CashInflowInvesting = "Cash_Inflow_Investing",
  CashOutflowInvesting = "Cash_Outflow_Investing",
  CashInflowFinancing = "Cash_Inflow_Financing",
  CashOutflowFinancing = "Cash_Outflow_Financing",
}

/** ForecastAccuracyMetrics */
export interface ForecastAccuracyMetrics {
  /** Mape */
  mape: number;
  /** Rmse */
  rmse: number;
  /** Mae */
  mae: number;
  /** R2 */
  r2?: number | null;
}

/** ForecastAssumption */
export interface ForecastAssumption {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Category */
  category: "revenue" | "costOfSales" | "expenses";
  /** Itemid */
  itemId: string;
  /** Growthtype */
  growthType: "linear" | "percentage" | "manual";
  /** Growthrate */
  growthRate: number;
  /** Manualvalues */
  manualValues?: number[] | null;
}

/** ForecastPLStatement */
export interface ForecastPLStatement {
  /** Revenue */
  revenue: PLItem[];
  /** Costofsales */
  costOfSales: PLItem[];
  /** Expenses */
  expenses: PLItem[];
}

/** ForecastPeriodData */
export interface ForecastPeriodData {
  /** Period */
  period: number;
  /**
   * Date
   * @format date
   */
  date: string;
  /** Label */
  label: string;
  /** Revenue */
  revenue: PLItem[];
  /** Costofsales */
  costOfSales: PLItem[];
  /** Expenses */
  expenses: PLItem[];
  /** Grossprofit */
  grossProfit: number;
  /** Netincome */
  netIncome: number;
}

/** ForecastPoint */
export interface ForecastPoint {
  /**
   * Forecast Date
   * The date of the forecasted point
   * @format date
   */
  forecast_date: string;
  /**
   * Yhat
   * The forecasted score value
   */
  yhat: number;
  /**
   * Yhat Lower
   * The lower bound of the forecast interval
   */
  yhat_lower: number;
  /**
   * Yhat Upper
   * The upper bound of the forecast interval
   */
  yhat_upper: number;
}

/** ForecastRequest */
export interface ForecastRequest {
  /**
   * Historical Data
   * List of historical score data points
   */
  historical_data: HistoricalScorePoint[];
  /**
   * Periods
   * Number of future periods (months) to forecast
   * @default 6
   */
  periods?: number;
  /**
   * Freq
   * Frequency of the forecast periods ('D', 'W', 'M', 'Q', 'Y')
   * @default "M"
   */
  freq?: string;
}

/** ForecastResponse */
export interface ForecastResponse {
  /**
   * Forecast Data
   * List of forecasted score data points
   */
  forecast_data: ForecastPoint[];
}

/** ForecastResultPeriod */
export interface ForecastResultPeriod {
  /**
   * Period
   * The forecast period number (1-based)
   */
  period: number;
  /**
   * Values
   * Calculated values for accounts in this period
   */
  values: Record<string, number>;
}

/** ForecastScenario */
export interface ForecastScenario {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  baseline: ForecastPLStatement;
  /** Assumptions */
  assumptions: ForecastAssumption[];
  /** Periods */
  periods: number;
  /** Periodtype */
  periodType: "monthly" | "quarterly" | "yearly";
  /**
   * Startdate
   * @format date
   */
  startDate: string;
}

/** ForecastVarianceAnalysis */
export interface ForecastVarianceAnalysis {
  /** Periodlabel */
  periodLabel: string;
  /** Predicted */
  predicted: number;
  /** Actual */
  actual: number;
  /** Variance */
  variance: number;
  /** Variancepercent */
  variancePercent: number;
  /** Impact */
  impact: "high" | "medium" | "low";
  /** Factors */
  factors?: string[] | null;
}

/** ForecastingRule */
export interface ForecastingRule {
  /**
   * Organizationid
   * ID of the organization this rule belongs to.
   */
  organizationId: string;
  /**
   * Name
   * Name of the forecasting rule.
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /**
   * Description
   * Optional description of the rule.
   */
  description?: string | null;
  /**
   * Targetaccountid
   * ID of the financial account this rule forecasts for (e.g., from Chart of Accounts).
   */
  targetAccountId: string;
  /**
   * Ruletype
   * Type of the rule: formula, lookup, or manual.
   */
  ruleType: "formula" | "lookup" | "manual";
  /**
   * Formuladefinition
   * Formula string referencing driver IDs (e.g., 'driver_sales_units * driver_avg_price'). Required if ruleType is 'formula'.
   */
  formulaDefinition?: string | null;
  /**
   * Lookupdefinition
   * Definition for lookup table (e.g., based on driver value ranges). Required if ruleType is 'lookup'. Structure TBD.
   */
  lookupDefinition?: Record<string, any> | null;
  /**
   * Id
   * Unique ID of the forecasting rule.
   */
  id: string;
  /**
   * Createdat
   * ISO timestamp of creation.
   */
  createdAt: string;
  /**
   * Updatedat
   * ISO timestamp of last update.
   */
  updatedAt: string;
}

/** FundingDetails */
export interface FundingDetails {
  /** Min Amount */
  min_amount?: number | null;
  /** Max Amount */
  max_amount?: number | null;
  /** Co Contribution Required */
  co_contribution_required?: boolean | null;
  /** Co Contribution Percentage */
  co_contribution_percentage?: number | null;
  /** Funding Type */
  funding_type: string;
}

/**
 * GSTCalculationRequest
 * Request model for GST calculations
 */
export interface GSTCalculationRequest {
  /** Business entity data for tax calculations */
  entity: BusinessEntityRequest;
  /** Financial data for tax calculations */
  financial_data: FinancialData;
  period: DateRange;
}

/**
 * GSTCalculationResponse
 * Response model for GST calculations
 */
export interface GSTCalculationResponse {
  /** Gst Collected */
  gst_collected: number;
  /** Gst Paid */
  gst_paid: number;
  /** Gst Net Amount */
  gst_net_amount: number;
  /** Gst Summary */
  gst_summary: Record<string, any>;
}

/** GSTFrequency */
export enum GSTFrequency {
  Monthly = "monthly",
  Quarterly = "quarterly",
  Annually = "annually",
}

/** GenerateReportRequest */
export interface GenerateReportRequest {
  /**
   * Report Definition Id
   * ID of the report definition to use.
   */
  report_definition_id: string;
}

/** GovernanceMetricsResponse */
export interface GovernanceMetricsResponse {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Metric Categories */
  metric_categories: AppApisGovernanceMetricsMetricCategory[];
  /** References */
  references: Record<string, string>[];
}

/** GrantComparisonRequest */
export interface GrantComparisonRequest {
  /** Grant Ids */
  grant_ids: string[];
  /** Business Id */
  business_id?: string | null;
}

/** GrantComparisonResponse */
export interface GrantComparisonResponse {
  /** Grants */
  grants: ROICalculationResponse[];
  /** Recommended Priority */
  recommended_priority: string[];
  /** Optimization Factors */
  optimization_factors: Record<string, number>;
}

/** GrantCreateRequest */
export interface GrantCreateRequest {
  grant: GrantProgram;
}

/**
 * GrantMatchRequest
 * Request model for grant matching
 */
export interface GrantMatchRequest {
  /** Business Id */
  business_id?: string | null;
  business_profile?: BusinessProfile | null;
  /**
   * Min Score
   * @default 0
   */
  min_score?: number | null;
  /**
   * Limit
   * @default 10
   */
  limit?: number | null;
  /**
   * Include Details
   * @default true
   */
  include_details?: boolean;
}

/** GrantProgram */
export interface GrantProgram {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Provider */
  provider: string;
  /** Level */
  level: string;
  /** State */
  state?: string | null;
  /** Region */
  region?: string | null;
  /** Category */
  category: string[];
  eligibility: EligibilityCriteria;
  funding: FundingDetails;
  application_period: ApplicationPeriod;
  /** Website Url */
  website_url: string;
  /** Contact Information */
  contact_information?: Record<string, string> | null;
  /**
   * Keywords
   * @default []
   */
  keywords?: string[];
}

/** GrantUpdateRequest */
export interface GrantUpdateRequest {
  grant: GrantProgram;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** HistogramData */
export interface HistogramData {
  /** Bin Centers */
  bin_centers: number[];
  /** Frequencies */
  frequencies: number[];
}

/** HistoricalAccountPoint */
export interface HistoricalAccountPoint {
  /**
   * Point Date
   * The date of the historical data point
   * @format date
   */
  point_date: string;
  /**
   * Value
   * The value of the account on that date
   */
  value: number;
}

/** HistoricalScorePoint */
export interface HistoricalScorePoint {
  /**
   * Point Date
   * The date of the historical score point
   * @format date
   */
  point_date: string;
  /**
   * Score
   * The historical score value (0-100)
   */
  score: number;
}

/** ImpactLevel */
export enum ImpactLevel {
  VERY_NEGATIVE = "VERY_NEGATIVE",
  NEGATIVE = "NEGATIVE",
  NEUTRAL = "NEUTRAL",
  POSITIVE = "POSITIVE",
  VERY_POSITIVE = "VERY_POSITIVE",
}

/** ImplementationComplexity */
export enum ImplementationComplexity {
  Simple = "simple",
  Moderate = "moderate",
  Complex = "complex",
}

/** ImportDetailResponse */
export interface ImportDetailResponse {
  /** Import Details */
  import_details: Record<string, any>;
  /** Metadata */
  metadata?: Record<string, any> | null;
  /** Sample Data */
  sample_data?: Record<string, any>[] | null;
}

/** ImportListResponse */
export interface ImportListResponse {
  /** Imports */
  imports: Record<string, any>[];
  /** Total */
  total: number;
}

/** ImportMappingRequest */
export interface ImportMappingRequest {
  /** Upload Id */
  upload_id: string;
  /** Data Type */
  data_type: string;
  /** Date */
  date: string;
  /** Organization Id */
  organization_id: string;
  /** Business Entity Id */
  business_entity_id: string;
  /** Mappings */
  mappings: ColumnMapping[];
  /** Date Format */
  date_format?: string | null;
}

/** IndustryBenchmark */
export interface IndustryBenchmark {
  /** Industry Code */
  industry_code: string;
  /** Industry Name */
  industry_name: string;
  /** Small Business */
  small_business: Record<string, number>;
  /** Medium Business */
  medium_business: Record<string, number>;
  /** Large Business */
  large_business: Record<string, number>;
  /** Source */
  source: string;
  /** Year */
  year: string;
}

/** Insight */
export interface Insight {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Type */
  type: "information" | "warning" | "success" | "neutral" | "positive" | "negative";
  /** Metric Name */
  metric_name?: string | null;
  /** Recommendations */
  recommendations?: string[] | null;
  /** Confidence */
  confidence?: number | null;
}

/** InsightRequest */
export interface InsightRequest {
  /** Metrics */
  metrics: AppApisFinancialInsightsFinancialMetric[];
  /**
   * Report Type
   * @default "board"
   */
  report_type?: "board" | "management" | "investor" | "custom";
  /** Industry */
  industry?: string | null;
  /** Company Size */
  company_size?: string | null;
  /** Time Period */
  time_period?: string | null;
  /** Context */
  context?: Record<string, any> | null;
}

/** InsightResponse */
export interface InsightResponse {
  /** Insights */
  insights: Insight[];
  /** Summary */
  summary?: string | null;
}

/** KeyDate */
export interface KeyDate {
  /** Date */
  date: string;
  /** Event */
  event: string;
  /** Description */
  description: string;
  cashFlowImpact?: CashFlowImpact | null;
}

/**
 * MappedAccountData
 * Represents a financial data point mapped to a system category.
 */
export interface MappedAccountData {
  /** System Category */
  system_category: string;
  /** Value */
  value: number;
}

/** MarketAnalysisModel */
export interface MarketAnalysisModel {
  /** Targetmarket */
  targetMarket?: string | null;
  /** Marketsize */
  marketSize?: string | null;
  /** Trends */
  trends?: string | null;
  /** Competitors */
  competitors?: Record<string, any>[] | null;
}

/** MarketingSalesStrategyModel */
export interface MarketingSalesStrategyModel {
  /** Positioning */
  positioning?: string | null;
  /** Pricing */
  pricing?: string | null;
  /** Promotion */
  promotion?: string | null;
  /** Distribution */
  distribution?: string | null;
  /** Salesprocess */
  salesProcess?: string | null;
}

/** MetricComparison */
export interface MetricComparison {
  /**
   * Metric Name
   * Name of the metric being compared
   */
  metric_name: string;
  /**
   * Company Value
   * The company's value for the metric
   */
  company_value: number;
  /**
   * Benchmark Value
   * The benchmark value for the metric
   */
  benchmark_value?: number | null;
  /**
   * Difference Absolute
   * Absolute difference between company and benchmark
   */
  difference_absolute?: number | null;
  /**
   * Difference Percent
   * Percentage difference between company and benchmark
   */
  difference_percent?: number | null;
  /**
   * Is Favorable
   * True if the company's value is considered favorable compared to the benchmark
   */
  is_favorable?: boolean | null;
  /** Company's percentile rank within the benchmark group */
  percentile_rank?: PercentileRank | null;
}

/** MetricDetail */
export interface MetricDetail {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Calculation */
  calculation?: string | null;
  /** Importance */
  importance: string;
  /** Typical Target */
  typical_target?: string | null;
}

/** MetricProbabilities */
export interface MetricProbabilities {
  /** Negative */
  negative: number;
  /** Significantly Negative */
  significantly_negative: number;
  /** Significantly Positive */
  significantly_positive: number;
  histogram: HistogramData;
}

/** MetricStatistics */
export interface MetricStatistics {
  /** Mean */
  mean: number;
  /** Median */
  median: number;
  /** Std */
  std: number;
  /** Min */
  min: number;
  /** Max */
  max: number;
  /** Percentile 10 */
  percentile_10: number;
  /** Percentile 25 */
  percentile_25: number;
  /** Percentile 75 */
  percentile_75: number;
  /** Percentile 90 */
  percentile_90: number;
}

/** MetricsQuery */
export interface MetricsQuery {
  /** Entity Type */
  entity_type?: string | null;
  /** Company Size */
  company_size?: string | null;
  /** Industry */
  industry?: string | null;
  /** Governance Area */
  governance_area?: string | null;
}

/** MitigationStrategy */
export interface MitigationStrategy {
  /** Id */
  id?: string | null;
  /** Title */
  title: string;
  /** Description */
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  timeframe: TimeFrame;
  expected_impact: RecommendationImpact;
  implementation_complexity: ImplementationComplexity;
  /** Key Stakeholders */
  key_stakeholders: string[];
  /** Implementation Steps */
  implementation_steps: string[];
  /** Metrics To Track */
  metrics_to_track: string[];
  /** Resource Requirements */
  resource_requirements?: Record<string, any> | null;
  /** Risk Addressed */
  risk_addressed: string;
  /** Risk Reduction Potential */
  risk_reduction_potential: number;
}

/** MonteCarloResults */
export interface MonteCarloResults {
  /** Summary Statistics */
  summary_statistics: Record<string, MetricStatistics>;
  /** Probabilities */
  probabilities: Record<string, MetricProbabilities>;
}

/** MyobTrialBalanceImportRequest */
export interface MyobTrialBalanceImportRequest {
  /** Connection Id */
  connection_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
}

/** MyobTrialBalanceImportResponse */
export interface MyobTrialBalanceImportResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Records Imported */
  records_imported?: number | null;
}

/** NotificationCreate */
export interface NotificationCreate {
  /** Userid */
  userId: string;
  /** Entityid */
  entityId?: string | null;
  /**
   * Type
   * Type of notification: deadline, compliance, anomaly, etc.
   */
  type: string;
  /**
   * Severity
   * Severity level: info, warning, error
   */
  severity: string;
  /** Title */
  title: string;
  /** Message */
  message: string;
  /**
   * Actionrequired
   * @default false
   */
  actionRequired?: boolean;
  /** Actionlink */
  actionLink?: string | null;
  /** Expiresat */
  expiresAt?: string | null;
  /** Data */
  data?: Record<string, any> | null;
}

/** NotificationResponse */
export interface NotificationResponse {
  /** Success */
  success: boolean;
  /** Message */
  message?: string | null;
  /** Data */
  data?: null;
}

/** OAuth2CredentialsInput */
export interface OAuth2CredentialsInput {
  /** Access Token */
  access_token: string;
  /** Refresh Token */
  refresh_token: string;
  /**
   * Expires At
   * @format date-time
   */
  expires_at: string;
  /** Scopes */
  scopes?: string | string[] | null;
  /** Tenant Id */
  tenant_id?: string | null;
}

/** OpportunityStrategy */
export interface OpportunityStrategy {
  /** Id */
  id?: string | null;
  /** Title */
  title: string;
  /** Description */
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  timeframe: TimeFrame;
  expected_impact: RecommendationImpact;
  implementation_complexity: ImplementationComplexity;
  /** Key Stakeholders */
  key_stakeholders: string[];
  /** Implementation Steps */
  implementation_steps: string[];
  /** Metrics To Track */
  metrics_to_track: string[];
  /** Resource Requirements */
  resource_requirements?: Record<string, any> | null;
  /** Opportunity Addressed */
  opportunity_addressed: string;
  /** Revenue Potential */
  revenue_potential?: number | null;
  /** Cost Savings Potential */
  cost_savings_potential?: number | null;
}

/** OptimizationRequest */
export interface OptimizationRequest {
  /** Grant Ids */
  grant_ids: string[];
  /** Business Id */
  business_id?: string | null;
  /** Available Time Hours */
  available_time_hours?: number | null;
  /** Available Budget */
  available_budget?: number | null;
  /**
   * Optimization Preference
   * @default "balanced"
   */
  optimization_preference?: string;
}

/** OptimizationResponse */
export interface OptimizationResponse {
  /** Recommended Grants */
  recommended_grants: string[];
  /** Total Expected Funding */
  total_expected_funding: number;
  /** Total Estimated Cost */
  total_estimated_cost: number;
  /** Total Estimated Time */
  total_estimated_time: number;
  /** Expected Net Benefit */
  expected_net_benefit: number;
  /** Expected Roi */
  expected_roi: number;
  /** Excluded Grants */
  excluded_grants: string[];
}

/** OrganizationManagementModel */
export interface OrganizationManagementModel {
  /** Teamstructure */
  teamStructure?: string | null;
  /** Keypersonnel */
  keyPersonnel?: Record<string, any>[] | null;
  /** Advisoryboard */
  advisoryBoard?: string | null;
}

/** OverallScore */
export interface OverallScore {
  /** Score */
  score: number;
  /**
   * Max Score
   * @default 100
   */
  max_score?: number;
  /**
   * Percentile
   * The percentile rank compared to similar businesses
   */
  percentile: number;
  /** Interpretation */
  interpretation: string;
  /** Category Scores */
  category_scores: Record<string, CategoryScore>;
}

/** OwnershipDetail */
export interface OwnershipDetail {
  /**
   * Owned Entity Id
   * ID of the entity that is owned
   */
  owned_entity_id: string;
  /**
   * Percentage
   * Ownership percentage
   * @exclusiveMin 0
   * @max 100
   */
  percentage: number;
}

/** PLItem */
export interface PLItem {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Amount */
  amount: number;
}

/** ParameterChart */
export interface ParameterChart {
  /** Parameter Values */
  parameter_values: number[];
  /** Impact Values */
  impact_values: number[];
}

/** ParameterCrossEffect */
export interface ParameterCrossEffect {
  /** Parameter1 */
  parameter1: string;
  /** Parameter2 */
  parameter2: string;
  /** Interaction Strength */
  interaction_strength: number;
  /** Description */
  description: string;
}

/** ParameterSensitivity */
export interface ParameterSensitivity {
  /** Parameter */
  parameter: string;
  /** Min Impact */
  min_impact: number;
  /** Max Impact */
  max_impact: number;
  /** Range */
  range: number;
}

/** Partner */
export interface Partner {
  /** Entity Id */
  entity_id: string;
  /** Entity Type */
  entity_type: "individual" | "company" | "trust";
  /** Partnership Interest */
  partnership_interest: number;
  /** Profit Sharing Ratio */
  profit_sharing_ratio: number;
  /** Loss Sharing Ratio */
  loss_sharing_ratio: number;
}

/** Partnership */
export interface Partnership {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  /** Business Structure */
  business_structure: "partnership";
  /** Tfn */
  tfn: string;
  /** Registered For Gst */
  registered_for_gst: boolean;
  gst_frequency?: GSTFrequency | null;
  /**
   * Local Currency
   * Local currency code (e.g., AUD, USD)
   */
  local_currency: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Parent Entity Id
   * ID of the parent entity in a hierarchy
   */
  parent_entity_id?: string | null;
  /**
   * Ownership Details
   * Details of entities owned by this entity
   */
  ownership_details?: OwnershipDetail[] | null;
  /** Partners */
  partners: Partner[];
  /** Partnership Type */
  partnership_type: "general" | "limited" | "jointVenture";
}

/**
 * PartnershipTaxDataRequest
 * Partnership-specific tax data
 */
export interface PartnershipTaxDataRequest {
  /** Partnership Type */
  partnership_type: "general" | "limited" | "jointVenture";
  /** Partners */
  partners: Record<string, any>[];
  /** Partnership Income */
  partnership_income?: number | null;
  /**
   * Partner Salaries
   * @default 0
   */
  partner_salaries?: number | null;
}

/** PercentileRank */
export interface PercentileRank {
  /**
   * Metric Name
   * Name of the metric
   */
  metric_name: string;
  /**
   * Percentile
   * Calculated percentile rank (0-100)
   */
  percentile: number;
  /**
   * Comparison Group
   * Description of the comparison group (e.g., industry, size)
   */
  comparison_group?: string | null;
}

/**
 * PeriodFinancialsInput
 * Holds all necessary mapped financial data for a calculation period.
 */
export interface PeriodFinancialsInput {
  /** Profit Loss */
  profit_loss: MappedAccountData[];
  /** Start Balance Sheet */
  start_balance_sheet: MappedAccountData[];
  /** End Balance Sheet */
  end_balance_sheet: MappedAccountData[];
}

/** ProbabilityThreshold */
export interface ProbabilityThreshold {
  /** Threshold */
  threshold: number;
  /** Probability */
  probability: number;
  /** Comparison */
  comparison: string;
}

/** ProductsServicesModel */
export interface ProductsServicesModel {
  /** Description */
  description?: string | null;
  /** Lifecycle */
  lifecycle?: string | null;
  /** Intellectualproperty */
  intellectualProperty?: string | null;
  /** Researchdevelopment */
  researchDevelopment?: string | null;
}

/** ProjectedTaxOutcome */
export interface ProjectedTaxOutcome {
  /** Taxable Income */
  taxable_income: number;
  /** Tax Payable */
  tax_payable: number;
  /** Effective Tax Rate */
  effective_tax_rate: number;
  /** Cashflow Impact */
  cashflow_impact: number;
}

/** PurgeResponse */
export interface PurgeResponse {
  /** Message */
  message: string;
  /** Deleted Count */
  deleted_count: number;
}

/** QueryAuditLogsResponse */
export interface QueryAuditLogsResponse {
  /** Logs */
  logs: AuditLogEntryResponse[];
  /** Total Count */
  total_count?: number | null;
}

/** ROICalculationRequest */
export interface ROICalculationRequest {
  /** Grant Id */
  grant_id: string;
  /** Business Id */
  business_id?: string | null;
  /** Expected Funding Amount */
  expected_funding_amount: number;
  /** Application Cost Estimate */
  application_cost_estimate?: number | null;
  /** Success Probability */
  success_probability?: number | null;
  /**
   * Include Requirements Breakdown
   * @default false
   */
  include_requirements_breakdown?: boolean;
}

/** ROICalculationResponse */
export interface ROICalculationResponse {
  /** Grant Id */
  grant_id: string;
  /** Grant Name */
  grant_name: string;
  /** Expected Funding Amount */
  expected_funding_amount: number;
  /** Estimated Application Cost */
  estimated_application_cost: number;
  /** Application Time Estimate */
  application_time_estimate: number;
  /** Success Probability */
  success_probability: number;
  /** Estimated Roi */
  estimated_roi: number;
  /** Estimated Net Benefit */
  estimated_net_benefit: number;
  /** Payback Period Days */
  payback_period_days: number;
  /** Requirements */
  requirements?: ApplicationRequirement[] | null;
  /** Confidence Level */
  confidence_level: string;
}

/** Recipient */
export interface Recipient {
  /** Email */
  email: string;
  /** Name */
  name?: string | null;
}

/** RecommendationCategory */
export enum RecommendationCategory {
  RiskMitigation = "risk_mitigation",
  Opportunity = "opportunity",
  Contingency = "contingency",
}

/** RecommendationImpact */
export enum RecommendationImpact {
  High = "high",
  Medium = "medium",
  Low = "low",
}

/** RecommendationPriority */
export enum RecommendationPriority {
  High = "high",
  Medium = "medium",
  Low = "low",
}

/** RecommendationRequest */
export interface RecommendationRequest {
  /** Company Id */
  company_id: string;
  financial_score_data: ScoreResponseInput;
  /**
   * Max Recommendations
   * @default 5
   */
  max_recommendations?: number | null;
  /** Focus Categories */
  focus_categories?: string[] | null;
}

/** RecommendationResponse */
export interface RecommendationResponse {
  /** Company Id */
  company_id: string;
  /** Recommendations */
  recommendations: RecommendedAction[];
  /** Priority Explanation */
  priority_explanation: string;
  /** Estimated Total Score Increase */
  estimated_total_score_increase: number;
  /**
   * Recommendation Date
   * @format date-time
   */
  recommendation_date: string;
}

/** RecommendedAction */
export interface RecommendedAction {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Priority */
  priority: number;
  /** Difficulty */
  difficulty: string;
  /** Timeframe */
  timeframe: string;
  /** Category */
  category: string;
  /** Impacts */
  impacts: ActionImpact[];
  /** Estimated Overall Score Increase */
  estimated_overall_score_increase: number;
}

/** RegionalVariation */
export interface RegionalVariation {
  /** Region */
  region: string;
  /** Description */
  description: string;
  seasonalAdjustments?: SeasonalAdjustments | null;
}

/** RelativePerformanceRequest */
export interface RelativePerformanceRequest {
  /** Company Id */
  company_id: string;
  /**
   * Comparison Metrics
   * @default ["overall_score","profitability","liquidity","leverage","efficiency"]
   */
  comparison_metrics?: string[];
}

/** RelativePerformanceResponse */
export interface RelativePerformanceResponse {
  /** Company Id */
  company_id: string;
  /** Industry */
  industry: string;
  /** Size */
  size: string;
  /**
   * Performance Metrics
   * Metric: {company_value, industry_avg, percentile}
   */
  performance_metrics: Record<string, Record<string, number>>;
  /**
   * Normalized Scores
   * Cross-industry normalized scores
   */
  normalized_scores: Record<string, number>;
}

/** ReportDataResponse */
export interface ReportDataResponse {
  /** Report Name */
  report_name: string;
  /** Report Id */
  report_id: string;
  /** Data */
  data: ReportRow[];
}

/** ReportDefinition */
export interface ReportDefinition {
  /**
   * Name
   * User-defined name for the report.
   */
  name: string;
  /**
   * Description
   * Optional description of the report's purpose or content.
   */
  description?: string | null;
  /**
   * Budget Version Id
   * Optional ID of the budget version to compare against.
   */
  budget_version_id?: string | null;
  /**
   * Datasource
   * Specifies the primary data source and scope.
   */
  dataSource: Record<string, any>;
  /**
   * Filters
   * Criteria applied to the data source before aggregation.
   */
  filters: Record<string, any>;
  /**
   * Rows
   * Defines the structure and content of the report rows.
   */
  rows: Record<string, any>[];
  /**
   * Columns
   * Defines the structure and content of the report columns.
   */
  columns: Record<string, any>[];
  /**
   * Id
   * Unique identifier for this report definition.
   */
  id: string;
  /**
   * Version
   * Schema version.
   * @default "1.0"
   */
  version?: string;
  /**
   * Createdat
   * Timestamp when the report definition was created.
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * Timestamp when the report definition was last updated.
   * @format date-time
   */
  updatedAt: string;
  /**
   * Ownerid
   * ID of the user who owns this definition.
   */
  ownerId: string;
}

/** ReportDefinitionCreate */
export interface ReportDefinitionCreate {
  /**
   * Name
   * User-defined name for the report.
   */
  name: string;
  /**
   * Description
   * Optional description of the report's purpose or content.
   */
  description?: string | null;
  /**
   * Budget Version Id
   * Optional ID of the budget version to compare against.
   */
  budget_version_id?: string | null;
  /**
   * Datasource
   * Specifies the primary data source and scope.
   */
  dataSource: Record<string, any>;
  /**
   * Filters
   * Criteria applied to the data source before aggregation.
   */
  filters: Record<string, any>;
  /**
   * Rows
   * Defines the structure and content of the report rows.
   */
  rows: Record<string, any>[];
  /**
   * Columns
   * Defines the structure and content of the report columns.
   */
  columns: Record<string, any>[];
}

/** ReportDefinitionMetadata */
export interface ReportDefinitionMetadata {
  /**
   * Name
   * User-defined name for the report.
   */
  name: string;
  /**
   * Description
   * Optional description of the report's purpose or content.
   */
  description?: string | null;
  /**
   * Id
   * Unique identifier for this report definition.
   */
  id: string;
  /**
   * Updatedat
   * Timestamp when the report definition was last updated.
   * @format date-time
   */
  updatedAt: string;
}

/** ReportFeedback */
export interface ReportFeedback {
  /** Reportid */
  reportId: string;
  /** Questionid */
  questionId: string;
  /** Response */
  response: any;
  /** Comments */
  comments?: string | null;
  /** Submittedby */
  submittedBy?: string | null;
}

/** ReportFormat */
export enum ReportFormat {
  Pdf = "pdf",
  Pptx = "pptx",
  Xlsx = "xlsx",
  Csv = "csv",
  Png = "png",
}

/** ReportRow */
export interface ReportRow {
  /** Row Header */
  row_header: string;
  /** Values */
  values: Record<string, any>;
}

/** ReportSchedule */
export interface ReportSchedule {
  /** Scheduleid */
  scheduleId: string;
  reportType: ReportType;
  /** Reportname */
  reportName: string;
  /** Description */
  description?: string | null;
  frequency: ScheduleFrequency;
  /**
   * Startdate
   * @format date
   */
  startDate: string;
  /** Enddate */
  endDate?: string | null;
  /** Deliverymethods */
  deliveryMethods: DeliveryMethod[];
  /** Recipients */
  recipients: Recipient[];
  /** Formats */
  formats: ReportFormat[];
  /** Parameters */
  parameters?: Record<string, any> | null;
  /** Feedbackquestions */
  feedbackQuestions?: FeedbackQuestion[] | null;
  status: ReportStatus;
  /**
   * Nextdeliverydate
   * @format date
   */
  nextDeliveryDate: string;
  /** Lastdeliverydate */
  lastDeliveryDate?: string | null;
  /** Createdby */
  createdBy: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** ReportStatus */
export enum ReportStatus {
  Scheduled = "scheduled",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed",
  Delivered = "delivered",
  Pending = "pending",
}

/** ReportType */
export enum ReportType {
  Board = "board",
  Management = "management",
  Investor = "investor",
  Executive = "executive",
  Custom = "custom",
}

/** ReportingStandardsQuery */
export interface ReportingStandardsQuery {
  /** Entity Type */
  entity_type?: string | null;
  /** Company Size */
  company_size?: string | null;
  /** Standard Type */
  standard_type?: string | null;
}

/** RevokeRoleRequest */
export interface RevokeRoleRequest {
  /**
   * Assignmentid
   * The ID of the specific assignment document to revoke.
   */
  assignmentId?: string | null;
  /**
   * Userid
   * User ID for revocation (used with roleName, scopeType, scopeId if assignmentId is not provided).
   */
  userId?: string | null;
  /**
   * Rolename
   * Role name for revocation.
   */
  roleName?: "Admin" | "Advisor" | "Viewer" | "Client Portal User" | null;
  /**
   * Scopetype
   * Scope type for revocation.
   */
  scopeType?: "Organization" | "Entity" | null;
  /**
   * Scopeid
   * Scope ID for revocation.
   */
  scopeId?: string | null;
}

/** RoleAssignment */
export interface RoleAssignment {
  /**
   * Userid
   * The ID of the user being assigned the role.
   */
  userId: string;
  /**
   * Rolename
   * The name of the role being assigned.
   */
  roleName: "Admin" | "Advisor" | "Viewer" | "Client Portal User";
  /**
   * Scopetype
   * The type of scope (Organization or Entity).
   */
  scopeType: "Organization" | "Entity";
  /**
   * Scopeid
   * The ID of the Organization or Entity.
   */
  scopeId: string;
  /**
   * Id
   * The unique ID of the role assignment document.
   */
  id: string;
  /**
   * Assignedat
   * ISO timestamp of when the role was assigned.
   */
  assignedAt: string;
}

/** RoleAssignmentCreate */
export interface RoleAssignmentCreate {
  /**
   * Userid
   * The ID of the user being assigned the role.
   */
  userId: string;
  /**
   * Rolename
   * The name of the role being assigned.
   */
  roleName: "Admin" | "Advisor" | "Viewer" | "Client Portal User";
  /**
   * Scopetype
   * The type of scope (Organization or Entity).
   */
  scopeType: "Organization" | "Entity";
  /**
   * Scopeid
   * The ID of the Organization or Entity.
   */
  scopeId: string;
}

/** RuleCreate */
export interface RuleCreate {
  /**
   * Organizationid
   * ID of the organization this rule belongs to.
   */
  organizationId: string;
  /**
   * Name
   * Name of the forecasting rule.
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /**
   * Description
   * Optional description of the rule.
   */
  description?: string | null;
  /**
   * Targetaccountid
   * ID of the financial account this rule forecasts for (e.g., from Chart of Accounts).
   */
  targetAccountId: string;
  /**
   * Ruletype
   * Type of the rule: formula, lookup, or manual.
   */
  ruleType: "formula" | "lookup" | "manual";
  /**
   * Formuladefinition
   * Formula string referencing driver IDs (e.g., 'driver_sales_units * driver_avg_price'). Required if ruleType is 'formula'.
   */
  formulaDefinition?: string | null;
  /**
   * Lookupdefinition
   * Definition for lookup table (e.g., based on driver value ranges). Required if ruleType is 'lookup'. Structure TBD.
   */
  lookupDefinition?: Record<string, any> | null;
}

/** RuleUpdate */
export interface RuleUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Targetaccountid */
  targetAccountId?: string | null;
  /** Ruletype */
  ruleType?: "formula" | "lookup" | "manual" | null;
  /** Formuladefinition */
  formulaDefinition?: string | null;
  /** Lookupdefinition */
  lookupDefinition?: Record<string, any> | null;
}

/** SavePlanResponse */
export interface SavePlanResponse {
  /** Planid */
  planId: string;
  /** Message */
  message: string;
}

/**
 * ScenarioApplyRequest
 * Request model for applying a scenario to a base forecast.
 */
export interface ScenarioApplyRequest {
  /**
   * Baseforecastid
   * The ID of the base forecast/budget data (e.g., import_id)
   */
  baseForecastId: string;
}

/**
 * ScenarioApplyResponse
 * Response model after applying a scenario.
 * Returns the calculated forecast data as a dictionary suitable for JSON.
 * Format is compatible with pandas DataFrame.to_dict(orient='split') after reset_index().
 */
export interface ScenarioApplyResponse {
  /** Scenarioid */
  scenarioId: string;
  /**
   * Calculatedforecastdata
   * Calculated forecast data, typically {'columns': [...], 'data': [[...], ...]}
   */
  calculatedForecastData: Record<string, any>;
}

/**
 * ScenarioAssumption
 * Represents a single assumption or change within a scenario.
 */
export interface ScenarioAssumption {
  /**
   * Id
   * Unique identifier for the assumption within the scenario
   */
  id?: string;
  /**
   * Type
   * Type of change
   */
  type: "percentage" | "absolute" | "driver_change";
  /**
   * Targetmetric
   * The metric or account the assumption applies to (e.g., 'Revenue', 'COGS', 'Marketing Spend')
   */
  targetMetric: string;
  /**
   * Value
   * The numerical value of the change
   */
  value: number;
  /**
   * Scope
   * Optional scope (e.g., specific product line, region) - currently informational
   */
  scope?: string | null;
  /**
   * Startdate
   * When the assumption starts taking effect (inclusive)
   */
  startDate?: string | null;
  /**
   * Enddate
   * When the assumption stops taking effect (inclusive)
   */
  endDate?: string | null;
  /**
   * Description
   * Brief description of the assumption
   */
  description?: string | null;
}

/** ScenarioCreate */
export interface ScenarioCreate {
  /**
   * Name
   * User-defined name for the scenario
   * @maxLength 100
   */
  name: string;
  /**
   * Description
   * Optional longer description
   */
  description?: string | null;
  /**
   * Baseforecastid
   * ID of the base forecast/budget this scenario is derived from
   */
  baseForecastId?: string | null;
  /**
   * Parentscenarioid
   * ID of the parent scenario if this is a linked/child scenario
   */
  parentScenarioId?: string | null;
  /**
   * Assumptions
   * List of assumptions defining the scenario
   */
  assumptions?: ScenarioAssumption[];
}

/**
 * ScenarioMetadata
 * Full scenario metadata model including system-generated fields.
 */
export interface ScenarioMetadata {
  /**
   * Name
   * User-defined name for the scenario
   * @maxLength 100
   */
  name: string;
  /**
   * Description
   * Optional longer description
   */
  description?: string | null;
  /**
   * Baseforecastid
   * ID of the base forecast/budget this scenario is derived from
   */
  baseForecastId?: string | null;
  /**
   * Parentscenarioid
   * ID of the parent scenario if this is a linked/child scenario
   */
  parentScenarioId?: string | null;
  /**
   * Assumptions
   * List of assumptions defining the scenario
   */
  assumptions?: ScenarioAssumption[];
  /**
   * Scenarioid
   * Unique identifier for the scenario
   */
  scenarioId: string;
  /**
   * Ownerid
   * ID of the user who owns this scenario
   */
  ownerId: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** ScenarioParameter */
export interface ScenarioParameter {
  /**
   * Name
   * Name of the economic parameter
   */
  name: string;
  /**
   * Current Value
   * The value of the parameter in this scenario
   */
  current_value: number;
}

/** ScenarioResponseRecommendations */
export interface ScenarioResponseRecommendations {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  scenario_type: ScenarioType;
  time_horizon: TimeHorizon;
  /** Mitigation Strategies */
  mitigation_strategies: MitigationStrategy[];
  /** Opportunity Strategies */
  opportunity_strategies: OpportunityStrategy[];
  /** Contingency Plans */
  contingency_plans: ContingencyPlan[];
  /** Executive Summary */
  executive_summary: string;
}

/** ScenarioResponseRequest */
export interface ScenarioResponseRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Financial Impacts */
  financial_impacts: Record<string, number>;
  /** Business Unit Impacts */
  business_unit_impacts: Record<string, Record<string, number>>;
  /** Risk Level */
  risk_level: number;
  /** Opportunity Level */
  opportunity_level: number;
}

/**
 * ScenarioSummary
 * Summary model for listing scenarios.
 */
export interface ScenarioSummary {
  /** Scenarioid */
  scenarioId: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Baseforecastid */
  baseForecastId: string | null;
  /** Parentscenarioid */
  parentScenarioId: string | null;
  /**
   * Assumptioncount
   * Number of assumptions in the scenario
   */
  assumptionCount: number;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** ScenarioType */
export enum ScenarioType {
  INTEREST_RATE = "INTEREST_RATE",
  EXCHANGE_RATE = "EXCHANGE_RATE",
  INFLATION = "INFLATION",
  MARKET_DEMAND = "MARKET_DEMAND",
  SUPPLY_CHAIN = "SUPPLY_CHAIN",
  REGULATORY = "REGULATORY",
}

/**
 * ScenarioUpdate
 * Model for updating specific fields of a scenario.
 */
export interface ScenarioUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Baseforecastid */
  baseForecastId?: string | null;
  /** Parentscenarioid */
  parentScenarioId?: string | null;
  /** Assumptions */
  assumptions?: ScenarioAssumption[] | null;
}

/** ScheduleFrequency */
export enum ScheduleFrequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Quarterly = "quarterly",
  Annually = "annually",
  Once = "once",
}

/** ScheduleRequest */
export interface ScheduleRequest {
  reportType: ReportType;
  /** Reportname */
  reportName: string;
  /** Description */
  description?: string | null;
  frequency: ScheduleFrequency;
  /**
   * Startdate
   * @format date
   */
  startDate: string;
  /** Enddate */
  endDate?: string | null;
  /** Deliverymethods */
  deliveryMethods: DeliveryMethod[];
  /** Recipients */
  recipients: Recipient[];
  /**
   * Formats
   * @default ["pdf"]
   */
  formats?: ReportFormat[];
  /** Parameters */
  parameters?: Record<string, any> | null;
  /** Feedbackquestions */
  feedbackQuestions?: FeedbackQuestion[] | null;
}

/** ScheduleResponse */
export interface ScheduleResponse {
  /** Scheduleid */
  scheduleId: string;
  /** Reportname */
  reportName: string;
  /**
   * Nextdeliverydate
   * @format date
   */
  nextDeliveryDate: string;
  /** @default "scheduled" */
  status?: ReportStatus;
}

/** ScoreResponse */
export interface ScoreResponseInput {
  /** Company Id */
  company_id: string;
  /** Industry */
  industry: string;
  /** Size */
  size: string;
  /**
   * Calculation Date
   * @format date-time
   */
  calculation_date: string;
  overall_score: OverallScore;
  /** Industry Average */
  industry_average: number;
  /** Industry Median */
  industry_median: number;
  /** Industry Percentile */
  industry_percentile: number;
  /** Trend Data */
  trend_data?: Record<string, number[]> | null;
}

/** ScoreResponse */
export interface ScoreResponseOutput {
  /** Company Id */
  company_id: string;
  /** Industry */
  industry: string;
  /** Size */
  size: string;
  /**
   * Calculation Date
   * @format date-time
   */
  calculation_date: string;
  overall_score: OverallScore;
  /** Industry Average */
  industry_average: number;
  /** Industry Median */
  industry_median: number;
  /** Industry Percentile */
  industry_percentile: number;
  /** Trend Data */
  trend_data?: Record<string, number[]> | null;
}

/** ScrapeRequest */
export interface ScrapeRequest {
  /** Sources */
  sources?: string[];
  /**
   * Full Scan
   * @default false
   */
  full_scan?: boolean;
}

/** ScrapeSource */
export interface ScrapeSource {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Url */
  url: string;
  /** Description */
  description: string;
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
  /** Last Scraped */
  last_scraped?: string | null;
}

/** SeasonalAdjustments */
export interface SeasonalAdjustments {
  /** Summer */
  Summer?: number | null;
  /** Autumn */
  Autumn?: number | null;
  /** Winter */
  Winter?: number | null;
  /** Spring */
  Spring?: number | null;
}

/** SeasonalFactors */
export interface SeasonalFactors {
  /**
   * Cashreceiptsadjustment
   * Percentage adjustment for cash receipts during this season
   */
  cashReceiptsAdjustment: number;
  /**
   * Cashdisbursementsadjustment
   * Percentage adjustment for cash disbursements during this season
   */
  cashDisbursementsAdjustment: number;
}

/** SeasonalPattern */
export interface SeasonalPattern {
  /** Season */
  season: string;
  /** Impact */
  impact: string;
  /** Description */
  description: string;
  seasonalFactors?: SeasonalFactors | null;
}

/** SeasonalityResponse */
export interface SeasonalityResponse {
  /** Industry */
  industry: string;
  /** Patterns */
  patterns: (SeasonalPattern | Record<string, any>)[];
  /** Key Dates */
  key_dates: (KeyDate | Record<string, any>)[];
  /** Eofy Impact */
  eofy_impact: string;
  /** Regional Variations */
  regional_variations: (RegionalVariation | Record<string, any>)[];
}

/** SensitivityAnalysisData */
export interface SensitivityAnalysisData {
  /** Metrics */
  metrics: string[];
  /** Tornado Data */
  tornado_data: Record<string, ParameterSensitivity[]>;
}

/** ShareActionRequest */
export interface ShareActionRequest {
  /**
   * Content Type
   * The type of content being shared (e.g., 'dashboard', 'report').
   */
  content_type: "dashboard" | "report" | "forecast" | "budget";
  /**
   * Content Id
   * The unique identifier of the content item.
   */
  content_id: string;
  /**
   * User Ids
   * List of external user IDs (Client Viewers) to grant/revoke access for.
   */
  user_ids: string[];
}

/** Shareholding */
export interface Shareholding {
  /** Share Class */
  share_class: string;
  /** Number Of Shares */
  number_of_shares: number;
  /** Percentage Owned */
  percentage_owned: number;
  /** Paid Value */
  paid_value: number;
  /** Unpaid Value */
  unpaid_value: number;
}

/** SimpleForecastRequest */
export interface SimpleForecastRequest {
  /**
   * Base Values
   * Dictionary of starting values for relevant accounts at period 0
   */
  base_values: Record<string, number>;
  /**
   * Drivers
   * List of drivers to apply
   */
  drivers: DriverDefinition[];
  /**
   * Num Periods
   * Number of monthly periods to forecast
   * @exclusiveMin 0
   */
  num_periods: number;
}

/** SimpleForecastResponse */
export interface SimpleForecastResponse {
  /**
   * Forecasted Periods
   * List of calculated results for each forecast period
   */
  forecasted_periods: ForecastResultPeriod[];
}

/** SimulationResult */
export interface SimulationResult {
  /** Variable */
  variable: string;
  /** Mean */
  mean: number;
  /** Median */
  median: number;
  /** Std Dev */
  std_dev: number;
  /** Min Value */
  min_value: number;
  /** Max Value */
  max_value: number;
  /** Percentiles */
  percentiles: Record<string, number>;
  /** Distribution Data */
  distribution_data?: Record<string, number[]> | null;
}

/** SingleAccountForecast */
export interface SingleAccountForecast {
  /**
   * Account Name
   * The name of the account
   */
  account_name: string;
  /**
   * Forecast Data
   * List of forecasted data points
   * @default []
   */
  forecast_data?: AccountForecastPoint[];
  /**
   * Error
   * Error message if forecasting failed for this account
   */
  error?: string | null;
}

/** SoleTrader */
export interface SoleTrader {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  /** Business Structure */
  business_structure: "soleTrader";
  /** Tfn */
  tfn: string;
  /** Registered For Gst */
  registered_for_gst: boolean;
  gst_frequency?: GSTFrequency | null;
  /**
   * Local Currency
   * Local currency code (e.g., AUD, USD)
   */
  local_currency: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Parent Entity Id
   * ID of the parent entity in a hierarchy
   */
  parent_entity_id?: string | null;
  /**
   * Ownership Details
   * Details of entities owned by this entity
   */
  ownership_details?: OwnershipDetail[] | null;
  /** Individual Id */
  individual_id: string;
}

/**
 * SoleTraderTaxDataRequest
 * Sole trader-specific tax data
 */
export interface SoleTraderTaxDataRequest {
  /** Individual Id */
  individual_id: string;
  /**
   * Income Streams
   * @default []
   */
  income_streams?: Record<string, any>[] | null;
  /**
   * Personal Deductions
   * @default []
   */
  personal_deductions?: Record<string, any>[] | null;
  /**
   * Tax Offsets
   * @default []
   */
  tax_offsets?: Record<string, any>[] | null;
}

/** StandardsResponse */
export interface StandardsResponse {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Requirements */
  requirements: Record<string, string>[];
  /** References */
  references: Record<string, string>[];
}

/** StepStatusUpdate */
export interface StepStatusUpdate {
  /** Status */
  status: string;
  /** Notes */
  notes?: string | null;
  /** Due Date */
  due_date?: string | null;
}

/** SubscriptionDetails */
export interface SubscriptionDetails {
  /** Id */
  id: string;
  /** Organization Id */
  organization_id: string;
  /** Customer Id */
  customer_id: string;
  /** Subscription Id */
  subscription_id?: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  /** Current Period End */
  current_period_end?: number | null;
  /**
   * Cancel At Period End
   * @default false
   */
  cancel_at_period_end?: boolean;
  /** Created */
  created: number;
  /** Product Id */
  product_id?: string | null;
  /** Price Id */
  price_id?: string | null;
  /** Payment Method */
  payment_method?: string | null;
}

/** SubscriptionPlanResponse */
export interface SubscriptionPlanResponse {
  /** Plans */
  plans: SubscriptionTierInfo[];
  /** Publishable Key */
  publishable_key: string;
}

/** SubscriptionPortalRequest */
export interface SubscriptionPortalRequest {
  /** Customer Id */
  customer_id: string;
  /** Return Url */
  return_url?: string | null;
}

/** SubscriptionStatus */
export enum SubscriptionStatus {
  Active = "active",
  PastDue = "past_due",
  Unpaid = "unpaid",
  Canceled = "canceled",
  Incomplete = "incomplete",
  IncompleteExpired = "incomplete_expired",
  Trialing = "trialing",
}

/** SubscriptionTier */
export enum SubscriptionTier {
  Free = "free",
  Basic = "basic",
  Professional = "professional",
  Enterprise = "enterprise",
}

/** SubscriptionTierInfo */
export interface SubscriptionTierInfo {
  tier: SubscriptionTier;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Price */
  price: number;
  /** Price Id */
  price_id: string;
  /** Features */
  features: string[];
  /**
   * Entity Limit
   * Number of entities allowed (0 for unlimited)
   */
  entity_limit: number;
  /**
   * Is Recommended
   * @default false
   */
  is_recommended?: boolean;
}

/** TaxAssumption */
export interface TaxAssumption {
  /** Id */
  id: string;
  /** Category */
  category: string;
  /** Description */
  description: string;
  /** Assumption Type */
  assumption_type: "revenue" | "expense" | "deduction" | "credit" | "rate";
  /** Base Value */
  base_value: number;
  /** Projected Value */
  projected_value: number;
  /** Growth Rate */
  growth_rate?: number | null;
  /** Notes */
  notes?: string | null;
}

/**
 * TaxCalculationRequest
 * Request model for tax calculations
 */
export interface TaxCalculationRequest {
  /** Business entity data for tax calculations */
  entity: BusinessEntityRequest;
  /** Financial data for tax calculations */
  financial_data: FinancialData;
  period: DateRange;
  /**
   * Adjustments
   * @default []
   */
  adjustments?: Record<string, any>[] | null;
}

/**
 * TaxCalculationResponse
 * Response model for tax calculations
 */
export interface TaxCalculationResponse {
  /** Taxable Income */
  taxable_income: number;
  /** Tax Payable */
  tax_payable: number;
  /** Effective Tax Rate */
  effective_tax_rate: number;
  /** Deductions */
  deductions: Record<string, any>[];
  /** Tax Credits */
  tax_credits: Record<string, any>[];
  /** Tax Summary */
  tax_summary: Record<string, any>;
}

/** TaxCredit */
export interface TaxCredit {
  /** Id */
  id: string;
  /** Category */
  category: string;
  /** Description */
  description: string;
  /** Amount */
  amount: number;
  /**
   * Evidence
   * @default []
   */
  evidence?: Attachment[];
}

/** TaxDeduction */
export interface TaxDeduction {
  /** Id */
  id: string;
  /** Category */
  category: string;
  /** Description */
  description: string;
  /** Amount */
  amount: number;
  /**
   * Evidence
   * @default []
   */
  evidence?: Attachment[];
}

/** TaxObligation */
export interface TaxObligation {
  /** Id */
  id: string;
  /** Entity Id */
  entity_id: string;
  /** Obligation Type */
  obligation_type: "income" | "bas" | "ias" | "payg" | "fbt" | "superannuation" | "other";
  /**
   * Due Date
   * @format date
   */
  due_date: string;
  /** Lodgement Date */
  lodgement_date?: string | null;
  /**
   * Payment Due Date
   * @format date
   */
  payment_due_date: string;
  /** Payment Date */
  payment_date?: string | null;
  /** Status */
  status: "upcoming" | "due" | "overdue" | "lodged" | "paid" | "deferred";
  /** Amount */
  amount: number;
  /** Description */
  description?: string | null;
  period: DateRange;
  /** Attachments */
  attachments?: Attachment[] | null;
}

/**
 * TaxObligationResponse
 * Response with tax obligations for an entity
 */
export interface TaxObligationResponse {
  /** Entity Id */
  entity_id: string;
  /** Year */
  year: number;
  /** Obligations */
  obligations: TaxObligation[];
  /** Summary of tax obligations by type and status */
  summary: TaxObligationSummary;
}

/**
 * TaxObligationSummary
 * Summary of tax obligations by type and status
 */
export interface TaxObligationSummary {
  /** Total Count */
  total_count: number;
  /** Due Within Month */
  due_within_month: number;
  /** Overdue */
  overdue: number;
  /** Completed */
  completed: number;
  /** By Type */
  by_type: Record<string, number>;
  /** Estimated Total Amount */
  estimated_total_amount: number;
  /** Next Due */
  next_due?: Record<string, any> | null;
}

/** TaxObligationValidationRequest */
export interface TaxObligationValidationRequest {
  /** Entity Id */
  entity_id: string;
  /** Obligations */
  obligations: Record<string, any>[];
  /** Financial Data */
  financial_data?: Record<string, any> | null;
  /** Additional Data */
  additional_data?: Record<string, any> | null;
}

/**
 * TaxPlanningRequest
 * Request model for tax planning scenarios
 */
export interface TaxPlanningRequest {
  /** Business entity data for tax calculations */
  entity: BusinessEntityRequest;
  /** Financial data for tax calculations */
  financial_data: FinancialData;
  /** Base Financial Year */
  base_financial_year: string;
  projection_period: DateRange;
  /** Assumptions */
  assumptions: Record<string, any>[];
  /** Strategies */
  strategies: Record<string, any>[];
}

/**
 * TaxPlanningResponse
 * Response model for tax planning calculations
 */
export interface TaxPlanningResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Entity Id */
  entity_id: string;
  /** Projected Tax Outcome */
  projected_tax_outcome: Record<string, any>;
  /** Strategy Outcomes */
  strategy_outcomes: Record<string, any>[];
  /** Comparison */
  comparison: Record<string, any>;
}

/** TaxPlanningScenario */
export interface TaxPlanningScenario {
  /** Id */
  id: string;
  /** Entity Id */
  entity_id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Base Financial Year */
  base_financial_year: string;
  projection_period: DateRange;
  /**
   * Assumptions
   * @default []
   */
  assumptions?: TaxAssumption[];
  projected_tax_outcome: ProjectedTaxOutcome;
  /**
   * Strategies
   * @default []
   */
  strategies?: TaxStrategy[];
  compare_to_baseline: CompareToBaseline;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** TaxReturn */
export interface TaxReturnInput {
  /** Id */
  id: string;
  /** Entity Id */
  entity_id: string;
  /** Financial Year */
  financial_year: string;
  /** Status */
  status: "notStarted" | "inProgress" | "readyForReview" | "reviewed" | "lodged" | "processed";
  /**
   * Due Date
   * @format date
   */
  due_date: string;
  /** Lodgement Date */
  lodgement_date?: string | null;
  /** Assessment Date */
  assessment_date?: string | null;
  /** Assessment Amount */
  assessment_amount?: number | null;
  /** Taxable Income */
  taxable_income: number;
  /** Tax Payable */
  tax_payable: number;
  /** Refund Amount */
  refund_amount?: number | null;
  /**
   * Deductions
   * @default []
   */
  deductions?: TaxDeduction[];
  /**
   * Credits
   * @default []
   */
  credits?: TaxCredit[];
  /**
   * Schedules
   * @default []
   */
  schedules?: TaxSchedule[];
  /**
   * Attachments
   * @default []
   */
  attachments?: Attachment[];
}

/** TaxReturn */
export interface TaxReturnOutput {
  /** Id */
  id: string;
  /** Entity Id */
  entity_id: string;
  /** Financial Year */
  financial_year: string;
  /** Status */
  status: "notStarted" | "inProgress" | "readyForReview" | "reviewed" | "lodged" | "processed";
  /**
   * Due Date
   * @format date
   */
  due_date: string;
  /** Lodgement Date */
  lodgement_date?: string | null;
  /** Assessment Date */
  assessment_date?: string | null;
  /** Assessment Amount */
  assessment_amount?: number | null;
  /** Taxable Income */
  taxable_income: number;
  /** Tax Payable */
  tax_payable: number;
  /** Refund Amount */
  refund_amount?: number | null;
  /**
   * Deductions
   * @default []
   */
  deductions?: TaxDeduction[];
  /**
   * Credits
   * @default []
   */
  credits?: TaxCredit[];
  /**
   * Schedules
   * @default []
   */
  schedules?: TaxSchedule[];
  /**
   * Attachments
   * @default []
   */
  attachments?: Attachment[];
}

/**
 * TaxReturnRequest
 * Request for generating a tax return
 */
export interface TaxReturnRequest {
  /** Business entity data for tax calculations */
  entity: BusinessEntityRequest;
  /** Financial data for tax calculations */
  financial_data: FinancialData;
  /** Financial Year */
  financial_year: string;
  /** Entity-specific tax data based on business structure */
  entity_specific_data: EntitySpecificTaxData;
  /**
   * Additional Deductions
   * @default []
   */
  additional_deductions?: Record<string, any>[] | null;
  /**
   * Additional Credits
   * @default []
   */
  additional_credits?: Record<string, any>[] | null;
}

/** TaxSchedule */
export interface TaxSchedule {
  /** Id */
  id: string;
  /** Schedule Type */
  schedule_type: string;
  /** Description */
  description: string;
  /** Data */
  data: Record<string, any>;
  /** Completed */
  completed: boolean;
}

/** TaxStrategy */
export interface TaxStrategy {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Implementation Steps */
  implementation_steps: string[];
  /** Risk Level */
  risk_level: "low" | "medium" | "high";
  /** Estimated Savings */
  estimated_savings: number;
  /** Timing Impact */
  timing_impact: "immediate" | "shortTerm" | "longTerm";
  /** Approval Status */
  approval_status: "proposed" | "approved" | "implemented" | "rejected";
}

/** ThresholdProbability */
export interface ThresholdProbability {
  /** Threshold */
  threshold: number;
  /** Probability */
  probability: number;
  /** Comparison */
  comparison: string;
}

/** Thresholds */
export interface Thresholds {
  /**
   * Absolute
   * Absolute threshold for flagging significant variance.
   */
  absolute?: number | null;
  /**
   * Percentage
   * Percentage threshold (e.g., 0.1 for 10%) for flagging significant variance.
   */
  percentage?: number | null;
}

/** TimeFrame */
export enum TimeFrame {
  Immediate = "immediate",
  ShortTerm = "short_term",
  MediumTerm = "medium_term",
  LongTerm = "long_term",
}

/** TimeHorizon */
export enum TimeHorizon {
  SHORT_TERM = "SHORT_TERM",
  MEDIUM_TERM = "MEDIUM_TERM",
  LONG_TERM = "LONG_TERM",
}

/** TimeSeriesComponents */
export interface TimeSeriesComponents {
  /** Trend */
  trend: number[];
  /** Seasonal */
  seasonal: number[];
  /** Residual */
  residual: number[];
  /** Original */
  original: number[];
  /** Cyclical */
  cyclical?: number[] | null;
}

/** TimeSeriesData */
export interface TimeSeriesData {
  /**
   * Data
   * List of time series data points
   */
  data: TimeSeriesPoint[];
}

/** TimeSeriesPoint */
export interface TimeSeriesPoint {
  /**
   * Ds
   * The date of the data point (YYYY-MM-DD)
   * @format date
   */
  ds: string;
  /**
   * Y
   * The numeric value of the data point
   */
  y: number;
}

/** TrendAnalysisRequest */
export interface TrendAnalysisRequest {
  /** Company Id */
  company_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
}

/** TrendAnalysisResponse */
export interface TrendAnalysisResponse {
  /** Company Id */
  company_id: string;
  /** Industry */
  industry: string;
  /** Size */
  size: string;
  /** Trend Points */
  trend_points: TrendPoint[];
  /**
   * Trend Analysis
   * Analysis of trends including slope, volatility, and interpretation
   */
  trend_analysis: Record<string, any>;
}

/** TrendPoint */
export interface TrendPoint {
  /**
   * Date
   * @format date
   */
  date: string;
  /** Score */
  score: number;
  /** Category Scores */
  category_scores: Record<string, number>;
}

/** Trust */
export interface Trust {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Abn */
  abn: string;
  /** Business Structure */
  business_structure: "trust";
  /** Tfn */
  tfn: string;
  /** Registered For Gst */
  registered_for_gst: boolean;
  gst_frequency?: GSTFrequency | null;
  /**
   * Local Currency
   * Local currency code (e.g., AUD, USD)
   */
  local_currency: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Parent Entity Id
   * ID of the parent entity in a hierarchy
   */
  parent_entity_id?: string | null;
  /**
   * Ownership Details
   * Details of entities owned by this entity
   */
  ownership_details?: OwnershipDetail[] | null;
  /** Trust Type */
  trust_type: "discretionary" | "unit" | "hybrid" | "fixed" | "other";
  /**
   * Trust Deed Date
   * @format date
   */
  trust_deed_date: string;
  /** Trustee Id */
  trustee_id: string;
  /** Trustee Type */
  trustee_type: "individual" | "company";
  /** Beneficiary Ids */
  beneficiary_ids: string[];
}

/**
 * TrustTaxDataRequest
 * Trust-specific tax data
 */
export interface TrustTaxDataRequest {
  /** Trust Type */
  trust_type: "discretionary" | "unit" | "hybrid" | "fixed" | "other";
  /**
   * Trust Deed Date
   * @format date
   */
  trust_deed_date: string;
  /** Trustee Id */
  trustee_id: string;
  /** Trustee Type */
  trustee_type: "individual" | "company";
  /** Beneficiary Ids */
  beneficiary_ids: string[];
  /**
   * Distributions
   * @default []
   */
  distributions?: Record<string, any>[] | null;
  /**
   * Capital Gains
   * @default 0
   */
  capital_gains?: number | null;
}

/** UpdateBenchmarkRequest */
export interface UpdateBenchmarkRequest {
  /**
   * Source Id
   * ID of the source to update
   */
  source_id: string;
  /**
   * Force Update
   * Force update even if recently updated
   * @default false
   */
  force_update?: boolean | null;
}

/** UpdateBenchmarkResponse */
export interface UpdateBenchmarkResponse {
  /**
   * Success
   * Indicates if the update was triggered successfully
   */
  success: boolean;
  /**
   * Message
   * Status message about the update process
   */
  message: string;
  /** The updated source metadata */
  updated_source?: BenchmarkSource | null;
}

/**
 * UpdateBudgetVersionRequest
 * Request body for updating/replacing a budget version.
 */
export interface UpdateBudgetVersionRequest {
  /**
   * Name
   * Optional new name for the version.
   */
  name?: string | null;
  /**
   * Items
   * The complete list of new budget items for this version.
   */
  items: BudgetItem[];
}

/** UpdateMetricDefinitionPayload */
export interface UpdateMetricDefinitionPayload {
  /**
   * Name
   * Updated canonical name
   */
  name?: string | null;
  /**
   * Description
   * Updated explanation
   */
  description?: string | null;
  /**
   * Formula
   * Updated formula
   */
  formula?: string | null;
  /**
   * Data Type
   * Updated data type
   */
  data_type?: string | null;
  /**
   * Unit
   * Updated unit
   */
  unit?: string | null;
  /**
   * Interpretation
   * Updated interpretation
   */
  interpretation?: string | null;
  /**
   * Category
   * Updated category
   */
  category?: string | null;
  /**
   * Related Metrics
   * Updated related metric IDs
   */
  related_metrics?: string[] | null;
}

/** UpdateScheduleRequest */
export interface UpdateScheduleRequest {
  /** Reportname */
  reportName?: string | null;
  /** Description */
  description?: string | null;
  frequency?: ScheduleFrequency | null;
  /** Startdate */
  startDate?: string | null;
  /** Enddate */
  endDate?: string | null;
  /** Deliverymethods */
  deliveryMethods?: DeliveryMethod[] | null;
  /** Recipients */
  recipients?: Recipient[] | null;
  /** Formats */
  formats?: ReportFormat[] | null;
  /** Parameters */
  parameters?: Record<string, any> | null;
  /** Feedbackquestions */
  feedbackQuestions?: FeedbackQuestion[] | null;
  status?: ReportStatus | null;
}

/** UpdateSourcePayload */
export interface UpdateSourcePayload {
  /**
   * Name
   * Updated name for the benchmark source
   */
  name?: string | null;
  /**
   * Description
   * Updated description
   */
  description?: string | null;
  /**
   * Industry Codes
   * Updated list of applicable industry codes
   */
  industry_codes?: string[] | null;
  /**
   * Region
   * Updated geographic region
   */
  region?: string | null;
}

/** UploadResponse */
export interface UploadResponse {
  /** Upload Id */
  upload_id: string;
  /** File Name */
  file_name: string;
  data_type: FinancialDataType;
  /** Columns */
  columns: string[];
  /** Preview Rows */
  preview_rows: Record<string, any>[];
  /** Row Count */
  row_count: number;
}

/** UploadResponseData */
export interface UploadResponseData {
  /** Upload Id */
  upload_id: string;
  /** File Name */
  file_name: string;
  /** Data Type */
  data_type: string;
  /** Columns */
  columns: string[];
  /** Preview Rows */
  preview_rows: Record<string, any>[];
  /** Row Count */
  row_count: number;
}

/** UserPermissionsResponse */
export interface UserPermissionsResponse {
  /**
   * Accessible Content
   * List of content references (e.g., 'dashboard:id1') accessible by the user.
   */
  accessible_content: string[];
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** ValidationIssue */
export interface ValidationIssue {
  /**
   * Severity
   * error, warning, or info
   */
  severity: string;
  /**
   * Code
   * Unique code for the issue type
   */
  code: string;
  /** Message */
  message: string;
  /** Field */
  field?: string | null;
  /** Details */
  details?: Record<string, any> | null;
  /** Remediation */
  remediation?: string | null;
}

/** ValidationResponse */
export interface ValidationResponse {
  /** Valid */
  valid: boolean;
  /**
   * Issues
   * @default []
   */
  issues?: ValidationIssue[];
}

/** VariableDefinition */
export interface VariableDefinition {
  /** Name */
  name: string;
  distribution: AppApisScenarioAnalysisDistributionType;
  /** Params */
  params: Record<string, number>;
  /** Description */
  description?: string | null;
}

/** VarianceAnalysisRequest */
export interface VarianceAnalysisRequest {
  /**
   * Entity Id
   * Identifier for the business entity.
   */
  entity_id: string;
  /**
   * Report Type
   * Type of financial report.
   */
  report_type: "pnl" | "balance_sheet";
  /**
   * Period End Date
   * The end date of the primary period (e.g., YYYY-MM-DD).
   * @format date
   */
  period_end_date: string;
  /**
   * Comparison Type
   * What to compare the actuals against.
   */
  comparison_type: "budget" | "prior_period" | "prior_year";
  /** Thresholds for determining significance. */
  thresholds: Thresholds;
}

/** VarianceAnalysisResponse */
export interface VarianceAnalysisResponse {
  /**
   * Analysis Details
   * Details about the analysis performed (request echo).
   */
  analysis_details: Record<string, any>;
  /**
   * Variances
   * List of calculated variances for each relevant account.
   */
  variances: VarianceItem[];
}

/** VarianceInput */
export interface VarianceInput {
  /**
   * Account Name
   * Name of the account with significant variance.
   */
  account_name: string;
  /**
   * Actual Value
   * Actual value for the period.
   */
  actual_value: number;
  /**
   * Comparison Value
   * Comparison value (budget, prior period, etc.).
   */
  comparison_value?: number | null;
  /**
   * Absolute Variance
   * The absolute variance amount.
   */
  absolute_variance?: number | null;
  /**
   * Percentage Variance
   * The percentage variance.
   */
  percentage_variance?: number | null;
  /**
   * Period
   * Reporting period identifier (e.g., 'Q1 2024').
   */
  period: string;
  /**
   * Variance Direction
   * Direction of variance.
   */
  variance_direction?: "favourable" | "unfavourable" | null;
}

/** VarianceItem */
export interface VarianceItem {
  /**
   * Account Name
   * Name or code of the financial account/item.
   */
  account_name: string;
  /**
   * Actual Value
   * The value for the primary period.
   */
  actual_value: number;
  /**
   * Comparison Value
   * The value for the comparison period (budget, prior period, etc.).
   */
  comparison_value?: number | null;
  /**
   * Absolute Variance
   * Actual - Comparison Value.
   */
  absolute_variance?: number | null;
  /**
   * Percentage Variance
   * (Actual - Comparison) / Comparison Value. Null if comparison is zero.
   */
  percentage_variance?: number | null;
  /**
   * Is Significant
   * True if variance exceeds defined thresholds.
   * @default false
   */
  is_significant?: boolean;
  /**
   * Variance Direction
   * Indicates if the variance is favourable or unfavourable (context-dependent).
   */
  variance_direction?: "favourable" | "unfavourable" | null;
}

/** WidgetConfig */
export interface WidgetConfig {
  /**
   * Entityid
   * Entity ID for data filtering
   */
  entityId?: string | null;
  /**
   * Daterangepreset
   * e.g., "last_quarter", "ytd"
   */
  dateRangePreset?: string | null;
  /**
   * Startdate
   * ISO date string for start of custom range
   */
  startDate?: string | null;
  /**
   * Enddate
   * ISO date string for end of custom range
   */
  endDate?: string | null;
  /**
   * Currencysymbol
   * Currency symbol for display
   * @default "$"
   */
  currencySymbol?: string | null;
  /**
   * Kpimetric
   * Metric identifier for KPI
   */
  kpiMetric?: string | null;
  /**
   * Comparisonperiod
   * Comparison period preset, e.g., "previous_period"
   */
  comparisonPeriod?: string | null;
  /**
   * Xaxiskey
   * Data key for X-axis
   */
  xAxisKey?: string | null;
  /**
   * Yaxiskeys
   * Data keys for Y-axis
   */
  yAxisKeys?: string[] | null;
  /**
   * Groupbykey
   * Data key for grouping/segmenting
   */
  groupByKey?: string | null;
  /**
   * Charttypevariant
   * e.g., 'stacked', 'percentage'
   */
  chartTypeVariant?: string | null;
  /**
   * Showseasonalimpact
   * Flag for seasonal analysis
   * @default false
   */
  showSeasonalImpact?: boolean | null;
  /**
   * Columns
   * Column definitions for tables
   */
  columns?: Record<string, any>[] | null;
  /**
   * Sortorder
   * Sort order (e.g., 'descending')
   */
  sortOrder?: string | null;
  /**
   * Limit
   * Limit number of rows
   */
  limit?: number | null;
  /**
   * Title
   * Custom title for the widget
   */
  title?: string | null;
  /**
   * Reportid
   * ID of the report used as data source
   */
  reportId?: string | null;
  /**
   * Metricname
   * Specific metric to display, e.g., for KPI
   */
  metricName?: string | null;
  /**
   * Xaxis
   * Field to use for the X-axis
   */
  xAxis?: string | null;
  /**
   * Yaxis
   * Field(s) to use for the Y-axis
   */
  yAxis?: string[] | null;
  /**
   * Charttype
   * Selected chart type for visualization
   */
  chartType?: "Line" | "Bar" | "KPI" | "Table" | "Waterfall" | "Pie" | "Number" | null;
  /**
   * Metrics
   * List of metric IDs/names to display
   */
  metrics?: string[] | null;
  /**
   * Dateaggregation
   * Time aggregation level (e.g., Monthly, Quarterly)
   */
  dateAggregation?: "Monthly" | "Quarterly" | "Yearly" | null;
  /**
   * Comparison
   * Comparison data to include (e.g., vs Budget)
   */
  comparison?: "Budget" | "PriorYear" | null;
  [key: string]: any;
}

/** WidgetConfiguration */
export interface WidgetConfiguration {
  /**
   * Id
   * Unique ID for this specific widget instance on the dashboard
   */
  id: string;
  /**
   * Type
   * Type of widget (e.g., 'enhancedCashFlowWaterfall', 'KPICard')
   */
  type: string;
  /**
   * Title
   * Optional title displayed on the widget
   */
  title?: string | null;
  /** Nested configuration object specific to the widget type */
  config?: WidgetConfig | null;
}

/** WorkingCapitalRecommendation */
export interface WorkingCapitalRecommendation {
  /** Category */
  category: "receivables" | "payables" | "inventory" | "cash_management" | "financing";
  /** Recommendation Type */
  recommendation_type: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Potential Impact */
  potential_impact: number;
  /** Implementation Difficulty */
  implementation_difficulty: "low" | "medium" | "high";
  /** Timeframe */
  timeframe: "immediate" | "short_term" | "long_term";
  /** Confidence */
  confidence: number;
  /** Action Items */
  action_items: string[];
}

/** WorkloadEstimate */
export interface WorkloadEstimate {
  /** Hours */
  hours: number;
  /**
   * Complexity
   * low, medium, high
   */
  complexity: string;
  /** Skills Required */
  skills_required: string[];
  /** Recommended Team Size */
  recommended_team_size: number;
}

/** MetricCategory */
export interface AppApisBoardReportingMetricCategory {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Key Metrics */
  key_metrics: Record<string, any>[];
}

/** MetricDistribution */
export interface AppApisCalculationEngineMetricDistribution {
  /** Metric */
  metric: string;
  /** Mean */
  mean: number;
  /** Median */
  median: number;
  /** Std */
  std: number;
  /** Min */
  min: number;
  /** Max */
  max: number;
  /** Percentile 10 */
  percentile_10: number;
  /** Percentile 25 */
  percentile_25: number;
  /** Percentile 75 */
  percentile_75: number;
  /** Percentile 90 */
  percentile_90: number;
  /** Probabilities */
  probabilities: ThresholdProbability[];
  histogram: HistogramData;
}

/** MonteCarloSimulationRequest */
export interface AppApisCalculationEngineMonteCarloSimulationRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Parameter Distributions */
  parameter_distributions: Record<string, AppApisCalculationEngineParameterDistribution>;
  /** Target Metrics */
  target_metrics: string[];
  /**
   * Num Simulations
   * @default 1000
   */
  num_simulations?: number | null;
}

/** MonteCarloSimulationResponse */
export interface AppApisCalculationEngineMonteCarloSimulationResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Num Simulations */
  num_simulations: number;
  /** Distributions */
  distributions: AppApisCalculationEngineMetricDistribution[];
}

/** ParameterDistribution */
export interface AppApisCalculationEngineParameterDistribution {
  /** Type */
  type: string;
  /** Min */
  min?: number | null;
  /** Max */
  max?: number | null;
  /** Mean */
  mean?: number | null;
  /** Std */
  std?: number | null;
  /** Mode */
  mode?: number | null;
  /** Values */
  values?: number[] | null;
  /** Probabilities */
  probabilities?: number[] | null;
}

/** SensitivityAnalysisRequest */
export interface AppApisCalculationEngineSensitivityAnalysisRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Parameters */
  parameters: Record<string, number>;
  /** Base Values */
  base_values: Record<string, number>;
  /** Target Metric */
  target_metric: string;
  /**
   * Variation Range
   * @default 0.2
   */
  variation_range?: number | null;
  /**
   * Steps
   * @default 5
   */
  steps?: number | null;
}

/** SensitivityAnalysisResponse */
export interface AppApisCalculationEngineSensitivityAnalysisResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Target Metric */
  target_metric: string;
  /** Sensitivities */
  sensitivities: ParameterSensitivity[];
  /** Parameter Charts */
  parameter_charts?: Record<string, ParameterChart> | null;
}

/** FinancialHealthResponse */
export interface AppApisFinancialHealthFinancialHealthResponse {
  /** Ratios */
  ratios: AppApisFinancialHealthFinancialRatio[];
  /** Failure Patterns */
  failure_patterns: FailurePattern[];
  /** Industry Benchmarks */
  industry_benchmarks?: IndustryBenchmark[] | null;
}

/** FinancialRatio */
export interface AppApisFinancialHealthFinancialRatio {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Formula */
  formula: string;
  /**
   * Industry Benchmarks
   * Benchmarks by industry, with sub-dictionary containing benchmarks by size (small, medium, large)
   */
  industry_benchmarks: Record<string, Record<string, number>>;
  /** Interpretation */
  interpretation: string;
  /**
   * Warning Thresholds
   * Warning thresholds by industry
   */
  warning_thresholds: Record<string, number>;
  /**
   * Category
   * Category of ratio: Profitability, Liquidity, Leverage, Efficiency
   */
  category: string;
}

/** FinancialHealthResponse */
export interface AppApisFinancialHealthIndicatorsFinancialHealthResponse {
  /** Ratios */
  ratios: AppApisFinancialHealthIndicatorsFinancialRatio[];
  /** Failure Patterns */
  failure_patterns: FailurePattern[];
  /** Industry Benchmarks */
  industry_benchmarks: IndustryBenchmark[];
}

/** FinancialRatio */
export interface AppApisFinancialHealthIndicatorsFinancialRatio {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Formula */
  formula: string;
  /** Industry Benchmarks */
  industry_benchmarks: Record<string, Record<string, number>>;
  /** Interpretation */
  interpretation: string;
  /** Warning Thresholds */
  warning_thresholds: Record<string, number>;
  /** Category */
  category: string;
}

/** ImportResponse */
export interface AppApisFinancialImportImportResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Import Id */
  import_id?: string | null;
  /** Item Count */
  item_count?: number | null;
}

/** FinancialMetric */
export interface AppApisFinancialInsightsFinancialMetric {
  /** Name */
  name: string;
  /** Current Value */
  current_value: number;
  /** Previous Value */
  previous_value?: number | null;
  /** Target Value */
  target_value?: number | null;
  /** Unit */
  unit?: string | null;
  /** Data Points */
  data_points?: FinancialDataPoint[] | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** FinancialMetric */
export interface AppApisFinancialScoringFinancialMetric {
  /** Name */
  name: string;
  /** Value */
  value: number;
  /**
   * Unit
   * @default "ratio"
   */
  unit?: string;
  /**
   * Date
   * @format date
   */
  date: string;
}

/** MetricCategory */
export interface AppApisGovernanceMetricsMetricCategory {
  /** Category */
  category: string;
  /** Description */
  description: string;
  /** Metrics */
  metrics: MetricDetail[];
}

/** ImportResponse */
export interface AppApisModelsImportResponse {
  /** Success */
  success: boolean;
  /** Import Id */
  import_id?: string | null;
  /** Message */
  message: string;
  /** Processed Points */
  processed_points?: number | null;
  /** Errors */
  errors?: string[] | null;
}

/**
 * NarrativeRequest
 * Request model for generating a narrative for a specific variance.
 */
export interface AppApisNarrativeGenerationNarrativeRequest {
  /**
   * Account Name
   * Name or code of the financial account/item.
   */
  account_name: string;
  /**
   * Account Type
   * The classification of the account (e.g., Revenue, Expense).
   */
  account_type: "Revenue" | "Expense" | "Asset" | "Liability" | "Equity" | "Unknown";
  /**
   * Period End Date
   * The end date of the primary period analyzed (e.g., YYYY-MM-DD).
   * @format date
   */
  period_end_date: string;
  /**
   * Comparison Type
   * What the actuals were compared against.
   */
  comparison_type: "budget" | "prior_period" | "prior_year";
  /**
   * Actual Value
   * The value for the primary period.
   */
  actual_value: number;
  /**
   * Comparison Value
   * The value for the comparison period.
   */
  comparison_value?: number | null;
  /**
   * Absolute Variance
   * Actual - Comparison Value.
   */
  absolute_variance?: number | null;
  /**
   * Percentage Variance
   * (Actual - Comparison) / Comparison Value. Null if comparison is zero or NaN.
   */
  percentage_variance?: number | null;
}

/**
 * NarrativeResponse
 * Response model containing the generated narrative.
 */
export interface AppApisNarrativeGenerationNarrativeResponse {
  /**
   * Narrative
   * The LLM-generated explanation for the variance.
   */
  narrative: string;
}

/** DistributionType */
export enum AppApisScenarioAnalysisDistributionType {
  Normal = "normal",
  Uniform = "uniform",
  Triangular = "triangular",
  Lognormal = "lognormal",
  Custom = "custom",
}

/** MonteCarloSimulationRequest */
export interface AppApisScenarioAnalysisMonteCarloSimulationRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Variables */
  variables: VariableDefinition[];
  /**
   * Iterations
   * @default 1000
   */
  iterations?: number;
  /**
   * Confidence Level
   * @default 0.95
   */
  confidence_level?: number;
  /**
   * Include Raw Data
   * @default false
   */
  include_raw_data?: boolean;
  /** Correlated Variables */
  correlated_variables?: Record<string, any>[] | null;
}

/** MonteCarloSimulationResponse */
export interface AppApisScenarioAnalysisMonteCarloSimulationResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Results */
  results: SimulationResult[];
  /** Summary Stats */
  summary_stats: Record<string, any>;
  /** Convergence Info */
  convergence_info?: Record<string, any> | null;
  /** Raw Data */
  raw_data?: Record<string, number[]> | null;
}

/** SensitivityAnalysisRequest */
export interface AppApisScenarioAnalysisSensitivityAnalysisRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Target Metric */
  target_metric: string;
  /**
   * Variation Range
   * @default 0.2
   */
  variation_range?: number;
  /**
   * Steps
   * @default 5
   */
  steps?: number;
  /** Parameters To Analyze */
  parameters_to_analyze?: string[] | null;
}

/** SensitivityAnalysisResponse */
export interface AppApisScenarioAnalysisSensitivityAnalysisResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Target Metric */
  target_metric: string;
  /** Sensitivities */
  sensitivities: ParameterSensitivity[];
  /** Parameter Data */
  parameter_data?: Record<string, Record<string, number[]>> | null;
}

/** EnhancedCalculateScenarioRequest */
export interface AppApisScenarioCalculationEnhancedCalculateScenarioRequest {
  /** The economic scenario to analyze */
  scenario: EconomicScenario;
  /**
   * Financial Data
   * Baseline financial data for calculations
   */
  financial_data: Record<string, any>;
  /**
   * Include Sensitivity Analysis
   * @default false
   */
  include_sensitivity_analysis?: boolean;
  /**
   * Include Monte Carlo
   * @default false
   */
  include_monte_carlo?: boolean;
  /**
   * Monte Carlo Simulations
   * @default 1000
   */
  monte_carlo_simulations?: number;
}

/** EnhancedScenarioImpactResult */
export interface AppApisScenarioCalculationEnhancedScenarioImpactResult {
  /**
   * Metric
   * Financial metric impacted
   */
  metric: string;
  /**
   * Impact Value
   * Calculated impact value (e.g., percentage change)
   */
  impact_value: number;
  /** Qualitative assessment of the impact */
  impact_level: ImpactLevel;
  /** Sensitivity Analysis */
  sensitivity_analysis?: Record<string, any> | null;
  /** Monte Carlo Results */
  monte_carlo_results?: Record<string, any> | null;
}

/** MetricDistribution */
export interface AppApisScenarioCalculationMetricDistribution {
  /** Metric */
  metric: string;
  /** Mean */
  mean: number;
  /** Median */
  median: number;
  /** Std */
  std: number;
  /** Min */
  min: number;
  /** Max */
  max: number;
  /** Percentile 10 */
  percentile_10: number;
  /** Percentile 25 */
  percentile_25: number;
  /** Percentile 75 */
  percentile_75: number;
  /** Percentile 90 */
  percentile_90: number;
  /** Probabilities */
  probabilities: ProbabilityThreshold[];
  /** Histogram */
  histogram: Record<string, number[]>;
}

/** MonteCarloSimulationRequest */
export interface AppApisScenarioCalculationMonteCarloSimulationRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Parameter Distributions */
  parameter_distributions: Record<string, AppApisScenarioCalculationParameterDistribution>;
  /** Target Metrics */
  target_metrics: string[];
  /**
   * Num Simulations
   * @default 1000
   */
  num_simulations?: number;
}

/** MonteCarloSimulationResponse */
export interface AppApisScenarioCalculationMonteCarloSimulationResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Num Simulations */
  num_simulations: number;
  /** Distributions */
  distributions: AppApisScenarioCalculationMetricDistribution[];
}

/** ParameterDistribution */
export interface AppApisScenarioCalculationParameterDistribution {
  /** Type */
  type: string;
  /** Mean */
  mean?: number | null;
  /** Std */
  std?: number | null;
  /** Min */
  min?: number | null;
  /** Max */
  max?: number | null;
  /** Mode */
  mode?: number | null;
  /** Values */
  values?: number[] | null;
  /** Probabilities */
  probabilities?: number[] | null;
}

/** SensitivityAnalysisRequest */
export interface AppApisScenarioCalculationSensitivityAnalysisRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Target Metric */
  target_metric: string;
  /**
   * Parameters To Analyze
   * Leave empty to analyze all parameters
   */
  parameters_to_analyze?: string[];
  /**
   * Variation Range
   * @default 0.2
   */
  variation_range?: number;
  /**
   * Steps
   * @default 5
   */
  steps?: number;
}

/** SensitivityAnalysisResponse */
export interface AppApisScenarioCalculationSensitivityAnalysisResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Target Metric */
  target_metric: string;
  /** Sensitivities */
  sensitivities: ParameterSensitivity[];
  /** Parameter Charts */
  parameter_charts: Record<string, Record<string, number[]>>;
}

/** DistributionType */
export enum AppApisScenarioCalculatorDistributionType {
  Normal = "normal",
  Triangular = "triangular",
  Uniform = "uniform",
  Custom = "custom",
}

/** EnhancedCalculateScenarioRequest */
export interface AppApisScenarioCalculatorEnhancedCalculateScenarioRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Financial Data Id */
  financial_data_id?: string | null;
  /**
   * Include Sensitivity Analysis
   * @default false
   */
  include_sensitivity_analysis?: boolean;
  /**
   * Include Monte Carlo
   * @default false
   */
  include_monte_carlo?: boolean;
  /**
   * Monte Carlo Simulations
   * @min 100
   * @max 10000
   * @default 1000
   */
  monte_carlo_simulations?: number;
}

/** EnhancedScenarioImpactResult */
export interface AppApisScenarioCalculatorEnhancedScenarioImpactResult {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Financial Impacts */
  financial_impacts: Record<string, number>;
  /** Business Unit Impacts */
  business_unit_impacts: Record<string, Record<string, number>>;
  /** Risk Level */
  risk_level: number;
  /** Opportunity Level */
  opportunity_level: number;
  /** Recommended Actions */
  recommended_actions: string[];
  sensitivity_analysis?: SensitivityAnalysisData | null;
  monte_carlo_results?: MonteCarloResults | null;
}

/** MetricDistribution */
export interface AppApisScenarioCalculatorMetricDistribution {
  /** Metric */
  metric: string;
  /** Mean */
  mean: number;
  /** Median */
  median: number;
  /** Std */
  std: number;
  /** Min */
  min: number;
  /** Max */
  max: number;
  /** Percentile 10 */
  percentile_10: number;
  /** Percentile 25 */
  percentile_25: number;
  /** Percentile 75 */
  percentile_75: number;
  /** Percentile 90 */
  percentile_90: number;
  /** Probabilities */
  probabilities: ThresholdProbability[];
  histogram: HistogramData;
}

/** MonteCarloSimulationRequest */
export interface AppApisScenarioCalculatorMonteCarloSimulationRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Parameter Distributions */
  parameter_distributions: Record<string, AppApisScenarioCalculatorParameterDistribution>;
  /** Target Metrics */
  target_metrics: string[];
  /**
   * Num Simulations
   * @min 100
   * @max 10000
   * @default 1000
   */
  num_simulations?: number;
}

/** MonteCarloSimulationResponse */
export interface AppApisScenarioCalculatorMonteCarloSimulationResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Num Simulations */
  num_simulations: number;
  /** Distributions */
  distributions: AppApisScenarioCalculatorMetricDistribution[];
}

/** ParameterDistribution */
export interface AppApisScenarioCalculatorParameterDistribution {
  type: AppApisScenarioCalculatorDistributionType;
  /** Min */
  min?: number | null;
  /** Max */
  max?: number | null;
  /** Mean */
  mean?: number | null;
  /** Std */
  std?: number | null;
  /** Mode */
  mode?: number | null;
  /** Custom Values */
  custom_values?: number[] | null;
  /** Custom Weights */
  custom_weights?: number[] | null;
}

/** SensitivityAnalysisRequest */
export interface AppApisScenarioCalculatorSensitivityAnalysisRequest {
  /** Scenario Id */
  scenario_id: string;
  /** Organization Id */
  organization_id: string;
  /** Target Metric */
  target_metric: string;
  /** Parameters To Analyze */
  parameters_to_analyze?: string[] | null;
  /**
   * Variation Range
   * @min 0.01
   * @max 1
   * @default 0.2
   */
  variation_range?: number;
  /**
   * Steps
   * @min 3
   * @max 20
   * @default 5
   */
  steps?: number;
}

/** SensitivityAnalysisResponse */
export interface AppApisScenarioCalculatorSensitivityAnalysisResponse {
  /** Scenario Id */
  scenario_id: string;
  /** Scenario Name */
  scenario_name: string;
  /** Target Metric */
  target_metric: string;
  /** Sensitivities */
  sensitivities: ParameterSensitivity[];
  /** Parameter Charts */
  parameter_charts: Record<string, ParameterChart>;
}

/** NarrativeRequest */
export interface AppApisVarianceAnalysisNarrativeRequest {
  /**
   * Variances
   * List of significant variances needing explanation.
   */
  variances: VarianceInput[];
  /**
   * Context
   * Optional broader context (e.g., company strategy, market events).
   */
  context?: string | null;
}

/** NarrativeResponse */
export interface AppApisVarianceAnalysisNarrativeResponse {
  /**
   * Narrative
   * The LLM-generated narrative explanation.
   */
  narrative: string;
}

export type CheckHealthData = HealthResponse;

export type CreateTaxReturn2Data = TaxReturnOutput;

export type CreateTaxReturn2Error = HTTPValidationError;

/** Response Create Tax Planning Scenario3 */
export type CreateTaxPlanningScenario3Data = Record<string, any>;

export type CreateTaxPlanningScenario3Error = HTTPValidationError;

export type CalculateIncomeTaxData = TaxCalculationResponse;

export type CalculateIncomeTaxError = HTTPValidationError;

export type CalculateGstEndpointData = GSTCalculationResponse;

export type CalculateGstEndpointError = HTTPValidationError;

export type GenerateBasStatementData = BASStatement;

export type GenerateBasStatementError = HTTPValidationError;

export type CreateTaxPlanningScenarioV2Data = TaxPlanningResponse;

export type CreateTaxPlanningScenarioV2Error = HTTPValidationError;

export type CreateBasStatement2Data = EnhancedBASResponse;

export type CreateBasStatement2Error = HTTPValidationError;

export interface GetTaxObligations2Params {
  /** Entity Id */
  entity_id: string;
  /** Year */
  year: number;
  /**
   * Include Completed
   * @default false
   */
  include_completed?: boolean;
}

export type GetTaxObligations2Data = TaxObligationResponse;

export type GetTaxObligations2Error = HTTPValidationError;

/** Response Calculate Detailed Gst */
export type CalculateDetailedGstData = Record<string, any>;

export type CalculateDetailedGstError = HTTPValidationError;

export interface GetIndustrySeasonalityParams {
  /** Industry */
  industry: string;
}

export type GetIndustrySeasonalityData = SeasonalityResponse;

export type GetIndustrySeasonalityError = HTTPValidationError;

export type CreateAdvancedForecastData = AdvancedForecastResult;

export type CreateAdvancedForecastError = HTTPValidationError;

export type OptimizeCashFlowData = CashFlowOptimizationResponse;

export type OptimizeCashFlowError = HTTPValidationError;

export interface GetHistoricalRecommendationsParams {
  /** Company Id */
  companyId: string;
}

export type GetHistoricalRecommendationsData = any;

export type GetHistoricalRecommendationsError = HTTPValidationError;

export type AnalyzeScenarioSensitivity2Data = AppApisScenarioCalculatorSensitivityAnalysisResponse;

export type AnalyzeScenarioSensitivity2Error = HTTPValidationError;

export type RunMonteCarloSimulation2Data = AppApisScenarioCalculatorMonteCarloSimulationResponse;

export type RunMonteCarloSimulation2Error = HTTPValidationError;

export type CalculateScenarioImpactV3Data = AppApisScenarioCalculatorEnhancedScenarioImpactResult;

export type CalculateScenarioImpactV3Error = HTTPValidationError;

export interface ListGrantsParams {
  /** Level */
  level?: string | null;
  /** State */
  state?: string | null;
  /** Category */
  category?: string | null;
  /** Business Type */
  business_type?: string | null;
  /** Min Amount */
  min_amount?: number | null;
  /** Max Amount */
  max_amount?: number | null;
  /** Funding Type */
  funding_type?: string | null;
  /** Q */
  q?: string | null;
}

export type ListGrantsData = any;

export type ListGrantsError = HTTPValidationError;

export type CreateGrantData = any;

export type CreateGrantError = HTTPValidationError;

export interface GetGrantParams {
  /** Grant Id */
  grantId: string;
}

export type GetGrantData = any;

export type GetGrantError = HTTPValidationError;

export interface UpdateGrantParams {
  /** Grant Id */
  grantId: string;
}

export type UpdateGrantData = any;

export type UpdateGrantError = HTTPValidationError;

export interface DeleteGrantParams {
  /** Grant Id */
  grantId: string;
}

export type DeleteGrantData = any;

export type DeleteGrantError = HTTPValidationError;

export type GetGrantCategoriesData = any;

export type GetBusinessTypesData = any;

export type GetStatesData = any;

export type GetFundingTypesData = any;

export type AnalyzeEngineSensitivityData = AppApisCalculationEngineSensitivityAnalysisResponse;

export type AnalyzeEngineSensitivityError = HTTPValidationError;

export type RunMonteCarloSimulationData = AppApisCalculationEngineMonteCarloSimulationResponse;

export type RunMonteCarloSimulationError = HTTPValidationError;

export type RunMonteCarloSimulationEnhancedData = AppApisScenarioAnalysisMonteCarloSimulationResponse;

export type RunMonteCarloSimulationEnhancedError = HTTPValidationError;

export type AnalyzeScenarioSensitivityEnhancedData = AppApisScenarioAnalysisSensitivityAnalysisResponse;

export type AnalyzeScenarioSensitivityEnhancedError = HTTPValidationError;

export type MatchGrantsData = any;

export type MatchGrantsError = HTTPValidationError;

export type ScrapeGrantsData = any;

export type ScrapeGrantsError = HTTPValidationError;

export type GetScrapeStatusData = any;

export type ListScrapeSourcesData = any;

export type CreateScrapeSourceData = any;

export type CreateScrapeSourceError = HTTPValidationError;

export interface UpdateScrapeSourceParams {
  /** Source Id */
  sourceId: string;
}

export type UpdateScrapeSourceData = any;

export type UpdateScrapeSourceError = HTTPValidationError;

export interface DeleteScrapeSourceParams {
  /** Source Id */
  sourceId: string;
}

export type DeleteScrapeSourceData = any;

export type DeleteScrapeSourceError = HTTPValidationError;

export type CreateApplicationData = any;

export type CreateApplicationError = HTTPValidationError;

export interface ListApplicationsParams {
  /** Status */
  status?: string | null;
  /** Grant Id */
  grant_id?: string | null;
}

export type ListApplicationsData = any;

export type ListApplicationsError = HTTPValidationError;

export interface GetApplicationParams {
  /** Application Id */
  applicationId: string;
}

export type GetApplicationData = any;

export type GetApplicationError = HTTPValidationError;

export interface UpdateApplicationParams {
  /** Application Id */
  applicationId: string;
}

export type UpdateApplicationData = any;

export type UpdateApplicationError = HTTPValidationError;

export interface DeleteApplicationEndpointParams {
  /** Application Id */
  applicationId: string;
}

export type DeleteApplicationEndpointData = any;

export type DeleteApplicationEndpointError = HTTPValidationError;

export interface UpdateApplicationStepParams {
  /** Application Id */
  applicationId: string;
  /** Step Id */
  stepId: string;
}

export type UpdateApplicationStepData = any;

export type UpdateApplicationStepError = HTTPValidationError;

export interface DeleteApplicationStepParams {
  /** Application Id */
  applicationId: string;
  /** Step Id */
  stepId: string;
}

export type DeleteApplicationStepData = any;

export type DeleteApplicationStepError = HTTPValidationError;

export interface AddApplicationStepParams {
  /** Application Id */
  applicationId: string;
}

export type AddApplicationStepData = any;

export type AddApplicationStepError = HTTPValidationError;

export interface PrepareDocumentUploadParams {
  /** Application Id */
  applicationId: string;
}

export type PrepareDocumentUploadData = any;

export type PrepareDocumentUploadError = HTTPValidationError;

export interface ListDocumentsParams {
  /** Step Id */
  step_id?: string | null;
  /** Application Id */
  applicationId: string;
}

export type ListDocumentsData = any;

export type ListDocumentsError = HTTPValidationError;

export interface ConfirmDocumentUploadParams {
  /** Application Id */
  applicationId: string;
  /** Document Id */
  documentId: string;
}

export type ConfirmDocumentUploadData = any;

export type ConfirmDocumentUploadError = HTTPValidationError;

export interface DeleteDocumentParams {
  /** Step Id */
  step_id?: string | null;
  /** Application Id */
  applicationId: string;
  /** Document Id */
  documentId: string;
}

export type DeleteDocumentData = any;

export type DeleteDocumentError = HTTPValidationError;

export type CalculateRoiForGrantData = ROICalculationResponse;

export type CalculateRoiForGrantError = HTTPValidationError;

export type CompareGrantsData = GrantComparisonResponse;

export type CompareGrantsError = HTTPValidationError;

export type OptimizeGrantStrategyData = OptimizationResponse;

export type OptimizeGrantStrategyError = HTTPValidationError;

export interface GetApplicationRequirementsParams {
  /** Grant Id */
  grantId: string;
}

export type GetApplicationRequirementsData = any;

export type GetApplicationRequirementsError = HTTPValidationError;

export type GetFinancialHealthIndicatorsData = AppApisFinancialHealthIndicatorsFinancialHealthResponse;

export interface GetRatiosByCategoryParams {
  /** Category */
  category: string;
}

/** Response Get Ratios By Category */
export type GetRatiosByCategoryData = AppApisFinancialHealthIndicatorsFinancialRatio[];

export type GetRatiosByCategoryError = HTTPValidationError;

/** Response Get Failure Patterns */
export type GetFailurePatternsData = FailurePattern[];

/** Response Get Industry Benchmarks */
export type GetIndustryBenchmarksData = IndustryBenchmark[];

export interface GetIndustryBenchmarkByCodeParams {
  /** Industry Code */
  industryCode: string;
}

export type GetIndustryBenchmarkByCodeData = IndustryBenchmark;

export type GetIndustryBenchmarkByCodeError = HTTPValidationError;

export type GetFinancialHealthIndicatorsLegacyData = AppApisFinancialHealthFinancialHealthResponse;

/** Response Get Financial Ratios Legacy */
export type GetFinancialRatiosLegacyData = AppApisFinancialHealthFinancialRatio[];

/** Response Get Failure Patterns Legacy */
export type GetFailurePatternsLegacyData = FailurePattern[];

/** Response Get Industry Benchmarks Legacy */
export type GetIndustryBenchmarksLegacyData = IndustryBenchmark[];

export interface GetIndustryBenchmarkByCodeLegacyParams {
  /** Industry Code */
  industryCode: string;
}

export type GetIndustryBenchmarkByCodeLegacyData = IndustryBenchmark;

export type GetIndustryBenchmarkByCodeLegacyError = HTTPValidationError;

export interface GetRatiosByCategoryLegacyParams {
  /** Category */
  category: string;
}

/** Response Get Ratios By Category Legacy */
export type GetRatiosByCategoryLegacyData = AppApisFinancialHealthFinancialRatio[];

export type GetRatiosByCategoryLegacyError = HTTPValidationError;

export type CalculateFinancialScoreData = ScoreResponseOutput;

export type CalculateFinancialScoreError = HTTPValidationError;

export type AnalyzeScoreTrendsData = TrendAnalysisResponse;

export type AnalyzeScoreTrendsError = HTTPValidationError;

export type CalculateRelativePerformanceData = RelativePerformanceResponse;

export type CalculateRelativePerformanceError = HTTPValidationError;

export type GenerateRecommendationsData = RecommendationResponse;

export type GenerateRecommendationsError = HTTPValidationError;

export type GetReportingStandardsData = StandardsResponse;

export type GetReportingStandardsError = HTTPValidationError;

export type GetBoardReportingBestPracticesData = BoardReportingResponse;

export type GetBoardReportingBestPracticesError = HTTPValidationError;

export type GetGovernanceMetricsData = GovernanceMetricsResponse;

export type GetGovernanceMetricsError = HTTPValidationError;

export type GenerateInsightsData = InsightResponse;

export type GenerateInsightsError = HTTPValidationError;

export type SaveBusinessPlanData = SavePlanResponse;

export type SaveBusinessPlanError = HTTPValidationError;

/** Response List Business Plans */
export type ListBusinessPlansData = BusinessPlanMetadata[];

export interface LoadBusinessPlanParams {
  /** Plan Id */
  planId: string;
}

export type LoadBusinessPlanData = BusinessPlanData;

export type LoadBusinessPlanError = HTTPValidationError;

export interface GetBusinessEntity2Params {
  /** Entity Id */
  entityId: string;
}

export type GetBusinessEntity2Data = any;

export type GetBusinessEntity2Error = HTTPValidationError;

/** Entity */
export type CreateBusinessEntity2Payload = Company | Trust | Partnership | SoleTrader;

export interface CreateBusinessEntity2Params {
  entity_type: BusinessStructureType;
}

export type CreateBusinessEntity2Data = any;

export type CreateBusinessEntity2Error = HTTPValidationError;

export interface GetTaxObligationsParams {
  /** Period Start */
  period_start?: string | null;
  /** Period End */
  period_end?: string | null;
  /** Entity Id */
  entityId: string;
}

export type GetTaxObligationsData = any;

export type GetTaxObligationsError = HTTPValidationError;

export type CreateTaxReturnData = any;

export type CreateTaxReturnError = HTTPValidationError;

export type CreateBasStatementData = any;

export type CreateBasStatementError = HTTPValidationError;

export type CreateTaxPlanningScenarioData = any;

export type CreateTaxPlanningScenarioError = HTTPValidationError;

export type CreateEntityData = BusinessEntityResponse;

export type CreateEntityError = HTTPValidationError;

export interface GetBusinessEntityParams {
  /** Entity Id */
  entityId: string;
}

export type GetBusinessEntityData = BusinessEntityResponse;

export type GetBusinessEntityError = HTTPValidationError;

export interface UpdateBusinessEntityParams {
  /** Entity Id */
  entityId: string;
}

export type UpdateBusinessEntityData = BusinessEntityResponse;

export type UpdateBusinessEntityError = HTTPValidationError;

export type ListBusinessEntitiesData = BusinessEntityListResponse;

export type UploadFxRatesData = FXRateUploadResponse;

export type UploadFxRatesError = HTTPValidationError;

export interface GetFxRatesParams {
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /** From Currency */
  from_currency?: string | null;
  /** To Currency */
  to_currency?: string | null;
}

export type GetFxRatesData = FXRateListResponse;

export type GetFxRatesError = HTTPValidationError;

/** Response List Connections */
export type ListConnectionsData = ConnectionOutput[];

export type AddConnectionData = ConnectionOutput;

export type AddConnectionError = HTTPValidationError;

export interface UpdateConnectionParams {
  /** Connection Id */
  connectionId: string;
}

export type UpdateConnectionData = ConnectionOutput;

export type UpdateConnectionError = HTTPValidationError;

export interface DeleteConnectionParams {
  /** Connection Id */
  connectionId: string;
}

export type DeleteConnectionData = any;

export type DeleteConnectionError = HTTPValidationError;

export interface TestConnectionParams {
  /** Connection Id */
  connectionId: string;
}

export type TestConnectionData = ConnectionTestResult;

export type TestConnectionError = HTTPValidationError;

export type GenerateReportData = ReportDataResponse;

export type GenerateReportError = HTTPValidationError;

export type GenerateVarianceNarrativeData = AppApisNarrativeGenerationNarrativeResponse;

export type GenerateVarianceNarrativeError = HTTPValidationError;

export type ValidateBusinessEntityData = ValidationResponse;

export type ValidateBusinessEntityError = HTTPValidationError;

export type ValidateTaxObligationsData = ValidationResponse;

export type ValidateTaxObligationsError = HTTPValidationError;

export type DetectComplianceAnomaliesData = ValidationResponse;

export type DetectComplianceAnomaliesError = HTTPValidationError;

/** Request */
export type RunComplianceChecksPayload = Record<string, any>;

/** Response Run Compliance Checks */
export type RunComplianceChecksData = Record<string, any>;

export type RunComplianceChecksError = HTTPValidationError;

export type ImportMyobTrialBalanceData = MyobTrialBalanceImportResponse;

export type ImportMyobTrialBalanceError = HTTPValidationError;

export type CalculateScenarioImpactV2Data = AppApisScenarioCalculationEnhancedScenarioImpactResult;

export type CalculateScenarioImpactV2Error = HTTPValidationError;

export type AnalyzeScenarioSensitivityData = AppApisScenarioCalculationSensitivityAnalysisResponse;

export type AnalyzeScenarioSensitivityError = HTTPValidationError;

export type AnalyzeScenarioSensitivityAdvancedData = AdvancedSensitivityResponse;

export type AnalyzeScenarioSensitivityAdvancedError = HTTPValidationError;

export type RunScenarioMonteCarloSimulationData = AppApisScenarioCalculationMonteCarloSimulationResponse;

export type RunScenarioMonteCarloSimulationError = HTTPValidationError;

export type RunMonteCarloSimulationAdvancedData = AdvancedMonteCarloResponse;

export type RunMonteCarloSimulationAdvancedError = HTTPValidationError;

export type GenerateStrategicRecommendationsData = ScenarioResponseRecommendations;

export type GenerateStrategicRecommendationsError = HTTPValidationError;

export type ForecastScoreData = ForecastResponse;

export type ForecastScoreError = HTTPValidationError;

export type ForecastAccountData = AccountForecastResponse;

export type ForecastAccountError = HTTPValidationError;

export type CreateSimpleDriverBasedForecastData = SimpleForecastResponse;

export type CreateSimpleDriverBasedForecastError = HTTPValidationError;

export interface CreateBudgetVersionParams {
  /**
   * Organization Id
   * ID of the organization
   */
  organizationId: string;
}

export type CreateBudgetVersionData = BudgetVersionMetadata;

export type CreateBudgetVersionError = HTTPValidationError;

export interface ListBudgetVersionsParams {
  /**
   * Organization Id
   * ID of the organization
   */
  organizationId: string;
}

/** Response List Budget Versions */
export type ListBudgetVersionsData = BudgetVersionMetadata[];

export type ListBudgetVersionsError = HTTPValidationError;

export interface GetBudgetVersionParams {
  /**
   * Organization Id
   * ID of the organization
   */
  organizationId: string;
  /**
   * Version Id
   * ID of the budget version to retrieve
   */
  versionId: string;
}

export type GetBudgetVersionData = BudgetVersion;

export type GetBudgetVersionError = HTTPValidationError;

export interface UpdateBudgetVersionParams {
  /**
   * Organization Id
   * ID of the organization
   */
  organizationId: string;
  /**
   * Version Id
   * ID of the budget version to update/replace
   */
  versionId: string;
}

export type UpdateBudgetVersionData = BudgetVersionMetadata;

export type UpdateBudgetVersionError = HTTPValidationError;

export interface DeleteBudgetVersionParams {
  organizationId: string;
  versionId: string;
}

export type DeleteBudgetVersionData = any;

export type DetectTaxAnomaliesData = AnomalyDetectionResponse;

export type DetectTaxAnomaliesError = HTTPValidationError;

export interface ListNotificationsParams {
  /** User Id */
  user_id: string;
  /** Entity Id */
  entity_id?: string | null;
  /** Type */
  type?: string | null;
  /** Severity */
  severity?: string | null;
  /**
   * Unread Only
   * @default false
   */
  unread_only?: boolean;
  /**
   * Active Only
   * @default true
   */
  active_only?: boolean;
  /**
   * Limit
   * @min 1
   * @max 100
   * @default 50
   */
  limit?: number;
  /**
   * Offset
   * @min 0
   * @default 0
   */
  offset?: number;
}

/** Response List Notifications */
export type ListNotificationsData = Record<string, any>;

export type ListNotificationsError = HTTPValidationError;

export type CreateNotificationData = NotificationResponse;

export type CreateNotificationError = HTTPValidationError;

export interface MarkNotificationReadParams {
  /** Notification Id */
  notificationId: string;
}

export type MarkNotificationReadData = NotificationResponse;

export type MarkNotificationReadError = HTTPValidationError;

export interface DismissNotificationParams {
  /** Notification Id */
  notificationId: string;
}

export type DismissNotificationData = NotificationResponse;

export type DismissNotificationError = HTTPValidationError;

/** Notification Ids */
export type BulkUpdateNotificationsPayload = string[] | null;

export interface BulkUpdateNotificationsParams {
  /**
   * Action
   * Action to perform: mark_read, dismiss
   */
  action: string;
  /** User Id */
  user_id: string;
  /** Entity Id */
  entity_id?: string | null;
  /** Type */
  type?: string | null;
}

export type BulkUpdateNotificationsData = NotificationResponse;

export type BulkUpdateNotificationsError = HTTPValidationError;

export interface GenerateDeadlineAlertsParams {
  /** User Id */
  user_id: string;
  /** Entity Id */
  entity_id?: string | null;
}

export type GenerateDeadlineAlertsData = NotificationResponse;

export type GenerateDeadlineAlertsError = HTTPValidationError;

export interface GenerateComplianceAlertsParams {
  /** User Id */
  user_id: string;
  /** Entity Id */
  entity_id?: string | null;
  /** Check Type */
  check_type?: string | null;
}

export type GenerateComplianceAlertsData = NotificationResponse;

export type GenerateComplianceAlertsError = HTTPValidationError;

/** Response List Scenarios */
export type ListScenariosData = ScenarioSummary[];

export type CreateScenarioData = ScenarioMetadata;

export type CreateScenarioError = HTTPValidationError;

export interface GetScenarioParams {
  /** Scenario Id */
  scenarioId: string;
}

export type GetScenarioData = ScenarioMetadata;

export type GetScenarioError = HTTPValidationError;

export interface UpdateScenarioParams {
  /** Scenario Id */
  scenarioId: string;
}

export type UpdateScenarioData = ScenarioMetadata;

export type UpdateScenarioError = HTTPValidationError;

export interface DeleteScenarioParams {
  /** Scenario Id */
  scenarioId: string;
}

export type DeleteScenarioData = any;

export type DeleteScenarioError = HTTPValidationError;

export interface ApplyScenarioParams {
  /** Scenario Id */
  scenarioId: string;
}

export type ApplyScenarioData = ScenarioApplyResponse;

export type ApplyScenarioError = HTTPValidationError;

export interface UploadFinancialDataLegacyParams {
  /** Data Type */
  data_type: string;
}

export type UploadFinancialDataLegacyData = UploadResponse;

export type UploadFinancialDataLegacyError = HTTPValidationError;

export type ProcessFinancialDataData = AppApisFinancialImportImportResponse;

export type ProcessFinancialDataError = HTTPValidationError;

export interface ListImportsParams {
  /** Organization Id */
  organizationId: string;
}

/** Response List Imports */
export type ListImportsData = FinancialImport[];

export type ListImportsError = HTTPValidationError;

export type UploadOrganizationFinancialDataData = UploadResponseData;

export type UploadOrganizationFinancialDataError = HTTPValidationError;

export interface UploadFinancialDataParams {
  /** Data Type */
  data_type: string;
}

export type UploadFinancialDataData = UploadResponseData;

export type UploadFinancialDataError = HTTPValidationError;

export interface GetImportParams {
  /** Import Id */
  importId: string;
}

export type GetImportData = any;

export type GetImportError = HTTPValidationError;

export type GrantAccessData = any;

export type GrantAccessError = HTTPValidationError;

export type RevokeAccessData = any;

export type RevokeAccessError = HTTPValidationError;

export interface GetContentPermissionsParams {
  /** Content Type */
  contentType: "dashboard" | "report" | "forecast" | "budget";
  /** Content Id */
  contentId: string;
}

export type GetContentPermissionsData = ContentPermissionsResponse;

export type GetContentPermissionsError = HTTPValidationError;

export interface GetUserPermissionsParams {
  /** User Id */
  userId: string;
}

export type GetUserPermissionsData = UserPermissionsResponse;

export type GetUserPermissionsError = HTTPValidationError;

export type GetSubscriptionPlansData = SubscriptionPlanResponse;

export type CreateCheckoutSessionData = any;

export type CreateCheckoutSessionError = HTTPValidationError;

export type CreatePortalSessionData = any;

export type CreatePortalSessionError = HTTPValidationError;

export interface GetOrganizationSubscriptionParams {
  /** Organization Id */
  organizationId: string;
}

/** Response Get Organization Subscription */
export type GetOrganizationSubscriptionData = SubscriptionDetails | null;

export type GetOrganizationSubscriptionError = HTTPValidationError;

export type StripeWebhookData = any;

export type StripeWebhookError = HTTPValidationError;

export type ScheduleReportData = ScheduleResponse;

export type ScheduleReportError = HTTPValidationError;

/** Response List Schedules */
export type ListSchedulesData = ReportSchedule[];

export interface GetScheduleParams {
  /** Schedule Id */
  scheduleId: string;
}

export type GetScheduleData = ReportSchedule;

export type GetScheduleError = HTTPValidationError;

export interface UpdateScheduleParams {
  /** Schedule Id */
  scheduleId: string;
}

export type UpdateScheduleData = ReportSchedule;

export type UpdateScheduleError = HTTPValidationError;

export interface DeleteScheduleParams {
  /** Schedule Id */
  scheduleId: string;
}

export type DeleteScheduleData = any;

export type DeleteScheduleError = HTTPValidationError;

export type ExportReportData = ExportResponse;

export type ExportReportError = HTTPValidationError;

export interface DownloadReportParams {
  format: ReportFormat;
  /** Report Id */
  reportId: string;
}

export type DownloadReportData = any;

export type DownloadReportError = HTTPValidationError;

export type SubmitFeedbackData = any;

export type SubmitFeedbackError = HTTPValidationError;

export interface ManualDeliverReportParams {
  /** Schedule Id */
  scheduleId: string;
}

export type ManualDeliverReportData = any;

export type ManualDeliverReportError = HTTPValidationError;

/** Response List Report Definitions */
export type ListReportDefinitionsData = ReportDefinitionMetadata[];

export type CreateReportDefinitionData = ReportDefinition;

export type CreateReportDefinitionError = HTTPValidationError;

export interface GetReportDefinitionParams {
  /** Report Id */
  reportId: string;
}

export type GetReportDefinitionData = ReportDefinition;

export type GetReportDefinitionError = HTTPValidationError;

export interface UpdateReportDefinitionParams {
  /** Report Id */
  reportId: string;
}

export type UpdateReportDefinitionData = ReportDefinition;

export type UpdateReportDefinitionError = HTTPValidationError;

export interface DeleteReportDefinitionParams {
  /** Report Id */
  reportId: string;
}

export type DeleteReportDefinitionData = any;

export type DeleteReportDefinitionError = HTTPValidationError;

export type PurgeOldAuditLogsData = PurgeResponse;

export interface QueryAuditLogsParams {
  /**
   * Startdate
   * Start timestamp (ISO 8601 format)
   */
  startDate?: string | null;
  /**
   * Enddate
   * End timestamp (ISO 8601 format)
   */
  endDate?: string | null;
  /**
   * Userid
   * Filter by user ID (Firebase UID)
   */
  userId?: string | null;
  /**
   * Action Query
   * Filter by action identifier
   */
  action_query?: string | null;
  /**
   * Entitytype
   * Filter by entity type
   */
  entityType?: string | null;
  /**
   * Entityid
   * Filter by entity ID
   */
  entityId?: string | null;
  /**
   * Limit Query
   * Maximum number of logs to return
   * @min 1
   * @max 1000
   * @default 100
   */
  limit_query?: number;
  /**
   * Offset Query
   * Number of logs to skip (for pagination)
   * @min 0
   * @default 0
   */
  offset_query?: number;
}

export type QueryAuditLogsData = QueryAuditLogsResponse;

export type QueryAuditLogsError = HTTPValidationError;

export type FetchWidgetDataData = FetchWidgetDataResponse;

export type FetchWidgetDataError = HTTPValidationError;

/** Response List Benchmark Metric Definitions */
export type ListBenchmarkMetricDefinitionsData = BenchmarkMetricDefinition[];

export type CreateBenchmarkMetricDefinitionData = BenchmarkMetricDefinition;

export type CreateBenchmarkMetricDefinitionError = HTTPValidationError;

export interface UpdateBenchmarkMetricDefinitionParams {
  /** Metric Id */
  metricId: string;
}

export type UpdateBenchmarkMetricDefinitionData = BenchmarkMetricDefinition;

export type UpdateBenchmarkMetricDefinitionError = HTTPValidationError;

export interface DeleteBenchmarkMetricDefinitionParams {
  /** Metric Id */
  metricId: string;
}

export type DeleteBenchmarkMetricDefinitionData = any;

export type DeleteBenchmarkMetricDefinitionError = HTTPValidationError;

/** Response List Benchmark Sources */
export type ListBenchmarkSourcesData = BenchmarkSource[];

export type CreateBenchmarkSourceData = BenchmarkSource;

export type CreateBenchmarkSourceError = HTTPValidationError;

export interface UpdateBenchmarkSourceParams {
  /** Source Id */
  sourceId: string;
}

export type UpdateBenchmarkSourceData = BenchmarkSource;

export type UpdateBenchmarkSourceError = HTTPValidationError;

export interface DeleteBenchmarkSourceParams {
  /** Source Id */
  sourceId: string;
}

/** Response Delete Benchmark Source */
export type DeleteBenchmarkSourceData = Record<string, any>;

export type DeleteBenchmarkSourceError = HTTPValidationError;

export interface CompareBenchmarkVersionsParams {
  /**
   * Source Id
   * Source ID to compare versions for
   */
  source_id: string;
  /**
   * Version1
   * First version to compare
   */
  version1: string;
  /**
   * Version2
   * Second version to compare
   */
  version2: string;
  /**
   * Industry Code
   * Optional industry code to filter by
   */
  industry_code?: string | null;
}

/** Response Compare Benchmark Versions */
export type CompareBenchmarkVersionsData = Record<string, any>;

export type CompareBenchmarkVersionsError = HTTPValidationError;

export interface GetBenchmarkDataSummaryParams {
  /**
   * Source Id
   * Optional source ID to filter by
   */
  source_id?: string | null;
}

/** Response Get Benchmark Data Summary */
export type GetBenchmarkDataSummaryData = Record<string, any>;

export type GetBenchmarkDataSummaryError = HTTPValidationError;

export interface GetBenchmarkDataEndpointParams {
  /**
   * Industry Code
   * Industry code to filter data
   */
  industry_code?: string | null;
  /**
   * Industry Name
   * Industry name to filter data
   */
  industry_name?: string | null;
  /**
   * Source Id
   * Source ID to filter data
   */
  source_id?: string | null;
  /**
   * Year
   * Year to filter data
   */
  year?: string | null;
  /**
   * Metric
   * Metric name to filter data
   */
  metric?: string | null;
  /**
   * Version
   * Version of the data to retrieve
   */
  version?: string | null;
}

export type GetBenchmarkDataEndpointData = BenchmarkDataResponse;

export type GetBenchmarkDataEndpointError = HTTPValidationError;

export type UpdateBenchmarkDataData = UpdateBenchmarkResponse;

export type UpdateBenchmarkDataError = HTTPValidationError;

export type UploadBenchmarkDataData = AppApisModelsImportResponse;

export type UploadBenchmarkDataError = HTTPValidationError;

export interface ListImports2Params {
  /**
   * Source Id
   * Filter imports by source ID
   */
  source_id?: string | null;
  /**
   * Limit
   * Maximum number of imports to return
   * @default 100
   */
  limit?: number;
}

export type ListImports2Data = ImportListResponse;

export type ListImports2Error = HTTPValidationError;

export interface GetImport2Params {
  /** Import Id */
  importId: string;
}

export type GetImport2Data = ImportDetailResponse;

export type GetImport2Error = HTTPValidationError;

export interface GetBenchmarkVersionsEndpointParams {
  /**
   * Source Id
   * Filter versions by source ID
   */
  source_id?: string | null;
}

/** Response Get Benchmark Versions Endpoint */
export type GetBenchmarkVersionsEndpointData = Record<string, any>;

export type GetBenchmarkVersionsEndpointError = HTTPValidationError;

export interface GetIndustryMetricsParams {
  /**
   * Industry Name
   * Industry name to filter metrics
   */
  industry_name?: string | null;
}

/** Response Get Industry Metrics */
export type GetIndustryMetricsData = Record<string, string[]>;

export type GetIndustryMetricsError = HTTPValidationError;

/** Response Get Industry List */
export type GetIndustryListData = Record<string, string[]>;

/** Response Get Data Collection Strategy */
export type GetDataCollectionStrategyData = Record<string, any>;

export type CompareWithBenchmarksData = BenchmarkComparisonResponse;

export type CompareWithBenchmarksError = HTTPValidationError;

export type CalculateCashFlowEndpointData = CashFlowStatement;

export type CalculateCashFlowEndpointError = HTTPValidationError;

export type AssignRoleData = RoleAssignment;

export type AssignRoleError = HTTPValidationError;

export type RevokeRoleData = any;

export type RevokeRoleError = HTTPValidationError;

export interface ListUserRolesParams {
  /** Organization Id */
  organization_id?: string | null;
  /** Entity Id */
  entity_id?: string | null;
  /** User Id */
  userId: string;
}

/** Response List User Roles */
export type ListUserRolesData = RoleAssignment[];

export type ListUserRolesError = HTTPValidationError;

export interface ListScopeRolesParams {
  /** Scope Type */
  scopeType: "Organization" | "Entity";
  /** Scope Id */
  scopeId: string;
}

/** Response List Scope Roles */
export type ListScopeRolesData = RoleAssignment[];

export type ListScopeRolesError = HTTPValidationError;

export type CreateCommentData = CommentRead;

export type CreateCommentError = HTTPValidationError;

export interface GetCommentsParams {
  /**
   * Contexttype
   * Filter by context type
   */
  contextType: string;
  /**
   * Contextid
   * Filter by context ID
   */
  contextId: string;
  /**
   * Contextsubid
   * Filter by context sub ID
   */
  contextSubId?: string | null;
  /**
   * Threadid
   * Filter by thread ID (for retrieving replies)
   */
  threadId?: string | null;
}

/** Response Get Comments */
export type GetCommentsData = CommentRead[];

export type GetCommentsError = HTTPValidationError;

export interface UpdateCommentParams {
  /** Comment Id */
  commentId: string;
}

export type UpdateCommentData = CommentRead;

export type UpdateCommentError = HTTPValidationError;

export interface DeleteCommentParams {
  /** Comment Id */
  commentId: string;
}

export type DeleteCommentData = any;

export type DeleteCommentError = HTTPValidationError;

export interface GetCoaMappingsParams {
  /** Organization Id */
  organizationId: string;
}

export type GetCoaMappingsData = CoaCashFlowMappingsResponse;

export type GetCoaMappingsError = HTTPValidationError;

export interface UpdateCoaMappingsParams {
  /** Organization Id */
  organizationId: string;
}

export type UpdateCoaMappingsData = CoaCashFlowMappingsResponse;

export type UpdateCoaMappingsError = HTTPValidationError;

export type CreateDriverData = Driver;

export type CreateDriverError = HTTPValidationError;

export interface ListDriversParams {
  /** Organization Id */
  organization_id: string;
}

/** Response List Drivers */
export type ListDriversData = Driver[];

export type ListDriversError = HTTPValidationError;

export interface GetDriverParams {
  /** Driver Id */
  driverId: string;
}

export type GetDriverData = Driver;

export type GetDriverError = HTTPValidationError;

export interface UpdateDriverParams {
  /** Driver Id */
  driverId: string;
}

export type UpdateDriverData = Driver;

export type UpdateDriverError = HTTPValidationError;

export interface DeleteDriverParams {
  /** Driver Id */
  driverId: string;
}

export type DeleteDriverData = any;

export type DeleteDriverError = HTTPValidationError;

export type CreateForecastingRuleData = ForecastingRule;

export type CreateForecastingRuleError = HTTPValidationError;

export interface ListForecastingRulesParams {
  /** Organization Id */
  organization_id: string;
  /** Target Account Id */
  target_account_id?: string | null;
}

/** Response List Forecasting Rules */
export type ListForecastingRulesData = ForecastingRule[];

export type ListForecastingRulesError = HTTPValidationError;

export interface GetForecastingRuleParams {
  /** Rule Id */
  ruleId: string;
}

export type GetForecastingRuleData = ForecastingRule;

export type GetForecastingRuleError = HTTPValidationError;

export interface UpdateForecastingRuleParams {
  /** Rule Id */
  ruleId: string;
}

export type UpdateForecastingRuleData = ForecastingRule;

export type UpdateForecastingRuleError = HTTPValidationError;

export interface DeleteForecastingRuleParams {
  /** Rule Id */
  ruleId: string;
}

export type DeleteForecastingRuleData = any;

export type DeleteForecastingRuleError = HTTPValidationError;

/** Response List Dashboards */
export type ListDashboardsData = DashboardSummary[];

export type CreateDashboardData = DashboardResponse;

export type CreateDashboardError = HTTPValidationError;

export interface GetDashboardParams {
  /** Dashboard Id */
  dashboardId: string;
}

export type GetDashboardData = DashboardResponse;

export type GetDashboardError = HTTPValidationError;

export interface UpdateDashboardParams {
  /** Dashboard Id */
  dashboardId: string;
}

export type UpdateDashboardData = DashboardResponse;

export type UpdateDashboardError = HTTPValidationError;

export interface DeleteDashboardParams {
  /** Dashboard Id */
  dashboardId: string;
}

export type DeleteDashboardData = any;

export type DeleteDashboardError = HTTPValidationError;

export type CalculateVariancesData = VarianceAnalysisResponse;

export type CalculateVariancesError = HTTPValidationError;

export type GenerateVarianceNarrative2Data = AppApisVarianceAnalysisNarrativeResponse;

export type GenerateVarianceNarrative2Error = HTTPValidationError;

export type CreateCoaMappingData = CoAMapping;

export type CreateCoaMappingError = HTTPValidationError;

export interface GetCoaMappingParams {
  /** Mapping Id */
  mappingId: string;
}

export type GetCoaMappingData = CoAMapping;

export type GetCoaMappingError = HTTPValidationError;

export interface UpdateCoaMappingParams {
  /** Mapping Id */
  mappingId: string;
}

export type UpdateCoaMappingData = CoAMapping;

export type UpdateCoaMappingError = HTTPValidationError;

export interface DeleteCoaMappingParams {
  /** Mapping Id */
  mappingId: string;
}

export type DeleteCoaMappingData = any;

export type DeleteCoaMappingError = HTTPValidationError;

export interface ListCoaMappingsForOrganizationParams {
  /** Organization Id */
  organizationId: string;
}

export type ListCoaMappingsForOrganizationData = CoAMappingListResponse;

export type ListCoaMappingsForOrganizationError = HTTPValidationError;

/** Response Get Consolidated Financial Statements */
export type GetConsolidatedFinancialStatementsData = Record<string, any>;

export type GetConsolidatedFinancialStatementsError = HTTPValidationError;

export type RunConsolidationInternalTestData = ConsolidatedFinancials;

export type CalculateConsolidationData = ConsolidatedFinancials;

export type CalculateConsolidationError = HTTPValidationError;
