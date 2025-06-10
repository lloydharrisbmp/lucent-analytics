# src/app/apis/models.py

"""Shared Pydantic models for APIs."""

from pydantic import BaseModel, Field
from enum import Enum
import uuid
import re
import databutton as db
from datetime import datetime
from typing import Optional, Dict, Any, List, Literal

# Define standard types for configuration options
ChartType = Literal["Line", "Bar", "KPI", "Table", "Waterfall", "Pie", "Number", None]
DateAggregation = Literal["Monthly", "Quarterly", "Yearly", None]
ComparisonType = Literal["Budget", "PriorYear", None]

# Define a flexible WidgetConfig that can hold various settings
# Use Dict[str, Any] for maximum flexibility initially,
# but specific models per widget type could be defined for stricter validation later.
class WidgetConfig(BaseModel):
    entityId: Optional[str] = Field(None, description="Entity ID for data filtering")
    dateRangePreset: Optional[str] = Field(None, description="e.g., \"last_quarter\", \"ytd\"")
    startDate: Optional[str] = Field(None, description="ISO date string for start of custom range")
    endDate: Optional[str] = Field(None, description="ISO date string for end of custom range")
    currencySymbol: Optional[str] = Field('$', description="Currency symbol for display")
    # --- Specific config examples ---
    # KPI Card
    kpiMetric: Optional[str] = Field(None, description="Metric identifier for KPI")
    comparisonPeriod: Optional[str] = Field(None, description="Comparison period preset, e.g., \"previous_period\"")
    # Charts (Line, Bar)
    xAxisKey: Optional[str] = Field(None, description="Data key for X-axis")
    yAxisKeys: Optional[List[str]] = Field(None, description="Data keys for Y-axis")
    groupByKey: Optional[str] = Field(None, description="Data key for grouping/segmenting")
    chartTypeVariant: Optional[str] = Field(None, description="e.g., 'stacked', 'percentage'")
    # Waterfall
    showSeasonalImpact: Optional[bool] = Field(False, description="Flag for seasonal analysis")
    # Table
    columns: Optional[List[Dict[str, Any]]] = Field(None, description="Column definitions for tables")
    sortOrder: Optional[str] = Field(None, description="Sort order (e.g., 'descending')")
    limit: Optional[int] = Field(None, description="Limit number of rows")
    
    # New fields for MYA-155
    title: Optional[str] = Field(None, description="Custom title for the widget")
    reportId: Optional[str] = Field(None, description="ID of the report used as data source")
    metricName: Optional[str] = Field(None, description="Specific metric to display, e.g., for KPI")
    xAxis: Optional[str] = Field(None, description="Field to use for the X-axis")
    yAxis: Optional[list[str]] = Field(None, description="Field(s) to use for the Y-axis")
    chartType: Optional[ChartType] = Field(None, description="Selected chart type for visualization")
    metrics: Optional[List[str]] = Field(None, description="List of metric IDs/names to display")
    dateAggregation: Optional[DateAggregation] = Field(None, description="Time aggregation level (e.g., Monthly, Quarterly)")
    comparison: Optional[ComparisonType] = Field(None, description="Comparison data to include (e.g., vs Budget)")

    class Config:
        extra = 'allow'  # Allow fields not explicitly defined for flexibility
        # Removed 'from_attributes = True' as it wasn't present in all original versions
        # and might not be needed if not loading from ORM objects.

# This definition should align with what the frontend expects
# based on the generated AppApisWidgetDataWidgetConfiguration
class WidgetConfiguration(BaseModel):
    id: str = Field(..., description="Unique ID for this specific widget instance on the dashboard")
    type: str = Field(..., description="Type of widget (e.g., 'enhancedCashFlowWaterfall', 'KPICard')")
    title: Optional[str] = Field(None, description="Optional title displayed on the widget")
    config: Optional[WidgetConfig] = Field(None, description="Nested configuration object specific to the widget type")

# This definition is used within the DashboardConfiguration in the dashboards API
class DashboardLayoutItem(BaseModel):
    i: str = Field(..., description="Widget ID, links to widgets array")
    x: int
    y: int
    w: int
    h: int
    static: Optional[bool] = False

# --- Models for Industry Benchmarks / Insights ---

class PercentileRank(BaseModel):
    metric_name: str = Field(..., description="Name of the metric")
    percentile: float = Field(..., description="Calculated percentile rank (0-100)")
    comparison_group: Optional[str] = Field(None, description="Description of the comparison group (e.g., industry, size)")

class MetricComparison(BaseModel):
    metric_name: str = Field(..., description="Name of the metric being compared")
    company_value: float = Field(..., description="The company's value for the metric")
    benchmark_value: Optional[float] = Field(None, description="The benchmark value for the metric")
    difference_absolute: Optional[float] = Field(None, description="Absolute difference between company and benchmark")
    difference_percent: Optional[float] = Field(None, description="Percentage difference between company and benchmark")
    is_favorable: Optional[bool] = Field(None, description="True if the company's value is considered favorable compared to the benchmark")
    percentile_rank: Optional[PercentileRank] = Field(None, description="Company's percentile rank within the benchmark group")

class BenchmarkSource(BaseModel):
    id: str = Field(..., description="Unique identifier for the benchmark source")
    name: str = Field(..., description="Name of the benchmark source (e.g., 'RMA Industry Norms')")
    description: Optional[str] = Field(None, description="Description of the data source")
    industry_codes: Optional[List[str]] = Field(None, description="List of applicable industry codes (e.g., ANZSIC)")
    region: Optional[str] = Field(None, description="Geographic region the benchmark applies to")
    last_updated: Optional[str] = Field(None, description="ISO 8601 timestamp of when the source data was last updated")
    data_points_key: Optional[str] = Field(None, description="Internal key for storing the associated data points") # Added for linking data

class BenchmarkDataPoint(BaseModel):
    industry_code: Optional[str] = Field(None, description="Industry code (e.g., ANZSIC)")
    industry_name: Optional[str] = Field(None, description="Name of the industry")
    metric_name: str = Field(..., description="Name of the benchmark metric")
    value: float = Field(..., description="The value of the benchmark metric")
    year: Optional[str] = Field(None, description="The year the benchmark data applies to")
    turnover_range: Optional[str] = Field(None, description="Applicable turnover range for the benchmark")
    source_id: str = Field(..., description="ID of the source this data point belongs to")
    version: Optional[str] = Field("1.0", description="Version of the benchmark data")
    # Add other relevant fields if needed based on data structure
    region: Optional[str] = Field(None, description="Geographic region if applicable")
    percentile: Optional[float] = Field(None, description="Percentile value if applicable (e.g., for distributions)")

# --- Helper Functions for Benchmarks ---
import re

BENCHMARK_SOURCES_KEY = "benchmark_sources.json"
BENCHMARK_DATA_PREFIX = "benchmark_data_"

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_benchmark_sources() -> List[BenchmarkSource]:
    """Loads benchmark sources from storage."""
    try:
        sources_data = db.storage.json.get(BENCHMARK_SOURCES_KEY)
        return [BenchmarkSource(**source) for source in sources_data]
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error loading benchmark sources: {e}")
        return []

def save_benchmark_sources(sources: List[BenchmarkSource]):
    """Saves benchmark sources to storage."""
    try:
        db.storage.json.put(BENCHMARK_SOURCES_KEY, [source.model_dump() for source in sources])
    except Exception as e:
        print(f"Error saving benchmark sources: {e}")
        # Potentially raise an exception here depending on desired error handling

def initialize_benchmark_sources():
    """Initializes default benchmark sources if none exist."""
    if not get_benchmark_sources():
        default_sources = [
            BenchmarkSource(
                id="ato_small_business", 
                name="ATO Small Business Benchmarks", 
                description="Australian Taxation Office small business benchmarks.",
                region="Australia",
                # Add other relevant fields like industry_codes if known
            ),
            BenchmarkSource(
                id="abs_industry_stats", 
                name="ABS Industry Statistics", 
                description="Australian Bureau of Statistics industry financial statistics.",
                region="Australia",
            ),
              BenchmarkSource(
                id="industry_associations", 
                name="Industry Associations", 
                description="Data collected from various industry association reports.",
                region="Australia",
            )
            # Add other default sources as needed
        ]
        save_benchmark_sources(default_sources)
        print(f"Initialized {len(default_sources)} default benchmark sources.")

def get_benchmark_data(
    source_id: Optional[str] = None, 
    version: Optional[str] = None, 
    industry_code: Optional[str] = None,
    industry_name: Optional[str] = None, 
    year: Optional[str] = None,
    metric: Optional[str] = None
) -> List[BenchmarkDataPoint]:
    """Gets benchmark data points, optionally filtered."""
    all_data = []
    
    # Determine keys to fetch
    keys_to_fetch = []
    if source_id:
        base_key = sanitize_storage_key(f"{BENCHMARK_DATA_PREFIX}{source_id}")
        if version:
            keys_to_fetch.append(f"{base_key}_v{version}")
        else:
            # Fetch latest/default if no version specified (or implement logic to find latest)
             keys_to_fetch.append(f"{base_key}_v1.0") # Assuming v1.0 default for now
             keys_to_fetch.append(base_key) # Also check base key for non-versioned data?

    else:
        # Fetch from all sources if no source_id specified
        # This might be inefficient; consider requiring source_id
        sources = get_benchmark_sources()
        for s in sources:
             base_key = sanitize_storage_key(f"{BENCHMARK_DATA_PREFIX}{s.id}")
             # Fetch latest/default version for each source
             keys_to_fetch.append(f"{base_key}_v1.0") # Assuming v1.0 default
             keys_to_fetch.append(base_key)
        keys_to_fetch.append(sanitize_storage_key(f"{BENCHMARK_DATA_PREFIX}all")) # Legacy combined key?

    # Fetch data from identified keys
    fetched_keys = set() # Avoid duplicate fetching
    for key in keys_to_fetch:
        if key not in fetched_keys:
            try:
                data = db.storage.json.get(key)
                all_data.extend([BenchmarkDataPoint(**item) for item in data])
                fetched_keys.add(key)
            except FileNotFoundError:
                pass # Ignore if a specific version/source key doesn't exist
            except Exception as e:
                print(f"Error loading benchmark data from key {key}: {e}")

    # Apply filters
    filtered_data = all_data
    if industry_code:
        filtered_data = [dp for dp in filtered_data if dp.industry_code == industry_code]
    if industry_name:
         # Case-insensitive partial match might be better
        filtered_data = [dp for dp in filtered_data if dp.industry_name and industry_name.lower() in dp.industry_name.lower()]
    if year:
        filtered_data = [dp for dp in filtered_data if dp.year == year]
    if metric:
        filtered_data = [dp for dp in filtered_data if dp.metric_name and metric.lower() == dp.metric_name.lower()]
        
    # Deduplicate based on a unique combination (e.g., source, year, industry, metric)
    unique_data = {}
    for dp in filtered_data:
        unique_key = (dp.source_id, dp.version, dp.year, dp.industry_code, dp.metric_name)
        if unique_key not in unique_data:
            unique_data[unique_key] = dp
            
    return list(unique_data.values())

def get_benchmark_versions(source_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Gets list of available versions, potentially filtered by source."""
    versions = []
    sources = get_benchmark_sources()
    if source_id:
        sources = [s for s in sources if s.id == source_id]
        if not sources:
             print(f"Source ID {source_id} not found for getting versions.")
             return []

    for source in sources:
        # Assuming version info is stored within the BenchmarkSource model itself
        # Need to adjust BenchmarkSource model if this isn't the case
        if hasattr(source, 'version_history') and source.version_history:
             for version_entry in source.version_history:
                 versions.append({
                     "source_id": source.id,
                     "version": version_entry.get("version", "N/A"),
                     "date": version_entry.get("date"),
                     "description": version_entry.get("description")
                 })
        else:
            # If no version history, maybe assume a default version exists?
            versions.append({"source_id": source.id, "version": "1.0", "description": "Default"})
            
    return versions

def add_benchmark_version(source_id: str, version: str, description: Optional[str] = None):
    """Adds or updates a version entry for a benchmark source."""
    sources = get_benchmark_sources()
    source_found = False
    for i, source in enumerate(sources):
        if source.id == source_id:
            source_found = True
            if not hasattr(source, 'version_history') or source.version_history is None:
                sources[i].version_history = []

            # Check if version already exists
            version_exists = False
            for j, existing_version in enumerate(sources[i].version_history):
                if existing_version.get("version") == version:
                    # Update existing entry
                    sources[i].version_history[j]["date"] = datetime.now().isoformat()
                    if description:
                        sources[i].version_history[j]["description"] = description
                    version_exists = True
                    break
            
            if not version_exists:
                # Add new version entry
                sources[i].version_history.append({
                    "version": version,
                    "date": datetime.now().isoformat(),
                    "description": description or f"Version {version} added"
                })
                # Sort versions? Optional, might be useful
                # sources[i].version_history.sort(key=lambda x: x.get('version', ''), reverse=True)

            # Update the source's last_updated timestamp
            sources[i].last_updated = datetime.now().isoformat()
            break
            
    if source_found:
        save_benchmark_sources(sources)
    else:
        print(f"Warning: Could not add version {version} because source {source_id} was not found.")


# --- Payloads ---
class CreateSourcePayload(BaseModel):
    name: str = Field(..., description="Name of the new benchmark source")
    description: Optional[str] = Field(None, description="Description of the source")
    industry_codes: Optional[List[str]] = Field(None, description="Applicable industry codes")
    region: Optional[str] = Field(None, description="Geographic region")
    # Add other fields needed for creation based on BenchmarkSource

class UpdateSourcePayload(BaseModel):
    name: Optional[str] = Field(None, description="Updated name for the benchmark source")
    description: Optional[str] = Field(None, description="Updated description")
    industry_codes: Optional[List[str]] = Field(None, description="Updated list of applicable industry codes")
    region: Optional[str] = Field(None, description="Updated geographic region")
    # Add other updatable fields, ensure they are Optional

# --- Responses ---
class BenchmarkDataResponse(BaseModel):
    data: List[BenchmarkDataPoint] = Field(..., description="List of benchmark data points")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata about the query (e.g., filters, total records)")

class BenchmarkSourcesResponse(BaseModel):
    sources: List[BenchmarkSource] = Field(..., description="List of available benchmark sources")

class UpdateBenchmarkRequest(BaseModel):
    source_id: str = Field(..., description="ID of the source to update")
    force_update: Optional[bool] = Field(False, description="Force update even if recently updated")

class UpdateBenchmarkResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the update was triggered successfully")
    message: str = Field(..., description="Status message about the update process")
    updated_source: Optional[BenchmarkSource] = Field(None, description="The updated source metadata") # Return the source object

# Assuming BenchmarkFileUploadRequest is handled via Form data, not a Pydantic model in body
# class BenchmarkFileUploadRequest(BaseModel): # Not needed if using Form(...)
#     source_id: str
#     year: str
#     version: str = "1.0"
#     description: Optional[str]
#     # file: UploadFile # Handled by FastAPI File(...)

class ImportResponse(BaseModel):
    success: bool
    import_id: Optional[str] = None # ID assigned to this import batch
    message: str
    processed_points: Optional[int] = None
    errors: Optional[List[str]] = None # Potential errors during processing

class ImportListResponse(BaseModel):
    imports: List[Dict[str, Any]] # List of import metadata dicts
    total: int

class ImportDetailResponse(BaseModel):
    import_details: Dict[str, Any] # Full details of the import record
    metadata: Optional[Dict[str, Any]] = None
    sample_data: Optional[List[Dict[str, Any]]] = None # Sample of the imported data

class CompanyMetric(BaseModel):
    metric_name: str = Field(..., description="Name of the company's metric")
    value: float = Field(..., description="The company's value for the metric")
    year: Optional[str] = Field(None, description="Year the metric applies to")
    # Add units, period etc. if needed

class ComparisonMethod(str, Enum):
    PERCENTILE = "percentile"
    DIRECT_COMPARISON = "direct_comparison"
    TREND_ANALYSIS = "trend_analysis"

class BenchmarkComparisonRequest(BaseModel):
    company_metrics: List[CompanyMetric] = Field(..., description="List of metrics for the company being analyzed")
    industry_code: Optional[str] = Field(None, description="ANZSIC code of the company's industry")
    industry_name: Optional[str] = Field(None, description="Name of the company's industry (used if code is ambiguous)")
    benchmark_source_id: Optional[str] = Field(None, description="Specific benchmark source ID to compare against (optional)")
    comparison_methods: Optional[List[ComparisonMethod]] = Field([ComparisonMethod.DIRECT_COMPARISON, ComparisonMethod.PERCENTILE], description="Methods to use for comparison")
    year: Optional[str] = Field(None, description="Specific year for benchmark data (optional, defaults to latest)")
    turnover_range: Optional[str] = Field(None, description="Turnover range to match in benchmarks (optional)")

class BenchmarkComparisonResponse(BaseModel):
    company_industry_identified: Optional[str] = Field(None, description="The industry identified for comparison")
    benchmark_source_used: Optional[BenchmarkSource] = Field(None, description="The benchmark source used for comparison")
    comparison_results: List[MetricComparison] = Field(..., description="List of comparison results for each metric")
    overall_summary: Optional[str] = Field(None, description="A brief textual summary of the comparison")
    # Could add insights or recommendations here later

# --- Metric Definitions ---
# Based on usage in industry_benchmarks endpoints
class BenchmarkMetricDefinition(BaseModel):
    metric_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the metric definition")
    name: str = Field(..., description="Canonical name of the metric (e.g., 'Current Ratio')")
    description: Optional[str] = Field(None, description="Explanation of what the metric measures")
    formula: Optional[str] = Field(None, description="Mathematical formula used to calculate the metric")
    data_type: str = Field(default="float", description="Data type of the metric value (e.g., 'float', 'percentage', 'ratio')")
    unit: Optional[str] = Field(None, description="Unit of measurement (e.g., '%', '$', 'days')")
    interpretation: Optional[str] = Field(None, description="Guidance on interpreting the metric (e.g., 'Higher is better')")
    category: Optional[str] = Field(None, description="Category the metric belongs to (e.g., 'Liquidity', 'Profitability')")
    related_metrics: Optional[List[str]] = Field(None, description="IDs of related metric definitions")

class CreateMetricDefinitionPayload(BaseModel):
    name: str = Field(..., description="Canonical name of the metric")
    description: Optional[str] = Field(None, description="Explanation of the metric")
    formula: Optional[str] = Field(None, description="Calculation formula")
    data_type: Optional[str] = Field("float", description="Data type")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    interpretation: Optional[str] = Field(None, description="Interpretation guide")
    category: Optional[str] = Field(None, description="Metric category")
    related_metrics: Optional[List[str]] = Field(None, description="Related metric IDs")

class UpdateMetricDefinitionPayload(BaseModel):
    name: Optional[str] = Field(None, description="Updated canonical name")
    description: Optional[str] = Field(None, description="Updated explanation")
    formula: Optional[str] = Field(None, description="Updated formula")
    data_type: Optional[str] = Field(None, description="Updated data type")
    unit: Optional[str] = Field(None, description="Updated unit")
    interpretation: Optional[str] = Field(None, description="Updated interpretation")
    category: Optional[str] = Field(None, description="Updated category")
    related_metrics: Optional[List[str]] = Field(None, description="Updated related metric IDs")

# --- Existing Model Definitions ---

# This definition was used in the dashboards API
class WidgetDataSource(BaseModel):
    sourceType: str = Field(..., description="Type of data source (e.g., 'reportApi', 'directQuery')")
    sourceId: Optional[str] = Field(None, description="Identifier for the source (e.g., report definition ID)")
    entityId: Optional[str] = Field(None, description="Optional specific entity ID for the source")
    # Removed date range fields as they seem to belong in WidgetConfig now
    parameters: Optional[Dict[str, Any]] = Field(None, description="Source-specific parameters")
