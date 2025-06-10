export interface WidgetDefinition {
  type: 'kpiCard' | 'lineChart' | 'barChart' | 'table';
  name: string;
  purpose: string;
  dataRequirements: string;
  configurationOptions: string;
}

export const widgetDefinitions: WidgetDefinition[] = [
  {
    type: 'kpiCard',
    name: 'KPI Card',
    purpose: 'Displays a single, prominent Key Performance Indicator (KPI) with optional context.',
    dataRequirements: 'Requires primaryValue. Optional: label, unit, comparisonValue, comparisonLabel, trend, trendLabel.',
    configurationOptions: 'Title, Data Mapping, Formatting, Comparison Display, Trend Display, Sparkline option.'
  },
  {
    type: 'lineChart',
    name: 'Line Chart',
    purpose: 'Visualizes trends over a continuous period (e.g., time).',
    dataRequirements: 'Requires array of data points with xValue (dimension) and one or more yValues (metrics). Example: [{ xValue: "2024-01", yValue1: 100 }].',
    configurationOptions: 'Title, Data Mapping, Time Period, Line Colors, Axis Labels, Legend, Smoothing.'
  },
  {
    type: 'barChart',
    name: 'Bar Chart',
    purpose: 'Compares discrete values across different categories or groups.',
    dataRequirements: 'Requires array of data points with category label and one or more metric values. Example: [{ category: "Product A", value1: 500 }].',
    configurationOptions: 'Title, Data Mapping, Bar Colors, Stacking, Axis Labels, Legend, Data Labels.'
  },
  {
    type: 'table',
    name: 'Simple Table',
    purpose: 'Displays data in a structured grid format.',
    dataRequirements: 'Requires array of objects for rows and column definitions. Example: [{ col1: "Item A", col2: 100 }], [{ key: "col1", header: "Item Name" }].',
    configurationOptions: 'Title, Data Mapping, Column Selection/Ordering, Sorting, Formatting, Pagination.'
  }
];
