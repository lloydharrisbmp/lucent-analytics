/**
 * Utilities for generating sample financial data
 */
import { 
  ProfitAndLossStatement, 
  BalanceSheet, 
  CashFlowStatement,
  DateRange,
  PLItem,
  BSItem,
  CFItem,
  KPI,
  KPIGroup,
  ForecastScenario,
  ForecastAssumption,
  ForecastResult,
  ForecastPeriodData,
  ForecastPeriod,
  ForecastModel,
  SeasonalPattern,
  SeasonalKeyDate,
  RegionalVariation,
  SeasonalCashFlowStatement,
  SeasonalCashFlowItem,
  SeasonType,
  ForecastAlgorithm,
  TimeSeriesComponents,
  SeasonalAdjustmentParams,
  ForecastVarianceAnalysis,
  ForecastAccuracyMetrics,
  AdvancedForecastResult
} from './financial-types';

/**
 * Generate a sample profit and loss statement
 */
export function generateSampleProfitAndLoss(period: DateRange): ProfitAndLossStatement {
  // Revenue items
  const revenue: PLItem[] = [
    { id: 'rev1', name: 'Product Sales', amount: 750000, type: 'revenue' },
    { id: 'rev2', name: 'Service Revenue', amount: 320000, type: 'revenue' },
    { id: 'rev3', name: 'Subscription Revenue', amount: 180000, type: 'revenue' },
    { id: 'rev4', name: 'Other Revenue', amount: 42000, type: 'revenue' },
  ];

  // Cost of sales items
  const costOfSales: PLItem[] = [
    { id: 'cos1', name: 'Materials', amount: 310000, type: 'costOfSales' },
    { id: 'cos2', name: 'Direct Labor', amount: 215000, type: 'costOfSales' },
    { id: 'cos3', name: 'Manufacturing Overhead', amount: 95000, type: 'costOfSales' },
  ];

  // Expense items
  const expenses: PLItem[] = [
    { id: 'exp1', name: 'Sales & Marketing', amount: 175000, type: 'expense' },
    { id: 'exp2', name: 'Research & Development', amount: 120000, type: 'expense' },
    { id: 'exp3', name: 'General & Administrative', amount: 135000, type: 'expense' },
    { id: 'exp4', name: 'Depreciation & Amortization', amount: 45000, type: 'expense' },
    { id: 'exp5', name: 'Interest Expense', amount: 18000, type: 'expense' },
  ];

  // Calculate totals
  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalCostOfSales = costOfSales.reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = totalRevenue - totalCostOfSales;
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = grossProfit - totalExpenses;

  return {
    period,
    revenue,
    costOfSales,
    expenses,
    grossProfit,
    netIncome,
  };
}

/**
 * Generate a sample balance sheet
 */
export function generateSampleBalanceSheet(asOf: Date): BalanceSheet {
  // Asset items
  const assets: BSItem[] = [
    { id: 'asset1', name: 'Cash & Cash Equivalents', amount: 450000, type: 'asset' },
    { id: 'asset2', name: 'Accounts Receivable', amount: 320000, type: 'asset' },
    { id: 'asset3', name: 'Inventory', amount: 280000, type: 'asset' },
    { id: 'asset4', name: 'Prepaid Expenses', amount: 35000, type: 'asset' },
    { id: 'asset5', name: 'Property, Plant & Equipment', amount: 850000, type: 'asset' },
    { id: 'asset6', name: 'Intangible Assets', amount: 320000, type: 'asset' },
  ];

  // Liability items
  const liabilities: BSItem[] = [
    { id: 'liab1', name: 'Accounts Payable', amount: 180000, type: 'liability' },
    { id: 'liab2', name: 'Accrued Expenses', amount: 95000, type: 'liability' },
    { id: 'liab3', name: 'Short-term Debt', amount: 120000, type: 'liability' },
    { id: 'liab4', name: 'Long-term Debt', amount: 650000, type: 'liability' },
    { id: 'liab5', name: 'Deferred Revenue', amount: 75000, type: 'liability' },
  ];

  // Equity items
  const equity: BSItem[] = [
    { id: 'equity1', name: 'Common Stock', amount: 500000, type: 'equity' },
    { id: 'equity2', name: 'Retained Earnings', amount: 635000, type: 'equity' },
  ];

  // Calculate totals
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

  return {
    asOf,
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
  };
}

/**
 * Generate a sample cash flow statement
 */
export function generateSampleCashFlow(period: DateRange): CashFlowStatement {
  // Operating activities
  const operatingActivities: CFItem[] = [
    { id: 'op1', name: 'Net Income', amount: 275000, type: 'operating' },
    { id: 'op2', name: 'Depreciation & Amortization', amount: 45000, type: 'operating' },
    { id: 'op3', name: 'Changes in Accounts Receivable', amount: -55000, type: 'operating' },
    { id: 'op4', name: 'Changes in Inventory', amount: -35000, type: 'operating' },
    { id: 'op5', name: 'Changes in Accounts Payable', amount: 25000, type: 'operating' },
    { id: 'op6', name: 'Changes in Accrued Expenses', amount: 15000, type: 'operating' },
  ];

  // Investing activities
  const investingActivities: CFItem[] = [
    { id: 'inv1', name: 'Capital Expenditures', amount: -120000, type: 'investing' },
    { id: 'inv2', name: 'Acquisitions', amount: -75000, type: 'investing' },
    { id: 'inv3', name: 'Sale of Assets', amount: 35000, type: 'investing' },
  ];

  // Financing activities
  const financingActivities: CFItem[] = [
    { id: 'fin1', name: 'Debt Issuance', amount: 150000, type: 'financing' },
    { id: 'fin2', name: 'Debt Repayment', amount: -80000, type: 'financing' },
    { id: 'fin3', name: 'Dividends Paid', amount: -50000, type: 'financing' },
  ];

  // Calculate totals
  const totalOperating = operatingActivities.reduce((sum, item) => sum + item.amount, 0);
  const totalInvesting = investingActivities.reduce((sum, item) => sum + item.amount, 0);
  const totalFinancing = financingActivities.reduce((sum, item) => sum + item.amount, 0);
  const netCashFlow = totalOperating + totalInvesting + totalFinancing;
  
  // Assume beginning balance
  const beginningCashBalance = 350000;
  const endingCashBalance = beginningCashBalance + netCashFlow;

  return {
    period,
    operatingActivities,
    investingActivities,
    financingActivities,
    netCashFlow,
    beginningCashBalance,
    endingCashBalance,
  };
}

/**
 * Generate sample KPIs
 */
export function generateSampleKPIs(): KPIGroup[] {
  return [
    {
      title: 'Profitability',
      kpis: [
        {
          name: 'Gross Margin',
          value: 42.8,
          unit: '%',
          change: 2.5,
          status: 'positive',
          description: 'Revenue minus cost of goods sold, divided by revenue',
        },
        {
          name: 'Net Profit Margin',
          value: 21.2,
          unit: '%',
          change: 1.8,
          status: 'positive',
          description: 'Net income divided by revenue',
        },
        {
          name: 'EBITDA Margin',
          value: 28.5,
          unit: '%',
          change: 3.2,
          status: 'positive',
          description: 'Earnings before interest, taxes, depreciation, and amortization, divided by revenue',
        },
      ],
    },
    {
      title: 'Liquidity',
      kpis: [
        {
          name: 'Current Ratio',
          value: 1.82,
          unit: '',
          change: 0.15,
          status: 'positive',
          description: 'Current assets divided by current liabilities',
        },
        {
          name: 'Quick Ratio',
          value: 1.35,
          unit: '',
          change: -0.05,
          status: 'negative',
          description: 'Cash, short-term investments, and accounts receivable divided by current liabilities',
        },
        {
          name: 'Days Sales Outstanding',
          value: 38.5,
          unit: 'days',
          change: -2.3,
          status: 'positive',
          description: 'Average number of days to collect payment after a sale',
        },
      ],
    },
    {
      title: 'Efficiency',
      kpis: [
        {
          name: 'Inventory Turnover',
          value: 7.8,
          unit: 'times',
          change: 0.6,
          status: 'positive',
          description: 'Cost of goods sold divided by average inventory',
        },
        {
          name: 'Asset Turnover',
          value: 1.25,
          unit: 'times',
          change: -0.1,
          status: 'negative',
          description: 'Revenue divided by average total assets',
        },
        {
          name: 'Operating Cycle',
          value: 72.3,
          unit: 'days',
          change: -4.8,
          status: 'positive',
          description: 'Days inventory outstanding plus days sales outstanding',
        },
      ],
    },
  ];
}

/**
 * Generate sample date ranges for period selection
 */
export function generateDateRanges(): DateRange[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return [
    {
      type: 'month',
      startDate: new Date(currentYear, currentMonth - 1, 1),
      endDate: new Date(currentYear, currentMonth, 0),
      label: 'Last Month',
    },
    {
      type: 'month',
      startDate: new Date(currentYear, currentMonth, 1),
      endDate: new Date(currentYear, currentMonth + 1, 0),
      label: 'Current Month',
    },
    {
      type: 'quarter',
      startDate: new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1),
      endDate: new Date(currentYear, Math.floor(currentMonth / 3) * 3 + 3, 0),
      label: 'Current Quarter',
    },
    {
      type: 'year',
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31),
      label: 'Year to Date',
    },
    {
      type: 'year',
      startDate: new Date(currentYear - 1, 0, 1),
      endDate: new Date(currentYear - 1, 11, 31),
      label: 'Last Year',
    },
  ];
}

/**
 * Generate sample working capital data for dashboard
 */
export function generateSampleWorkingCapitalData(periods = 12): {
  monthlyData: {
    month: string;
    receivables: number;
    payables: number;
    inventory: number;
    cash: number;
    otherCurrentAssets: number;
    otherCurrentLiabilities: number;
    revenue: number;
    cogs: number;
    metrics: {
      dso: number;
      dpo: number;
      dio: number;
      ccc: number;
      workingCapitalRatio: number;
      quickRatio: number;
      inventoryTurnover: number;
      receivablesTurnover: number;
      payablesTurnover: number;
    };
  }[];
  benchmarkData?: {
    industry: string;
    metrics: {
      dso: number;
      dpo: number;
      dio: number;
      ccc: number;
      workingCapitalRatio: number;
      quickRatio: number;
      inventoryTurnover: number;
      receivablesTurnover: number;
      payablesTurnover: number;
    };
  };
  dateRange: string;
} {
  const now = new Date();
  const monthlyData = [];
  let totalRevenue = 0;
  let totalCOGS = 0;
  
  // Industry benchmarks and targets
  const industries = [
    { 
      name: 'Retail', 
      metrics: {
        dso: 25, 
        dpo: 35, 
        dio: 62,
        ccc: 52, // dso + dio - dpo
        workingCapitalRatio: 1.8,
        quickRatio: 1.2,
        inventoryTurnover: 6.5,
        receivablesTurnover: 14.0,
        payablesTurnover: 10.5
      }
    },
    { 
      name: 'Manufacturing', 
      metrics: {
        dso: 45, 
        dpo: 42, 
        dio: 78,
        ccc: 81, // dso + dio - dpo
        workingCapitalRatio: 1.6,
        quickRatio: 1.0,
        inventoryTurnover: 4.8,
        receivablesTurnover: 8.2,
        payablesTurnover: 8.8
      }
    },
    { 
      name: 'Professional Services', 
      metrics: {
        dso: 52, 
        dpo: 30, 
        dio: 15,
        ccc: 37, // dso + dio - dpo
        workingCapitalRatio: 2.2,
        quickRatio: 2.0,
        inventoryTurnover: 24.0,
        receivablesTurnover: 7.1,
        payablesTurnover: 12.3
      }
    }
  ];
  
  // Randomly select an industry
  const industry = industries[Math.floor(Math.random() * industries.length)];
  
  // Company performs slightly worse than industry average
  const baseDSO = industry.metrics.dso * (1 + (Math.random() * 0.2)); // Up to 20% worse
  const baseDPO = industry.metrics.dpo * (1 - (Math.random() * 0.2)); // Up to 20% worse
  const baseDIO = industry.metrics.dio * (1 + (Math.random() * 0.2)); // Up to 20% worse
  
  // Generate monthly data
  for (let i = 0; i < periods; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - (periods - 1) + i, 1);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const monthLabel = `${month} ${year}`;
    
    // Base values with some monthly variance
    const baseRevenue = 750000 + (Math.random() * 250000);
    const baseCOGS = baseRevenue * (0.55 + (Math.random() * 0.1)); // 55-65% of revenue
    
    // Add seasonal effects
    const currentSeason = determineAustralianSeason(date);
    let seasonalFactor = 1;
    
    switch(currentSeason) {
      case 'Summer':
        seasonalFactor = 1.15; // Higher in summer
        break;
      case 'Autumn':
        seasonalFactor = 0.95; // Slightly lower in autumn
        break;
      case 'Winter':
        seasonalFactor = 0.85; // Lower in winter
        break;
      case 'Spring':
        seasonalFactor = 1.05; // Slightly higher in spring
        break;
    }
    
    // Apply seasonal factor to revenue and adjust COGS accordingly
    const revenue = baseRevenue * seasonalFactor;
    const cogs = baseCOGS * seasonalFactor;
    
    totalRevenue += revenue;
    totalCOGS += cogs;
    
    // Calculate working capital components with seasonal adjustments
    const dsoAdjustment = currentSeason === 'Summer' ? 1.1 : 
                         currentSeason === 'Winter' ? 0.9 : 1;
                         
    const dpoAdjustment = currentSeason === 'Winter' ? 1.1 : 
                         currentSeason === 'Summer' ? 0.9 : 1;
                         
    const dioAdjustment = currentSeason === 'Winter' ? 1.15 : 
                         currentSeason === 'Summer' ? 0.85 : 1;
    
    // Calculate DSO, DPO, DIO with seasonality and trend over time
    // Also add a slight improvement trend over time (later months slightly better)
    const improvementFactor = 1 - (i * 0.005); // Small improvement each month
    
    const dso = baseDSO * dsoAdjustment * improvementFactor;
    const dpo = baseDPO * dpoAdjustment * (1 + (i * 0.005)); // DPO improves over time (increases)
    const dio = baseDIO * dioAdjustment * improvementFactor;
    
    // Calculate cash conversion cycle
    const ccc = dso + dio - dpo;
    
    // Calculate turnover ratios
    const inventoryTurnover = industry.metrics.inventoryTurnover * (0.9 + (Math.random() * 0.2));
    const receivablesTurnover = industry.metrics.receivablesTurnover * (0.9 + (Math.random() * 0.2));
    const payablesTurnover = industry.metrics.payablesTurnover * (0.9 + (Math.random() * 0.2));
    
    // Calculate working capital ratios
    const workingCapitalRatio = industry.metrics.workingCapitalRatio * (0.9 + (Math.random() * 0.2));
    const quickRatio = industry.metrics.quickRatio * (0.9 + (Math.random() * 0.2));
    
    // Calculate accounts receivable, inventory, and accounts payable
    const receivables = (revenue / 30) * dso;
    const inventory = (cogs / 30) * dio;
    const payables = (cogs / 30) * dpo;
    
    // Other working capital components (for display completeness)
    const cash = 250000 + (Math.random() * 100000) * (1 + (i * 0.01)); // Slightly increases over time
    const otherCurrentAssets = 120000 + (Math.random() * 50000);
    const otherCurrentLiabilities = 180000 + (Math.random() * 70000);
    
    monthlyData.push({
      month: monthLabel,
      receivables,
      payables,
      inventory,
      cash,
      otherCurrentAssets,
      otherCurrentLiabilities,
      revenue,
      cogs,
      metrics: {
        dso,
        dpo,
        dio,
        ccc,
        workingCapitalRatio,
        quickRatio,
        inventoryTurnover,
        receivablesTurnover,
        payablesTurnover
      }
    });
  }
  
  // Create date range string
  const startMonth = monthlyData[0].month;
  const endMonth = monthlyData[monthlyData.length - 1].month;
  const dateRange = `${startMonth} - ${endMonth}`;
  
  // Return the data in the expected format
  return {
    monthlyData,
    benchmarkData: {
      industry: industry.name,
      metrics: industry.metrics
    },
    dateRange
  };
}

/**
 * Generate a sample cash flow scenario
 */
export function generateSampleScenario(id: string, name: string, options: { months?: number, baseBalance?: number, growth?: number } = {}): {
  id: string;
  name: string;
  startingBalance: number;
  monthlyProjections: {
    month: string;
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
    endingCashBalance: number;
  }[];
  metrics: {
    averageMonthlyBurn: number;
    peakNegativeCashFlow: number;
    runwayMonths: number;
    lowestCashBalance: number;
    highestCashBalance: number;
  };
} {
  const {
    months = 12,
    baseBalance = 100000,
    growth = 0.05
  } = options;
  
  const now = new Date();
  const projections = [];
  let balance = baseBalance;
  let totalOperating = 0;
  let minBalance = balance;
  let maxBalance = balance;
  let totalNegativeCashFlow = 0;
  let negativeMonths = 0;
  
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    // Add seasonality to cash flows
    const season = determineAustralianSeason(date);
    let seasonalFactor = 1;
    
    switch (season) {
      case 'Summer':
        seasonalFactor = 1.2; // Higher revenue in summer
        break;
      case 'Winter':
        seasonalFactor = 0.8; // Lower revenue in winter
        break;
      case 'Autumn':
        seasonalFactor = 0.9; // Slightly lower in autumn
        break;
      case 'Spring':
        seasonalFactor = 1.1; // Slightly higher in spring
        break;
    }
    
    // Apply growth factor compounded monthly
    const growthFactor = Math.pow(1 + growth, i);
    
    // Base operating cash flow with seasonal and growth adjustments
    const baseOperating = 20000 * seasonalFactor * growthFactor;
    
    // Random variations
    const operatingVariation = (Math.random() * 0.4) - 0.2; // -20% to +20%
    const investingVariation = (Math.random() * 0.3) - 0.15; // -15% to +15%
    const financingVariation = (Math.random() * 0.2) - 0.1; // -10% to +10%
    
    // Generate cash flows with variations
    const operatingCashFlow = baseOperating * (1 + operatingVariation);
    const investingCashFlow = -10000 * (1 + investingVariation) * growthFactor;
    const financingCashFlow = 5000 * (1 + financingVariation) * (i < 6 ? 1 : 0.5); // Financing decreases in later months
    
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
    balance += netCashFlow;
    
    // Update statistics
    totalOperating += operatingCashFlow;
    minBalance = Math.min(minBalance, balance);
    maxBalance = Math.max(maxBalance, balance);
    
    if (netCashFlow < 0) {
      totalNegativeCashFlow += Math.abs(netCashFlow);
      negativeMonths++;
    }
    
    projections.push({
      month: `${month} ${year}`,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      endingCashBalance: balance,
    });
  }
  
  // Calculate metrics
  const averageMonthlyBurn = negativeMonths > 0 ? totalNegativeCashFlow / negativeMonths : 0;
  const peakNegativeCashFlow = projections.reduce((min, p) => Math.min(min, p.netCashFlow < 0 ? p.netCashFlow : 0), 0);
  
  // Calculate runway based on average burn rate and current balance
  const runwayMonths = averageMonthlyBurn > 0 ? baseBalance / averageMonthlyBurn : months;
  
  return {
    id,
    name,
    startingBalance: baseBalance,
    monthlyProjections: projections,
    metrics: {
      averageMonthlyBurn,
      peakNegativeCashFlow,
      runwayMonths,
      lowestCashBalance: minBalance,
      highestCashBalance: maxBalance,
    }
  };
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Determine the current season based on a date
 * In Australia: Summer (Dec-Feb), Autumn (Mar-May), Winter (Jun-Aug), Spring (Sep-Nov)
 */
export function determineAustralianSeason(date: Date): SeasonType {
  const month = date.getMonth();
  
  if (month >= 11 || month <= 1) return 'Summer'; // December to February
  if (month >= 2 && month <= 4) return 'Autumn';  // March to May
  if (month >= 5 && month <= 7) return 'Winter';  // June to August
  return 'Spring';                                // September to November
}

/**
 * Get historical seasonal patterns for cash flow items
 * This simulates historical data patterns that would normally come from database
 */
export function getHistoricalSeasonalPatterns(): Record<string, number[]> {
  // Values represent seasonal adjustment factors for [Summer, Autumn, Winter, Spring]
  return {
    // Operating activities
    'op1': [1.05, 0.95, 0.90, 1.10], // Net Income
    'op2': [1.0, 1.0, 1.0, 1.0],     // Depreciation (not seasonal)
    'op3': [1.15, 0.95, 0.85, 1.05], // Accounts Receivable (higher in summer)
    'op4': [1.25, 0.90, 0.80, 1.05], // Inventory (higher in summer)
    'op5': [0.95, 1.0, 1.15, 0.90],  // Accounts Payable (higher in winter)
    'op6': [1.0, 1.05, 1.10, 0.85],  // Accrued Expenses (higher in winter)
    
    // Investing activities
    'inv1': [0.80, 1.05, 1.20, 0.95], // Capital Expenditures (higher in winter)
    'inv2': [0.90, 1.10, 1.15, 0.85], // Acquisitions (higher in winter)
    'inv3': [1.10, 1.05, 0.85, 1.0],  // Asset Sales (higher in summer)
    
    // Financing activities
    'fin1': [0.95, 1.05, 1.15, 0.85], // Debt Issuance (higher in winter)
    'fin2': [1.05, 1.0, 0.90, 1.05],  // Debt Repayment (higher in summer)
    'fin3': [0.80, 1.10, 1.20, 0.90]  // Dividends (higher in winter)
  };
}

/**
 * Calculate year-over-year seasonal variations for historical analysis
 */
export function calculateHistoricalTrend(itemId: string, currentYear: number): { pastYears: {year: number, amount: number}[], averageSeasonalVariation: number } {
  // Base value from current sample data
  const sample = generateSampleCashFlow({ type: 'year', startDate: new Date(), endDate: new Date(), label: 'Current Year' });
  let baseAmount = 0;
  
  // Find the item in the sample data
  const findItem = (items: CFItem[]): number => {
    for (const item of items) {
      if (item.id === itemId) return item.amount;
    }
    return 0;
  };
  
  baseAmount = findItem(sample.operatingActivities) || 
              findItem(sample.investingActivities) || 
              findItem(sample.financingActivities) || 0;
  
  // Generate mock historical data (in real app this would come from database)
  const patterns = getHistoricalSeasonalPatterns();
  const itemPattern = patterns[itemId] || [1, 1, 1, 1];
  
  // Create mock data for past 3 years with seasonal variations
  const pastYears = [];
  let totalVariation = 0;
  
  for (let i = 1; i <= 3; i++) {
    const yearOffset = currentYear - i;
    // Apply a different seasonal factor each year and some randomness
    const seasonalIndex = i % 4; // Cycle through the seasons
    const factor = itemPattern[seasonalIndex];
    const randomFactor = 0.9 + Math.random() * 0.2; // Random between 0.9 and 1.1
    
    const amount = baseAmount * factor * randomFactor * (1 - (i * 0.03)); // Slight decrease for older years
    pastYears.push({ year: yearOffset, amount });
    totalVariation += Math.abs(factor - 1);
  }
  
  return {
    pastYears,
    averageSeasonalVariation: totalVariation / 3 // Average variation over 3 years
  };
}

/**
 * Apply seasonal adjustments to a cash flow statement based on industry and season
 */
export function applySeasonalAdjustments(
  cashFlow: CashFlowStatement,
  industry: string,
  patterns: SeasonalPattern[],
  keyDates: SeasonalKeyDate[],
  regionalVariations: RegionalVariation[] = [],
  region: string = ''
): SeasonalCashFlowStatement {
  // Determine current season based on period end date
  const currentSeason = determineAustralianSeason(cashFlow.period.endDate);
  
  // Initialize the seasonal cash flow statement
  const seasonalCashFlow: SeasonalCashFlowStatement = {
    ...cashFlow,
    seasonalityApplied: true,
    industry,
    operatingActivities: [],
    investingActivities: [],
    financingActivities: [],
    seasonalPatterns: patterns,
    keyDates,
    regionalVariations,
    currentSeason,
    seasonAdjustedNetCashFlow: 0,
    seasonalityImpact: 0
  };
  
  // Get current patterns for the season
  const currentPattern = patterns.find(p => p.season.includes(currentSeason)) || patterns[0];
  
  // Get regional adjustment if applicable
  let regionalFactor = 1;
  if (region) {
    const variation = regionalVariations.find(rv => rv.region === region);
    if (variation && variation.seasonalAdjustments && variation.seasonalAdjustments[currentSeason]) {
      regionalFactor = 1 + (variation.seasonalAdjustments[currentSeason] || 0);
    }
  }
  
  // Get historical patterns
  const historicalPatterns = getHistoricalSeasonalPatterns();
  const currentYear = new Date().getFullYear();
  
  // Helper to adjust cash flow items
  const adjustItems = (items: CFItem[], activityType: 'operating' | 'investing' | 'financing'): SeasonalCashFlowItem[] => {
    return items.map(item => {
      // Base seasonality adjustment from the pattern
      const seasonalFactors = currentPattern.seasonalFactors || { cashReceiptsAdjustment: 0, cashDisbursementsAdjustment: 0 };
      
      // Determine if this is typically a receipt or disbursement based on amount sign
      const isReceipt = item.amount >= 0;
      let adjustmentFactor = isReceipt 
        ? 1 + (seasonalFactors.cashReceiptsAdjustment || 0) 
        : 1 + (seasonalFactors.cashDisbursementsAdjustment || 0);
        
      // Apply regional factor
      adjustmentFactor *= regionalFactor;
      
      // Apply historical pattern if available
      const itemPatterns = historicalPatterns[item.id];
      if (itemPatterns) {
        const seasonIndex = currentSeason === 'Summer' ? 0 : 
                         currentSeason === 'Autumn' ? 1 : 
                         currentSeason === 'Winter' ? 2 : 3;
        adjustmentFactor *= itemPatterns[seasonIndex];
      }
      
      // Calculate the adjusted amount
      const baseAmount = item.amount;
      const adjustedAmount = baseAmount * adjustmentFactor;
      
      // Build the seasonal cash flow item
      const seasonalItem: SeasonalCashFlowItem = {
        ...item,
        seasonalAdjustment: {
          applied: true,
          baseAmount,
          adjustedAmount,
          adjustmentFactor,
          adjustmentReason: `${currentSeason} seasonal adjustment for ${industry}`
        },
        seasonalPattern: currentPattern.season,
        historicalTrend: calculateHistoricalTrend(item.id, currentYear)
      };
      
      // Override the amount with the adjusted amount
      seasonalItem.amount = adjustedAmount;
      
      return seasonalItem;
    });
  };
  
  // Apply adjustments to each set of activities
  seasonalCashFlow.operatingActivities = adjustItems(cashFlow.operatingActivities, 'operating');
  seasonalCashFlow.investingActivities = adjustItems(cashFlow.investingActivities, 'investing');
  seasonalCashFlow.financingActivities = adjustItems(cashFlow.financingActivities, 'financing');
  
  // Recalculate totals
  const totalOperating = seasonalCashFlow.operatingActivities.reduce((sum, item) => sum + item.amount, 0);
  const totalInvesting = seasonalCashFlow.investingActivities.reduce((sum, item) => sum + item.amount, 0);
  const totalFinancing = seasonalCashFlow.financingActivities.reduce((sum, item) => sum + item.amount, 0);
  
  seasonalCashFlow.seasonAdjustedNetCashFlow = totalOperating + totalInvesting + totalFinancing;
  seasonalCashFlow.netCashFlow = seasonalCashFlow.seasonAdjustedNetCashFlow;
  seasonalCashFlow.endingCashBalance = seasonalCashFlow.beginningCashBalance + seasonalCashFlow.seasonAdjustedNetCashFlow;
  seasonalCashFlow.seasonalityImpact = seasonalCashFlow.seasonAdjustedNetCashFlow - cashFlow.netCashFlow;
  
  return seasonalCashFlow;
}

/**
 * Generate a sample seasonal cash flow statement
 */
export function generateSampleSeasonalCashFlow(
  period: DateRange,
  industry: string = 'default',
  region: string = ''
): SeasonalCashFlowStatement {
  // First generate a regular cash flow statement
  const baseCashFlow = generateSampleCashFlow(period);
  
  // Fetch the sample seasonal data for the industry
  // In a real app, this would come from API call to the seasonal endpoint
  const defaultPatterns: SeasonalPattern[] = [
    {
      season: 'Summer (Dec-Feb)',
      impact: 'Variable',
      description: 'December busy leading up to Christmas. Significant slowdown from mid-December to late January.',
      seasonalFactors: { cashReceiptsAdjustment: 0.05, cashDisbursementsAdjustment: 0.05 }
    },
    {
      season: 'Autumn (Mar-May)', 
      impact: 'High',
      description: 'Full business operations resume. Easter creates a brief slowdown.',
      seasonalFactors: { cashReceiptsAdjustment: 0.15, cashDisbursementsAdjustment: 0.10 }
    },
    {
      season: 'Winter (Jun-Aug)', 
      impact: 'Variable',
      description: 'June extremely busy with EOFY activities. July often slower as new financial year begins.',
      seasonalFactors: { cashReceiptsAdjustment: 0.05, cashDisbursementsAdjustment: 0.05 }
    },
    {
      season: 'Spring (Sep-Nov)', 
      impact: 'High',
      description: 'Peak business period with few public holidays. Strong trading before Christmas.',
      seasonalFactors: { cashReceiptsAdjustment: 0.15, cashDisbursementsAdjustment: 0.10 }
    }
  ];
  
  const defaultKeyDates: SeasonalKeyDate[] = [
    {
      date: 'December 25-January 26',
      event: 'Christmas to Australia Day',
      description: 'Extended period of reduced business activity',
      cashFlowImpact: { type: 'both', relativeImpact: 'High' }
    },
    {
      date: 'June 30',
      event: 'EOFY',
      description: 'Critical financial and tax deadline for all Australian businesses',
      cashFlowImpact: { type: 'disbursement', relativeImpact: 'Very High' }
    },
    {
      date: 'October-November',
      event: 'Pre-Christmas',
      description: 'Planning and stock-up period before holiday season',
      cashFlowImpact: { type: 'disbursement', relativeImpact: 'Moderate-High' }
    }
  ];
  
  const defaultRegionalVariations: RegionalVariation[] = [
    {
      region: 'Northern Australia',
      description: 'Wet season (Nov-Apr) impacts outdoor businesses and supply chains',
      seasonalAdjustments: { Summer: 0.15, Winter: -0.10 }
    },
    {
      region: 'Tourist areas',
      description: 'Local economies highly synchronized with tourism patterns',
      seasonalAdjustments: { Summer: 0.20, Winter: -0.15 }
    }
  ];
  
  // Apply the seasonal adjustments
  return applySeasonalAdjustments(
    baseCashFlow,
    industry,
    defaultPatterns,
    defaultKeyDates,
    defaultRegionalVariations,
    region
  );
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Format decimal values
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Generate a sample forecast scenario with detailed settings
 */
export function generateSampleForecastScenario(): ForecastScenario {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Use current month's financial data as baseline
  const period: DateRange = {
    type: 'month',
    startDate: new Date(currentYear, currentMonth, 1),
    endDate: new Date(currentYear, currentMonth + 1, 0),
    label: 'Current Month',
  };
  
  const baseline = generateSampleProfitAndLoss(period);
  
  // Define default assumptions
  const assumptions: ForecastAssumption[] = [
    {
      id: 'a1',
      name: 'Product Sales Growth',
      category: 'revenue',
      itemId: 'rev1',
      growthType: 'percentage',
      growthRate: 5.0, // 5% monthly growth
    },
    {
      id: 'a2',
      name: 'Service Revenue Growth',
      category: 'revenue',
      itemId: 'rev2',
      growthType: 'percentage',
      growthRate: 3.0, // 3% monthly growth
    },
    {
      id: 'a3',
      name: 'Subscription Revenue Growth',
      category: 'revenue',
      itemId: 'rev3',
      growthType: 'percentage',
      growthRate: 8.0, // 8% monthly growth
    },
    {
      id: 'a4',
      name: 'Materials Cost Growth',
      category: 'costOfSales',
      itemId: 'cos1',
      growthType: 'percentage',
      growthRate: 4.0, // 4% monthly growth
    },
    {
      id: 'a5',
      name: 'Direct Labor Cost Growth',
      category: 'costOfSales',
      itemId: 'cos2',
      growthType: 'percentage',
      growthRate: 2.5, // 2.5% monthly growth
    },
    {
      id: 'a6',
      name: 'Sales & Marketing Expense Growth',
      category: 'expenses',
      itemId: 'exp1',
      growthType: 'percentage',
      growthRate: 3.0, // 3% monthly growth
    },
    {
      id: 'a7',
      name: 'R&D Expense Growth',
      category: 'expenses',
      itemId: 'exp2',
      growthType: 'percentage',
      growthRate: 6.0, // 6% monthly growth
    },
  ];
  
  return {
    id: 'scenario1',
    name: 'Growth Scenario',
    description: 'Moderate growth assumptions with increased R&D investment',
    baseline,
    assumptions,
    periods: 12, // 12 month forecast
    periodType: 'monthly',
    startDate: new Date(currentYear, currentMonth + 1, 1) // Start from next month
  };
}

/**
 * Generate sample alternative forecast scenario
 */
export function generateSampleConservativeScenario(): ForecastScenario {
  // Start with the default scenario and modify it
  const baseScenario = generateSampleForecastScenario();
  
  return {
    ...baseScenario,
    id: 'scenario2',
    name: 'Conservative Scenario',
    description: 'Lower growth expectations with cost control measures',
    assumptions: [
      {
        id: 'ac1',
        name: 'Product Sales Growth',
        category: 'revenue',
        itemId: 'rev1',
        growthType: 'percentage',
        growthRate: 2.0, // 2% monthly growth
      },
      {
        id: 'ac2',
        name: 'Service Revenue Growth',
        category: 'revenue',
        itemId: 'rev2',
        growthType: 'percentage',
        growthRate: 1.5, // 1.5% monthly growth
      },
      {
        id: 'ac3',
        name: 'Subscription Revenue Growth',
        category: 'revenue',
        itemId: 'rev3',
        growthType: 'percentage',
        growthRate: 4.0, // 4% monthly growth
      },
      {
        id: 'ac4',
        name: 'Materials Cost Growth',
        category: 'costOfSales',
        itemId: 'cos1',
        growthType: 'percentage',
        growthRate: 2.0, // 2% monthly growth
      },
      {
        id: 'ac5',
        name: 'Direct Labor Cost Growth',
        category: 'costOfSales',
        itemId: 'cos2',
        growthType: 'percentage',
        growthRate: 1.0, // 1% monthly growth
      },
      {
        id: 'ac6',
        name: 'Sales & Marketing Expense Growth',
        category: 'expenses',
        itemId: 'exp1',
        growthType: 'percentage',
        growthRate: 1.0, // 1% monthly growth
      },
      {
        id: 'ac7',
        name: 'R&D Expense Growth',
        category: 'expenses',
        itemId: 'exp2',
        growthType: 'percentage',
        growthRate: 2.0, // 2% monthly growth
      },
    ]
  };
}

// Fix the generateForecastResults function
export function generateForecastResults(scenario: ForecastScenario): ForecastResult {
  const { baseline, assumptions, periods, periodType, startDate } = scenario;
  
  // Helper function to calculate period label
  const getPeriodLabel = (date: Date, periodType: ForecastPeriod): string => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (periodType === 'monthly') {
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(date);
    } else if (periodType === 'quarterly') {
      const quarter = Math.floor(month / 3) + 1;
      return `Q${quarter} ${year}`;
    } else {
      return `${year}`;
    }
  };
  
  // Helper function to advance date by period type
  const advanceDate = (date: Date, periodType: ForecastPeriod): Date => {
    const newDate = new Date(date);
    if (periodType === 'monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (periodType === 'quarterly') {
      newDate.setMonth(newDate.getMonth() + 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    return newDate;
  };
  
  // Helper function to apply growth model to a value
  const applyGrowth = (value: number, assumption: ForecastAssumption, periodIndex: number): number => {
    switch (assumption.growthType) {
      case 'percentage':
        return value * Math.pow(1 + assumption.growthRate / 100, periodIndex + 1);
      case 'linear':
        return value + (value * assumption.growthRate / 100 * (periodIndex + 1));
      case 'manual':
        return assumption.manualValues && periodIndex < assumption.manualValues.length
          ? assumption.manualValues[periodIndex]
          : value;
      default:
        return value;
    }
  };
  
  // Generate data for each period
  const forecastPeriods: ForecastPeriodData[] = [];
  let currentDate = new Date(startDate);
  
  // Deep clone the initial data
  const cloneItems = (items: PLItem[]): PLItem[] => {
    return items.map(item => ({ ...item }));
  };
  
  for (let i = 0; i < periods; i++) {
    // Calculate period end date
    const periodEndDate = advanceDate(currentDate, periodType);
    periodEndDate.setDate(periodEndDate.getDate() - 1); // Last day of the period
    
    // Start with cloned baseline data for this period
    const periodRevenue = cloneItems(baseline.revenue);
    const periodCostOfSales = cloneItems(baseline.costOfSales);
    const periodExpenses = cloneItems(baseline.expenses);
    
    // Apply growth assumptions to each item
    assumptions.forEach(assumption => {
      if (assumption.category === 'revenue') {
        const item = periodRevenue.find(item => item.id === assumption.itemId);
        if (item) {
          item.amount = applyGrowth(item.amount, assumption, i);
        }
      } else if (assumption.category === 'costOfSales') {
        const item = periodCostOfSales.find(item => item.id === assumption.itemId);
        if (item) {
          item.amount = applyGrowth(item.amount, assumption, i);
        }
      } else if (assumption.category === 'expenses') {
        const item = periodExpenses.find(item => item.id === assumption.itemId);
        if (item) {
          item.amount = applyGrowth(item.amount, assumption, i);
        }
      }
    });
    
    // Calculate totals for this period
    const periodTotalRevenue = periodRevenue.reduce((sum, item) => sum + item.amount, 0);
    const periodTotalCostOfSales = periodCostOfSales.reduce((sum, item) => sum + item.amount, 0);
    const periodGrossProfit = periodTotalRevenue - periodTotalCostOfSales;
    const periodTotalExpenses = periodExpenses.reduce((sum, item) => sum + item.amount, 0);
    const periodNetIncome = periodGrossProfit - periodTotalExpenses;
    
    // Add period data
    forecastPeriods.push({
      period: i,
      date: periodEndDate,
      label: getPeriodLabel(periodEndDate, periodType),
      revenue: periodRevenue,
      costOfSales: periodCostOfSales,
      expenses: periodExpenses,
      grossProfit: periodGrossProfit,
      netIncome: periodNetIncome
    });
    
    // Advance to next period start date
    currentDate = advanceDate(currentDate, periodType);
  }
  
  // Calculate forecast totals
  const totalRevenue = forecastPeriods.reduce((sum, period) => {
    return sum + period.revenue.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  
  const totalCostOfSales = forecastPeriods.reduce((sum, period) => {
    return sum + period.costOfSales.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  
  const totalExpenses = forecastPeriods.reduce((sum, period) => {
    return sum + period.expenses.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  
  const totalGrossProfit = totalRevenue - totalCostOfSales;
  const totalNetIncome = totalGrossProfit - totalExpenses;
  
  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    periodType: scenario.periodType,
    startDate: scenario.startDate,
    periods: forecastPeriods,
    totals: {
      revenue: totalRevenue,
      costOfSales: totalCostOfSales,
      expenses: totalExpenses,
      grossProfit: totalGrossProfit,
      netIncome: totalNetIncome
    }
  };
}

/**
 * Calculate moving average for a time series
 */
export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  
  // Need at least windowSize data points to calculate moving average
  if (data.length < windowSize) {
    return data.map(() => NaN);
  }
  
  // For the first windowSize-1 points, we'll use NaN as we don't have enough data yet
  for (let i = 0; i < windowSize - 1; i++) {
    result.push(NaN);
  }
  
  // Calculate moving average for the rest of the data
  for (let i = windowSize - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += data[i - j];
    }
    result.push(sum / windowSize);
  }
  
  return result;
}

/**
 * Calculate exponential smoothing for a time series
 */
export function calculateExponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  const result: number[] = [];
  
  if (data.length === 0) return result;
  
  // First value is just the first data point
  result.push(data[0]);
  
  // Calculate exponential smoothing for the rest of the data
  for (let i = 1; i < data.length; i++) {
    const smoothed = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(smoothed);
  }
  
  return result;
}

/**
 * Generate sample profit and loss statement for a given period
 */
export function generateSampleProfitAndLossStatement(period: DateRange): ProfitAndLossStatement {
  return generateSampleProfitAndLoss(period);
}

/**
 * Get historical profit and loss data for time series analysis
 */
export function getHistoricalPLData(periodType: ForecastPeriod, count: number): ProfitAndLossStatement[] {
  const result: ProfitAndLossStatement[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Generate historical data based on period type
  for (let i = 0; i < count; i++) {
    let periodStart: Date;
    let periodEnd: Date;
    let label: string;
    
    if (periodType === 'monthly') {
      periodStart = new Date(currentYear, currentMonth - i, 1);
      periodEnd = new Date(currentYear, currentMonth - i + 1, 0);
      label = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(periodStart);
    } else if (periodType === 'quarterly') {
      const quarter = Math.floor(currentMonth / 3);
      const startQuarter = quarter - Math.floor(i % 4);
      const yearOffset = Math.floor(i / 4);
      periodStart = new Date(currentYear - yearOffset, startQuarter * 3, 1);
      periodEnd = new Date(currentYear - yearOffset, startQuarter * 3 + 3, 0);
      label = `Q${(startQuarter % 4) + 1} ${currentYear - yearOffset}`;
    } else { // yearly
      periodStart = new Date(currentYear - i, 0, 1);
      periodEnd = new Date(currentYear - i, 11, 31);
      label = `${currentYear - i}`;
    }
    
    const period: DateRange = {
      type: periodType === 'monthly' ? 'month' : periodType === 'quarterly' ? 'quarter' : 'year',
      startDate: periodStart,
      endDate: periodEnd,
      label
    };
    
    // Generate base data
    const statement = generateSampleProfitAndLoss(period);
    
    // Add some random variation to simulate real historical data
    const variationFactor = 0.9 + (Math.random() * 0.2); // Random between 0.9 and 1.1
    const seasonalFactor = 1 + (0.1 * Math.sin(i * Math.PI / 6)); // Add seasonal pattern
    
    // Apply variations
    statement.revenue.forEach(item => {
      item.amount = item.amount * variationFactor * seasonalFactor;
    });
    statement.costOfSales.forEach(item => {
      item.amount = item.amount * variationFactor * (seasonalFactor * 0.8);
    });
    statement.expenses.forEach(item => {
      item.amount = item.amount * variationFactor * (seasonalFactor * 0.5);
    });
    
    // Recalculate totals
    statement.grossProfit = statement.revenue.reduce((sum, item) => sum + item.amount, 0) - 
                          statement.costOfSales.reduce((sum, item) => sum + item.amount, 0);
    statement.netIncome = statement.grossProfit - statement.expenses.reduce((sum, item) => sum + item.amount, 0);
    
    result.unshift(statement); // Add to beginning of array to get chronological order
  }
  
  return result;
}

/**
 * Decompose a time series into trend, seasonal, and residual components
 */
export function decomposeTimeSeries(
  data: number[], 
  params: SeasonalAdjustmentParams
): TimeSeriesComponents {
  const { seasonalPeriod, method } = params;
  const result: TimeSeriesComponents = {
    trend: [],
    seasonal: [],
    residual: [],
    original: [...data]
  };
  
  // Need at least 2 * seasonalPeriod data points for meaningful decomposition
  if (data.length < seasonalPeriod * 2) {
    return {
      trend: data.map(() => NaN),
      seasonal: data.map(() => NaN),
      residual: data.map(() => NaN),
      original: [...data]
    };
  }
  
  // 1. Calculate trend using moving average
  const trendWindowSize = method === 'multiplicative' ? seasonalPeriod : seasonalPeriod;
  result.trend = calculateMovingAverage(data, trendWindowSize);
  
  // 2. Calculate seasonal component
  const detrended = data.map((value, index) => {
    if (isNaN(result.trend[index])) {
      return NaN;
    }
    
    return method === 'multiplicative' 
      ? value / result.trend[index]
      : value - result.trend[index];
  });
  
  // Calculate seasonal indices by averaging the detrended values for each season
  const seasonalIndices: number[] = [];
  for (let i = 0; i < seasonalPeriod; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = i; j < data.length; j += seasonalPeriod) {
      if (!isNaN(detrended[j])) {
        sum += detrended[j];
        count++;
      }
    }
    
    seasonalIndices.push(count > 0 ? sum / count : 0);
  }
  
  // Normalize seasonal indices for multiplicative model
  if (method === 'multiplicative') {
    const avg = seasonalIndices.reduce((sum, value) => sum + value, 0) / seasonalIndices.length;
    seasonalIndices.forEach((value, i) => seasonalIndices[i] = value / avg);
  }
  
  // Fill in the seasonal component
  for (let i = 0; i < data.length; i++) {
    result.seasonal.push(seasonalIndices[i % seasonalPeriod]);
  }
  
  // 3. Calculate residual component
  for (let i = 0; i < data.length; i++) {
    if (isNaN(result.trend[i]) || isNaN(result.seasonal[i])) {
      result.residual.push(NaN);
    } else {
      const expected = method === 'multiplicative'
        ? result.trend[i] * result.seasonal[i]
        : result.trend[i] + result.seasonal[i];
      
      result.residual.push(data[i] - expected);
    }
  }
  
  return result;
}

/**
 * Apply seasonal adjustment to forecasted data
 */
export function applySeasonalAdjustment(
  forecast: number[], 
  timeSeriesComponents: TimeSeriesComponents,
  params: SeasonalAdjustmentParams
): number[] {
  const { method } = params;
  const { seasonal } = timeSeriesComponents;
  const seasonalLength = seasonal.filter(v => !isNaN(v)).length;
  
  return forecast.map((value, index) => {
    const seasonalIndex = index % seasonalLength;
    const seasonalFactor = seasonal[seasonalIndex];
    
    return method === 'multiplicative'
      ? value * seasonalFactor
      : value + seasonalFactor;
  });
}

/**
 * Calculate forecast accuracy metrics
 */
export function calculateForecastAccuracy(
  actual: number[], 
  predicted: number[]
): ForecastAccuracyMetrics {
  const n = Math.min(actual.length, predicted.length);
  if (n === 0) {
    return { mape: 0, rmse: 0, mae: 0 };
  }
  
  let sumAbsError = 0;
  let sumAbsPercentError = 0;
  let sumSquaredError = 0;
  
  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    const absError = Math.abs(error);
    const absPercentError = actual[i] !== 0 ? (absError / Math.abs(actual[i])) : 0;
    
    sumAbsError += absError;
    sumAbsPercentError += absPercentError;
    sumSquaredError += error * error;
  }
  
  const mae = sumAbsError / n;
  const mape = (sumAbsPercentError / n) * 100;
  const rmse = Math.sqrt(sumSquaredError / n);
  
  return { mae, mape, rmse };
}

/**
 * Perform variance analysis between forecasted and actual values
 */
export function analyzeVariance(
  actual: number[], 
  predicted: number[],
  periodLabels: string[]
): ForecastVarianceAnalysis[] {
  const results: ForecastVarianceAnalysis[] = [];
  
  const n = Math.min(actual.length, predicted.length, periodLabels.length);
  if (n === 0) return results;
  
  for (let i = 0; i < n; i++) {
    const variance = actual[i] - predicted[i];
    const variancePercent = actual[i] !== 0 ? (variance / actual[i]) * 100 : 0;
    
    // Determine impact level based on variance percentage
    let impact: 'high' | 'medium' | 'low' = 'low';
    if (Math.abs(variancePercent) > 20) {
      impact = 'high';
    } else if (Math.abs(variancePercent) > 10) {
      impact = 'medium';
    }
    
    results.push({
      periodLabel: periodLabels[i],
      actual: actual[i],
      predicted: predicted[i],
      variance,
      variancePercent,
      impact,
      factors: []
    });
  }
  
  return results;
}

/**
 * Generate advanced forecast results with multiple algorithm options
 */
export function generateAdvancedForecastResults(
  scenario: ForecastScenario, 
  algorithm: ForecastAlgorithm = 'simple',
  options: {
    seasonallyAdjusted?: boolean,
    seasonalParams?: SeasonalAdjustmentParams,
    historicalData?: number[],
    actualData?: number[],
    periodLabels?: string[]
  } = {}
): AdvancedForecastResult {
  const { baseline, assumptions, periods, periodType, startDate } = scenario;
  
  // Helper function to calculate period label
  const getPeriodLabel = (date: Date, periodType: ForecastPeriod): string => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (periodType === 'monthly') {
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(date);
    } else if (periodType === 'quarterly') {
      const quarter = Math.floor(month / 3) + 1;
      return `Q${quarter} ${year}`;
    } else {
      return `${year}`;
    }
  };
  
  // Helper function to advance date by period type
  const advanceDate = (date: Date, periodType: ForecastPeriod): Date => {
    const newDate = new Date(date);
    if (periodType === 'monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (periodType === 'quarterly') {
      newDate.setMonth(newDate.getMonth() + 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    return newDate;
  };
  
  // Helper function to apply growth model to a value
  const applyGrowth = (value: number, assumption: ForecastAssumption, periodIndex: number): number => {
    switch (assumption.growthType) {
      case 'percentage':
        return value * Math.pow(1 + assumption.growthRate / 100, periodIndex + 1);
      case 'linear':
        return value + (value * assumption.growthRate / 100 * (periodIndex + 1));
      case 'manual':
        return assumption.manualValues && periodIndex < assumption.manualValues.length
          ? assumption.manualValues[periodIndex]
          : value;
      default:
        return value;
    }
  };
  
  // Generate data for each period
  const forecastPeriods: ForecastPeriodData[] = [];
  let currentDate = new Date(startDate);
  
  // Deep clone the initial data
  const cloneItems = (items: PLItem[]): PLItem[] => {
    return items.map(item => ({ ...item }));
  };
  
  for (let i = 0; i < periods; i++) {
    // Calculate period end date
    const periodEndDate = advanceDate(currentDate, periodType);
    periodEndDate.setDate(periodEndDate.getDate() - 1); // Last day of the period
    
    // Start with cloned baseline data for this period
    const periodRevenue = cloneItems(baseline.revenue);
    const periodCostOfSales = cloneItems(baseline.costOfSales);
    const periodExpenses = cloneItems(baseline.expenses);
    
    // Apply growth assumptions to each item
    assumptions.forEach(assumption => {
      if (assumption.category === 'revenue') {
        const item = periodRevenue.find(item => item.id === assumption.itemId);
        if (item) {
          item.amount = applyGrowth(item.amount, assumption, i);
        }
      } else if (assumption.category === 'costOfSales') {
        const item = periodCostOfSales.find(item => item.id === assumption.itemId);
        if (item) {
          item.amount = applyGrowth(item.amount, assumption, i);
        }
      } else if (assumption.category === 'expenses') {
        const item = periodExpenses.find(item => item.id === assumption.itemId);
        if (item) {
          item.amount = applyGrowth(item.amount, assumption, i);
        }
      }
    });
    
    // Calculate totals for this period
    const periodTotalRevenue = periodRevenue.reduce((sum, item) => sum + item.amount, 0);
    const periodTotalCostOfSales = periodCostOfSales.reduce((sum, item) => sum + item.amount, 0);
    const periodGrossProfit = periodTotalRevenue - periodTotalCostOfSales;
    const periodTotalExpenses = periodExpenses.reduce((sum, item) => sum + item.amount, 0);
    const periodNetIncome = periodGrossProfit - periodTotalExpenses;
    
    // Add period data
    forecastPeriods.push({
      period: i,
      date: periodEndDate,
      label: getPeriodLabel(periodEndDate, periodType),
      revenue: periodRevenue,
      costOfSales: periodCostOfSales,
      expenses: periodExpenses,
      grossProfit: periodGrossProfit,
      netIncome: periodNetIncome
    });
    
    // Advance to next period start date
    currentDate = advanceDate(currentDate, periodType);
  }
  
  // Calculate forecast totals
  const totalRevenue = forecastPeriods.reduce((sum, period) => {
    return sum + period.revenue.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  
  const totalCostOfSales = forecastPeriods.reduce((sum, period) => {
    return sum + period.costOfSales.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  
  const totalExpenses = forecastPeriods.reduce((sum, period) => {
    return sum + period.expenses.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  
  const totalGrossProfit = totalRevenue - totalCostOfSales;
  const totalNetIncome = totalGrossProfit - totalExpenses;
  
  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    periodType: scenario.periodType,
    startDate: scenario.startDate,
    periods: forecastPeriods,
    totals: {
      revenue: totalRevenue,
      costOfSales: totalCostOfSales,
      expenses: totalExpenses,
      grossProfit: totalGrossProfit,
      netIncome: totalNetIncome
    }
  };
}
