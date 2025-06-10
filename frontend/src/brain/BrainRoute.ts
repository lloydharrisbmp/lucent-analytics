import {
  AccountForecastRequest,
  AddApplicationStepData,
  AddConnectionData,
  AdvancedForecastRequest,
  AdvancedMonteCarloRequest,
  AdvancedSensitivityAnalysisRequest,
  AnalyzeEngineSensitivityData,
  AnalyzeScenarioSensitivity2Data,
  AnalyzeScenarioSensitivityAdvancedData,
  AnalyzeScenarioSensitivityData,
  AnalyzeScenarioSensitivityEnhancedData,
  AnalyzeScoreTrendsData,
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
  AssignRoleData,
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
  BulkUpdateNotificationsPayload,
  BusinessEntityCreateRequest,
  BusinessEntityValidationRequest,
  BusinessPlanData,
  BusinessStructureType,
  CalculateCashFlowEndpointData,
  CalculateCashFlowRequest,
  CalculateConsolidationData,
  CalculateDetailedGstData,
  CalculateFinancialScoreData,
  CalculateGstEndpointData,
  CalculateIncomeTaxData,
  CalculateRelativePerformanceData,
  CalculateRoiForGrantData,
  CalculateScenarioImpactV2Data,
  CalculateScenarioImpactV3Data,
  CalculateVariancesData,
  CashFlowData,
  CheckHealthData,
  CoAMappingCreatePayload,
  CoAMappingUpdatePayload,
  CoaCashFlowMappingsUpdate,
  CommentCreate,
  CommentUpdate,
  CompanyData,
  CompareBenchmarkVersionsData,
  CompareGrantsData,
  CompareWithBenchmarksData,
  ConfirmDocumentUploadData,
  ConnectionCreateInput,
  ConnectionUpdateInput,
  ConsolidationRequest,
  CreateAdvancedForecastData,
  CreateApplicationData,
  CreateApplicationRequest,
  CreateBasStatement2Data,
  CreateBasStatementData,
  CreateBenchmarkMetricDefinitionData,
  CreateBenchmarkSourceData,
  CreateBudgetVersionData,
  CreateBudgetVersionRequest,
  CreateBusinessEntity2Data,
  CreateBusinessEntity2Payload,
  CreateCheckoutSessionData,
  CreateCheckoutSessionRequest,
  CreateCoaMappingData,
  CreateCommentData,
  CreateDashboardData,
  CreateDriverData,
  CreateEntityData,
  CreateForecastingRuleData,
  CreateGrantData,
  CreateMetricDefinitionPayload,
  CreateNotificationData,
  CreatePortalSessionData,
  CreateReportDefinitionData,
  CreateScenarioData,
  CreateScrapeSourceData,
  CreateSimpleDriverBasedForecastData,
  CreateSourcePayload,
  CreateTaxPlanningScenario3Data,
  CreateTaxPlanningScenarioData,
  CreateTaxPlanningScenarioV2Data,
  CreateTaxReturn2Data,
  CreateTaxReturnData,
  DashboardCreate,
  DashboardUpdate,
  DeleteApplicationEndpointData,
  DeleteApplicationStepData,
  DeleteBenchmarkMetricDefinitionData,
  DeleteBenchmarkSourceData,
  DeleteBudgetVersionData,
  DeleteCoaMappingData,
  DeleteCommentData,
  DeleteConnectionData,
  DeleteDashboardData,
  DeleteDocumentData,
  DeleteDriverData,
  DeleteForecastingRuleData,
  DeleteGrantData,
  DeleteReportDefinitionData,
  DeleteScenarioData,
  DeleteScheduleData,
  DeleteScrapeSourceData,
  DetectComplianceAnomaliesData,
  DetectTaxAnomaliesData,
  DismissNotificationData,
  DocumentUploadRequest,
  DownloadReportData,
  DriverCreate,
  DriverUpdate,
  EnhancedBASRequest,
  ExportReportData,
  ExportRequest,
  FetchWidgetDataData,
  ForecastAccountData,
  ForecastRequest,
  ForecastScoreData,
  GSTCalculationRequest,
  GenerateBasStatementData,
  GenerateComplianceAlertsData,
  GenerateDeadlineAlertsData,
  GenerateInsightsData,
  GenerateRecommendationsData,
  GenerateReportData,
  GenerateReportRequest,
  GenerateStrategicRecommendationsData,
  GenerateVarianceNarrative2Data,
  GenerateVarianceNarrativeData,
  GetApplicationData,
  GetApplicationRequirementsData,
  GetBenchmarkDataEndpointData,
  GetBenchmarkDataSummaryData,
  GetBenchmarkVersionsEndpointData,
  GetBoardReportingBestPracticesData,
  GetBudgetVersionData,
  GetBusinessEntity2Data,
  GetBusinessEntityData,
  GetBusinessTypesData,
  GetCoaMappingData,
  GetCoaMappingsData,
  GetCommentsData,
  GetConsolidatedFinancialStatementsData,
  GetContentPermissionsData,
  GetDashboardData,
  GetDataCollectionStrategyData,
  GetDriverData,
  GetFailurePatternsData,
  GetFailurePatternsLegacyData,
  GetFinancialHealthIndicatorsData,
  GetFinancialHealthIndicatorsLegacyData,
  GetFinancialRatiosLegacyData,
  GetForecastingRuleData,
  GetFundingTypesData,
  GetFxRatesData,
  GetGovernanceMetricsData,
  GetGrantCategoriesData,
  GetGrantData,
  GetHistoricalRecommendationsData,
  GetImport2Data,
  GetImportData,
  GetIndustryBenchmarkByCodeData,
  GetIndustryBenchmarkByCodeLegacyData,
  GetIndustryBenchmarksData,
  GetIndustryBenchmarksLegacyData,
  GetIndustryListData,
  GetIndustryMetricsData,
  GetIndustrySeasonalityData,
  GetOrganizationSubscriptionData,
  GetRatiosByCategoryData,
  GetRatiosByCategoryLegacyData,
  GetReportDefinitionData,
  GetReportingStandardsData,
  GetScenarioData,
  GetScheduleData,
  GetScrapeStatusData,
  GetStatesData,
  GetSubscriptionPlansData,
  GetTaxObligations2Data,
  GetTaxObligationsData,
  GetUserPermissionsData,
  GrantAccessData,
  GrantComparisonRequest,
  GrantCreateRequest,
  GrantMatchRequest,
  GrantUpdateRequest,
  ImportMappingRequest,
  ImportMyobTrialBalanceData,
  InsightRequest,
  ListApplicationsData,
  ListBenchmarkMetricDefinitionsData,
  ListBenchmarkSourcesData,
  ListBudgetVersionsData,
  ListBusinessEntitiesData,
  ListBusinessPlansData,
  ListCoaMappingsForOrganizationData,
  ListConnectionsData,
  ListDashboardsData,
  ListDocumentsData,
  ListDriversData,
  ListForecastingRulesData,
  ListGrantsData,
  ListImports2Data,
  ListImportsData,
  ListNotificationsData,
  ListReportDefinitionsData,
  ListScenariosData,
  ListSchedulesData,
  ListScopeRolesData,
  ListScrapeSourcesData,
  ListUserRolesData,
  LoadBusinessPlanData,
  ManualDeliverReportData,
  MarkNotificationReadData,
  MatchGrantsData,
  MetricsQuery,
  MyobTrialBalanceImportRequest,
  NotificationCreate,
  OptimizationRequest,
  OptimizeCashFlowData,
  OptimizeGrantStrategyData,
  PrepareDocumentUploadData,
  ProcessFinancialDataData,
  PurgeOldAuditLogsData,
  QueryAuditLogsData,
  ROICalculationRequest,
  RecommendationRequest,
  RelativePerformanceRequest,
  ReportDefinitionCreate,
  ReportFeedback,
  ReportFormat,
  ReportingStandardsQuery,
  RevokeAccessData,
  RevokeRoleData,
  RevokeRoleRequest,
  RoleAssignmentCreate,
  RuleCreate,
  RuleUpdate,
  RunComplianceChecksData,
  RunComplianceChecksPayload,
  RunConsolidationInternalTestData,
  RunMonteCarloSimulation2Data,
  RunMonteCarloSimulationAdvancedData,
  RunMonteCarloSimulationData,
  RunMonteCarloSimulationEnhancedData,
  RunScenarioMonteCarloSimulationData,
  SaveBusinessPlanData,
  ScenarioApplyRequest,
  ScenarioCreate,
  ScenarioResponseRequest,
  ScenarioUpdate,
  ScheduleReportData,
  ScheduleRequest,
  ScrapeGrantsData,
  ScrapeRequest,
  ScrapeSource,
  ShareActionRequest,
  SimpleForecastRequest,
  StepStatusUpdate,
  StripeWebhookData,
  SubmitFeedbackData,
  SubscriptionPortalRequest,
  TaxCalculationRequest,
  TaxObligationValidationRequest,
  TaxPlanningRequest,
  TaxPlanningScenario,
  TaxReturnInput,
  TaxReturnRequest,
  TestConnectionData,
  TimeSeriesData,
  TrendAnalysisRequest,
  UpdateApplicationData,
  UpdateApplicationStepData,
  UpdateBenchmarkDataData,
  UpdateBenchmarkMetricDefinitionData,
  UpdateBenchmarkRequest,
  UpdateBenchmarkSourceData,
  UpdateBudgetVersionData,
  UpdateBudgetVersionRequest,
  UpdateBusinessEntityData,
  UpdateCoaMappingData,
  UpdateCoaMappingsData,
  UpdateCommentData,
  UpdateConnectionData,
  UpdateDashboardData,
  UpdateDriverData,
  UpdateForecastingRuleData,
  UpdateGrantData,
  UpdateMetricDefinitionPayload,
  UpdateReportDefinitionData,
  UpdateScenarioData,
  UpdateScheduleData,
  UpdateScheduleRequest,
  UpdateScrapeSourceData,
  UpdateSourcePayload,
  UploadBenchmarkDataData,
  UploadFinancialDataData,
  UploadFinancialDataLegacyData,
  UploadFxRatesData,
  UploadOrganizationFinancialDataData,
  ValidateBusinessEntityData,
  ValidateTaxObligationsData,
  VarianceAnalysisRequest,
  WidgetConfiguration,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Create a tax return for a business entity with entity-specific calculations
   * @tags dbtn/module:tax_returns, dbtn/hasAuth
   * @name create_tax_return2
   * @summary Create Tax Return2
   * @request POST:/routes/tax-returns/create-tax-return
   */
  export namespace create_tax_return2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxReturnRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTaxReturn2Data;
  }

  /**
   * @description Create an advanced tax planning scenario with entity-specific optimizations
   * @tags dbtn/module:tax_returns, dbtn/hasAuth
   * @name create_tax_planning_scenario3
   * @summary Create Tax Planning Scenario3
   * @request POST:/routes/tax-planning/create-scenario3
   */
  export namespace create_tax_planning_scenario3 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxReturnRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTaxPlanningScenario3Data;
  }

  /**
   * @description Calculate income tax for a business entity
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name calculate_income_tax
   * @summary Calculate Income Tax
   * @request POST:/routes/calculate-income-tax
   */
  export namespace calculate_income_tax {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxCalculationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateIncomeTaxData;
  }

  /**
   * @description Calculate GST for a business entity
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name calculate_gst_endpoint
   * @summary Calculate Gst Endpoint
   * @request POST:/routes/calculate-gst
   */
  export namespace calculate_gst_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GSTCalculationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateGstEndpointData;
  }

  /**
   * @description Generate a BAS statement for a business entity
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name generate_bas_statement
   * @summary Generate Bas Statement
   * @request POST:/routes/generate-bas
   */
  export namespace generate_bas_statement {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BASGenerationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateBasStatementData;
  }

  /**
   * @description Create a tax planning scenario for a business entity
   * @tags dbtn/module:tax_calculator, dbtn/hasAuth
   * @name create_tax_planning_scenario_v2
   * @summary Create Tax Planning Scenario V2
   * @request POST:/routes/tax-planning/create-scenario
   */
  export namespace create_tax_planning_scenario_v2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxPlanningRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTaxPlanningScenarioV2Data;
  }

  /**
   * @description Generate an enhanced BAS statement with detailed breakdown
   * @tags dbtn/module:tax_obligations, dbtn/hasAuth
   * @name create_bas_statement2
   * @summary Create Bas Statement2
   * @request POST:/routes/bas/create-statement
   */
  export namespace create_bas_statement2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EnhancedBASRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBasStatement2Data;
  }

  /**
   * @description Get tax obligations for an entity for a specific year
   * @tags dbtn/module:tax_obligations, dbtn/hasAuth
   * @name get_tax_obligations2
   * @summary Get Tax Obligations2
   * @request GET:/routes/tax-obligations
   */
  export namespace get_tax_obligations2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Entity Id */
      entity_id: string;
      /** Year */
      year: number;
      /**
       * Include Completed
       * @default false
       */
      include_completed?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTaxObligations2Data;
  }

  /**
   * @description Calculate detailed GST breakdown for BAS
   * @tags dbtn/module:tax_obligations, dbtn/hasAuth
   * @name calculate_detailed_gst
   * @summary Calculate Detailed Gst
   * @request POST:/routes/bas/calculate-gst
   */
  export namespace calculate_detailed_gst {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EnhancedBASRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateDetailedGstData;
  }

  /**
   * @description Get seasonality patterns for a specific Australian industry
   * @tags dbtn/module:seasonality, dbtn/hasAuth
   * @name get_industry_seasonality
   * @summary Get Industry Seasonality
   * @request GET:/routes/seasonality/{industry}
   */
  export namespace get_industry_seasonality {
    export type RequestParams = {
      /** Industry */
      industry: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIndustrySeasonalityData;
  }

  /**
   * No description
   * @tags dbtn/module:advanced_forecasting, dbtn/hasAuth
   * @name create_advanced_forecast
   * @summary Create Advanced Forecast
   * @request POST:/routes/advanced-forecast
   */
  export namespace create_advanced_forecast {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AdvancedForecastRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateAdvancedForecastData;
  }

  /**
   * @description Generate cash flow optimization recommendations
   * @tags dbtn/module:cash_flow_recommendations, dbtn/hasAuth
   * @name optimize_cash_flow
   * @summary Optimize Cash Flow
   * @request POST:/routes/optimize
   */
  export namespace optimize_cash_flow {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CashFlowData;
    export type RequestHeaders = {};
    export type ResponseBody = OptimizeCashFlowData;
  }

  /**
   * @description Get historical cash flow recommendations for a company
   * @tags dbtn/module:cash_flow_recommendations, dbtn/hasAuth
   * @name get_historical_recommendations
   * @summary Get Historical Recommendations
   * @request GET:/routes/historical/{company_id}
   */
  export namespace get_historical_recommendations {
    export type RequestParams = {
      /** Company Id */
      companyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetHistoricalRecommendationsData;
  }

  /**
   * No description
   * @tags dbtn/module:scenario_calculator, dbtn/hasAuth
   * @name analyze_scenario_sensitivity2
   * @summary Analyze Scenario Sensitivity2
   * @request POST:/routes/scenario-sensitivity-analysis
   */
  export namespace analyze_scenario_sensitivity2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioCalculatorSensitivityAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeScenarioSensitivity2Data;
  }

  /**
   * No description
   * @tags dbtn/module:scenario_calculator, dbtn/hasAuth
   * @name run_monte_carlo_simulation2
   * @summary Run Monte Carlo Simulation2
   * @request POST:/routes/scenario-monte-carlo-simulation
   */
  export namespace run_monte_carlo_simulation2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioCalculatorMonteCarloSimulationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RunMonteCarloSimulation2Data;
  }

  /**
   * No description
   * @tags dbtn/module:scenario_calculator, dbtn/hasAuth
   * @name calculate_scenario_impact_v3
   * @summary Calculate Scenario Impact V3
   * @request POST:/routes/calculate-scenario-impact-v3
   */
  export namespace calculate_scenario_impact_v3 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioCalculatorEnhancedCalculateScenarioRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateScenarioImpactV3Data;
  }

  /**
   * @description List government grants and incentives with optional filtering
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name list_grants
   * @summary List Grants
   * @request GET:/routes/grants
   */
  export namespace list_grants {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListGrantsData;
  }

  /**
   * @description Create a new grant in the database
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name create_grant
   * @summary Create Grant
   * @request POST:/routes/grants
   */
  export namespace create_grant {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GrantCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateGrantData;
  }

  /**
   * @description Get detailed information about a specific grant
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_grant
   * @summary Get Grant
   * @request GET:/routes/grants/{grant_id}
   */
  export namespace get_grant {
    export type RequestParams = {
      /** Grant Id */
      grantId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetGrantData;
  }

  /**
   * @description Update an existing grant in the database
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name update_grant
   * @summary Update Grant
   * @request PUT:/routes/grants/{grant_id}
   */
  export namespace update_grant {
    export type RequestParams = {
      /** Grant Id */
      grantId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = GrantUpdateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateGrantData;
  }

  /**
   * @description Delete a grant from the database
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name delete_grant
   * @summary Delete Grant
   * @request DELETE:/routes/grants/{grant_id}
   */
  export namespace delete_grant {
    export type RequestParams = {
      /** Grant Id */
      grantId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteGrantData;
  }

  /**
   * @description Get a list of all grant categories
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_grant_categories
   * @summary Get Grant Categories
   * @request GET:/routes/grants/categories
   */
  export namespace get_grant_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetGrantCategoriesData;
  }

  /**
   * @description Get a list of all business types eligible for grants
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_business_types
   * @summary Get Business Types
   * @request GET:/routes/grants/business-types
   */
  export namespace get_business_types {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessTypesData;
  }

  /**
   * @description Get a list of all states with grants
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_states
   * @summary Get States
   * @request GET:/routes/grants/states
   */
  export namespace get_states {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStatesData;
  }

  /**
   * @description Get a list of all funding types
   * @tags dbtn/module:government_grants, dbtn/hasAuth
   * @name get_funding_types
   * @summary Get Funding Types
   * @request GET:/routes/grants/funding-types
   */
  export namespace get_funding_types {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFundingTypesData;
  }

  /**
   * @description Perform sensitivity analysis on a scenario
   * @tags dbtn/module:calculation_engine, dbtn/hasAuth
   * @name analyze_engine_sensitivity
   * @summary Analyze Engine Sensitivity
   * @request POST:/routes/calculation-engine/analyze-sensitivity
   */
  export namespace analyze_engine_sensitivity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisCalculationEngineSensitivityAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeEngineSensitivityData;
  }

  /**
   * @description Run Monte Carlo simulation on a scenario without enhancement
   * @tags dbtn/module:calculation_engine, dbtn/hasAuth
   * @name run_monte_carlo_simulation
   * @summary Run Monte Carlo Simulation
   * @request POST:/routes/calculation-engine/run-monte-carlo
   */
  export namespace run_monte_carlo_simulation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisCalculationEngineMonteCarloSimulationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RunMonteCarloSimulationData;
  }

  /**
   * @description Run an advanced Monte Carlo simulation for financial scenario analysis
   * @tags dbtn/module:scenario_analysis, dbtn/hasAuth
   * @name run_monte_carlo_simulation_enhanced
   * @summary Run Monte Carlo Simulation Enhanced
   * @request POST:/routes/run-monte-carlo-simulation-enhanced
   */
  export namespace run_monte_carlo_simulation_enhanced {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioAnalysisMonteCarloSimulationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RunMonteCarloSimulationEnhancedData;
  }

  /**
   * @description Analyze the sensitivity of scenario outcomes to parameter changes - optimized for UI integration
   * @tags dbtn/module:scenario_analysis, dbtn/hasAuth
   * @name analyze_scenario_sensitivity_enhanced
   * @summary Analyze Scenario Sensitivity Enhanced
   * @request POST:/routes/analyze-scenario-sensitivity2
   */
  export namespace analyze_scenario_sensitivity_enhanced {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioAnalysisSensitivityAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeScenarioSensitivityEnhancedData;
  }

  /**
   * @description Match a business profile with suitable grants and return scored matches
   * @tags dbtn/module:grant_matcher, dbtn/hasAuth
   * @name match_grants
   * @summary Match Grants
   * @request POST:/routes/match-grants
   */
  export namespace match_grants {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GrantMatchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = MatchGrantsData;
  }

  /**
   * @description Start a background task to scrape government websites for grants
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name scrape_grants
   * @summary Scrape Grants
   * @request POST:/routes/grants/scrape
   */
  export namespace scrape_grants {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ScrapeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ScrapeGrantsData;
  }

  /**
   * @description Get the status of recent scraping operations
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name get_scrape_status
   * @summary Get Scrape Status
   * @request GET:/routes/grants/scrape/status
   */
  export namespace get_scrape_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetScrapeStatusData;
  }

  /**
   * @description List all available scraping sources
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name list_scrape_sources
   * @summary List Scrape Sources
   * @request GET:/routes/grants/scrape/sources
   */
  export namespace list_scrape_sources {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListScrapeSourcesData;
  }

  /**
   * @description Create a new scraping source
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name create_scrape_source
   * @summary Create Scrape Source
   * @request POST:/routes/grants/scrape/sources
   */
  export namespace create_scrape_source {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ScrapeSource;
    export type RequestHeaders = {};
    export type ResponseBody = CreateScrapeSourceData;
  }

  /**
   * @description Update a scraping source
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name update_scrape_source
   * @summary Update Scrape Source
   * @request PUT:/routes/grants/scrape/sources/{source_id}
   */
  export namespace update_scrape_source {
    export type RequestParams = {
      /** Source Id */
      sourceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ScrapeSource;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateScrapeSourceData;
  }

  /**
   * @description Delete a scraping source
   * @tags dbtn/module:grants_admin, dbtn/hasAuth
   * @name delete_scrape_source
   * @summary Delete Scrape Source
   * @request DELETE:/routes/grants/scrape/sources/{source_id}
   */
  export namespace delete_scrape_source {
    export type RequestParams = {
      /** Source Id */
      sourceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteScrapeSourceData;
  }

  /**
   * @description Create a new grant application
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name create_application
   * @summary Create Application
   * @request POST:/routes/applications
   */
  export namespace create_application {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateApplicationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateApplicationData;
  }

  /**
   * @description List all applications for a user
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name list_applications
   * @summary List Applications
   * @request GET:/routes/applications
   */
  export namespace list_applications {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: string | null;
      /** Grant Id */
      grant_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListApplicationsData;
  }

  /**
   * @description Get a specific application
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name get_application
   * @summary Get Application
   * @request GET:/routes/applications/{application_id}
   */
  export namespace get_application {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetApplicationData;
  }

  /**
   * @description Update an application status
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name update_application
   * @summary Update Application
   * @request PUT:/routes/applications/{application_id}
   */
  export namespace update_application {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ApplicationStatusUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateApplicationData;
  }

  /**
   * @description Delete an application
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name delete_application_endpoint
   * @summary Delete Application Endpoint
   * @request DELETE:/routes/applications/{application_id}
   */
  export namespace delete_application_endpoint {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteApplicationEndpointData;
  }

  /**
   * @description Update an application step
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name update_application_step
   * @summary Update Application Step
   * @request PUT:/routes/applications/{application_id}/steps/{step_id}
   */
  export namespace update_application_step {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
      /** Step Id */
      stepId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = StepStatusUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateApplicationStepData;
  }

  /**
   * @description Delete a step from an application
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name delete_application_step
   * @summary Delete Application Step
   * @request DELETE:/routes/applications/{application_id}/steps/{step_id}
   */
  export namespace delete_application_step {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
      /** Step Id */
      stepId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteApplicationStepData;
  }

  /**
   * @description Add a new step to an application
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name add_application_step
   * @summary Add Application Step
   * @request POST:/routes/applications/{application_id}/steps
   */
  export namespace add_application_step {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ApplicationStep;
    export type RequestHeaders = {};
    export type ResponseBody = AddApplicationStepData;
  }

  /**
   * @description Prepare for document upload and return upload URL
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name prepare_document_upload
   * @summary Prepare Document Upload
   * @request POST:/routes/applications/{application_id}/documents
   */
  export namespace prepare_document_upload {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DocumentUploadRequest;
    export type RequestHeaders = {};
    export type ResponseBody = PrepareDocumentUploadData;
  }

  /**
   * @description List documents for an application or step
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/applications/{application_id}/documents
   */
  export namespace list_documents {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
    };
    export type RequestQuery = {
      /** Step Id */
      step_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListDocumentsData;
  }

  /**
   * @description Confirm document upload and add to the application
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name confirm_document_upload
   * @summary Confirm Document Upload
   * @request POST:/routes/applications/{application_id}/documents/{document_id}/confirm
   */
  export namespace confirm_document_upload {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DocumentUploadRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ConfirmDocumentUploadData;
  }

  /**
   * @description Delete a document from an application or step
   * @tags dbtn/module:grant_applications, dbtn/hasAuth
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/applications/{application_id}/documents/{document_id}
   */
  export namespace delete_document {
    export type RequestParams = {
      /** Application Id */
      applicationId: string;
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** Step Id */
      step_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteDocumentData;
  }

  /**
   * @description Calculate the ROI for a specific grant application
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name calculate_roi_for_grant
   * @summary Calculate Roi For Grant
   * @request POST:/routes/grant-roi-calculator/calculate
   */
  export namespace calculate_roi_for_grant {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ROICalculationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateRoiForGrantData;
  }

  /**
   * @description Compare ROI and other metrics for multiple grants
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name compare_grants
   * @summary Compare Grants
   * @request POST:/routes/grant-roi-calculator/compare
   */
  export namespace compare_grants {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GrantComparisonRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CompareGrantsData;
  }

  /**
   * @description Optimize grant application strategy based on constraints and preferences
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name optimize_grant_strategy
   * @summary Optimize Grant Strategy
   * @request POST:/routes/grant-roi-calculator/optimize
   */
  export namespace optimize_grant_strategy {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = OptimizationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = OptimizeGrantStrategyData;
  }

  /**
   * @description Get detailed workload and requirements breakdown for a grant application
   * @tags dbtn/module:grant_roi_calculator, dbtn/hasAuth
   * @name get_application_requirements
   * @summary Get Application Requirements
   * @request GET:/routes/grant-roi-calculator/requirements/{grant_id}
   */
  export namespace get_application_requirements {
    export type RequestParams = {
      /** Grant Id */
      grantId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetApplicationRequirementsData;
  }

  /**
   * @description Get comprehensive Australian financial health indicators including ratios, benchmarks, and failure patterns.
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_financial_health_indicators
   * @summary Get Financial Health Indicators
   * @request GET:/routes/financial-health-indicators
   */
  export namespace get_financial_health_indicators {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFinancialHealthIndicatorsData;
  }

  /**
   * @description Get financial ratios filtered by category.
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_ratios_by_category
   * @summary Get Ratios By Category
   * @request GET:/routes/financial-ratios-by-category/{category}
   */
  export namespace get_ratios_by_category {
    export type RequestParams = {
      /** Category */
      category: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRatiosByCategoryData;
  }

  /**
   * @description Get common business failure patterns in Australian businesses.
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_failure_patterns
   * @summary Get Failure Patterns
   * @request GET:/routes/financial-failure-patterns
   */
  export namespace get_failure_patterns {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFailurePatternsData;
  }

  /**
   * @description Get financial benchmarks for Australian industries by business size.
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_industry_benchmarks
   * @summary Get Industry Benchmarks
   * @request GET:/routes/industry-benchmarks
   */
  export namespace get_industry_benchmarks {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIndustryBenchmarksData;
  }

  /**
   * @description Get financial benchmarks for a specific Australian industry by code.
   * @tags dbtn/module:financial_health_indicators, dbtn/hasAuth
   * @name get_industry_benchmark_by_code
   * @summary Get Industry Benchmark By Code
   * @request GET:/routes/industry-benchmark/{industry_code}
   */
  export namespace get_industry_benchmark_by_code {
    export type RequestParams = {
      /** Industry Code */
      industryCode: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIndustryBenchmarkByCodeData;
  }

  /**
   * @description Get financial health indicators for Australian businesses (legacy endpoint)
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_financial_health_indicators_legacy
   * @summary Get Financial Health Indicators Legacy
   * @request GET:/routes/financial-health-indicators-legacy
   */
  export namespace get_financial_health_indicators_legacy {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFinancialHealthIndicatorsLegacyData;
  }

  /**
   * @description Get financial ratios and their benchmarks (legacy endpoint)
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_financial_ratios_legacy
   * @summary Get Financial Ratios Legacy
   * @request GET:/routes/financial-ratios-legacy
   */
  export namespace get_financial_ratios_legacy {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFinancialRatiosLegacyData;
  }

  /**
   * @description Get common business failure patterns and warning signs (legacy endpoint)
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_failure_patterns_legacy
   * @summary Get Failure Patterns Legacy
   * @request GET:/routes/failure-patterns-legacy
   */
  export namespace get_failure_patterns_legacy {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFailurePatternsLegacyData;
  }

  /**
   * @description Get industry benchmarks by business size (legacy endpoint)
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_industry_benchmarks_legacy
   * @summary Get Industry Benchmarks Legacy
   * @request GET:/routes/industry-benchmarks-legacy
   */
  export namespace get_industry_benchmarks_legacy {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIndustryBenchmarksLegacyData;
  }

  /**
   * @description Get industry benchmarks for a specific industry code (legacy endpoint)
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_industry_benchmark_by_code_legacy
   * @summary Get Industry Benchmark By Code Legacy
   * @request GET:/routes/industry-benchmarks-legacy/{industry_code}
   */
  export namespace get_industry_benchmark_by_code_legacy {
    export type RequestParams = {
      /** Industry Code */
      industryCode: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIndustryBenchmarkByCodeLegacyData;
  }

  /**
   * @description Get financial ratios by category (Profitability, Liquidity, Leverage, Efficiency) (legacy endpoint)
   * @tags dbtn/module:financial_health, dbtn/hasAuth
   * @name get_ratios_by_category_legacy
   * @summary Get Ratios By Category Legacy
   * @request GET:/routes/financial-ratios-legacy/{category}
   */
  export namespace get_ratios_by_category_legacy {
    export type RequestParams = {
      /** Category */
      category: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRatiosByCategoryLegacyData;
  }

  /**
   * @description Calculate financial health score based on company metrics
   * @tags dbtn/module:financial_scoring, dbtn/hasAuth
   * @name calculate_financial_score
   * @summary Calculate Financial Score
   * @request POST:/routes/calculate-financial-score
   */
  export namespace calculate_financial_score {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CompanyData;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateFinancialScoreData;
  }

  /**
   * @description Analyze trends in financial health scores over time
   * @tags dbtn/module:financial_scoring, dbtn/hasAuth
   * @name analyze_score_trends
   * @summary Analyze Score Trends
   * @request POST:/routes/trend-analysis
   */
  export namespace analyze_score_trends {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TrendAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeScoreTrendsData;
  }

  /**
   * @description Calculate company performance relative to industry benchmarks with cross-industry normalization
   * @tags dbtn/module:financial_scoring, dbtn/hasAuth
   * @name calculate_relative_performance
   * @summary Calculate Relative Performance
   * @request POST:/routes/relative-performance
   */
  export namespace calculate_relative_performance {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RelativePerformanceRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateRelativePerformanceData;
  }

  /**
   * @description Generate prioritized recommendations based on financial health assessment
   * @tags dbtn/module:recommendation_engine, dbtn/hasAuth
   * @name generate_recommendations
   * @summary Generate Recommendations
   * @request POST:/routes/generate-financial-recommendations
   */
  export namespace generate_recommendations {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RecommendationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateRecommendationsData;
  }

  /**
   * @description Retrieve Australian reporting standards based on entity type, size, and standard type.
   * @tags dbtn/module:reporting_standards, dbtn/hasAuth
   * @name get_reporting_standards
   * @summary Get Reporting Standards
   * @request POST:/routes/get-reporting-standards
   */
  export namespace get_reporting_standards {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReportingStandardsQuery;
    export type RequestHeaders = {};
    export type ResponseBody = GetReportingStandardsData;
  }

  /**
   * @description Retrieve best practices for board reporting in Australia based on industry, entity size, type, and report type.
   * @tags dbtn/module:board_reporting, dbtn/hasAuth
   * @name get_board_reporting_best_practices
   * @summary Get Board Reporting Best Practices
   * @request POST:/routes/best-practices
   */
  export namespace get_board_reporting_best_practices {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BoardReportingQuery;
    export type RequestHeaders = {};
    export type ResponseBody = GetBoardReportingBestPracticesData;
  }

  /**
   * @description Retrieve key governance and reporting metrics based on entity type, size, industry, and governance area.
   * @tags dbtn/module:governance_metrics, dbtn/hasAuth
   * @name get_governance_metrics
   * @summary Get Governance Metrics
   * @request POST:/routes/key-metrics
   */
  export namespace get_governance_metrics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MetricsQuery;
    export type RequestHeaders = {};
    export type ResponseBody = GetGovernanceMetricsData;
  }

  /**
   * @description Generate insights from financial metrics.
   * @tags dbtn/module:financial_insights, dbtn/hasAuth
   * @name generate_insights
   * @summary Generate Insights
   * @request POST:/routes/generate-insights
   */
  export namespace generate_insights {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = InsightRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateInsightsData;
  }

  /**
   * @description Saves a new version of the business plan to Firestore for the logged-in user. Each save creates a new document, providing basic versioning. (Temporarily Disabled)
   * @tags Business Plans, dbtn/module:business_plans, dbtn/hasAuth
   * @name save_business_plan
   * @summary Save Business Plan
   * @request POST:/routes/business-plans/save
   */
  export namespace save_business_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BusinessPlanData;
    export type RequestHeaders = {};
    export type ResponseBody = SaveBusinessPlanData;
  }

  /**
   * @description Lists all saved business plans (metadata only) for the logged-in user, ordered by last saved date descending. (Temporarily Disabled)
   * @tags Business Plans, dbtn/module:business_plans, dbtn/hasAuth
   * @name list_business_plans
   * @summary List Business Plans
   * @request GET:/routes/business-plans/list
   */
  export namespace list_business_plans {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListBusinessPlansData;
  }

  /**
   * @description Loads the full data for a specific business plan belonging to the logged-in user. (Temporarily Disabled)
   * @tags Business Plans, dbtn/module:business_plans, dbtn/hasAuth
   * @name load_business_plan
   * @summary Load Business Plan
   * @request GET:/routes/business-plans/load/{plan_id}
   */
  export namespace load_business_plan {
    export type RequestParams = {
      /** Plan Id */
      planId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = LoadBusinessPlanData;
  }

  /**
   * @description Get a business entity by ID
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name get_business_entity2
   * @summary Get Business Entity2
   * @request GET:/routes/business-entities/{entity_id}
   */
  export namespace get_business_entity2 {
    export type RequestParams = {
      /** Entity Id */
      entityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessEntity2Data;
  }

  /**
   * @description Create a new business entity
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_business_entity2
   * @summary Create Business Entity2
   * @request POST:/routes/business-entities/
   */
  export namespace create_business_entity2 {
    export type RequestParams = {};
    export type RequestQuery = {
      entity_type: BusinessStructureType;
    };
    export type RequestBody = CreateBusinessEntity2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBusinessEntity2Data;
  }

  /**
   * @description Get tax obligations for an entity
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name get_tax_obligations
   * @summary Get Tax Obligations
   * @request GET:/routes/tax-obligations/{entity_id}
   */
  export namespace get_tax_obligations {
    export type RequestParams = {
      /** Entity Id */
      entityId: string;
    };
    export type RequestQuery = {
      /** Period Start */
      period_start?: string | null;
      /** Period End */
      period_end?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTaxObligationsData;
  }

  /**
   * @description Create a new tax return
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_tax_return
   * @summary Create Tax Return
   * @request POST:/routes/tax-returns/
   */
  export namespace create_tax_return {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxReturnInput;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTaxReturnData;
  }

  /**
   * @description Create a new BAS statement
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_bas_statement
   * @summary Create Bas Statement
   * @request POST:/routes/bas-statements/
   */
  export namespace create_bas_statement {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BASStatement;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBasStatementData;
  }

  /**
   * @description Create a new tax planning scenario
   * @tags dbtn/module:tax_compliance_schema, dbtn/hasAuth
   * @name create_tax_planning_scenario
   * @summary Create Tax Planning Scenario
   * @request POST:/routes/tax-planning/scenarios/
   */
  export namespace create_tax_planning_scenario {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxPlanningScenario;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTaxPlanningScenarioData;
  }

  /**
   * @description Create a new business entity
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name create_entity
   * @summary Create Entity
   * @request POST:/routes/business-entity
   */
  export namespace create_entity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BusinessEntityCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateEntityData;
  }

  /**
   * @description Get a business entity by ID
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name get_business_entity
   * @summary Get Business Entity
   * @request GET:/routes/business-entity/{entity_id}
   */
  export namespace get_business_entity {
    export type RequestParams = {
      /** Entity Id */
      entityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessEntityData;
  }

  /**
   * @description Update a business entity
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name update_business_entity
   * @summary Update Business Entity
   * @request PUT:/routes/business-entity/{entity_id}
   */
  export namespace update_business_entity {
    export type RequestParams = {
      /** Entity Id */
      entityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = BusinessEntityCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBusinessEntityData;
  }

  /**
   * @description List all business entities
   * @tags dbtn/module:business_entity, dbtn/hasAuth
   * @name list_business_entities
   * @summary List Business Entities
   * @request GET:/routes/business-entities
   */
  export namespace list_business_entities {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListBusinessEntitiesData;
  }

  /**
   * @description Uploads FX rates from a CSV file. Expects columns: date, from_currency, to_currency, rate. Appends to existing rates, removes duplicates (keeping latest), and sorts.
   * @tags FX Rates, dbtn/module:fx_rates, dbtn/hasAuth
   * @name upload_fx_rates
   * @summary Upload Fx Rates
   * @request POST:/routes/fx-rates/upload
   */
  export namespace upload_fx_rates {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadFxRates;
    export type RequestHeaders = {};
    export type ResponseBody = UploadFxRatesData;
  }

  /**
   * @description Retrieves FX rates, optionally filtering by date range and currencies.
   * @tags FX Rates, dbtn/module:fx_rates, dbtn/hasAuth
   * @name get_fx_rates
   * @summary Get Fx Rates
   * @request GET:/routes/fx-rates
   */
  export namespace get_fx_rates {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Start Date */
      start_date?: string | null;
      /** End Date */
      end_date?: string | null;
      /** From Currency */
      from_currency?: string | null;
      /** To Currency */
      to_currency?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFxRatesData;
  }

  /**
   * @description Lists all data source connections for the user's organization.
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name list_connections
   * @summary List Connections
   * @request GET:/routes/connections/
   */
  export namespace list_connections {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListConnectionsData;
  }

  /**
   * @description Adds a new data source connection for the user's organization.
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name add_connection
   * @summary Add Connection
   * @request POST:/routes/connections/
   */
  export namespace add_connection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ConnectionCreateInput;
    export type RequestHeaders = {};
    export type ResponseBody = AddConnectionData;
  }

  /**
   * @description Updates an existing data source connection.
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name update_connection
   * @summary Update Connection
   * @request PUT:/routes/connections/{connection_id}
   */
  export namespace update_connection {
    export type RequestParams = {
      /** Connection Id */
      connectionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ConnectionUpdateInput;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateConnectionData;
  }

  /**
   * @description Deletes a data source connection.
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name delete_connection
   * @summary Delete Connection
   * @request DELETE:/routes/connections/{connection_id}
   */
  export namespace delete_connection {
    export type RequestParams = {
      /** Connection Id */
      connectionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteConnectionData;
  }

  /**
   * @description (Placeholder) Tests the connectivity of a data source connection.
   * @tags Data Connections, dbtn/module:data_connections, dbtn/hasAuth
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/connections/{connection_id}/test
   */
  export namespace test_connection {
    export type RequestParams = {
      /** Connection Id */
      connectionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestConnectionData;
  }

  /**
   * @description Generates a basic report based on a definition ID. Fetches the definition, retrieves the corresponding processed financial data (JSON), and structures it according to the definition's rows/columns (basic implementation).
   * @tags Report Engine, dbtn/module:report_engine, dbtn/hasAuth
   * @name generate_report
   * @summary Generate Report
   * @request POST:/routes/report-engine/generate-report
   */
  export namespace generate_report {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateReportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateReportData;
  }

  /**
   * @description Generates a narrative explanation for a given significant financial variance using an LLM.
   * @tags Narrative Generation, LLM, dbtn/module:narrative_generation, dbtn/hasAuth
   * @name generate_variance_narrative
   * @summary Generate Variance Narrative
   * @request POST:/routes/narrative-generation/generate-variance-narrative
   */
  export namespace generate_variance_narrative {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisNarrativeGenerationNarrativeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateVarianceNarrativeData;
  }

  /**
   * No description
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name validate_business_entity
   * @summary Validate Business Entity
   * @request POST:/routes/compliance-validator/validate-entity
   */
  export namespace validate_business_entity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BusinessEntityValidationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ValidateBusinessEntityData;
  }

  /**
   * No description
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name validate_tax_obligations
   * @summary Validate Tax Obligations
   * @request POST:/routes/compliance-validator/validate-obligations
   */
  export namespace validate_tax_obligations {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxObligationValidationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ValidateTaxObligationsData;
  }

  /**
   * No description
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name detect_compliance_anomalies
   * @summary Detect Compliance Anomalies
   * @request POST:/routes/compliance-validator/detect-anomalies
   */
  export namespace detect_compliance_anomalies {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaxObligationValidationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = DetectComplianceAnomaliesData;
  }

  /**
   * @description Run all compliance checks in a single request
   * @tags dbtn/module:compliance_validator, dbtn/hasAuth
   * @name run_compliance_checks
   * @summary Run Compliance Checks
   * @request POST:/routes/compliance-validator/run-all-checks
   */
  export namespace run_compliance_checks {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RunComplianceChecksPayload;
    export type RequestHeaders = {};
    export type ResponseBody = RunComplianceChecksData;
  }

  /**
   * @description Imports Trial Balance data from MYOB AccountRight Live for a given connection and date range.
   * @tags MYOB Integration, dbtn/module:myob_import, dbtn/hasAuth
   * @name import_myob_trial_balance
   * @summary Import Myob Trial Balance
   * @request POST:/routes/myob/import/trial-balance
   */
  export namespace import_myob_trial_balance {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MyobTrialBalanceImportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ImportMyobTrialBalanceData;
  }

  /**
   * @description Calculate the financial and business impacts of a given scenario with advanced analysis options
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name calculate_scenario_impact_v2
   * @summary Calculate Scenario Impact V2
   * @request POST:/routes/calculate-scenario-impact-v2
   */
  export namespace calculate_scenario_impact_v2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioCalculationEnhancedCalculateScenarioRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateScenarioImpactV2Data;
  }

  /**
   * @description Perform sensitivity analysis on a scenario to identify most important variables
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name analyze_scenario_sensitivity
   * @summary Analyze Scenario Sensitivity
   * @request POST:/routes/scenario-sensitivity-detailed
   */
  export namespace analyze_scenario_sensitivity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioCalculationSensitivityAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeScenarioSensitivityData;
  }

  /**
   * @description Perform advanced sensitivity analysis with cross-dependencies and stress testing
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name analyze_scenario_sensitivity_advanced
   * @summary Analyze Scenario Sensitivity Advanced
   * @request POST:/routes/analyze-scenario-sensitivity-advanced
   */
  export namespace analyze_scenario_sensitivity_advanced {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AdvancedSensitivityAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeScenarioSensitivityAdvancedData;
  }

  /**
   * @description Run a Monte Carlo simulation for a scenario to generate probability distributions
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name run_scenario_monte_carlo_simulation
   * @summary Run Scenario Monte Carlo Simulation
   * @request POST:/routes/scenario-monte-carlo-simulation-detailed
   */
  export namespace run_scenario_monte_carlo_simulation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisScenarioCalculationMonteCarloSimulationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RunScenarioMonteCarloSimulationData;
  }

  /**
   * @description Run advanced Monte Carlo simulations with correlated variables and stress testing
   * @tags dbtn/module:scenario_calculation, dbtn/hasAuth
   * @name run_monte_carlo_simulation_advanced
   * @summary Run Monte Carlo Simulation Advanced
   * @request POST:/routes/run-monte-carlo-simulation-advanced
   */
  export namespace run_monte_carlo_simulation_advanced {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AdvancedMonteCarloRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RunMonteCarloSimulationAdvancedData;
  }

  /**
   * @description Generate comprehensive strategic recommendations for responding to a scenario, including risk mitigation strategies, opportunity identification, and contingency planning.
   * @tags dbtn/module:strategic_recommendations, dbtn/hasAuth
   * @name generate_strategic_recommendations
   * @summary Generate Strategic Recommendations
   * @request POST:/routes/generate-recommendations
   */
  export namespace generate_strategic_recommendations {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ScenarioResponseRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateStrategicRecommendationsData;
  }

  /**
   * @description Generates a time-series forecast for financial health scores using Prophet. Requires historical data points (date, score).
   * @tags Forecasting, dbtn/module:forecasting, dbtn/hasAuth
   * @name forecast_score
   * @summary Forecast Score
   * @request POST:/routes/forecasting/forecast-score
   */
  export namespace forecast_score {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ForecastRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ForecastScoreData;
  }

  /**
   * @description Generates time-series forecasts for multiple financial accounts using ARIMA or Prophet.
   * @tags Forecasting, dbtn/module:forecasting, dbtn/hasAuth
   * @name forecast_account
   * @summary Forecast Account
   * @request POST:/routes/forecasting/forecast-account
   */
  export namespace forecast_account {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountForecastRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ForecastAccountData;
  }

  /**
   * @description Generates a simple forecast based on drivers applied monthly.
   * @tags Forecasting, dbtn/module:forecasting, dbtn/hasAuth
   * @name create_simple_driver_based_forecast
   * @summary Create Simple Driver Based Forecast
   * @request POST:/routes/forecasting/driver-based-simple
   */
  export namespace create_simple_driver_based_forecast {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SimpleForecastRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateSimpleDriverBasedForecastData;
  }

  /**
   * @description Creates a new budget version for an organization.
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name create_budget_version
   * @summary Create Budget Version
   * @request POST:/routes/budgets/{organization_id}/versions
   */
  export namespace create_budget_version {
    export type RequestParams = {
      /**
       * Organization Id
       * ID of the organization
       */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CreateBudgetVersionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBudgetVersionData;
  }

  /**
   * @description Lists metadata for all available budget versions for an organization.
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name list_budget_versions
   * @summary List Budget Versions
   * @request GET:/routes/budgets/{organization_id}/versions
   */
  export namespace list_budget_versions {
    export type RequestParams = {
      /**
       * Organization Id
       * ID of the organization
       */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListBudgetVersionsData;
  }

  /**
   * @description Retrieves a specific budget version, including all its items.
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name get_budget_version
   * @summary Get Budget Version
   * @request GET:/routes/budgets/{organization_id}/versions/{version_id}
   */
  export namespace get_budget_version {
    export type RequestParams = {
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
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBudgetVersionData;
  }

  /**
   * @description Updates (replaces) an existing budget version.
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name update_budget_version
   * @summary Update Budget Version
   * @request PUT:/routes/budgets/{organization_id}/versions/{version_id}
   */
  export namespace update_budget_version {
    export type RequestParams = {
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
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateBudgetVersionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBudgetVersionData;
  }

  /**
   * @description Deletes a specific budget version by removing it from the index.
   * @tags Budgets, dbtn/module:budgets, dbtn/hasAuth
   * @name delete_budget_version
   * @summary Delete Budget Version
   * @request DELETE:/routes/budgets/{organization_id}/versions/{version_id}
   */
  export namespace delete_budget_version {
    export type RequestParams = {
      organizationId: string;
      versionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteBudgetVersionData;
  }

  /**
   * @description Detects anomalies (outliers, level shifts, trend changes) in the provided financial time series data. Uses Facebook Prophet model to identify anomalies based on deviations from expected patterns and significant changepoints. Args: payload (TimeSeriesData): The input time series data. Returns: AnomalyDetectionResponse: A list of detected anomalies.
   * @tags Tax & Compliance, Anomaly Detection, dbtn/module:anomaly_detection, dbtn/hasAuth
   * @name detect_tax_anomalies
   * @summary Detect Tax Anomalies
   * @request POST:/routes/tax-compliance/anomaly-detection/detect
   */
  export namespace detect_tax_anomalies {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TimeSeriesData;
    export type RequestHeaders = {};
    export type ResponseBody = DetectTaxAnomaliesData;
  }

  /**
   * No description
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name list_notifications
   * @summary List Notifications
   * @request GET:/routes/notifications/list
   */
  export namespace list_notifications {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListNotificationsData;
  }

  /**
   * @description API endpoint to create a new notification.
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name create_notification
   * @summary Create Notification
   * @request POST:/routes/notifications/create
   */
  export namespace create_notification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NotificationCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateNotificationData;
  }

  /**
   * No description
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name mark_notification_read
   * @summary Mark Notification Read
   * @request POST:/routes/notifications/{notification_id}/read
   */
  export namespace mark_notification_read {
    export type RequestParams = {
      /** Notification Id */
      notificationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = MarkNotificationReadData;
  }

  /**
   * No description
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name dismiss_notification
   * @summary Dismiss Notification
   * @request POST:/routes/notifications/{notification_id}/dismiss
   */
  export namespace dismiss_notification {
    export type RequestParams = {
      /** Notification Id */
      notificationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DismissNotificationData;
  }

  /**
   * No description
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name bulk_update_notifications
   * @summary Bulk Update Notifications
   * @request POST:/routes/notifications/bulk-update
   */
  export namespace bulk_update_notifications {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = BulkUpdateNotificationsPayload;
    export type RequestHeaders = {};
    export type ResponseBody = BulkUpdateNotificationsData;
  }

  /**
   * @description Automatically generate notifications for upcoming tax deadlines This would normally be triggered by a scheduled job
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name generate_deadline_alerts
   * @summary Generate Deadline Alerts
   * @request POST:/routes/notifications/generate-deadline-alerts
   */
  export namespace generate_deadline_alerts {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
      /** Entity Id */
      entity_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateDeadlineAlertsData;
  }

  /**
   * @description Generate notifications based on compliance validation results This would normally be triggered by a scheduled job
   * @tags dbtn/module:compliance_notifications, dbtn/hasAuth
   * @name generate_compliance_alerts
   * @summary Generate Compliance Alerts
   * @request POST:/routes/notifications/generate-compliance-alerts
   */
  export namespace generate_compliance_alerts {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
      /** Entity Id */
      entity_id?: string | null;
      /** Check Type */
      check_type?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateComplianceAlertsData;
  }

  /**
   * @description Lists all scenarios owned by the authenticated user.
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name list_scenarios
   * @summary List Scenarios
   * @request GET:/routes/scenarios/
   */
  export namespace list_scenarios {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListScenariosData;
  }

  /**
   * @description Creates a new forecast/budget scenario for the authenticated user.
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name create_scenario
   * @summary Create Scenario
   * @request POST:/routes/scenarios/
   */
  export namespace create_scenario {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ScenarioCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateScenarioData;
  }

  /**
   * @description Retrieves a specific scenario by ID, ensuring ownership.
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name get_scenario
   * @summary Get Scenario
   * @request GET:/routes/scenarios/{scenario_id}
   */
  export namespace get_scenario {
    export type RequestParams = {
      /** Scenario Id */
      scenarioId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetScenarioData;
  }

  /**
   * @description Updates an existing scenario, ensuring ownership.
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name update_scenario
   * @summary Update Scenario
   * @request PUT:/routes/scenarios/{scenario_id}
   */
  export namespace update_scenario {
    export type RequestParams = {
      /** Scenario Id */
      scenarioId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ScenarioUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateScenarioData;
  }

  /**
   * @description Deletes a scenario, ensuring ownership.
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name delete_scenario
   * @summary Delete Scenario
   * @request DELETE:/routes/scenarios/{scenario_id}
   */
  export namespace delete_scenario {
    export type RequestParams = {
      /** Scenario Id */
      scenarioId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteScenarioData;
  }

  /**
   * @description Applies a saved scenario's assumptions to a specified base forecast.
   * @tags Scenarios, dbtn/module:scenarios, dbtn/hasAuth
   * @name apply_scenario
   * @summary Apply Scenario
   * @request POST:/routes/scenarios/apply/{scenario_id}
   */
  export namespace apply_scenario {
    export type RequestParams = {
      /** Scenario Id */
      scenarioId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ScenarioApplyRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ApplyScenarioData;
  }

  /**
   * @description Upload a CSV file containing financial data for preview and column mapping
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name upload_financial_data_legacy
   * @summary Upload Financial Data Legacy
   * @request POST:/routes/financial-import/upload-legacy
   */
  export namespace upload_financial_data_legacy {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Data Type */
      data_type: string;
    };
    export type RequestBody = BodyUploadFinancialDataLegacy;
    export type RequestHeaders = {};
    export type ResponseBody = UploadFinancialDataLegacyData;
  }

  /**
   * @description Process the uploaded financial data using the provided column mappings
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name process_financial_data
   * @summary Process Financial Data
   * @request POST:/routes/financial-import/process
   */
  export namespace process_financial_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ImportMappingRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ProcessFinancialDataData;
  }

  /**
   * @description Lists import history for a given organization.
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name list_imports
   * @summary List Imports
   * @request GET:/routes/financial-import/organizations/{organization_id}/imports
   */
  export namespace list_imports {
    export type RequestParams = {
      /** Organization Id */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListImportsData;
  }

  /**
   * @description Handles file upload specifically for the DataImports page, requiring organization_id upfront. Saves the file temporarily and returns metadata for column mapping.
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name upload_organization_financial_data
   * @summary Upload Organization Financial Data
   * @request POST:/routes/financial-import/upload-for-organization
   */
  export namespace upload_organization_financial_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadOrganizationFinancialData;
    export type RequestHeaders = {};
    export type ResponseBody = UploadOrganizationFinancialDataData;
  }

  /**
   * @description Handles the initial file upload for the wizard. Saves the file temporarily and returns metadata for column mapping. Does NOT require organization_id at this stage.
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name upload_financial_data
   * @summary Upload Financial Data
   * @request POST:/routes/financial-import/upload
   */
  export namespace upload_financial_data {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Data Type */
      data_type: string;
    };
    export type RequestBody = BodyUploadFinancialData;
    export type RequestHeaders = {};
    export type ResponseBody = UploadFinancialDataData;
  }

  /**
   * @description Get imported data by import ID
   * @tags dbtn/module:financial_import, dbtn/hasAuth
   * @name get_import
   * @summary Get Import
   * @request GET:/routes/financial-import/imports/{import_id}
   */
  export namespace get_import {
    export type RequestParams = {
      /** Import Id */
      importId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetImportData;
  }

  /**
   * @description Grants access for specified external users to a piece of content.
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name grant_access
   * @summary Grant Access
   * @request POST:/routes/sharing/grants
   */
  export namespace grant_access {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ShareActionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GrantAccessData;
  }

  /**
   * @description Revokes access for specified external users from a piece of content.
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name revoke_access
   * @summary Revoke Access
   * @request DELETE:/routes/sharing/grants
   */
  export namespace revoke_access {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ShareActionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RevokeAccessData;
  }

  /**
   * @description Gets the list of user IDs who have access to a specific content item.
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name get_content_permissions
   * @summary Get Content Permissions
   * @request GET:/routes/sharing/content/{content_type}/{content_id}
   */
  export namespace get_content_permissions {
    export type RequestParams = {
      /** Content Type */
      contentType: "dashboard" | "report" | "forecast" | "budget";
      /** Content Id */
      contentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentPermissionsData;
  }

  /**
   * @description Gets the list of content items accessible by a specific external user.
   * @tags Sharing, dbtn/module:sharing, dbtn/hasAuth
   * @name get_user_permissions
   * @summary Get User Permissions
   * @request GET:/routes/sharing/user/{user_id}
   */
  export namespace get_user_permissions {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserPermissionsData;
  }

  /**
   * @description Get all available subscription plans with pricing
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_subscription_plans
   * @summary Get Subscription Plans
   * @request GET:/routes/subscriptions/plans
   */
  export namespace get_subscription_plans {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubscriptionPlansData;
  }

  /**
   * @description Create a Stripe checkout session for subscription
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name create_checkout_session
   * @summary Create Checkout Session
   * @request POST:/routes/subscriptions/create-checkout-session
   */
  export namespace create_checkout_session {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateCheckoutSessionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCheckoutSessionData;
  }

  /**
   * @description Create a Stripe billing portal session for subscription management
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name create_portal_session
   * @summary Create Portal Session
   * @request POST:/routes/subscriptions/create-portal-session
   */
  export namespace create_portal_session {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SubscriptionPortalRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreatePortalSessionData;
  }

  /**
   * @description Get subscription details for an organization
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_organization_subscription
   * @summary Get Organization Subscription
   * @request GET:/routes/subscriptions/organization/{organization_id}
   */
  export namespace get_organization_subscription {
    export type RequestParams = {
      /** Organization Id */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOrganizationSubscriptionData;
  }

  /**
   * @description Handle Stripe webhook events
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name stripe_webhook
   * @summary Stripe Webhook
   * @request POST:/routes/subscriptions/webhook
   */
  export namespace stripe_webhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      /** Stripe-Signature */
      "stripe-signature"?: string;
    };
    export type ResponseBody = StripeWebhookData;
  }

  /**
   * @description Schedule a report for periodic delivery
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name schedule_report
   * @summary Schedule Report
   * @request POST:/routes/report-distribution/schedule
   */
  export namespace schedule_report {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ScheduleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ScheduleReportData;
  }

  /**
   * @description List all scheduled reports for the user
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name list_schedules
   * @summary List Schedules
   * @request GET:/routes/report-distribution/schedules
   */
  export namespace list_schedules {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListSchedulesData;
  }

  /**
   * @description Get details of a specific report schedule
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name get_schedule
   * @summary Get Schedule
   * @request GET:/routes/report-distribution/schedule/{schedule_id}
   */
  export namespace get_schedule {
    export type RequestParams = {
      /** Schedule Id */
      scheduleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetScheduleData;
  }

  /**
   * @description Update an existing report schedule
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name update_schedule
   * @summary Update Schedule
   * @request PUT:/routes/report-distribution/schedule/{schedule_id}
   */
  export namespace update_schedule {
    export type RequestParams = {
      /** Schedule Id */
      scheduleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateScheduleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateScheduleData;
  }

  /**
   * @description Delete a report schedule
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name delete_schedule
   * @summary Delete Schedule
   * @request DELETE:/routes/report-distribution/schedule/{schedule_id}
   */
  export namespace delete_schedule {
    export type RequestParams = {
      /** Schedule Id */
      scheduleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteScheduleData;
  }

  /**
   * @description Export a report in the specified format
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name export_report
   * @summary Export Report
   * @request POST:/routes/report-distribution/export
   */
  export namespace export_report {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ExportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ExportReportData;
  }

  /**
   * @description Download a previously exported report
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name download_report
   * @summary Download Report
   * @request GET:/routes/report-distribution/download/{report_id}
   */
  export namespace download_report {
    export type RequestParams = {
      /** Report Id */
      reportId: string;
    };
    export type RequestQuery = {
      format: ReportFormat;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DownloadReportData;
  }

  /**
   * @description Submit feedback for a delivered report
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/report-distribution/feedback
   */
  export namespace submit_feedback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReportFeedback;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitFeedbackData;
  }

  /**
   * @description Manually trigger delivery of a scheduled report
   * @tags dbtn/module:report_distribution, dbtn/hasAuth
   * @name manual_deliver_report
   * @summary Manual Deliver Report
   * @request POST:/routes/report-distribution/deliver/{schedule_id}
   */
  export namespace manual_deliver_report {
    export type RequestParams = {
      /** Schedule Id */
      scheduleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ManualDeliverReportData;
  }

  /**
   * @description Retrieves a list of metadata for all report definitions owned by the authenticated user. Requires 'reports:read' permission.
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name list_report_definitions
   * @summary List Report Definitions
   * @request GET:/routes/report-definitions
   */
  export namespace list_report_definitions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListReportDefinitionsData;
  }

  /**
   * @description Creates a new custom report definition for the authenticated user. Requires 'reports:create' permission.
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name create_report_definition
   * @summary Create Report Definition
   * @request POST:/routes/report-definitions
   */
  export namespace create_report_definition {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReportDefinitionCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateReportDefinitionData;
  }

  /**
   * @description Retrieves the full details of a specific report definition by its ID. Requires 'reports:read' permission.
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name get_report_definition
   * @summary Get Report Definition
   * @request GET:/routes/report-definitions/{report_id}
   */
  export namespace get_report_definition {
    export type RequestParams = {
      /** Report Id */
      reportId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetReportDefinitionData;
  }

  /**
   * @description Updates an existing report definition by its ID. Requires 'reports:update' permission.
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name update_report_definition
   * @summary Update Report Definition
   * @request PUT:/routes/report-definitions/{report_id}
   */
  export namespace update_report_definition {
    export type RequestParams = {
      /** Report Id */
      reportId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ReportDefinitionCreate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateReportDefinitionData;
  }

  /**
   * @description Deletes a specific report definition by its ID. Requires 'reports:delete' permission.
   * @tags Report Definitions, dbtn/module:report_definitions, dbtn/hasAuth
   * @name delete_report_definition
   * @summary Delete Report Definition
   * @request DELETE:/routes/report-definitions/{report_id}
   */
  export namespace delete_report_definition {
    export type RequestParams = {
      /** Report Id */
      reportId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteReportDefinitionData;
  }

  /**
   * @description Deletes audit log entries older than the defined retention period (180 days). Requires global admin role.
   * @tags Audit Logs, dbtn/module:audit_logs, dbtn/hasAuth
   * @name purge_old_audit_logs
   * @summary Purge Old Audit Logs
   * @request POST:/routes/audit-logs/purge
   */
  export namespace purge_old_audit_logs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = PurgeOldAuditLogsData;
  }

  /**
   * @description Query audit log entries with filters and pagination.
   * @tags Audit Logs, dbtn/module:audit_logs, dbtn/hasAuth
   * @name query_audit_logs
   * @summary Query Audit Logs
   * @request GET:/routes/audit-logs/
   */
  export namespace query_audit_logs {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = QueryAuditLogsData;
  }

  /**
   * @description SIMPLIFIED FOR DEBUGGING Fetches and processes data for a given widget configuration. Currently supports 'reportApi' sourceType.
   * @tags Widget Data, dbtn/module:widget_data, dbtn/hasAuth
   * @name fetch_widget_data
   * @summary Fetch Widget Data
   * @request POST:/routes/widget-data/fetch
   */
  export namespace fetch_widget_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = WidgetConfiguration;
    export type RequestHeaders = {};
    export type ResponseBody = FetchWidgetDataData;
  }

  /**
   * @description Lists all available benchmark metric definitions.
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name list_benchmark_metric_definitions
   * @summary List Benchmark Metric Definitions
   * @request GET:/routes/metrics
   */
  export namespace list_benchmark_metric_definitions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListBenchmarkMetricDefinitionsData;
  }

  /**
   * @description Creates a new benchmark metric definition.
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name create_benchmark_metric_definition
   * @summary Create Benchmark Metric Definition
   * @request POST:/routes/metrics
   */
  export namespace create_benchmark_metric_definition {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateMetricDefinitionPayload;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBenchmarkMetricDefinitionData;
  }

  /**
   * @description Updates an existing benchmark metric definition.
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name update_benchmark_metric_definition
   * @summary Update Benchmark Metric Definition
   * @request PUT:/routes/metrics/{metric_id}
   */
  export namespace update_benchmark_metric_definition {
    export type RequestParams = {
      /** Metric Id */
      metricId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateMetricDefinitionPayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBenchmarkMetricDefinitionData;
  }

  /**
   * @description Deletes a benchmark metric definition.
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name delete_benchmark_metric_definition
   * @summary Delete Benchmark Metric Definition
   * @request DELETE:/routes/metrics/{metric_id}
   */
  export namespace delete_benchmark_metric_definition {
    export type RequestParams = {
      /** Metric Id */
      metricId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteBenchmarkMetricDefinitionData;
  }

  /**
   * @description List all available benchmark data sources
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name list_benchmark_sources
   * @summary List Benchmark Sources
   * @request GET:/routes/sources
   */
  export namespace list_benchmark_sources {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListBenchmarkSourcesData;
  }

  /**
   * @description Create a new benchmark data source. Uses CreateSourcePayload for input validation.
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name create_benchmark_source
   * @summary Create Benchmark Source
   * @request POST:/routes/sources
   */
  export namespace create_benchmark_source {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateSourcePayload;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBenchmarkSourceData;
  }

  /**
   * @description Update an existing benchmark data source. Uses UpdateSourcePayload for input validation. Only updates fields provided in the payload.
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name update_benchmark_source
   * @summary Update Benchmark Source
   * @request PUT:/routes/sources/{source_id}
   */
  export namespace update_benchmark_source {
    export type RequestParams = {
      /** Source Id */
      sourceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateSourcePayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBenchmarkSourceData;
  }

  /**
   * @description Delete a benchmark data source and its data
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name delete_benchmark_source
   * @summary Delete Benchmark Source
   * @request DELETE:/routes/delete-benchmark-source/{source_id}
   */
  export namespace delete_benchmark_source {
    export type RequestParams = {
      /** Source Id */
      sourceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteBenchmarkSourceData;
  }

  /**
   * @description Compare two versions of benchmark data for a source
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name compare_benchmark_versions
   * @summary Compare Benchmark Versions
   * @request GET:/routes/compare-benchmark-versions
   */
  export namespace compare_benchmark_versions {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CompareBenchmarkVersionsData;
  }

  /**
   * @description Get a summary of available benchmark data
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_benchmark_data_summary
   * @summary Get Benchmark Data Summary
   * @request GET:/routes/benchmark-data-summary
   */
  export namespace get_benchmark_data_summary {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Source Id
       * Optional source ID to filter by
       */
      source_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBenchmarkDataSummaryData;
  }

  /**
   * @description Get benchmark data based on filters
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_benchmark_data_endpoint
   * @summary Get Benchmark Data Endpoint
   * @request GET:/routes/benchmark-data
   */
  export namespace get_benchmark_data_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBenchmarkDataEndpointData;
  }

  /**
   * @description Trigger an update of benchmark data from the specified source
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name update_benchmark_data
   * @summary Update Benchmark Data
   * @request POST:/routes/update-benchmark
   */
  export namespace update_benchmark_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateBenchmarkRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBenchmarkDataData;
  }

  /**
   * @description Upload and process benchmark data file
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name upload_benchmark_data
   * @summary Upload Benchmark Data
   * @request POST:/routes/upload-benchmark-data
   */
  export namespace upload_benchmark_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadBenchmarkData;
    export type RequestHeaders = {};
    export type ResponseBody = UploadBenchmarkDataData;
  }

  /**
   * @description List all benchmark data imports
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name list_imports2
   * @summary List Imports2
   * @request GET:/routes/benchmark-imports
   */
  export namespace list_imports2 {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListImports2Data;
  }

  /**
   * @description Get details of a specific import
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_import2
   * @summary Get Import2
   * @request GET:/routes/benchmark-import/{import_id}
   */
  export namespace get_import2 {
    export type RequestParams = {
      /** Import Id */
      importId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetImport2Data;
  }

  /**
   * @description Get available versions of benchmark data
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_benchmark_versions_endpoint
   * @summary Get Benchmark Versions Endpoint
   * @request GET:/routes/benchmark-versions
   */
  export namespace get_benchmark_versions_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Source Id
       * Filter versions by source ID
       */
      source_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBenchmarkVersionsEndpointData;
  }

  /**
   * @description Get available metrics for a specific industry or all industries
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_industry_metrics
   * @summary Get Industry Metrics
   * @request GET:/routes/industry-metrics
   */
  export namespace get_industry_metrics {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Industry Name
       * Industry name to filter metrics
       */
      industry_name?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIndustryMetricsData;
  }

  /**
   * @description Get a list of all industries from all sources
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_industry_list
   * @summary Get Industry List
   * @request GET:/routes/industry-list
   */
  export namespace get_industry_list {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIndustryListData;
  }

  /**
   * @description Get information about the data collection and update strategy
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name get_data_collection_strategy
   * @summary Get Data Collection Strategy
   * @request GET:/routes/data-collection-strategy
   */
  export namespace get_data_collection_strategy {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDataCollectionStrategyData;
  }

  /**
   * @description Compare company data with industry benchmarks
   * @tags dbtn/module:industry_benchmarks, dbtn/hasAuth
   * @name compare_with_benchmarks
   * @summary Compare With Benchmarks
   * @request POST:/routes/compare-with-benchmarks
   */
  export namespace compare_with_benchmarks {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BenchmarkComparisonRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CompareWithBenchmarksData;
  }

  /**
   * @description API endpoint to calculate the cash flow statement using the indirect method. Takes mapped financial data for a period and returns the calculated statement.
   * @tags Cash Flow, dbtn/module:cash_flow, dbtn/hasAuth
   * @name calculate_cash_flow_endpoint
   * @summary Calculate Cash Flow Endpoint
   * @request POST:/routes/cash-flow/calculate-indirect
   */
  export namespace calculate_cash_flow_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CalculateCashFlowRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateCashFlowEndpointData;
  }

  /**
   * @description Assigns a specific role to a user within a given scope (Organization or Entity).
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name assign_role
   * @summary Assign Role
   * @request POST:/routes/roles/assign
   */
  export namespace assign_role {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RoleAssignmentCreate;
    export type RequestHeaders = {};
    export type ResponseBody = AssignRoleData;
  }

  /**
   * @description Revokes a specific role assignment for a user.
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name revoke_role
   * @summary Revoke Role
   * @request DELETE:/routes/roles/revoke
   */
  export namespace revoke_role {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RevokeRoleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RevokeRoleData;
  }

  /**
   * @description Lists all roles assigned to a specific user, optionally filtered by organization or entity. Authorization Rules: - A user can always list their own roles (user_id == current_user.sub). - An Admin of the specified organization/entity scope can list roles for the target user within that scope.
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name list_user_roles
   * @summary List User Roles
   * @request GET:/routes/roles/user/{user_id}
   */
  export namespace list_user_roles {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {
      /** Organization Id */
      organization_id?: string | null;
      /** Entity Id */
      entity_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUserRolesData;
  }

  /**
   * @description Lists all role assignments within a specific scope (Organization or Entity). Authorization Rules: - An Admin or Advisor within the specified scope can list all roles in that scope.
   * @tags Roles & Permissions, dbtn/module:roles, dbtn/hasAuth
   * @name list_scope_roles
   * @summary List Scope Roles
   * @request GET:/routes/roles/scope/{scope_type}/{scope_id}
   */
  export namespace list_scope_roles {
    export type RequestParams = {
      /** Scope Type */
      scopeType: "Organization" | "Entity";
      /** Scope Id */
      scopeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListScopeRolesData;
  }

  /**
   * @description Creates a new comment or reply in Firestore.
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name create_comment
   * @summary Create Comment
   * @request POST:/routes/comments
   */
  export namespace create_comment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CommentCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCommentData;
  }

  /**
   * @description Retrieves comments based on context or thread ID.
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name get_comments
   * @summary Get Comments
   * @request GET:/routes/comments
   */
  export namespace get_comments {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommentsData;
  }

  /**
   * @description Updates the text of an existing comment, checking for ownership.
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name update_comment
   * @summary Update Comment
   * @request PUT:/routes/comments/{comment_id}
   */
  export namespace update_comment {
    export type RequestParams = {
      /** Comment Id */
      commentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CommentUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCommentData;
  }

  /**
   * @description Soft-deletes a comment, checking for ownership. Decrements reply count if it's a reply.
   * @tags Comments, dbtn/module:comments, dbtn/hasAuth
   * @name delete_comment
   * @summary Delete Comment
   * @request DELETE:/routes/comments/{comment_id}
   */
  export namespace delete_comment {
    export type RequestParams = {
      /** Comment Id */
      commentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteCommentData;
  }

  /**
   * @description Retrieves the current mapping of Chart of Accounts items to cash flow categories for a specific organization.
   * @tags CoA Mappings, dbtn/module:coa_mappings, dbtn/hasAuth
   * @name get_coa_mappings
   * @summary Get CoA to Cash Flow Category Mappings
   * @request GET:/routes/coa-mappings/{organization_id}
   */
  export namespace get_coa_mappings {
    export type RequestParams = {
      /** Organization Id */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCoaMappingsData;
  }

  /**
   * @description Sets or replaces the entire mapping configuration for a specific organization.
   * @tags CoA Mappings, dbtn/module:coa_mappings, dbtn/hasAuth
   * @name update_coa_mappings
   * @summary Update CoA to Cash Flow Category Mappings
   * @request PUT:/routes/coa-mappings/{organization_id}
   */
  export namespace update_coa_mappings {
    export type RequestParams = {
      /** Organization Id */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CoaCashFlowMappingsUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCoaMappingsData;
  }

  /**
   * @description Creates a new forecasting driver.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name create_driver
   * @summary Create Driver
   * @request POST:/routes/forecasting/drivers
   */
  export namespace create_driver {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DriverCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateDriverData;
  }

  /**
   * @description Lists all forecasting drivers for a given organization.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name list_drivers
   * @summary List Drivers
   * @request GET:/routes/forecasting/drivers
   */
  export namespace list_drivers {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Organization Id */
      organization_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListDriversData;
  }

  /**
   * @description Gets a specific forecasting driver by its ID.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name get_driver
   * @summary Get Driver
   * @request GET:/routes/forecasting/drivers/{driver_id}
   */
  export namespace get_driver {
    export type RequestParams = {
      /** Driver Id */
      driverId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDriverData;
  }

  /**
   * @description Updates an existing forecasting driver.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name update_driver
   * @summary Update Driver
   * @request PUT:/routes/forecasting/drivers/{driver_id}
   */
  export namespace update_driver {
    export type RequestParams = {
      /** Driver Id */
      driverId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DriverUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateDriverData;
  }

  /**
   * @description Deletes a forecasting driver.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name delete_driver
   * @summary Delete Driver
   * @request DELETE:/routes/forecasting/drivers/{driver_id}
   */
  export namespace delete_driver {
    export type RequestParams = {
      /** Driver Id */
      driverId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteDriverData;
  }

  /**
   * @description Creates a new forecasting rule.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name create_forecasting_rule
   * @summary Create Forecasting Rule
   * @request POST:/routes/forecasting/rules
   */
  export namespace create_forecasting_rule {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RuleCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateForecastingRuleData;
  }

  /**
   * @description Lists forecasting rules for an organization, optionally filtered by target account.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name list_forecasting_rules
   * @summary List Forecasting Rules
   * @request GET:/routes/forecasting/rules
   */
  export namespace list_forecasting_rules {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Organization Id */
      organization_id: string;
      /** Target Account Id */
      target_account_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListForecastingRulesData;
  }

  /**
   * @description Gets a specific forecasting rule by ID.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name get_forecasting_rule
   * @summary Get Forecasting Rule
   * @request GET:/routes/forecasting/rules/{rule_id}
   */
  export namespace get_forecasting_rule {
    export type RequestParams = {
      /** Rule Id */
      ruleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetForecastingRuleData;
  }

  /**
   * @description Updates an existing forecasting rule.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name update_forecasting_rule
   * @summary Update Forecasting Rule
   * @request PUT:/routes/forecasting/rules/{rule_id}
   */
  export namespace update_forecasting_rule {
    export type RequestParams = {
      /** Rule Id */
      ruleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = RuleUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateForecastingRuleData;
  }

  /**
   * @description Deletes a forecasting rule.
   * @tags Forecasting Rules & Drivers, dbtn/module:forecasting_rules, dbtn/hasAuth
   * @name delete_forecasting_rule
   * @summary Delete Forecasting Rule
   * @request DELETE:/routes/forecasting/rules/{rule_id}
   */
  export namespace delete_forecasting_rule {
    export type RequestParams = {
      /** Rule Id */
      ruleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteForecastingRuleData;
  }

  /**
   * @description Lists all dashboards accessible to the authenticated user (simplified to owner for now).
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name list_dashboards
   * @summary List Dashboards
   * @request GET:/routes/dashboards
   */
  export namespace list_dashboards {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListDashboardsData;
  }

  /**
   * @description Creates a new dashboard configuration.
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name create_dashboard
   * @summary Create Dashboard
   * @request POST:/routes/dashboards
   */
  export namespace create_dashboard {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DashboardCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateDashboardData;
  }

  /**
   * @description Retrieves a specific dashboard configuration.
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name get_dashboard
   * @summary Get Dashboard
   * @request GET:/routes/dashboards/{dashboard_id}
   */
  export namespace get_dashboard {
    export type RequestParams = {
      /** Dashboard Id */
      dashboardId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDashboardData;
  }

  /**
   * @description Updates an existing dashboard configuration.
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name update_dashboard
   * @summary Update Dashboard
   * @request PUT:/routes/dashboards/{dashboard_id}
   */
  export namespace update_dashboard {
    export type RequestParams = {
      /** Dashboard Id */
      dashboardId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DashboardUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateDashboardData;
  }

  /**
   * @description Deletes a dashboard configuration.
   * @tags Dashboards, dbtn/module:dashboards, dbtn/hasAuth
   * @name delete_dashboard
   * @summary Delete Dashboard
   * @request DELETE:/routes/dashboards/{dashboard_id}
   */
  export namespace delete_dashboard {
    export type RequestParams = {
      /** Dashboard Id */
      dashboardId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteDashboardData;
  }

  /**
   * @description Calculates financial variances based on the provided request parameters. Fetches actual and comparison data (budget, prior period, prior year), computes absolute and percentage variances, and flags significant items. Args: payload (VarianceAnalysisRequest): Parameters specifying the analysis. # user (AuthorizedUser): The authenticated user (if required). Returns: VarianceAnalysisResponse: The results of the variance analysis.
   * @tags Reporting, Variance Analysis, dbtn/module:variance_analysis, dbtn/hasAuth
   * @name calculate_variances
   * @summary Calculate Variances
   * @request POST:/routes/routes/reporting/variance-analysis/calculate
   */
  export namespace calculate_variances {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VarianceAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateVariancesData;
  }

  /**
   * @description Generates narrative explanations for significant financial variances using an LLM. Takes a list of significant variances (ideally filtered from the /calculate endpoint) and optional context to generate a cohesive narrative.
   * @tags Reporting, Variance Analysis, dbtn/module:variance_analysis, dbtn/hasAuth
   * @name generate_variance_narrative2
   * @summary Generate Variance Narrative
   * @request POST:/routes/routes/reporting/variance-analysis/generate-narrative
   * @originalName generate_variance_narrative
   * @duplicate
   */
  export namespace generate_variance_narrative2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisVarianceAnalysisNarrativeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateVarianceNarrative2Data;
  }

  /**
   * No description
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name create_coa_mapping
   * @summary Create Coa Mapping
   * @request POST:/routes/consolidation/coa-mappings/
   */
  export namespace create_coa_mapping {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CoAMappingCreatePayload;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCoaMappingData;
  }

  /**
   * No description
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name get_coa_mapping
   * @summary Get Coa Mapping
   * @request GET:/routes/consolidation/coa-mappings/{mapping_id}
   */
  export namespace get_coa_mapping {
    export type RequestParams = {
      /** Mapping Id */
      mappingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCoaMappingData;
  }

  /**
   * No description
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name update_coa_mapping
   * @summary Update Coa Mapping
   * @request PUT:/routes/consolidation/coa-mappings/{mapping_id}
   */
  export namespace update_coa_mapping {
    export type RequestParams = {
      /** Mapping Id */
      mappingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CoAMappingUpdatePayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCoaMappingData;
  }

  /**
   * No description
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name delete_coa_mapping
   * @summary Delete Coa Mapping
   * @request DELETE:/routes/consolidation/coa-mappings/{mapping_id}
   */
  export namespace delete_coa_mapping {
    export type RequestParams = {
      /** Mapping Id */
      mappingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteCoaMappingData;
  }

  /**
   * No description
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name list_coa_mappings_for_organization
   * @summary List Coa Mappings For Organization
   * @request GET:/routes/consolidation/coa-mappings/organization/{organization_id}
   */
  export namespace list_coa_mappings_for_organization {
    export type RequestParams = {
      /** Organization Id */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCoaMappingsForOrganizationData;
  }

  /**
   * @description Processes a consolidated trial balance and returns structured financial statements (Profit & Loss, Balance Sheet, Cash Flow Statement). NOTE: Balance Sheet and Cash Flow are placeholders. P&L is an initial implementation.
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name get_consolidated_financial_statements
   * @summary Get Consolidated Financial Statements
   * @request POST:/routes/consolidation/financial-statements
   */
  export namespace get_consolidated_financial_statements {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ConsolidationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetConsolidatedFinancialStatementsData;
  }

  /**
   * @description INTERNAL USE ONLY: Runs a hardcoded consolidation test scenario. Used to bypass test_endpoint limitations with complex JSON.
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name run_consolidation_internal_test
   * @summary Run Consolidation Internal Test
   * @request GET:/routes/consolidation/test-internal
   */
  export namespace run_consolidation_internal_test {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RunConsolidationInternalTestData;
  }

  /**
   * @description Calculates consolidated financials for a given group of entities and period. Requires financial data (trial balance) for each entity involved.
   * @tags Consolidation, dbtn/module:consolidation, dbtn/hasAuth
   * @name calculate_consolidation
   * @summary Calculate Consolidation
   * @request POST:/routes/consolidation/calculate
   */
  export namespace calculate_consolidation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ConsolidationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateConsolidationData;
  }
}
