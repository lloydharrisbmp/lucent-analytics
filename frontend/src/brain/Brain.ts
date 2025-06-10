import {
  AccountForecastRequest,
  AddApplicationStepData,
  AddApplicationStepError,
  AddApplicationStepParams,
  AddConnectionData,
  AddConnectionError,
  AdvancedForecastRequest,
  AdvancedMonteCarloRequest,
  AdvancedSensitivityAnalysisRequest,
  AnalyzeEngineSensitivityData,
  AnalyzeEngineSensitivityError,
  AnalyzeScenarioSensitivity2Data,
  AnalyzeScenarioSensitivity2Error,
  AnalyzeScenarioSensitivityAdvancedData,
  AnalyzeScenarioSensitivityAdvancedError,
  AnalyzeScenarioSensitivityData,
  AnalyzeScenarioSensitivityEnhancedData,
  AnalyzeScenarioSensitivityEnhancedError,
  AnalyzeScenarioSensitivityError,
  AnalyzeScoreTrendsData,
  AnalyzeScoreTrendsError,
  AppApisCalculationEngineMonteCarloSimulationRequest,
  AppApisCalculationEngineSensitivityAnalysisRequest,
  AppApisNarrativeGenerationNarrativeRequest,
  AppApisScenarioAnalysisMonteCarloSimulationRequest,
  AppApisScenarioAnalysisSensitivityAnalysisRequest,
  AppApisScenarioCalculationEnhancedCalculateScenarioRequest,
  AppApisScenarioCalculationMonteCarloSimulationRequest,
  AppApisScenarioCalculationSensitivityAnalysisRequest,
  AppApisScenarioCalculatorEnhancedCalculateScenarioRequest,
  AppApisScenarioCalculatorMonteCarloSimulationRequest,
  AppApisScenarioCalculatorSensitivityAnalysisRequest,
  AppApisVarianceAnalysisNarrativeRequest,
  ApplicationStatusUpdate,
  ApplicationStep,
  ApplyScenarioData,
  ApplyScenarioError,
  ApplyScenarioParams,
  AssignRoleData,
  AssignRoleError,
  BASGenerationRequest,
  BASStatement,
  BenchmarkComparisonRequest,
  BoardReportingQuery,
  BodyUploadBenchmarkData,
  BodyUploadFinancialData,
  BodyUploadFinancialDataLegacy,
  BodyUploadFxRates,
  BodyUploadOrganizationFinancialData,
  BulkUpdateNotificationsData,
  BulkUpdateNotificationsError,
  BulkUpdateNotificationsParams,
  BulkUpdateNotificationsPayload,
  BusinessEntityCreateRequest,
  BusinessEntityValidationRequest,
  BusinessPlanData,
  CalculateCashFlowEndpointData,
  CalculateCashFlowEndpointError,
  CalculateCashFlowRequest,
  CalculateConsolidationData,
  CalculateConsolidationError,
  CalculateDetailedGstData,
  CalculateDetailedGstError,
  CalculateFinancialScoreData,
  CalculateFinancialScoreError,
  CalculateGstEndpointData,
  CalculateGstEndpointError,
  CalculateIncomeTaxData,
  CalculateIncomeTaxError,
  CalculateRelativePerformanceData,
  CalculateRelativePerformanceError,
  CalculateRoiForGrantData,
  CalculateRoiForGrantError,
  CalculateScenarioImpactV2Data,
  CalculateScenarioImpactV2Error,
  CalculateScenarioImpactV3Data,
  CalculateScenarioImpactV3Error,
  CalculateVariancesData,
  CalculateVariancesError,
  CashFlowData,
  CheckHealthData,
  CoAMappingCreatePayload,
  CoAMappingUpdatePayload,
  CoaCashFlowMappingsUpdate,
  CommentCreate,
  CommentUpdate,
  CompanyData,
  CompareBenchmarkVersionsData,
  CompareBenchmarkVersionsError,
  CompareBenchmarkVersionsParams,
  CompareGrantsData,
  CompareGrantsError,
  CompareWithBenchmarksData,
  CompareWithBenchmarksError,
  ConfirmDocumentUploadData,
  ConfirmDocumentUploadError,
  ConfirmDocumentUploadParams,
  ConnectionCreateInput,
  ConnectionUpdateInput,
  ConsolidationRequest,
  CreateAdvancedForecastData,
  CreateAdvancedForecastError,
  CreateApplicationData,
  CreateApplicationError,
  CreateApplicationRequest,
  CreateBasStatement2Data,
  CreateBasStatement2Error,
  CreateBasStatementData,
  CreateBasStatementError,
  CreateBenchmarkMetricDefinitionData,
  CreateBenchmarkMetricDefinitionError,
  CreateBenchmarkSourceData,
  CreateBenchmarkSourceError,
  CreateBudgetVersionData,
  CreateBudgetVersionError,
  CreateBudgetVersionParams,
  CreateBudgetVersionRequest,
  CreateBusinessEntity2Data,
  CreateBusinessEntity2Error,
  CreateBusinessEntity2Params,
  CreateBusinessEntity2Payload,
  CreateCheckoutSessionData,
  CreateCheckoutSessionError,
  CreateCheckoutSessionRequest,
  CreateCoaMappingData,
  CreateCoaMappingError,
  CreateCommentData,
  CreateCommentError,
  CreateDashboardData,
  CreateDashboardError,
  CreateDriverData,
  CreateDriverError,
  CreateEntityData,
  CreateEntityError,
  CreateForecastingRuleData,
  CreateForecastingRuleError,
  CreateGrantData,
  CreateGrantError,
  CreateMetricDefinitionPayload,
  CreateNotificationData,
  CreateNotificationError,
  CreatePortalSessionData,
  CreatePortalSessionError,
  CreateReportDefinitionData,
  CreateReportDefinitionError,
  CreateScenarioData,
  CreateScenarioError,
  CreateScrapeSourceData,
  CreateScrapeSourceError,
  CreateSimpleDriverBasedForecastData,
  CreateSimpleDriverBasedForecastError,
  CreateSourcePayload,
  CreateTaxPlanningScenario3Data,
  CreateTaxPlanningScenario3Error,
  CreateTaxPlanningScenarioData,
  CreateTaxPlanningScenarioError,
  CreateTaxPlanningScenarioV2Data,
  CreateTaxPlanningScenarioV2Error,
  CreateTaxReturn2Data,
  CreateTaxReturn2Error,
  CreateTaxReturnData,
  CreateTaxReturnError,
  DashboardCreate,
  DashboardUpdate,
  DeleteApplicationEndpointData,
  DeleteApplicationEndpointError,
  DeleteApplicationEndpointParams,
  DeleteApplicationStepData,
  DeleteApplicationStepError,
  DeleteApplicationStepParams,
  DeleteBenchmarkMetricDefinitionData,
  DeleteBenchmarkMetricDefinitionError,
  DeleteBenchmarkMetricDefinitionParams,
  DeleteBenchmarkSourceData,
  DeleteBenchmarkSourceError,
  DeleteBenchmarkSourceParams,
  DeleteBudgetVersionData,
  DeleteBudgetVersionParams,
  DeleteCoaMappingData,
  DeleteCoaMappingError,
  DeleteCoaMappingParams,
  DeleteCommentData,
  DeleteCommentError,
  DeleteCommentParams,
  DeleteConnectionData,
  DeleteConnectionError,
  DeleteConnectionParams,
  DeleteDashboardData,
  DeleteDashboardError,
  DeleteDashboardParams,
  DeleteDocumentData,
  DeleteDocumentError,
  DeleteDocumentParams,
  DeleteDriverData,
  DeleteDriverError,
  DeleteDriverParams,
  DeleteForecastingRuleData,
  DeleteForecastingRuleError,
  DeleteForecastingRuleParams,
  DeleteGrantData,
  DeleteGrantError,
  DeleteGrantParams,
  DeleteReportDefinitionData,
  DeleteReportDefinitionError,
  DeleteReportDefinitionParams,
  DeleteScenarioData,
  DeleteScenarioError,
  DeleteScenarioParams,
  DeleteScheduleData,
  DeleteScheduleError,
  DeleteScheduleParams,
  DeleteScrapeSourceData,
  DeleteScrapeSourceError,
  DeleteScrapeSourceParams,
  DetectComplianceAnomaliesData,
  DetectComplianceAnomaliesError,
  DetectTaxAnomaliesData,
  DetectTaxAnomaliesError,
  DismissNotificationData,
  DismissNotificationError,
  DismissNotificationParams,
  DocumentUploadRequest,
  DownloadReportData,
  DownloadReportError,
  DownloadReportParams,
  DriverCreate,
  DriverUpdate,
  EnhancedBASRequest,
  ExportReportData,
  ExportReportError,
  ExportRequest,
  FetchWidgetDataData,
  FetchWidgetDataError,
  ForecastAccountData,
  ForecastAccountError,
  ForecastRequest,
  ForecastScoreData,
  ForecastScoreError,
  GSTCalculationRequest,
  GenerateBasStatementData,
  GenerateBasStatementError,
  GenerateComplianceAlertsData,
  GenerateComplianceAlertsError,
  GenerateComplianceAlertsParams,
  GenerateDeadlineAlertsData,
  GenerateDeadlineAlertsError,
  GenerateDeadlineAlertsParams,
  GenerateInsightsData,
  GenerateInsightsError,
  GenerateRecommendationsData,
  GenerateRecommendationsError,
  GenerateReportData,
  GenerateReportError,
  GenerateReportRequest,
  GenerateStrategicRecommendationsData,
  GenerateStrategicRecommendationsError,
  GenerateVarianceNarrative2Data,
  GenerateVarianceNarrative2Error,
  GenerateVarianceNarrativeData,
  GenerateVarianceNarrativeError,
  GetApplicationData,
  GetApplicationError,
  GetApplicationParams,
  GetApplicationRequirementsData,
  GetApplicationRequirementsError,
  GetApplicationRequirementsParams,
  GetBenchmarkDataEndpointData,
  GetBenchmarkDataEndpointError,
  GetBenchmarkDataEndpointParams,
  GetBenchmarkDataSummaryData,
  GetBenchmarkDataSummaryError,
  GetBenchmarkDataSummaryParams,
  GetBenchmarkVersionsEndpointData,
  GetBenchmarkVersionsEndpointError,
  GetBenchmarkVersionsEndpointParams,
  GetBoardReportingBestPracticesData,
  GetBoardReportingBestPracticesError,
  GetBudgetVersionData,
  GetBudgetVersionError,
  GetBudgetVersionParams,
  GetBusinessEntity2Data,
  GetBusinessEntity2Error,
  GetBusinessEntity2Params,
  GetBusinessEntityData,
  GetBusinessEntityError,
  GetBusinessEntityParams,
  GetBusinessTypesData,
  GetCoaMappingData,
  GetCoaMappingError,
  GetCoaMappingParams,
  GetCoaMappingsData,
  GetCoaMappingsError,
  GetCoaMappingsParams,
  GetCommentsData,
  GetCommentsError,
  GetCommentsParams,
  GetConsolidatedFinancialStatementsData,
  GetConsolidatedFinancialStatementsError,
  GetContentPermissionsData,
  GetContentPermissionsError,
  GetContentPermissionsParams,
  GetDashboardData,
  GetDashboardError,
  GetDashboardParams,
  GetDataCollectionStrategyData,
  GetDriverData,
  GetDriverError,
  GetDriverParams,
  GetFailurePatternsData,
  GetFailurePatternsLegacyData,
  GetFinancialHealthIndicatorsData,
  GetFinancialHealthIndicatorsLegacyData,
  GetFinancialRatiosLegacyData,
  GetForecastingRuleData,
  GetForecastingRuleError,
  GetForecastingRuleParams,
  GetFundingTypesData,
  GetFxRatesData,
  GetFxRatesError,
  GetFxRatesParams,
  GetGovernanceMetricsData,
  GetGovernanceMetricsError,
  GetGrantCategoriesData,
  GetGrantData,
  GetGrantError,
  GetGrantParams,
  GetHistoricalRecommendationsData,
  GetHistoricalRecommendationsError,
  GetHistoricalRecommendationsParams,
  GetImport2Data,
  GetImport2Error,
  GetImport2Params,
  GetImportData,
  GetImportError,
  GetImportParams,
  GetIndustryBenchmarkByCodeData,
  GetIndustryBenchmarkByCodeError,
  GetIndustryBenchmarkByCodeLegacyData,
  GetIndustryBenchmarkByCodeLegacyError,
  GetIndustryBenchmarkByCodeLegacyParams,
  GetIndustryBenchmarkByCodeParams,
  GetIndustryBenchmarksData,
  GetIndustryBenchmarksLegacyData,
  GetIndustryListData,
  GetIndustryMetricsData,
  GetIndustryMetricsError,
  GetIndustryMetricsParams,
  GetIndustrySeasonalityData,
  GetIndustrySeasonalityError,
  GetIndustrySeasonalityParams,
  GetOrganizationSubscriptionData,
  GetOrganizationSubscriptionError,
  GetOrganizationSubscriptionParams,
  GetRatiosByCategoryData,
  GetRatiosByCategoryError,
  GetRatiosByCategoryLegacyData,
  GetRatiosByCategoryLegacyError,
  GetRatiosByCategoryLegacyParams,
  GetRatiosByCategoryParams,
  GetReportDefinitionData,
  GetReportDefinitionError,
  GetReportDefinitionParams,
  GetReportingStandardsData,
  GetReportingStandardsError,
  GetScenarioData,
  GetScenarioError,
  GetScenarioParams,
  GetScheduleData,
  GetScheduleError,
  GetScheduleParams,
  GetScrapeStatusData,
  GetStatesData,
  GetSubscriptionPlansData,
  GetTaxObligations2Data,
  GetTaxObligations2Error,
  GetTaxObligations2Params,
  GetTaxObligationsData,
  GetTaxObligationsError,
  GetTaxObligationsParams,
  GetUserPermissionsData,
  GetUserPermissionsError,
  GetUserPermissionsParams,
  GrantAccessData,
  GrantAccessError,
  GrantComparisonRequest,
  GrantCreateRequest,
  GrantMatchRequest,
  GrantUpdateRequest,
  ImportMappingRequest,
  ImportMyobTrialBalanceData,
  ImportMyobTrialBalanceError,
  InsightRequest,
  ListApplicationsData,
  ListApplicationsError,
  ListApplicationsParams,
  ListBenchmarkMetricDefinitionsData,
  ListBenchmarkSourcesData,
  ListBudgetVersionsData,
  ListBudgetVersionsError,
  ListBudgetVersionsParams,
  ListBusinessEntitiesData,
  ListBusinessPlansData,
  ListCoaMappingsForOrganizationData,
  ListCoaMappingsForOrganizationError,
  ListCoaMappingsForOrganizationParams,
  ListConnectionsData,
  ListDashboardsData,
  ListDocumentsData,
  ListDocumentsError,
  ListDocumentsParams,
  ListDriversData,
  ListDriversError,
  ListDriversParams,
  ListForecastingRulesData,
  ListForecastingRulesError,
  ListForecastingRulesParams,
  ListGrantsData,
  ListGrantsError,
  ListGrantsParams,
  ListImports2Data,
  ListImports2Error,
  ListImports2Params,
  ListImportsData,
  ListImportsError,
  ListImportsParams,
  ListNotificationsData,
  ListNotificationsError,
  ListNotificationsParams,
  ListReportDefinitionsData,
  ListScenariosData,
  ListSchedulesData,
  ListScopeRolesData,
  ListScopeRolesError,
  ListScopeRolesParams,
  ListScrapeSourcesData,
  ListUserRolesData,
  ListUserRolesError,
  ListUserRolesParams,
  LoadBusinessPlanData,
  LoadBusinessPlanError,
  LoadBusinessPlanParams,
  ManualDeliverReportData,
  ManualDeliverReportError,
  ManualDeliverReportParams,
  MarkNotificationReadData,
  MarkNotificationReadError,
  MarkNotificationReadParams,
  MatchGrantsData,
  MatchGrantsError,
  MetricsQuery,
  MyobTrialBalanceImportRequest,
  NotificationCreate,
  OptimizationRequest,
  OptimizeCashFlowData,
  OptimizeCashFlowError,
  OptimizeGrantStrategyData,
  OptimizeGrantStrategyError,
  PrepareDocumentUploadData,
  PrepareDocumentUploadError,
  PrepareDocumentUploadParams,
  ProcessFinancialDataData,
  ProcessFinancialDataError,
  PurgeOldAuditLogsData,
  QueryAuditLogsData,
  QueryAuditLogsError,
  QueryAuditLogsParams,
  ROICalculationRequest,
  RecommendationRequest,
  RelativePerformanceRequest,
  ReportDefinitionCreate,
  ReportFeedback,
  ReportingStandardsQuery,
  RevokeAccessData,
  RevokeAccessError,
  RevokeRoleData,
  RevokeRoleError,
  RevokeRoleRequest,
  RoleAssignmentCreate,
  RuleCreate,
  RuleUpdate,
  RunComplianceChecksData,
  RunComplianceChecksError,
  RunComplianceChecksPayload,
  RunConsolidationInternalTestData,
  RunMonteCarloSimulation2Data,
  RunMonteCarloSimulation2Error,
  RunMonteCarloSimulationAdvancedData,
  RunMonteCarloSimulationAdvancedError,
  RunMonteCarloSimulationData,
  RunMonteCarloSimulationEnhancedData,
  RunMonteCarloSimulationEnhancedError,
  RunMonteCarloSimulationError,
  RunScenarioMonteCarloSimulationData,
  RunScenarioMonteCarloSimulationError,
  SaveBusinessPlanData,
  SaveBusinessPlanError,
  ScenarioApplyRequest,
  ScenarioCreate,
  ScenarioResponseRequest,
  ScenarioUpdate,
  ScheduleReportData,
  ScheduleReportError,
  ScheduleRequest,
  ScrapeGrantsData,
  ScrapeGrantsError,
  ScrapeRequest,
  ScrapeSource,
  ShareActionRequest,
  SimpleForecastRequest,
  StepStatusUpdate,
  StripeWebhookData,
  StripeWebhookError,
  SubmitFeedbackData,
  SubmitFeedbackError,
  SubscriptionPortalRequest,
  TaxCalculationRequest,
  TaxObligationValidationRequest,
  TaxPlanningRequest,
  TaxPlanningScenario,
  TaxReturnInput,
  TaxReturnRequest,
  TestConnectionData,
  TestConnectionError,
  TestConnectionParams,
  TimeSeriesData,
  TrendAnalysisRequest,
  UpdateApplicationData,
  UpdateApplicationError,
  UpdateApplicationParams,
  UpdateApplicationStepData,
  UpdateApplicationStepError,
  UpdateApplicationStepParams,
  UpdateBenchmarkDataData,
  UpdateBenchmarkDataError,
  UpdateBenchmarkMetricDefinitionData,
  UpdateBenchmarkMetricDefinitionError,
  UpdateBenchmarkMetricDefinitionParams,
  UpdateBenchmarkRequest,
  UpdateBenchmarkSourceData,
  UpdateBenchmarkSourceError,
  UpdateBenchmarkSourceParams,
  UpdateBudgetVersionData,
  UpdateBudgetVersionError,
  UpdateBudgetVersionParams,
  UpdateBudgetVersionRequest,
  UpdateBusinessEntityData,
  UpdateBusinessEntityError,
  UpdateBusinessEntityParams,
  UpdateCoaMappingData,
  UpdateCoaMappingError,
  UpdateCoaMappingParams,
  UpdateCoaMappingsData,
  UpdateCoaMappingsError,
  UpdateCoaMappingsParams,
  UpdateCommentData,
  UpdateCommentError,
  UpdateCommentParams,
  UpdateConnectionData,
  UpdateConnectionError,
  UpdateConnectionParams,
  UpdateDashboardData,
  UpdateDashboardError,
  UpdateDashboardParams,
  UpdateDriverData,
  UpdateDriverError,
  UpdateDriverParams,
  UpdateForecastingRuleData,
  UpdateForecastingRuleError,
  UpdateForecastingRuleParams,
  UpdateGrantData,
  UpdateGrantError,
  UpdateGrantParams,
  UpdateMetricDefinitionPayload,
  UpdateReportDefinitionData,
  UpdateReportDefinitionError,
  UpdateReportDefinitionParams,
  UpdateScenarioData,
  UpdateScenarioError,
  UpdateScenarioParams,
  UpdateScheduleData,
  UpdateScheduleError,
  UpdateScheduleParams,
  UpdateScheduleRequest,
  UpdateScrapeSourceData,
  UpdateScrapeSourceError,
  UpdateScrapeSourceParams,
  UpdateSourcePayload,
  UploadBenchmarkDataData,
  UploadBenchmarkDataError,
  UploadFinancialDataData,
  UploadFinancialDataError,
  UploadFinancialDataLegacyData,
  UploadFinancialDataLegacyError,
  UploadFinancialDataLegacyParams,
  UploadFinancialDataParams,
  UploadFxRatesData,
  UploadFxRatesError,
  UploadOrganizationFinancialDataData,
  UploadOrganizationFinancialDataError,
  ValidateBusinessEntityData,
  ValidateBusinessEntityError,
  ValidateTaxObligationsData,
  ValidateTaxObligationsError,
  VarianceAnalysisRequest,
  WidgetConfiguration,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a tax return for a business entity with entity-specific calculations
   *
   * @tags dbtn/module:tax_returns, dbtn/hasAuth
   * @name create_tax_return2
   * @summary Create Tax Return2
   * @request POST:/routes/tax-returns/create-tax-return
   */
  create_tax_return2 = (data: TaxReturnRequest, params: RequestParams = {}) =>
    this.request<CreateTaxReturn2Data, CreateTaxReturn2Error>({
      path: `/routes/tax-returns/create-tax-return`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create an advanced tax planning scenario with entity-specific optimizations
   *
   * @tags dbtn/module:tax_returns, dbtn/hasAuth
   * @name create_tax_planning_scenario3
   * @summary Create Tax Planning Scenario3
   * @request POST:/routes/tax-planning/create-scenario3
   */
  create_tax_planning_scenario3 = (data: TaxReturnRequest, params: RequestParams = {}) =>
    this.request<CreateTaxPlanningScenario3Data, CreateTaxPlanningScenario3Error>({
      path: `/routes/tax-planning/create-scenario3`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Calculate income tax for a business entity
   *
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name calculate_income_tax
   * @summary Calculate Income Tax
   * @request POST:/routes/calculate-income-tax
   */
  calculate_income_tax = (data: TaxCalculationRequest, params: RequestParams = {}) =>
    this.request<CalculateIncomeTaxData, CalculateIncomeTaxError>({
      path: `/routes/calculate-income-tax`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Calculate GST for a business entity
   *
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name calculate_gst_endpoint
   * @summary Calculate Gst Endpoint
   * @request POST:/routes/calculate-gst
   */
  calculate_gst_endpoint = (data: GSTCalculationRequest, params: RequestParams = {}) =>
    this.request<CalculateGstEndpointData, CalculateGstEndpointError>({
      path: `/routes/calculate-gst`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a BAS statement for a business entity
   *
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name generate_bas_statement
   * @summary Generate Bas Statement
   * @request POST:/routes/generate-bas
   */
  generate_bas_statement = (data: BASGenerationRequest, params: RequestParams = {}) =>
    this.request<GenerateBasStatementData, GenerateBasStatementError>({
      path: `/routes/generate-bas`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a tax planning scenario for a business entity
   *
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name create_tax_planning_scenario_v2
   * @summary Create Tax Planning Scenario V2
   * @request POST:/routes/tax-planning/create-scenario
   */
  create_tax_planning_scenario_v2 = (data: TaxPlanningRequest, params: RequestParams = {}) =>
    this.request<CreateTaxPlanningScenarioV2Data, CreateTaxPlanningScenarioV2Error>({
      path: `/routes/tax-planning/create-scenario`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate an enhanced BAS statement with detailed breakdown
   *
   * @tags dbtn/module:tax_obligations, dbtn/hasAuth
   * @name create_bas_statement2
   * @summary Create Bas Statement2
   * @request POST:/routes/bas/create-statement
   */
  create_bas_statement2 = (data: EnhancedBASRequest, params: RequestParams = {}) =>
    this.request<CreateBasStatement2Data, CreateBasStatement2Error>({
      path: `/routes/bas/create-statement`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get tax obligations for an entity for a specific year
   *
   * @tags dbtn/module:tax_obligations, dbtn/hasAuth
   * @name get_tax_obligations2
   * @summary Get Tax Obligations2
   * @request GET:/routes/tax-obligations
   */
  get_tax_obligations2 = (query: GetTaxObligations2Params, params: RequestParams = {}) =>
    this.request<GetTaxObligations2Data, GetTaxObligations2Error>({
      path: `/routes/tax-obligations`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Calculate detailed GST breakdown for BAS
   *
   * @tags dbtn/module:tax_obligations, dbtn/hasAuth
   * @name calculate_detailed_gst
   * @summary Calculate Detailed Gst
   * @request POST:/routes/bas/calculate-gst
   */
  calculate_detailed_gst = (data: EnhancedBASRequest, params: RequestParams = {}) =>
    this.request<CalculateDetailedGstData, CalculateDetailedGstError>({
      path: `/routes/bas/calculate-gst`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get seasonality patterns for a specific Australian industry
   *
   * @tags dbtn/module:seasonality, dbtn/hasAuth
   * @name get_industry_seasonality
   * @summary Get Industry Seasonality
   * @request GET:/routes/seasonality/{industry}
   */
  get_industry_seasonality = ({ industry, ...query }: GetIndustrySeasonalityParams, params: RequestParams = {}) =>
    this.request<GetIndustrySeasonalityData, GetIndustrySeasonalityError>({
      path: `/routes/seasonality/${industry}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:advanced_forecasting, dbtn/hasAuth
   * @name create_advanced_forecast
   * @summary Create Advanced Forecast
   * @request POST:/routes/advanced-forecast
   */
  create_advanced_forecast = (data: AdvancedForecastRequest, params: RequestParams = {}) =>
    this.request<CreateAdvancedForecastData, CreateAdvancedForecastError>({
      path: `/routes/advanced-forecast`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate cash flow optimization recommendations
   *
   * @tags dbtn/module:cash_flow_recommendations, dbtn/hasAuth
   * @name optimize_cash_flow
   * @summary Optimize Cash Flow
   * @request POST:/routes/optimize
   */
  optimize_cash_flow = (data: CashFlowData, params: RequestParams = {}) =>
    this.request<OptimizeCashFlowData, OptimizeCashFlowError>({
      path: `/routes/optimize`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get historical cash flow recommendations for a company
   *
   * @tags dbtn/module:cash_flow_recommendations, dbtn/hasAuth
   * @name get_historical_recommendations
   * @summary Get Historical Recommendations
   * @request GET:/routes/historical/{company_id}
   */
  get_historical_recommendations = (
    { companyId, ...query }: GetHistoricalRecommendationsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetHistoricalRecommendationsData, GetHistoricalRecommendationsError>({
      path: `/routes/historical/${companyId}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:scenario_calculator, dbtn/hasAuth
   * @name analyze_scenario_sensitivity2
   * @summary Analyze Scenario Sensitivity2
   * @request POST:/routes/scenario-sensitivity-analysis
   */
  analyze_scenario_sensitivity2 = (
    data: AppApisScenarioCalculatorSensitivityAnalysisRequest,
    params: RequestParams = {},
  ) =>
    this.request<AnalyzeScenarioSensitivity2Data, AnalyzeScenarioSensitivity2Error>({
      path: `/routes/scenario-sensitivity-analysis`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:scenario_calculator, dbtn/hasAuth
   * @name run_monte_carlo_simulation2
   * @summary Run Monte Carlo Simulation2
   * @request POST:/routes/scenario-monte-carlo-simulation
   */
  run_monte_carlo_simulation2 = (
    data: AppApisScenarioCalculatorMonteCarloSimulationRequest,
    params: RequestParams = {},
  ) =>
    this.request<RunMonteCarloSimulation2Data, RunMonteCarloSimulation2Error>({
      path: `/routes/scenario-monte-carlo-simulation`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:scenario_calculator, dbtn/hasAuth
   * @name calculate_scenario_impact_v3
   * @summary Calculate Scenario Impact V3
   * @request POST:/routes/calculate-scenario-impact-v3
   */
  calculate_scenario_impact_v3 = (
    data: AppApisScenarioCalculatorEnhancedCalculateScenarioRequest,
    params: RequestParams = {},
  ) =>
    this.request<CalculateScenarioImpactV3Data, CalculateScenarioImpactV3Error>({
      path: `/routes/calculate-scenario-impact-v3`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List government grants and incentives with optional filtering
   *
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name list_grants
   * @summary List Grants
   * @request GET:/routes/grants
   */
  list_grants = (query: ListGrantsParams, params: RequestParams = {}) =>
    this.request<ListGrantsData, ListGrantsError>({
      path: `/routes/grants`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new grant in the database
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name create_grant
   * @summary Create Grant
   * @request POST:/routes/grants
   */
  create_grant = (data: GrantCreateRequest, params: RequestParams = {}) =>
    this.request<CreateGrantData, CreateGrantError>({
      path: `/routes/grants`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get detailed information about a specific grant
   *
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_grant
   * @summary Get Grant
   * @request GET:/routes/grants/{grant_id}
   */
  get_grant = ({ grantId, ...query }: GetGrantParams, params: RequestParams = {}) =>
    this.request<GetGrantData, GetGrantError>({
      path: `/routes/grants/${grantId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an existing grant in the database
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name update_grant
   * @summary Update Grant
   * @request PUT:/routes/grants/{grant_id}
   */
  update_grant = ({ grantId, ...query }: UpdateGrantParams, data: GrantUpdateRequest, params: RequestParams = {}) =>
    this.request<UpdateGrantData, UpdateGrantError>({
      path: `/routes/grants/${grantId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a grant from the database
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name delete_grant
   * @summary Delete Grant
   * @request DELETE:/routes/grants/{grant_id}
   */
  delete_grant = ({ grantId, ...query }: DeleteGrantParams, params: RequestParams = {}) =>
    this.request<DeleteGrantData, DeleteGrantError>({
      path: `/routes/grants/${grantId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get a list of all grant categories
   *
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_grant_categories
   * @summary Get Grant Categories
   * @request GET:/routes/grants/categories
   */
  get_grant_categories = (params: RequestParams = {}) =>
    this.request<GetGrantCategoriesData, any>({
      path: `/routes/grants/categories`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a list of all business types eligible for grants
   *
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_business_types
   * @summary Get Business Types
   * @request GET:/routes/grants/business-types
   */
  get_business_types = (params: RequestParams = {}) =>
    this.request<GetBusinessTypesData, any>({
      path: `/routes/grants/business-types`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a list of all states with grants
   *
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_states
   * @summary Get States
   * @request GET:/routes/grants/states
   */
  get_states = (params: RequestParams = {}) =>
    this.request<GetStatesData, any>({
      path: `/routes/grants/states`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a list of all funding types
   *
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_funding_types
   * @summary Get Funding Types
   * @request GET:/routes/grants/funding-types
   */
  get_funding_types = (params: RequestParams = {}) =>
    this.request<GetFundingTypesData, any>({
      path: `/routes/grants/funding-types`,
      method: "GET",
      ...params,
    });

  /**
   * @description Perform sensitivity analysis on a scenario
   *
   * @tags dbtn/module:calculation_engine, dbtn/hasAuth
   * @name analyze_engine_sensitivity
   * @summary Analyze Engine Sensitivity
   * @request POST:/routes/calculation-engine/analyze-sensitivity
   */
  analyze_engine_sensitivity = (data: AppApisCalculationEngineSensitivityAnalysisRequest, params: RequestParams = {}) =>
    this.request<AnalyzeEngineSensitivityData, AnalyzeEngineSensitivityError>({
      path: `/routes/calculation-engine/analyze-sensitivity`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Run Monte Carlo simulation on a scenario without enhancement
   *
   * @tags dbtn/module:calculation_engine, dbtn/hasAuth
   * @name run_monte_carlo_simulation
   * @summary Run Monte Carlo Simulation
   * @request POST:/routes/calculation-engine/run-monte-carlo
   */
  run_monte_carlo_simulation = (
    data: AppApisCalculationEngineMonteCarloSimulationRequest,
    params: RequestParams = {},
  ) =>
    this.request<RunMonteCarloSimulationData, RunMonteCarloSimulationError>({
      path: `/routes/calculation-engine/run-monte-carlo`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Run an advanced Monte Carlo simulation for financial scenario analysis
   *
   * @tags dbtn/module:scenario_analysis, dbtn/hasAuth
   * @name run_monte_carlo_simulation_enhanced
   * @summary Run Monte Carlo Simulation Enhanced
   * @request POST:/routes/run-monte-carlo-simulation-enhanced
   */
  run_monte_carlo_simulation_enhanced = (
    data: AppApisScenarioAnalysisMonteCarloSimulationRequest,
    params: RequestParams = {},
  ) =>
    this.request<RunMonteCarloSimulationEnhancedData, RunMonteCarloSimulationEnhancedError>({
      path: `/routes/run-monte-carlo-simulation-enhanced`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Analyze the sensitivity of scenario outcomes to parameter changes - optimized for UI integration
   *
   * @tags dbtn/module:scenario_analysis, dbtn/hasAuth
   * @name analyze_scenario_sensitivity_enhanced
   * @summary Analyze Scenario Sensitivity Enhanced
   * @request POST:/routes/analyze-scenario-sensitivity2
   */
  analyze_scenario_sensitivity_enhanced = (
    data: AppApisScenarioAnalysisSensitivityAnalysisRequest,
    params: RequestParams = {},
  ) =>
    this.request<AnalyzeScenarioSensitivityEnhancedData, AnalyzeScenarioSensitivityEnhancedError>({
      path: `/routes/analyze-scenario-sensitivity2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Match a business profile with suitable grants and return scored matches
   *
   * @tags dbtn/module:grant_matcher, dbtn/hasAuth
   * @name match_grants
   * @summary Match Grants
   * @request POST:/routes/match-grants
   */
  match_grants = (data: GrantMatchRequest, params: RequestParams = {}) =>
    this.request<MatchGrantsData, MatchGrantsError>({
      path: `/routes/match-grants`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Start a background task to scrape government websites for grants
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name scrape_grants
   * @summary Scrape Grants
   * @request POST:/routes/grants/scrape
   */
  scrape_grants = (data: ScrapeRequest, params: RequestParams = {}) =>
    this.request<ScrapeGrantsData, ScrapeGrantsError>({
      path: `/routes/grants/scrape`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the status of recent scraping operations
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name get_scrape_status
   * @summary Get Scrape Status
   * @request GET:/routes/grants/scrape/status
   */
  get_scrape_status = (params: RequestParams = {}) =>
    this.request<GetScrapeStatusData, any>({
      path: `/routes/grants/scrape/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all available scraping sources
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name list_scrape_sources
   * @summary List Scrape Sources
   * @request GET:/routes/grants/scrape/sources
   */
  list_scrape_sources = (params: RequestParams = {}) =>
    this.request<ListScrapeSourcesData, any>({
      path: `/routes/grants/scrape/sources`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new scraping source
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name create_scrape_source
   * @summary Create Scrape Source
   * @request POST:/routes/grants/scrape/sources
   */
  create_scrape_source = (data: ScrapeSource, params: RequestParams = {}) =>
    this.request<CreateScrapeSourceData, CreateScrapeSourceError>({
      path: `/routes/grants/scrape/sources`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a scraping source
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name update_scrape_source
   * @summary Update Scrape Source
   * @request PUT:/routes/grants/scrape/sources/{source_id}
   */
  update_scrape_source = (
    { sourceId, ...query }: UpdateScrapeSourceParams,
    data: ScrapeSource,
    params: RequestParams = {},
  ) =>
    this.request<UpdateScrapeSourceData, UpdateScrapeSourceError>({
      path: `/routes/grants/scrape/sources/${sourceId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a scraping source
   *
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name delete_scrape_source
   * @summary Delete Scrape Source
   * @request DELETE:/routes/grants/scrape/sources/{source_id}
   */
  delete_scrape_source = ({ sourceId, ...query }: DeleteScrapeSourceParams, params: RequestParams = {}) =>
    this.request<DeleteScrapeSourceData, DeleteScrapeSourceError>({
      path: `/routes/grants/scrape/sources/${sourceId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Create a new grant application
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name create_application
   * @summary Create Application
   * @request POST:/routes/applications
   */
  create_application = (data: CreateApplicationRequest, params: RequestParams = {}) =>
    this.request<CreateApplicationData, CreateApplicationError>({
      path: `/routes/applications`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all applications for a user
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name list_applications
   * @summary List Applications
   * @request GET:/routes/applications
   */
  list_applications = (query: ListApplicationsParams, params: RequestParams = {}) =>
    this.request<ListApplicationsData, ListApplicationsError>({
      path: `/routes/applications`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific application
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name get_application
   * @summary Get Application
   * @request GET:/routes/applications/{application_id}
   */
  get_application = ({ applicationId, ...query }: GetApplicationParams, params: RequestParams = {}) =>
    this.request<GetApplicationData, GetApplicationError>({
      path: `/routes/applications/${applicationId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an application status
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name update_application
   * @summary Update Application
   * @request PUT:/routes/applications/{application_id}
   */
  update_application = (
    { applicationId, ...query }: UpdateApplicationParams,
    data: ApplicationStatusUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateApplicationData, UpdateApplicationError>({
      path: `/routes/applications/${applicationId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete an application
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name delete_application_endpoint
   * @summary Delete Application Endpoint
   * @request DELETE:/routes/applications/{application_id}
   */
  delete_application_endpoint = (
    { applicationId, ...query }: DeleteApplicationEndpointParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteApplicationEndpointData, DeleteApplicationEndpointError>({
      path: `/routes/applications/${applicationId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Update an application step
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name update_application_step
   * @summary Update Application Step
   * @request PUT:/routes/applications/{application_id}/steps/{step_id}
   */
  update_application_step = (
    { applicationId, stepId, ...query }: UpdateApplicationStepParams,
    data: StepStatusUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateApplicationStepData, UpdateApplicationStepError>({
      path: `/routes/applications/${applicationId}/steps/${stepId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a step from an application
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name delete_application_step
   * @summary Delete Application Step
   * @request DELETE:/routes/applications/{application_id}/steps/{step_id}
   */
  delete_application_step = (
    { applicationId, stepId, ...query }: DeleteApplicationStepParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteApplicationStepData, DeleteApplicationStepError>({
      path: `/routes/applications/${applicationId}/steps/${stepId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Add a new step to an application
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name add_application_step
   * @summary Add Application Step
   * @request POST:/routes/applications/{application_id}/steps
   */
  add_application_step = (
    { applicationId, ...query }: AddApplicationStepParams,
    data: ApplicationStep,
    params: RequestParams = {},
  ) =>
    this.request<AddApplicationStepData, AddApplicationStepError>({
      path: `/routes/applications/${applicationId}/steps`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Prepare for document upload and return upload URL
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name prepare_document_upload
   * @summary Prepare Document Upload
   * @request POST:/routes/applications/{application_id}/documents
   */
  prepare_document_upload = (
    { applicationId, ...query }: PrepareDocumentUploadParams,
    data: DocumentUploadRequest,
    params: RequestParams = {},
  ) =>
    this.request<PrepareDocumentUploadData, PrepareDocumentUploadError>({
      path: `/routes/applications/${applicationId}/documents`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List documents for an application or step
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/applications/{application_id}/documents
   */
  list_documents = ({ applicationId, ...query }: ListDocumentsParams, params: RequestParams = {}) =>
    this.request<ListDocumentsData, ListDocumentsError>({
      path: `/routes/applications/${applicationId}/documents`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Confirm document upload and add to the application
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name confirm_document_upload
   * @summary Confirm Document Upload
   * @request POST:/routes/applications/{application_id}/documents/{document_id}/confirm
   */
  confirm_document_upload = (
    { applicationId, documentId, ...query }: ConfirmDocumentUploadParams,
    data: DocumentUploadRequest,
    params: RequestParams = {},
  ) =>
    this.request<ConfirmDocumentUploadData, ConfirmDocumentUploadError>({
      path: `/routes/applications/${applicationId}/documents/${documentId}/confirm`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a document from an application or step
   *
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/applications/{application_id}/documents/{document_id}
   */
  delete_document = ({ applicationId, documentId, ...query }: DeleteDocumentParams, params: RequestParams = {}) =>
    this.request<DeleteDocumentData, DeleteDocumentError>({
      path: `/routes/applications/${applicationId}/documents/${documentId}`,
      method: "DELETE",
      query: query,
      ...params,
    });

  /**
   * @description Calculate the ROI for a specific grant application
   *
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name calculate_roi_for_grant
   * @summary Calculate Roi For Grant
   * @request POST:/routes/grant-roi-calculator/calculate
   */
  calculate_roi_for_grant = (data: ROICalculationRequest, params: RequestParams = {}) =>
    this.request<CalculateRoiForGrantData, CalculateRoiForGrantError>({
      path: `/routes/grant-roi-calculator/calculate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Compare ROI and other metrics for multiple grants
   *
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name compare_grants
   * @summary Compare Grants
   * @request POST:/routes/grant-roi-calculator/compare
   */
  compare_grants = (data: GrantComparisonRequest, params: RequestParams = {}) =>
    this.request<CompareGrantsData, CompareGrantsError>({
      path: `/routes/grant-roi-calculator/compare`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Optimize grant application strategy based on constraints and preferences
   *
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name optimize_grant_strategy
   * @summary Optimize Grant Strategy
   * @request POST:/routes/grant-roi-calculator/optimize
   */
  optimize_grant_strategy = (data: OptimizationRequest, params: RequestParams = {}) =>
    this.request<OptimizeGrantStrategyData, OptimizeGrantStrategyError>({
      path: `/routes/grant-roi-calculator/optimize`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get detailed workload and requirements breakdown for a grant application
   *
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name get_application_requirements
   * @summary Get Application Requirements
   * @request GET:/routes/grant-roi-calculator/requirements/{grant_id}
   */
  get_application_requirements = (
    { grantId, ...query }: GetApplicationRequirementsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetApplicationRequirementsData, GetApplicationRequirementsError>({
      path: `/routes/grant-roi-calculator/requirements/${grantId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get comprehensive Australian financial health indicators including ratios, benchmarks, and failure patterns.
   *
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_financial_health_indicators
   * @summary Get Financial Health Indicators
   * @request GET:/routes/financial-health-indicators
   */
  get_financial_health_indicators = (params: RequestParams = {}) =>
    this.request<GetFinancialHealthIndicatorsData, any>({
      path: `/routes/financial-health-indicators`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get financial ratios filtered by category.
   *
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_ratios_by_category
   * @summary Get Ratios By Category
   * @request GET:/routes/financial-ratios-by-category/{category}
   */
  get_ratios_by_category = ({ category, ...query }: GetRatiosByCategoryParams, params: RequestParams = {}) =>
    this.request<GetRatiosByCategoryData, GetRatiosByCategoryError>({
      path: `/routes/financial-ratios-by-category/${category}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get common business failure patterns in Australian businesses.
   *
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_failure_patterns
   * @summary Get Failure Patterns
   * @request GET:/routes/financial-failure-patterns
   */
  get_failure_patterns = (params: RequestParams = {}) =>
    this.request<GetFailurePatternsData, any>({
      path: `/routes/financial-failure-patterns`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get financial benchmarks for Australian industries by business size.
   *
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_industry_benchmarks
   * @summary Get Industry Benchmarks
   * @request GET:/routes/industry-benchmarks
   */
  get_industry_benchmarks = (params: RequestParams = {}) =>
    this.request<GetIndustryBenchmarksData, any>({
      path: `/routes/industry-benchmarks`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get financial benchmarks for a specific Australian industry by code.
   *
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_industry_benchmark_by_code
   * @summary Get Industry Benchmark By Code
   * @request GET:/routes/industry-benchmark/{industry_code}
   */
  get_industry_benchmark_by_code = (
    { industryCode, ...query }: GetIndustryBenchmarkByCodeParams,
    params: RequestParams = {},
  ) =>
    this.request<GetIndustryBenchmarkByCodeData, GetIndustryBenchmarkByCodeError>({
      path: `/routes/industry-benchmark/${industryCode}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get financial health indicators for Australian businesses (legacy endpoint)
   *
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_financial_health_indicators_legacy
   * @summary Get Financial Health Indicators Legacy
   * @request GET:/routes/financial-health-indicators-legacy
   */
  get_financial_health_indicators_legacy = (params: RequestParams = {}) =>
    this.request<GetFinancialHealthIndicatorsLegacyData, any>({
      path: `/routes/financial-health-indicators-legacy`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get financial ratios and their benchmarks (legacy endpoint)
   *
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_financial_ratios_legacy
   * @summary Get Financial Ratios Legacy
   * @request GET:/routes/financial-ratios-legacy
   */
  get_financial_ratios_legacy = (params: RequestParams = {}) =>
    this.request<GetFinancialRatiosLegacyData, any>({
      path: `/routes/financial-ratios-legacy`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get common business failure patterns and warning signs (legacy endpoint)
   *
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_failure_patterns_legacy
   * @summary Get Failure Patterns Legacy
   * @request GET:/routes/failure-patterns-legacy
   */
  get_failure_patterns_legacy = (params: RequestParams = {}) =>
    this.request<GetFailurePatternsLegacyData, any>({
      path: `/routes/failure-patterns-legacy`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get industry benchmarks by business size (legacy endpoint)
   *
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_industry_benchmarks_legacy
   * @summary Get Industry Benchmarks Legacy
   * @request GET:/routes/industry-benchmarks-legacy
   */
  get_industry_benchmarks_legacy = (params: RequestParams = {}) =>
    this.request<GetIndustryBenchmarksLegacyData, any>({
      path: `/routes/industry-benchmarks-legacy`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get industry benchmarks for a specific industry code (legacy endpoint)
   *
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_industry_benchmark_by_code_legacy
   * @summary Get Industry Benchmark By Code Legacy
   * @request GET:/routes/industry-benchmarks-legacy/{industry_code}
   */
  get_industry_benchmark_by_code_legacy = (
    { industryCode, ...query }: GetIndustryBenchmarkByCodeLegacyParams,
    params: RequestParams = {},
  ) =>
    this.request<GetIndustryBenchmarkByCodeLegacyData, GetIndustryBenchmarkByCodeLegacyError>({
      path: `/routes/industry-benchmarks-legacy/${industryCode}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get financial ratios by category (Profitability, Liquidity, Leverage, Efficiency) (legacy endpoint)
   *
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_ratios_by_category_legacy
   * @summary Get Ratios By Category Legacy
   * @request GET:/routes/financial-ratios-legacy/{category}
   */
  get_ratios_by_category_legacy = (
    { category, ...query }: GetRatiosByCategoryLegacyParams,
    params: RequestParams = {},
  ) =>
    this.request<GetRatiosByCategoryLegacyData, GetRatiosByCategoryLegacyError>({
      path: `/routes/financial-ratios-legacy/${category}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Calculate financial health score based on company metrics
   *
   * @tags dbtn/module:financial_scoring, dbtn/hasAuth
   * @name calculate_financial_score
   * @summary Calculate Financial Score
   * @request POST:/routes/calculate-financial-score
   */
  calculate_financial_score = (data: CompanyData, params: RequestParams = {}) =>
    this.request<CalculateFinancialScoreData, CalculateFinancialScoreError>({
      path: `/routes/calculate-financial-score`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Analyze trends in financial health scores over time
   *
   * @tags dbtn/module:financial_scoring, dbtn/hasAuth
   * @name analyze_score_trends
   * @summary Analyze Score Trends
   * @request POST:/routes/trend-analysis
   */
  analyze_score_trends = (data: TrendAnalysisRequest, params: RequestParams = {}) =>
    this.request<AnalyzeScoreTrendsData, AnalyzeScoreTrendsError>({
      path: `/routes/trend-analysis`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Calculate company performance relative to industry benchmarks with cross-industry normalization
   *
   * @tags dbtn/module:financial_scoring, dbtn/hasAuth
   * @name calculate_relative_performance
   * @summary Calculate Relative Performance
   * @request POST:/routes/relative-performance
   */
  calculate_relative_performance = (data: RelativePerformanceRequest, params: RequestParams = {}) =>
    this.request<CalculateRelativePerformanceData, CalculateRelativePerformanceError>({
      path: `/routes/relative-performance`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate prioritized recommendations based on financial health assessment
   *
   * @tags dbtn/module:recommendation_engine, dbtn/hasAuth
   * @name generate_recommendations
   * @summary Generate Recommendations
   * @request POST:/routes/generate-financial-recommendations
   */
  generate_recommendations = (data: RecommendationRequest, params: RequestParams = {}) =>
    this.request<GenerateRecommendationsData, GenerateRecommendationsError>({
      path: `/routes/generate-financial-recommendations`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve Australian reporting standards based on entity type, size, and standard type.
   *
   * @tags dbtn/module:reporting_standards, dbtn/hasAuth
   * @name get_reporting_standards
   * @summary Get Reporting Standards
   * @request POST:/routes/get-reporting-standards
   */
  get_reporting_standards = (data: ReportingStandardsQuery, params: RequestParams = {}) =>
    this.request<GetReportingStandardsData, GetReportingStandardsError>({
      path: `/routes/get-reporting-standards`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve best practices for board reporting in Australia based on industry, entity size, type, and report type.
   *
   * @tags dbtn/module:board_reporting, dbtn/hasAuth
   * @name get_board_reporting_best_practices
   * @summary Get Board Reporting Best Practices
   * @request POST:/routes/best-practices
   */
  get_board_reporting_best_practices = (data: BoardReportingQuery, params: RequestParams = {}) =>
    this.request<GetBoardReportingBestPracticesData, GetBoardReportingBestPracticesError>({
      path: `/routes/best-practices`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve key governance and reporting metrics based on entity type, size, industry, and governance area.
   *
   * @tags dbtn/module:governance_metrics, dbtn/hasAuth
   * @name get_governance_metrics
   * @summary Get Governance Metrics
   * @request POST:/routes/key-metrics
   */
  get_governance_metrics = (data: MetricsQuery, params: RequestParams = {}) =>
    this.request<GetGovernanceMetricsData, GetGovernanceMetricsError>({
      path: `/routes/key-metrics`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate insights from financial metrics.
   *
   * @tags dbtn/module:financial_insights, dbtn/hasAuth
   * @name generate_insights
   * @summary Generate Insights
   * @request POST:/routes/generate-insights
   */
  generate_insights = (data: InsightRequest, params: RequestParams = {}) =>
    this.request<GenerateInsightsData, GenerateInsightsError>({
      path: `/routes/generate-insights`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Saves a new version of the business plan to Firestore for the logged-in user. Each save creates a new document, providing basic versioning. (Temporarily Disabled)
   *
   * @tags Business Plans, dbtn/module:business_plans, dbtn/hasAuth
   * @name save_business_plan
   * @summary Save Business Plan
   * @request POST:/routes/business-plans/save
   */
  save_business_plan = (data: BusinessPlanData, params: RequestParams = {}) =>
    this.request<SaveBusinessPlanData, SaveBusinessPlanError>({
      path: `/routes/business-plans/save`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lists all saved business plans (metadata only) for the logged-in user, ordered by last saved date descending. (Temporarily Disabled)
   *
   * @tags Business Plans, dbtn/module:business_plans, dbtn/hasAuth
   * @name list_business_plans
   * @summary List Business Plans
   * @request GET:/routes/business-plans/list
   */
  list_business_plans = (params: RequestParams = {}) =>
    this.request<ListBusinessPlansData, any>({
      path: `/routes/business-plans/list`,
      method: "GET",
      ...params,
    });

  /**
   * @description Loads the full data for a specific business plan belonging to the logged-in user. (Temporarily Disabled)
   *
   * @tags Business Plans, dbtn/module:business_plans, dbtn/hasAuth
   * @name load_business_plan
   * @summary Load Business Plan
   * @request GET:/routes/business-plans/load/{plan_id}
   */
  load_business_plan = ({ planId, ...query }: LoadBusinessPlanParams, params: RequestParams = {}) =>
    this.request<LoadBusinessPlanData, LoadBusinessPlanError>({
      path: `/routes/business-plans/load/${planId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a business entity by ID
   *
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name get_business_entity2
   * @summary Get Business Entity2
   * @request GET:/routes/business-entities/{entity_id}
   */
  get_business_entity2 = ({ entityId, ...query }: GetBusinessEntity2Params, params: RequestParams = {}) =>
    this.request<GetBusinessEntity2Data, GetBusinessEntity2Error>({
      path: `/routes/business-entities/${entityId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new business entity
   *
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_business_entity2
   * @summary Create Business Entity2
   * @request POST:/routes/business-entities/
   */
  create_business_entity2 = (
    query: CreateBusinessEntity2Params,
    data: CreateBusinessEntity2Payload,
    params: RequestParams = {},
  ) =>
    this.request<CreateBusinessEntity2Data, CreateBusinessEntity2Error>({
      path: `/routes/business-entities/`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get tax obligations for an entity
   *
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name get_tax_obligations
   * @summary Get Tax Obligations
   * @request GET:/routes/tax-obligations/{entity_id}
   */
  get_tax_obligations = ({ entityId, ...query }: GetTaxObligationsParams, params: RequestParams = {}) =>
    this.request<GetTaxObligationsData, GetTaxObligationsError>({
      path: `/routes/tax-obligations/${entityId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new tax return
   *
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_tax_return
   * @summary Create Tax Return
   * @request POST:/routes/tax-returns/
   */
  create_tax_return = (data: TaxReturnInput, params: RequestParams = {}) =>
    this.request<CreateTaxReturnData, CreateTaxReturnError>({
      path: `/routes/tax-returns/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new BAS statement
   *
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_bas_statement
   * @summary Create Bas Statement
   * @request POST:/routes/bas-statements/
   */
  create_bas_statement = (data: BASStatement, params: RequestParams = {}) =>
    this.request<CreateBasStatementData, CreateBasStatementError>({
      path: `/routes/bas-statements/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new tax planning scenario
   *
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_tax_planning_scenario
   * @summary Create Tax Planning Scenario
   * @request POST:/routes/tax-planning/scenarios/
   */
  create_tax_planning_scenario = (data: TaxPlanningScenario, params: RequestParams = {}) =>
    this.request<CreateTaxPlanningScenarioData, CreateTaxPlanningScenarioError>({
      path: `/routes/tax-planning/scenarios/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new business entity
   *
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name create_entity
   * @summary Create Entity
   * @request POST:/routes/business-entity
   */
  create_entity = (data: BusinessEntityCreateRequest, params: RequestParams = {}) =>
    this.request<CreateEntityData, CreateEntityError>({
      path: `/routes/business-entity`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a business entity by ID
   *
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name get_business_entity
   * @summary Get Business Entity
   * @request GET:/routes/business-entity/{entity_id}
   */
  get_business_entity = ({ entityId, ...query }: GetBusinessEntityParams, params: RequestParams = {}) =>
    this.request<GetBusinessEntityData, GetBusinessEntityError>({
      path: `/routes/business-entity/${entityId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a business entity
   *
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name update_business_entity
   * @summary Update Business Entity
   * @request PUT:/routes/business-entity/{entity_id}
   */
  update_business_entity = (
    { entityId, ...query }: UpdateBusinessEntityParams,
    data: BusinessEntityCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBusinessEntityData, UpdateBusinessEntityError>({
      path: `/routes/business-entity/${entityId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all business entities
   *
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name list_business_entities
   * @summary List Business Entities
   * @request GET:/routes/business-entities
   */
  list_business_entities = (params: RequestParams = {}) =>
    this.request<ListBusinessEntitiesData, any>({
      path: `/routes/business-entities`,
      method: "GET",
      ...params,
    });

  /**
   * @description Uploads FX rates from a CSV file. Expects columns: date, from_currency, to_currency, rate. Appends to existing rates, removes duplicates (keeping latest), and sorts.
   *
   * @tags FX Rates, dbtn/module:fx_rates, dbtn/hasAuth
   * @name upload_fx_rates
   * @summary Upload Fx Rates
   * @request POST:/routes/fx-rates/upload
   */
  upload_fx_rates = (data: BodyUploadFxRates, params: RequestParams = {}) =>
    this.request<UploadFxRatesData, UploadFxRatesError>({
      path: `/routes/fx-rates/upload`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Retrieves FX rates, optionally filtering by date range and currencies.
   *
   * @tags FX Rates, dbtn/module:fx_rates, dbtn/hasAuth
   * @name get_fx_rates
   * @summary Get Fx Rates
   * @request GET:/routes/fx-rates
   */
  get_fx_rates = (query: GetFxRatesParams, params: RequestParams = {}) =>
    this.request<GetFxRatesData, GetFxRatesError>({
      path: `/routes/fx-rates`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Lists all data source connections for the user's organization.
   *
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name list_connections
   * @summary List Connections
   * @request GET:/routes/connections/
   */
  list_connections = (params: RequestParams = {}) =>
    this.request<ListConnectionsData, any>({
      path: `/routes/connections/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Adds a new data source connection for the user's organization.
   *
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name add_connection
   * @summary Add Connection
   * @request POST:/routes/connections/
   */
  add_connection = (data: ConnectionCreateInput, params: RequestParams = {}) =>
    this.request<AddConnectionData, AddConnectionError>({
      path: `/routes/connections/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Updates an existing data source connection.
   *
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name update_connection
   * @summary Update Connection
   * @request PUT:/routes/connections/{connection_id}
   */
  update_connection = (
    { connectionId, ...query }: UpdateConnectionParams,
    data: ConnectionUpdateInput,
    params: RequestParams = {},
  ) =>
    this.request<UpdateConnectionData, UpdateConnectionError>({
      path: `/routes/connections/${connectionId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a data source connection.
   *
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name delete_connection
   * @summary Delete Connection
   * @request DELETE:/routes/connections/{connection_id}
   */
  delete_connection = ({ connectionId, ...query }: DeleteConnectionParams, params: RequestParams = {}) =>
    this.request<DeleteConnectionData, DeleteConnectionError>({
      path: `/routes/connections/${connectionId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description (Placeholder) Tests the connectivity of a data source connection.
   *
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/connections/{connection_id}/test
   */
  test_connection = ({ connectionId, ...query }: TestConnectionParams, params: RequestParams = {}) =>
    this.request<TestConnectionData, TestConnectionError>({
      path: `/routes/connections/${connectionId}/test`,
      method: "POST",
      ...params,
    });

  /**
   * @description Generates a basic report based on a definition ID. Fetches the definition, retrieves the corresponding processed financial data (JSON), and structures it according to the definition's rows/columns (basic implementation).
   *
   * @tags Report Engine, dbtn/module:report_engine, dbtn/hasAuth
   * @name generate_report
   * @summary Generate Report
   * @request POST:/routes/report-engine/generate-report
   */
  generate_report = (data: GenerateReportRequest, params: RequestParams = {}) =>
    this.request<GenerateReportData, GenerateReportError>({
      path: `/routes/report-engine/generate-report`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generates a narrative explanation for a given significant financial variance using an LLM.
   *
   * @tags Narrative Generation, LLM, dbtn/module:narrative_generation, dbtn/hasAuth
   * @name generate_variance_narrative
   * @summary Generate Variance Narrative
   * @request POST:/routes/narrative-generation/generate-variance-narrative
   */
  generate_variance_narrative = (data: AppApisNarrativeGenerationNarrativeRequest, params: RequestParams = {}) =>
    this.request<GenerateVarianceNarrativeData, GenerateVarianceNarrativeError>({
      path: `/routes/narrative-generation/generate-variance-narrative`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name validate_business_entity
   * @summary Validate Business Entity
   * @request POST:/routes/compliance-validator/validate-entity
   */
  validate_business_entity = (data: BusinessEntityValidationRequest, params: RequestParams = {}) =>
    this.request<ValidateBusinessEntityData, ValidateBusinessEntityError>({
      path: `/routes/compliance-validator/validate-entity`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name validate_tax_obligations
   * @summary Validate Tax Obligations
   * @request POST:/routes/compliance-validator/validate-obligations
   */
  validate_tax_obligations = (data: TaxObligationValidationRequest, params: RequestParams = {}) =>
    this.request<ValidateTaxObligationsData, ValidateTaxObligationsError>({
      path: `/routes/compliance-validator/validate-obligations`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name detect_compliance_anomalies
   * @summary Detect Compliance Anomalies
   * @request POST:/routes/compliance-validator/detect-anomalies
   */
  detect_compliance_anomalies = (data: TaxObligationValidationRequest, params: RequestParams = {}) =>
    this.request<DetectComplianceAnomaliesData, DetectComplianceAnomaliesError>({
      path: `/routes/compliance-validator/detect-anomalies`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Run all compliance checks in a single request
   *
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name run_compliance_checks
   * @summary Run Compliance Checks
   * @request POST:/routes/compliance-validator/run-all-checks
   */
  run_compliance_checks = (data: RunComplianceChecksPayload, params: RequestParams = {}) =>
    this.request<RunComplianceChecksData, RunComplianceChecksError>({
      path: `/routes/compliance-validator/run-all-checks`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Imports Trial Balance data from MYOB AccountRight Live for a given connection and date range.
   *
   * @tags MYOB Integration, dbtn/module:myob_import, dbtn/hasAuth
   * @name import_myob_trial_balance
   * @summary Import Myob Trial Balance
   * @request POST:/routes/myob/import/trial-balance
   */
  import_myob_trial_balance = (data: MyobTrialBalanceImportRequest, params: RequestParams = {}) =>
    this.request<ImportMyobTrialBalanceData, ImportMyobTrialBalanceError>({
      path: `/routes/myob/import/trial-balance`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Calculate the financial and business impacts of a given scenario with advanced analysis options
   *
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name calculate_scenario_impact_v2
   * @summary Calculate Scenario Impact V2
   * @request POST:/routes/calculate-scenario-impact-v2
   */
  calculate_scenario_impact_v2 = (
    data: AppApisScenarioCalculationEnhancedCalculateScenarioRequest,
    params: RequestParams = {},
  ) =>
    this.request<CalculateScenarioImpactV2Data, CalculateScenarioImpactV2Error>({
      path: `/routes/calculate-scenario-impact-v2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Perform sensitivity analysis on a scenario to identify most important variables
   *
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name analyze_scenario_sensitivity
   * @summary Analyze Scenario Sensitivity
   * @request POST:/routes/scenario-sensitivity-detailed
   */
  analyze_scenario_sensitivity = (
    data: AppApisScenarioCalculationSensitivityAnalysisRequest,
    params: RequestParams = {},
  ) =>
    this.request<AnalyzeScenarioSensitivityData, AnalyzeScenarioSensitivityError>({
      path: `/routes/scenario-sensitivity-detailed`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Perform advanced sensitivity analysis with cross-dependencies and stress testing
   *
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name analyze_scenario_sensitivity_advanced
   * @summary Analyze Scenario Sensitivity Advanced
   * @request POST:/routes/analyze-scenario-sensitivity-advanced
   */
  analyze_scenario_sensitivity_advanced = (data: AdvancedSensitivityAnalysisRequest, params: RequestParams = {}) =>
    this.request<AnalyzeScenarioSensitivityAdvancedData, AnalyzeScenarioSensitivityAdvancedError>({
      path: `/routes/analyze-scenario-sensitivity-advanced`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Run a Monte Carlo simulation for a scenario to generate probability distributions
   *
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name run_scenario_monte_carlo_simulation
   * @summary Run Scenario Monte Carlo Simulation
   * @request POST:/routes/scenario-monte-carlo-simulation-detailed
   */
  run_scenario_monte_carlo_simulation = (
    data: AppApisScenarioCalculationMonteCarloSimulationRequest,
    params: RequestParams = {},
  ) =>
    this.request<RunScenarioMonteCarloSimulationData, RunScenarioMonteCarloSimulationError>({
      path: `/routes/scenario-monte-carlo-simulation-detailed`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Run advanced Monte Carlo simulations with correlated variables and stress testing
   *
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name run_monte_carlo_simulation_advanced
   * @summary Run Monte Carlo Simulation Advanced
   * @request POST:/routes/run-monte-carlo-simulation-advanced
   */
  run_monte_carlo_simulation_advanced = (data: AdvancedMonteCarloRequest, params: RequestParams = {}) =>
    this.request<RunMonteCarloSimulationAdvancedData, RunMonteCarloSimulationAdvancedError>({
      path: `/routes/run-monte-carlo-simulation-advanced`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate comprehensive strategic recommendations for responding to a scenario, including risk mitigation strategies, opportunity identification, and contingency planning.
   *
   * @tags dbtn/module:strategic_recommendations, dbtn/hasAuth
   * @name generate_strategic_recommendations
   * @summary Generate Strategic Recommendations
   * @request POST:/routes/generate-recommendations
   */
  generate_strategic_recommendations = (data: ScenarioResponseRequest, params: RequestParams = {}) =>
    this.request<GenerateStrategicRecommendationsData, GenerateStrategicRecommendationsError>({
      path: `/routes/generate-recommendations`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generates a time-series forecast for financial health scores using Prophet. Requires historical data points (date, score).
   *
   * @tags Forecasting, dbtn/module:forecasting, dbtn/hasAuth
   * @name forecast_score
   * @summary Forecast Score
   * @request POST:/routes/forecasting/forecast-score
   */
  forecast_score = (data: ForecastRequest, params: RequestParams = {}) =>
    this.request<ForecastScoreData, ForecastScoreError>({
      path: `/routes/forecasting/forecast-score`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generates time-series forecasts for multiple financial accounts using ARIMA or Prophet.
   *
   * @tags Forecasting, dbtn/module:forecasting, dbtn/hasAuth
   * @name forecast_account
   * @summary Forecast Account
   * @request POST:/routes/forecasting/forecast-account
   */
  forecast_account = (data: AccountForecastRequest, params: RequestParams = {}) =>
    this.request<ForecastAccountData, ForecastAccountError>({
      path: `/routes/forecasting/forecast-account`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generates a simple forecast based on drivers applied monthly.
   *
   * @tags Forecasting, dbtn/module:forecasting, dbtn/hasAuth
   * @name create_simple_driver_based_forecast
   * @summary Create Simple Driver Based Forecast
   * @request POST:/routes/forecasting/driver-based-simple
   */
  create_simple_driver_based_forecast = (data: SimpleForecastRequest, params: RequestParams = {}) =>
    this.request<CreateSimpleDriverBasedForecastData, CreateSimpleDriverBasedForecastError>({
      path: `/routes/forecasting/driver-based-simple`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Creates a new budget version for an organization.
   *
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name create_budget_version
   * @summary Create Budget Version
   * @request POST:/routes/budgets/{organization_id}/versions
   */
  create_budget_version = (
    { organizationId, ...query }: CreateBudgetVersionParams,
    data: CreateBudgetVersionRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreateBudgetVersionData, CreateBudgetVersionError>({
      path: `/routes/budgets/${organizationId}/versions`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lists metadata for all available budget versions for an organization.
   *
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name list_budget_versions
   * @summary List Budget Versions
   * @request GET:/routes/budgets/{organization_id}/versions
   */
  list_budget_versions = ({ organizationId, ...query }: ListBudgetVersionsParams, params: RequestParams = {}) =>
    this.request<ListBudgetVersionsData, ListBudgetVersionsError>({
      path: `/routes/budgets/${organizationId}/versions`,
      method: "GET",
      ...params,
    });

  /**
   * @description Retrieves a specific budget version, including all its items.
   *
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name get_budget_version
   * @summary Get Budget Version
   * @request GET:/routes/budgets/{organization_id}/versions/{version_id}
   */
  get_budget_version = ({ organizationId, versionId, ...query }: GetBudgetVersionParams, params: RequestParams = {}) =>
    this.request<GetBudgetVersionData, GetBudgetVersionError>({
      path: `/routes/budgets/${organizationId}/versions/${versionId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Updates (replaces) an existing budget version.
   *
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name update_budget_version
   * @summary Update Budget Version
   * @request PUT:/routes/budgets/{organization_id}/versions/{version_id}
   */
  update_budget_version = (
    { organizationId, versionId, ...query }: UpdateBudgetVersionParams,
    data: UpdateBudgetVersionRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBudgetVersionData, UpdateBudgetVersionError>({
      path: `/routes/budgets/${organizationId}/versions/${versionId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a specific budget version by removing it from the index.
   *
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name delete_budget_version
   * @summary Delete Budget Version
   * @request DELETE:/routes/budgets/{organization_id}/versions/{version_id}
   */
  delete_budget_version = (
    { organizationId, versionId, ...query }: DeleteBudgetVersionParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteBudgetVersionData, any>({
      path: `/routes/budgets/${organizationId}/versions/${versionId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Detects anomalies (outliers, level shifts, trend changes) in the provided financial time series data. Uses Facebook Prophet model to identify anomalies based on deviations from expected patterns and significant changepoints. Args: payload (TimeSeriesData): The input time series data. Returns: AnomalyDetectionResponse: A list of detected anomalies.
   *
   * @tags Tax & Compliance, Anomaly Detection, dbtn/module:anomaly_detection, dbtn/hasAuth
   * @name detect_tax_anomalies
   * @summary Detect Tax Anomalies
   * @request POST:/routes/tax-compliance/anomaly-detection/detect
   */
  detect_tax_anomalies = (data: TimeSeriesData, params: RequestParams = {}) =>
    this.request<DetectTaxAnomaliesData, DetectTaxAnomaliesError>({
      path: `/routes/tax-compliance/anomaly-detection/detect`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name list_notifications
   * @summary List Notifications
   * @request GET:/routes/notifications/list
   */
  list_notifications = (query: ListNotificationsParams, params: RequestParams = {}) =>
    this.request<ListNotificationsData, ListNotificationsError>({
      path: `/routes/notifications/list`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description API endpoint to create a new notification.
   *
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name create_notification
   * @summary Create Notification
   * @request POST:/routes/notifications/create
   */
  create_notification = (data: NotificationCreate, params: RequestParams = {}) =>
    this.request<CreateNotificationData, CreateNotificationError>({
      path: `/routes/notifications/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name mark_notification_read
   * @summary Mark Notification Read
   * @request POST:/routes/notifications/{notification_id}/read
   */
  mark_notification_read = ({ notificationId, ...query }: MarkNotificationReadParams, params: RequestParams = {}) =>
    this.request<MarkNotificationReadData, MarkNotificationReadError>({
      path: `/routes/notifications/${notificationId}/read`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name dismiss_notification
   * @summary Dismiss Notification
   * @request POST:/routes/notifications/{notification_id}/dismiss
   */
  dismiss_notification = ({ notificationId, ...query }: DismissNotificationParams, params: RequestParams = {}) =>
    this.request<DismissNotificationData, DismissNotificationError>({
      path: `/routes/notifications/${notificationId}/dismiss`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name bulk_update_notifications
   * @summary Bulk Update Notifications
   * @request POST:/routes/notifications/bulk-update
   */
  bulk_update_notifications = (
    query: BulkUpdateNotificationsParams,
    data: BulkUpdateNotificationsPayload,
    params: RequestParams = {},
  ) =>
    this.request<BulkUpdateNotificationsData, BulkUpdateNotificationsError>({
      path: `/routes/notifications/bulk-update`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Automatically generate notifications for upcoming tax deadlines This would normally be triggered by a scheduled job
   *
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name generate_deadline_alerts
   * @summary Generate Deadline Alerts
   * @request POST:/routes/notifications/generate-deadline-alerts
   */
  generate_deadline_alerts = (query: GenerateDeadlineAlertsParams, params: RequestParams = {}) =>
    this.request<GenerateDeadlineAlertsData, GenerateDeadlineAlertsError>({
      path: `/routes/notifications/generate-deadline-alerts`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Generate notifications based on compliance validation results This would normally be triggered by a scheduled job
   *
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name generate_compliance_alerts
   * @summary Generate Compliance Alerts
   * @request POST:/routes/notifications/generate-compliance-alerts
   */
  generate_compliance_alerts = (query: GenerateComplianceAlertsParams, params: RequestParams = {}) =>
    this.request<GenerateComplianceAlertsData, GenerateComplianceAlertsError>({
      path: `/routes/notifications/generate-compliance-alerts`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Lists all scenarios owned by the authenticated user.
   *
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name list_scenarios
   * @summary List Scenarios
   * @request GET:/routes/scenarios/
   */
  list_scenarios = (params: RequestParams = {}) =>
    this.request<ListScenariosData, any>({
      path: `/routes/scenarios/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Creates a new forecast/budget scenario for the authenticated user.
   *
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name create_scenario
   * @summary Create Scenario
   * @request POST:/routes/scenarios/
   */
  create_scenario = (data: ScenarioCreate, params: RequestParams = {}) =>
    this.request<CreateScenarioData, CreateScenarioError>({
      path: `/routes/scenarios/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves a specific scenario by ID, ensuring ownership.
   *
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name get_scenario
   * @summary Get Scenario
   * @request GET:/routes/scenarios/{scenario_id}
   */
  get_scenario = ({ scenarioId, ...query }: GetScenarioParams, params: RequestParams = {}) =>
    this.request<GetScenarioData, GetScenarioError>({
      path: `/routes/scenarios/${scenarioId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Updates an existing scenario, ensuring ownership.
   *
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name update_scenario
   * @summary Update Scenario
   * @request PUT:/routes/scenarios/{scenario_id}
   */
  update_scenario = (
    { scenarioId, ...query }: UpdateScenarioParams,
    data: ScenarioUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateScenarioData, UpdateScenarioError>({
      path: `/routes/scenarios/${scenarioId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a scenario, ensuring ownership.
   *
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name delete_scenario
   * @summary Delete Scenario
   * @request DELETE:/routes/scenarios/{scenario_id}
   */
  delete_scenario = ({ scenarioId, ...query }: DeleteScenarioParams, params: RequestParams = {}) =>
    this.request<DeleteScenarioData, DeleteScenarioError>({
      path: `/routes/scenarios/${scenarioId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Applies a saved scenario's assumptions to a specified base forecast.
   *
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name apply_scenario
   * @summary Apply Scenario
   * @request POST:/routes/scenarios/apply/{scenario_id}
   */
  apply_scenario = (
    { scenarioId, ...query }: ApplyScenarioParams,
    data: ScenarioApplyRequest,
    params: RequestParams = {},
  ) =>
    this.request<ApplyScenarioData, ApplyScenarioError>({
      path: `/routes/scenarios/apply/${scenarioId}`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Upload a CSV file containing financial data for preview and column mapping
   *
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name upload_financial_data_legacy
   * @summary Upload Financial Data Legacy
   * @request POST:/routes/financial-import/upload-legacy
   */
  upload_financial_data_legacy = (
    query: UploadFinancialDataLegacyParams,
    data: BodyUploadFinancialDataLegacy,
    params: RequestParams = {},
  ) =>
    this.request<UploadFinancialDataLegacyData, UploadFinancialDataLegacyError>({
      path: `/routes/financial-import/upload-legacy`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Process the uploaded financial data using the provided column mappings
   *
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name process_financial_data
   * @summary Process Financial Data
   * @request POST:/routes/financial-import/process
   */
  process_financial_data = (data: ImportMappingRequest, params: RequestParams = {}) =>
    this.request<ProcessFinancialDataData, ProcessFinancialDataError>({
      path: `/routes/financial-import/process`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lists import history for a given organization.
   *
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name list_imports
   * @summary List Imports
   * @request GET:/routes/financial-import/organizations/{organization_id}/imports
   */
  list_imports = ({ organizationId, ...query }: ListImportsParams, params: RequestParams = {}) =>
    this.request<ListImportsData, ListImportsError>({
      path: `/routes/financial-import/organizations/${organizationId}/imports`,
      method: "GET",
      ...params,
    });

  /**
   * @description Handles file upload specifically for the DataImports page, requiring organization_id upfront. Saves the file temporarily and returns metadata for column mapping.
   *
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name upload_organization_financial_data
   * @summary Upload Organization Financial Data
   * @request POST:/routes/financial-import/upload-for-organization
   */
  upload_organization_financial_data = (data: BodyUploadOrganizationFinancialData, params: RequestParams = {}) =>
    this.request<UploadOrganizationFinancialDataData, UploadOrganizationFinancialDataError>({
      path: `/routes/financial-import/upload-for-organization`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Handles the initial file upload for the wizard. Saves the file temporarily and returns metadata for column mapping. Does NOT require organization_id at this stage.
   *
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name upload_financial_data
   * @summary Upload Financial Data
   * @request POST:/routes/financial-import/upload
   */
  upload_financial_data = (
    query: UploadFinancialDataParams,
    data: BodyUploadFinancialData,
    params: RequestParams = {},
  ) =>
    this.request<UploadFinancialDataData, UploadFinancialDataError>({
      path: `/routes/financial-import/upload`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Get imported data by import ID
   *
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name get_import
   * @summary Get Import
   * @request GET:/routes/financial-import/imports/{import_id}
   */
  get_import = ({ importId, ...query }: GetImportParams, params: RequestParams = {}) =>
    this.request<GetImportData, GetImportError>({
      path: `/routes/financial-import/imports/${importId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Grants access for specified external users to a piece of content.
   *
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name grant_access
   * @summary Grant Access
   * @request POST:/routes/sharing/grants
   */
  grant_access = (data: ShareActionRequest, params: RequestParams = {}) =>
    this.request<GrantAccessData, GrantAccessError>({
      path: `/routes/sharing/grants`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Revokes access for specified external users from a piece of content.
   *
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name revoke_access
   * @summary Revoke Access
   * @request DELETE:/routes/sharing/grants
   */
  revoke_access = (data: ShareActionRequest, params: RequestParams = {}) =>
    this.request<RevokeAccessData, RevokeAccessError>({
      path: `/routes/sharing/grants`,
      method: "DELETE",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Gets the list of user IDs who have access to a specific content item.
   *
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name get_content_permissions
   * @summary Get Content Permissions
   * @request GET:/routes/sharing/content/{content_type}/{content_id}
   */
  get_content_permissions = (
    { contentType, contentId, ...query }: GetContentPermissionsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetContentPermissionsData, GetContentPermissionsError>({
      path: `/routes/sharing/content/${contentType}/${contentId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Gets the list of content items accessible by a specific external user.
   *
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name get_user_permissions
   * @summary Get User Permissions
   * @request GET:/routes/sharing/user/{user_id}
   */
  get_user_permissions = ({ userId, ...query }: GetUserPermissionsParams, params: RequestParams = {}) =>
    this.request<GetUserPermissionsData, GetUserPermissionsError>({
      path: `/routes/sharing/user/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get all available subscription plans with pricing
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_subscription_plans
   * @summary Get Subscription Plans
   * @request GET:/routes/subscriptions/plans
   */
  get_subscription_plans = (params: RequestParams = {}) =>
    this.request<GetSubscriptionPlansData, any>({
      path: `/routes/subscriptions/plans`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a Stripe checkout session for subscription
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name create_checkout_session
   * @summary Create Checkout Session
   * @request POST:/routes/subscriptions/create-checkout-session
   */
  create_checkout_session = (data: CreateCheckoutSessionRequest, params: RequestParams = {}) =>
    this.request<CreateCheckoutSessionData, CreateCheckoutSessionError>({
      path: `/routes/subscriptions/create-checkout-session`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a Stripe billing portal session for subscription management
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name create_portal_session
   * @summary Create Portal Session
   * @request POST:/routes/subscriptions/create-portal-session
   */
  create_portal_session = (data: SubscriptionPortalRequest, params: RequestParams = {}) =>
    this.request<CreatePortalSessionData, CreatePortalSessionError>({
      path: `/routes/subscriptions/create-portal-session`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get subscription details for an organization
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_organization_subscription
   * @summary Get Organization Subscription
   * @request GET:/routes/subscriptions/organization/{organization_id}
   */
  get_organization_subscription = (
    { organizationId, ...query }: GetOrganizationSubscriptionParams,
    params: RequestParams = {},
  ) =>
    this.request<GetOrganizationSubscriptionData, GetOrganizationSubscriptionError>({
      path: `/routes/subscriptions/organization/${organizationId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Handle Stripe webhook events
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name stripe_webhook
   * @summary Stripe Webhook
   * @request POST:/routes/subscriptions/webhook
   */
  stripe_webhook = (params: RequestParams = {}) =>
    this.request<StripeWebhookData, StripeWebhookError>({
      path: `/routes/subscriptions/webhook`,
      method: "POST",
      ...params,
    });

  /**
   * @description Schedule a report for periodic delivery
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name schedule_report
   * @summary Schedule Report
   * @request POST:/routes/report-distribution/schedule
   */
  schedule_report = (data: ScheduleRequest, params: RequestParams = {}) =>
    this.request<ScheduleReportData, ScheduleReportError>({
      path: `/routes/report-distribution/schedule`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all scheduled reports for the user
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name list_schedules
   * @summary List Schedules
   * @request GET:/routes/report-distribution/schedules
   */
  list_schedules = (params: RequestParams = {}) =>
    this.request<ListSchedulesData, any>({
      path: `/routes/report-distribution/schedules`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get details of a specific report schedule
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name get_schedule
   * @summary Get Schedule
   * @request GET:/routes/report-distribution/schedule/{schedule_id}
   */
  get_schedule = ({ scheduleId, ...query }: GetScheduleParams, params: RequestParams = {}) =>
    this.request<GetScheduleData, GetScheduleError>({
      path: `/routes/report-distribution/schedule/${scheduleId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an existing report schedule
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name update_schedule
   * @summary Update Schedule
   * @request PUT:/routes/report-distribution/schedule/{schedule_id}
   */
  update_schedule = (
    { scheduleId, ...query }: UpdateScheduleParams,
    data: UpdateScheduleRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateScheduleData, UpdateScheduleError>({
      path: `/routes/report-distribution/schedule/${scheduleId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a report schedule
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name delete_schedule
   * @summary Delete Schedule
   * @request DELETE:/routes/report-distribution/schedule/{schedule_id}
   */
  delete_schedule = ({ scheduleId, ...query }: DeleteScheduleParams, params: RequestParams = {}) =>
    this.request<DeleteScheduleData, DeleteScheduleError>({
      path: `/routes/report-distribution/schedule/${scheduleId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Export a report in the specified format
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name export_report
   * @summary Export Report
   * @request POST:/routes/report-distribution/export
   */
  export_report = (data: ExportRequest, params: RequestParams = {}) =>
    this.request<ExportReportData, ExportReportError>({
      path: `/routes/report-distribution/export`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Download a previously exported report
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name download_report
   * @summary Download Report
   * @request GET:/routes/report-distribution/download/{report_id}
   */
  download_report = ({ reportId, ...query }: DownloadReportParams, params: RequestParams = {}) =>
    this.request<DownloadReportData, DownloadReportError>({
      path: `/routes/report-distribution/download/${reportId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Submit feedback for a delivered report
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/report-distribution/feedback
   */
  submit_feedback = (data: ReportFeedback, params: RequestParams = {}) =>
    this.request<SubmitFeedbackData, SubmitFeedbackError>({
      path: `/routes/report-distribution/feedback`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Manually trigger delivery of a scheduled report
   *
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name manual_deliver_report
   * @summary Manual Deliver Report
   * @request POST:/routes/report-distribution/deliver/{schedule_id}
   */
  manual_deliver_report = ({ scheduleId, ...query }: ManualDeliverReportParams, params: RequestParams = {}) =>
    this.request<ManualDeliverReportData, ManualDeliverReportError>({
      path: `/routes/report-distribution/deliver/${scheduleId}`,
      method: "POST",
      ...params,
    });

  /**
   * @description Retrieves a list of metadata for all report definitions owned by the authenticated user. Requires 'reports:read' permission.
   *
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name list_report_definitions
   * @summary List Report Definitions
   * @request GET:/routes/report-definitions
   */
  list_report_definitions = (params: RequestParams = {}) =>
    this.request<ListReportDefinitionsData, any>({
      path: `/routes/report-definitions`,
      method: "GET",
      ...params,
    });

  /**
   * @description Creates a new custom report definition for the authenticated user. Requires 'reports:create' permission.
   *
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name create_report_definition
   * @summary Create Report Definition
   * @request POST:/routes/report-definitions
   */
  create_report_definition = (data: ReportDefinitionCreate, params: RequestParams = {}) =>
    this.request<CreateReportDefinitionData, CreateReportDefinitionError>({
      path: `/routes/report-definitions`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves the full details of a specific report definition by its ID. Requires 'reports:read' permission.
   *
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name get_report_definition
   * @summary Get Report Definition
   * @request GET:/routes/report-definitions/{report_id}
   */
  get_report_definition = ({ reportId, ...query }: GetReportDefinitionParams, params: RequestParams = {}) =>
    this.request<GetReportDefinitionData, GetReportDefinitionError>({
      path: `/routes/report-definitions/${reportId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Updates an existing report definition by its ID. Requires 'reports:update' permission.
   *
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name update_report_definition
   * @summary Update Report Definition
   * @request PUT:/routes/report-definitions/{report_id}
   */
  update_report_definition = (
    { reportId, ...query }: UpdateReportDefinitionParams,
    data: ReportDefinitionCreate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateReportDefinitionData, UpdateReportDefinitionError>({
      path: `/routes/report-definitions/${reportId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a specific report definition by its ID. Requires 'reports:delete' permission.
   *
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name delete_report_definition
   * @summary Delete Report Definition
   * @request DELETE:/routes/report-definitions/{report_id}
   */
  delete_report_definition = ({ reportId, ...query }: DeleteReportDefinitionParams, params: RequestParams = {}) =>
    this.request<DeleteReportDefinitionData, DeleteReportDefinitionError>({
      path: `/routes/report-definitions/${reportId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Deletes audit log entries older than the defined retention period (180 days). Requires global admin role.
   *
   * @tags Audit Logs, dbtn/module:audit_logs, dbtn/hasAuth
   * @name purge_old_audit_logs
   * @summary Purge Old Audit Logs
   * @request POST:/routes/audit-logs/purge
   */
  purge_old_audit_logs = (params: RequestParams = {}) =>
    this.request<PurgeOldAuditLogsData, any>({
      path: `/routes/audit-logs/purge`,
      method: "POST",
      ...params,
    });

  /**
   * @description Query audit log entries with filters and pagination.
   *
   * @tags Audit Logs, dbtn/module:audit_logs, dbtn/hasAuth
   * @name query_audit_logs
   * @summary Query Audit Logs
   * @request GET:/routes/audit-logs/
   */
  query_audit_logs = (query: QueryAuditLogsParams, params: RequestParams = {}) =>
    this.request<QueryAuditLogsData, QueryAuditLogsError>({
      path: `/routes/audit-logs/`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description SIMPLIFIED FOR DEBUGGING Fetches and processes data for a given widget configuration. Currently supports 'reportApi' sourceType.
   *
   * @tags Widget Data, dbtn/module:widget_data, dbtn/hasAuth
   * @name fetch_widget_data
   * @summary Fetch Widget Data
   * @request POST:/routes/widget-data/fetch
   */
  fetch_widget_data = (data: WidgetConfiguration, params: RequestParams = {}) =>
    this.request<FetchWidgetDataData, FetchWidgetDataError>({
      path: `/routes/widget-data/fetch`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lists all available benchmark metric definitions.
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name list_benchmark_metric_definitions
   * @summary List Benchmark Metric Definitions
   * @request GET:/routes/metrics
   */
  list_benchmark_metric_definitions = (params: RequestParams = {}) =>
    this.request<ListBenchmarkMetricDefinitionsData, any>({
      path: `/routes/metrics`,
      method: "GET",
      ...params,
    });

  /**
   * @description Creates a new benchmark metric definition.
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name create_benchmark_metric_definition
   * @summary Create Benchmark Metric Definition
   * @request POST:/routes/metrics
   */
  create_benchmark_metric_definition = (data: CreateMetricDefinitionPayload, params: RequestParams = {}) =>
    this.request<CreateBenchmarkMetricDefinitionData, CreateBenchmarkMetricDefinitionError>({
      path: `/routes/metrics`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Updates an existing benchmark metric definition.
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name update_benchmark_metric_definition
   * @summary Update Benchmark Metric Definition
   * @request PUT:/routes/metrics/{metric_id}
   */
  update_benchmark_metric_definition = (
    { metricId, ...query }: UpdateBenchmarkMetricDefinitionParams,
    data: UpdateMetricDefinitionPayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBenchmarkMetricDefinitionData, UpdateBenchmarkMetricDefinitionError>({
      path: `/routes/metrics/${metricId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a benchmark metric definition.
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name delete_benchmark_metric_definition
   * @summary Delete Benchmark Metric Definition
   * @request DELETE:/routes/metrics/{metric_id}
   */
  delete_benchmark_metric_definition = (
    { metricId, ...query }: DeleteBenchmarkMetricDefinitionParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteBenchmarkMetricDefinitionData, DeleteBenchmarkMetricDefinitionError>({
      path: `/routes/metrics/${metricId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description List all available benchmark data sources
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name list_benchmark_sources
   * @summary List Benchmark Sources
   * @request GET:/routes/sources
   */
  list_benchmark_sources = (params: RequestParams = {}) =>
    this.request<ListBenchmarkSourcesData, any>({
      path: `/routes/sources`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new benchmark data source. Uses CreateSourcePayload for input validation.
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name create_benchmark_source
   * @summary Create Benchmark Source
   * @request POST:/routes/sources
   */
  create_benchmark_source = (data: CreateSourcePayload, params: RequestParams = {}) =>
    this.request<CreateBenchmarkSourceData, CreateBenchmarkSourceError>({
      path: `/routes/sources`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update an existing benchmark data source. Uses UpdateSourcePayload for input validation. Only updates fields provided in the payload.
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name update_benchmark_source
   * @summary Update Benchmark Source
   * @request PUT:/routes/sources/{source_id}
   */
  update_benchmark_source = (
    { sourceId, ...query }: UpdateBenchmarkSourceParams,
    data: UpdateSourcePayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBenchmarkSourceData, UpdateBenchmarkSourceError>({
      path: `/routes/sources/${sourceId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a benchmark data source and its data
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name delete_benchmark_source
   * @summary Delete Benchmark Source
   * @request DELETE:/routes/delete-benchmark-source/{source_id}
   */
  delete_benchmark_source = ({ sourceId, ...query }: DeleteBenchmarkSourceParams, params: RequestParams = {}) =>
    this.request<DeleteBenchmarkSourceData, DeleteBenchmarkSourceError>({
      path: `/routes/delete-benchmark-source/${sourceId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Compare two versions of benchmark data for a source
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name compare_benchmark_versions
   * @summary Compare Benchmark Versions
   * @request GET:/routes/compare-benchmark-versions
   */
  compare_benchmark_versions = (query: CompareBenchmarkVersionsParams, params: RequestParams = {}) =>
    this.request<CompareBenchmarkVersionsData, CompareBenchmarkVersionsError>({
      path: `/routes/compare-benchmark-versions`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a summary of available benchmark data
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_benchmark_data_summary
   * @summary Get Benchmark Data Summary
   * @request GET:/routes/benchmark-data-summary
   */
  get_benchmark_data_summary = (query: GetBenchmarkDataSummaryParams, params: RequestParams = {}) =>
    this.request<GetBenchmarkDataSummaryData, GetBenchmarkDataSummaryError>({
      path: `/routes/benchmark-data-summary`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get benchmark data based on filters
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_benchmark_data_endpoint
   * @summary Get Benchmark Data Endpoint
   * @request GET:/routes/benchmark-data
   */
  get_benchmark_data_endpoint = (query: GetBenchmarkDataEndpointParams, params: RequestParams = {}) =>
    this.request<GetBenchmarkDataEndpointData, GetBenchmarkDataEndpointError>({
      path: `/routes/benchmark-data`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Trigger an update of benchmark data from the specified source
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name update_benchmark_data
   * @summary Update Benchmark Data
   * @request POST:/routes/update-benchmark
   */
  update_benchmark_data = (data: UpdateBenchmarkRequest, params: RequestParams = {}) =>
    this.request<UpdateBenchmarkDataData, UpdateBenchmarkDataError>({
      path: `/routes/update-benchmark`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Upload and process benchmark data file
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name upload_benchmark_data
   * @summary Upload Benchmark Data
   * @request POST:/routes/upload-benchmark-data
   */
  upload_benchmark_data = (data: BodyUploadBenchmarkData, params: RequestParams = {}) =>
    this.request<UploadBenchmarkDataData, UploadBenchmarkDataError>({
      path: `/routes/upload-benchmark-data`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description List all benchmark data imports
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name list_imports2
   * @summary List Imports2
   * @request GET:/routes/benchmark-imports
   */
  list_imports2 = (query: ListImports2Params, params: RequestParams = {}) =>
    this.request<ListImports2Data, ListImports2Error>({
      path: `/routes/benchmark-imports`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get details of a specific import
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_import2
   * @summary Get Import2
   * @request GET:/routes/benchmark-import/{import_id}
   */
  get_import2 = ({ importId, ...query }: GetImport2Params, params: RequestParams = {}) =>
    this.request<GetImport2Data, GetImport2Error>({
      path: `/routes/benchmark-import/${importId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get available versions of benchmark data
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_benchmark_versions_endpoint
   * @summary Get Benchmark Versions Endpoint
   * @request GET:/routes/benchmark-versions
   */
  get_benchmark_versions_endpoint = (query: GetBenchmarkVersionsEndpointParams, params: RequestParams = {}) =>
    this.request<GetBenchmarkVersionsEndpointData, GetBenchmarkVersionsEndpointError>({
      path: `/routes/benchmark-versions`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get available metrics for a specific industry or all industries
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_industry_metrics
   * @summary Get Industry Metrics
   * @request GET:/routes/industry-metrics
   */
  get_industry_metrics = (query: GetIndustryMetricsParams, params: RequestParams = {}) =>
    this.request<GetIndustryMetricsData, GetIndustryMetricsError>({
      path: `/routes/industry-metrics`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a list of all industries from all sources
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_industry_list
   * @summary Get Industry List
   * @request GET:/routes/industry-list
   */
  get_industry_list = (params: RequestParams = {}) =>
    this.request<GetIndustryListData, any>({
      path: `/routes/industry-list`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get information about the data collection and update strategy
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_data_collection_strategy
   * @summary Get Data Collection Strategy
   * @request GET:/routes/data-collection-strategy
   */
  get_data_collection_strategy = (params: RequestParams = {}) =>
    this.request<GetDataCollectionStrategyData, any>({
      path: `/routes/data-collection-strategy`,
      method: "GET",
      ...params,
    });

  /**
   * @description Compare company data with industry benchmarks
   *
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name compare_with_benchmarks
   * @summary Compare With Benchmarks
   * @request POST:/routes/compare-with-benchmarks
   */
  compare_with_benchmarks = (data: BenchmarkComparisonRequest, params: RequestParams = {}) =>
    this.request<CompareWithBenchmarksData, CompareWithBenchmarksError>({
      path: `/routes/compare-with-benchmarks`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description API endpoint to calculate the cash flow statement using the indirect method. Takes mapped financial data for a period and returns the calculated statement.
   *
   * @tags Cash Flow, dbtn/module:cash_flow, dbtn/hasAuth
   * @name calculate_cash_flow_endpoint
   * @summary Calculate Cash Flow Endpoint
   * @request POST:/routes/cash-flow/calculate-indirect
   */
  calculate_cash_flow_endpoint = (data: CalculateCashFlowRequest, params: RequestParams = {}) =>
    this.request<CalculateCashFlowEndpointData, CalculateCashFlowEndpointError>({
      path: `/routes/cash-flow/calculate-indirect`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Assigns a specific role to a user within a given scope (Organization or Entity).
   *
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name assign_role
   * @summary Assign Role
   * @request POST:/routes/roles/assign
   */
  assign_role = (data: RoleAssignmentCreate, params: RequestParams = {}) =>
    this.request<AssignRoleData, AssignRoleError>({
      path: `/routes/roles/assign`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Revokes a specific role assignment for a user.
   *
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name revoke_role
   * @summary Revoke Role
   * @request DELETE:/routes/roles/revoke
   */
  revoke_role = (data: RevokeRoleRequest, params: RequestParams = {}) =>
    this.request<RevokeRoleData, RevokeRoleError>({
      path: `/routes/roles/revoke`,
      method: "DELETE",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lists all roles assigned to a specific user, optionally filtered by organization or entity. Authorization Rules: - A user can always list their own roles (user_id == current_user.sub). - An Admin of the specified organization/entity scope can list roles for the target user within that scope.
   *
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name list_user_roles
   * @summary List User Roles
   * @request GET:/routes/roles/user/{user_id}
   */
  list_user_roles = ({ userId, ...query }: ListUserRolesParams, params: RequestParams = {}) =>
    this.request<ListUserRolesData, ListUserRolesError>({
      path: `/routes/roles/user/${userId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Lists all role assignments within a specific scope (Organization or Entity). Authorization Rules: - An Admin or Advisor within the specified scope can list all roles in that scope.
   *
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name list_scope_roles
   * @summary List Scope Roles
   * @request GET:/routes/roles/scope/{scope_type}/{scope_id}
   */
  list_scope_roles = ({ scopeType, scopeId, ...query }: ListScopeRolesParams, params: RequestParams = {}) =>
    this.request<ListScopeRolesData, ListScopeRolesError>({
      path: `/routes/roles/scope/${scopeType}/${scopeId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Creates a new comment or reply in Firestore.
   *
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name create_comment
   * @summary Create Comment
   * @request POST:/routes/comments
   */
  create_comment = (data: CommentCreate, params: RequestParams = {}) =>
    this.request<CreateCommentData, CreateCommentError>({
      path: `/routes/comments`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves comments based on context or thread ID.
   *
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name get_comments
   * @summary Get Comments
   * @request GET:/routes/comments
   */
  get_comments = (query: GetCommentsParams, params: RequestParams = {}) =>
    this.request<GetCommentsData, GetCommentsError>({
      path: `/routes/comments`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Updates the text of an existing comment, checking for ownership.
   *
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name update_comment
   * @summary Update Comment
   * @request PUT:/routes/comments/{comment_id}
   */
  update_comment = ({ commentId, ...query }: UpdateCommentParams, data: CommentUpdate, params: RequestParams = {}) =>
    this.request<UpdateCommentData, UpdateCommentError>({
      path: `/routes/comments/${commentId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Soft-deletes a comment, checking for ownership. Decrements reply count if it's a reply.
   *
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name delete_comment
   * @summary Delete Comment
   * @request DELETE:/routes/comments/{comment_id}
   */
  delete_comment = ({ commentId, ...query }: DeleteCommentParams, params: RequestParams = {}) =>
    this.request<DeleteCommentData, DeleteCommentError>({
      path: `/routes/comments/${commentId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Retrieves the current mapping of Chart of Accounts items to cash flow categories for a specific organization.
   *
   * @tags CoA Mappings, dbtn/module:coa_mappings, dbtn/hasAuth
   * @name get_coa_mappings
   * @summary Get CoA to Cash Flow Category Mappings
   * @request GET:/routes/coa-mappings/{organization_id}
   */
  get_coa_mappings = ({ organizationId, ...query }: GetCoaMappingsParams, params: RequestParams = {}) =>
    this.request<GetCoaMappingsData, GetCoaMappingsError>({
      path: `/routes/coa-mappings/${organizationId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Sets or replaces the entire mapping configuration for a specific organization.
   *
   * @tags CoA Mappings, dbtn/module:coa_mappings, dbtn/hasAuth
   * @name update_coa_mappings
   * @summary Update CoA to Cash Flow Category Mappings
   * @request PUT:/routes/coa-mappings/{organization_id}
   */
  update_coa_mappings = (
    { organizationId, ...query }: UpdateCoaMappingsParams,
    data: CoaCashFlowMappingsUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCoaMappingsData, UpdateCoaMappingsError>({
      path: `/routes/coa-mappings/${organizationId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Creates a new forecasting driver.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name create_driver
   * @summary Create Driver
   * @request POST:/routes/forecasting/drivers
   */
  create_driver = (data: DriverCreate, params: RequestParams = {}) =>
    this.request<CreateDriverData, CreateDriverError>({
      path: `/routes/forecasting/drivers`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lists all forecasting drivers for a given organization.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name list_drivers
   * @summary List Drivers
   * @request GET:/routes/forecasting/drivers
   */
  list_drivers = (query: ListDriversParams, params: RequestParams = {}) =>
    this.request<ListDriversData, ListDriversError>({
      path: `/routes/forecasting/drivers`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Gets a specific forecasting driver by its ID.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name get_driver
   * @summary Get Driver
   * @request GET:/routes/forecasting/drivers/{driver_id}
   */
  get_driver = ({ driverId, ...query }: GetDriverParams, params: RequestParams = {}) =>
    this.request<GetDriverData, GetDriverError>({
      path: `/routes/forecasting/drivers/${driverId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Updates an existing forecasting driver.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name update_driver
   * @summary Update Driver
   * @request PUT:/routes/forecasting/drivers/{driver_id}
   */
  update_driver = ({ driverId, ...query }: UpdateDriverParams, data: DriverUpdate, params: RequestParams = {}) =>
    this.request<UpdateDriverData, UpdateDriverError>({
      path: `/routes/forecasting/drivers/${driverId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a forecasting driver.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name delete_driver
   * @summary Delete Driver
   * @request DELETE:/routes/forecasting/drivers/{driver_id}
   */
  delete_driver = ({ driverId, ...query }: DeleteDriverParams, params: RequestParams = {}) =>
    this.request<DeleteDriverData, DeleteDriverError>({
      path: `/routes/forecasting/drivers/${driverId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Creates a new forecasting rule.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name create_forecasting_rule
   * @summary Create Forecasting Rule
   * @request POST:/routes/forecasting/rules
   */
  create_forecasting_rule = (data: RuleCreate, params: RequestParams = {}) =>
    this.request<CreateForecastingRuleData, CreateForecastingRuleError>({
      path: `/routes/forecasting/rules`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lists forecasting rules for an organization, optionally filtered by target account.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name list_forecasting_rules
   * @summary List Forecasting Rules
   * @request GET:/routes/forecasting/rules
   */
  list_forecasting_rules = (query: ListForecastingRulesParams, params: RequestParams = {}) =>
    this.request<ListForecastingRulesData, ListForecastingRulesError>({
      path: `/routes/forecasting/rules`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Gets a specific forecasting rule by ID.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name get_forecasting_rule
   * @summary Get Forecasting Rule
   * @request GET:/routes/forecasting/rules/{rule_id}
   */
  get_forecasting_rule = ({ ruleId, ...query }: GetForecastingRuleParams, params: RequestParams = {}) =>
    this.request<GetForecastingRuleData, GetForecastingRuleError>({
      path: `/routes/forecasting/rules/${ruleId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Updates an existing forecasting rule.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name update_forecasting_rule
   * @summary Update Forecasting Rule
   * @request PUT:/routes/forecasting/rules/{rule_id}
   */
  update_forecasting_rule = (
    { ruleId, ...query }: UpdateForecastingRuleParams,
    data: RuleUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateForecastingRuleData, UpdateForecastingRuleError>({
      path: `/routes/forecasting/rules/${ruleId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a forecasting rule.
   *
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name delete_forecasting_rule
   * @summary Delete Forecasting Rule
   * @request DELETE:/routes/forecasting/rules/{rule_id}
   */
  delete_forecasting_rule = ({ ruleId, ...query }: DeleteForecastingRuleParams, params: RequestParams = {}) =>
    this.request<DeleteForecastingRuleData, DeleteForecastingRuleError>({
      path: `/routes/forecasting/rules/${ruleId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Lists all dashboards accessible to the authenticated user (simplified to owner for now).
   *
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name list_dashboards
   * @summary List Dashboards
   * @request GET:/routes/dashboards
   */
  list_dashboards = (params: RequestParams = {}) =>
    this.request<ListDashboardsData, any>({
      path: `/routes/dashboards`,
      method: "GET",
      ...params,
    });

  /**
   * @description Creates a new dashboard configuration.
   *
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name create_dashboard
   * @summary Create Dashboard
   * @request POST:/routes/dashboards
   */
  create_dashboard = (data: DashboardCreate, params: RequestParams = {}) =>
    this.request<CreateDashboardData, CreateDashboardError>({
      path: `/routes/dashboards`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves a specific dashboard configuration.
   *
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name get_dashboard
   * @summary Get Dashboard
   * @request GET:/routes/dashboards/{dashboard_id}
   */
  get_dashboard = ({ dashboardId, ...query }: GetDashboardParams, params: RequestParams = {}) =>
    this.request<GetDashboardData, GetDashboardError>({
      path: `/routes/dashboards/${dashboardId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Updates an existing dashboard configuration.
   *
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name update_dashboard
   * @summary Update Dashboard
   * @request PUT:/routes/dashboards/{dashboard_id}
   */
  update_dashboard = (
    { dashboardId, ...query }: UpdateDashboardParams,
    data: DashboardUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateDashboardData, UpdateDashboardError>({
      path: `/routes/dashboards/${dashboardId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a dashboard configuration.
   *
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name delete_dashboard
   * @summary Delete Dashboard
   * @request DELETE:/routes/dashboards/{dashboard_id}
   */
  delete_dashboard = ({ dashboardId, ...query }: DeleteDashboardParams, params: RequestParams = {}) =>
    this.request<DeleteDashboardData, DeleteDashboardError>({
      path: `/routes/dashboards/${dashboardId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Calculates financial variances based on the provided request parameters. Fetches actual and comparison data (budget, prior period, prior year), computes absolute and percentage variances, and flags significant items. Args: payload (VarianceAnalysisRequest): Parameters specifying the analysis. # user (AuthorizedUser): The authenticated user (if required). Returns: VarianceAnalysisResponse: The results of the variance analysis.
   *
   * @tags Reporting, Variance Analysis, dbtn/module:variance_analysis, dbtn/hasAuth
   * @name calculate_variances
   * @summary Calculate Variances
   * @request POST:/routes/routes/reporting/variance-analysis/calculate
   */
  calculate_variances = (data: VarianceAnalysisRequest, params: RequestParams = {}) =>
    this.request<CalculateVariancesData, CalculateVariancesError>({
      path: `/routes/routes/reporting/variance-analysis/calculate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generates narrative explanations for significant financial variances using an LLM. Takes a list of significant variances (ideally filtered from the /calculate endpoint) and optional context to generate a cohesive narrative.
   *
   * @tags Reporting, Variance Analysis, dbtn/module:variance_analysis, dbtn/hasAuth
   * @name generate_variance_narrative2
   * @summary Generate Variance Narrative
   * @request POST:/routes/routes/reporting/variance-analysis/generate-narrative
   * @originalName generate_variance_narrative
   * @duplicate
   */
  generate_variance_narrative2 = (data: AppApisVarianceAnalysisNarrativeRequest, params: RequestParams = {}) =>
    this.request<GenerateVarianceNarrative2Data, GenerateVarianceNarrative2Error>({
      path: `/routes/routes/reporting/variance-analysis/generate-narrative`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name create_coa_mapping
   * @summary Create Coa Mapping
   * @request POST:/routes/consolidation/coa-mappings/
   */
  create_coa_mapping = (data: CoAMappingCreatePayload, params: RequestParams = {}) =>
    this.request<CreateCoaMappingData, CreateCoaMappingError>({
      path: `/routes/consolidation/coa-mappings/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name get_coa_mapping
   * @summary Get Coa Mapping
   * @request GET:/routes/consolidation/coa-mappings/{mapping_id}
   */
  get_coa_mapping = ({ mappingId, ...query }: GetCoaMappingParams, params: RequestParams = {}) =>
    this.request<GetCoaMappingData, GetCoaMappingError>({
      path: `/routes/consolidation/coa-mappings/${mappingId}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name update_coa_mapping
   * @summary Update Coa Mapping
   * @request PUT:/routes/consolidation/coa-mappings/{mapping_id}
   */
  update_coa_mapping = (
    { mappingId, ...query }: UpdateCoaMappingParams,
    data: CoAMappingUpdatePayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCoaMappingData, UpdateCoaMappingError>({
      path: `/routes/consolidation/coa-mappings/${mappingId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name delete_coa_mapping
   * @summary Delete Coa Mapping
   * @request DELETE:/routes/consolidation/coa-mappings/{mapping_id}
   */
  delete_coa_mapping = ({ mappingId, ...query }: DeleteCoaMappingParams, params: RequestParams = {}) =>
    this.request<DeleteCoaMappingData, DeleteCoaMappingError>({
      path: `/routes/consolidation/coa-mappings/${mappingId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * No description
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name list_coa_mappings_for_organization
   * @summary List Coa Mappings For Organization
   * @request GET:/routes/consolidation/coa-mappings/organization/{organization_id}
   */
  list_coa_mappings_for_organization = (
    { organizationId, ...query }: ListCoaMappingsForOrganizationParams,
    params: RequestParams = {},
  ) =>
    this.request<ListCoaMappingsForOrganizationData, ListCoaMappingsForOrganizationError>({
      path: `/routes/consolidation/coa-mappings/organization/${organizationId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Processes a consolidated trial balance and returns structured financial statements (Profit & Loss, Balance Sheet, Cash Flow Statement). NOTE: Balance Sheet and Cash Flow are placeholders. P&L is an initial implementation.
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name get_consolidated_financial_statements
   * @summary Get Consolidated Financial Statements
   * @request POST:/routes/consolidation/financial-statements
   */
  get_consolidated_financial_statements = (data: ConsolidationRequest, params: RequestParams = {}) =>
    this.request<GetConsolidatedFinancialStatementsData, GetConsolidatedFinancialStatementsError>({
      path: `/routes/consolidation/financial-statements`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description INTERNAL USE ONLY: Runs a hardcoded consolidation test scenario. Used to bypass test_endpoint limitations with complex JSON.
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name run_consolidation_internal_test
   * @summary Run Consolidation Internal Test
   * @request GET:/routes/consolidation/test-internal
   */
  run_consolidation_internal_test = (params: RequestParams = {}) =>
    this.request<RunConsolidationInternalTestData, any>({
      path: `/routes/consolidation/test-internal`,
      method: "GET",
      ...params,
    });

  /**
   * @description Calculates consolidated financials for a given group of entities and period. Requires financial data (trial balance) for each entity involved.
   *
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name calculate_consolidation
   * @summary Calculate Consolidation
   * @request POST:/routes/consolidation/calculate
   */
  calculate_consolidation = (data: ConsolidationRequest, params: RequestParams = {}) =>
    this.request<CalculateConsolidationData, CalculateConsolidationError>({
      path: `/routes/consolidation/calculate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
