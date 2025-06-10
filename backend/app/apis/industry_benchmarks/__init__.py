from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, Depends
from pydantic import BaseModel # Added BaseModel import
from typing import List, Dict, Optional, Any
import databutton as db
from datetime import datetime
import statistics

# Import our submodules
from app.apis.models import (
    # Models
    BenchmarkSource, BenchmarkDataPoint, 
    # Payloads
    CreateSourcePayload, UpdateSourcePayload,
    # Responses
    BenchmarkDataResponse, BenchmarkSourcesResponse, UpdateBenchmarkRequest, UpdateBenchmarkResponse,
    ImportResponse, ImportListResponse, ImportDetailResponse,
    BenchmarkComparisonRequest, BenchmarkComparisonResponse, MetricComparison, PercentileRank,
    CompanyMetric, ComparisonMethod,

    # Metric Definitions
    BenchmarkMetricDefinition, CreateMetricDefinitionPayload, UpdateMetricDefinitionPayload,

    # Helpers
    get_benchmark_sources, save_benchmark_sources, initialize_benchmark_sources,
    get_benchmark_data, get_benchmark_versions, add_benchmark_version, sanitize_storage_key
)

# Import ETL functions
# Moving this inside functions that need it to avoid circular imports

# Import insights engine
from app.apis.insights import generate_insights

# Create router
router = APIRouter()

# Initialize data when the module is loaded
initialize_benchmark_sources()

# --- Constants ---
METRIC_DEFINITIONS_JSON_KEY = "benchmark_metric_definitions.json"


# --- Helper Functions (General) ---

def _load_json_data(key: str, model_cls: type) -> List[Any]:
    """Loads JSON data from db.storage and validates with a Pydantic model class."""
    try:
        data = db.storage.json.get(key)
        return [model_cls(**item) for item in data]
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error loading or parsing JSON from {key}: {e}")
        # Depending on strictness, could raise HTTPException here
        return []

def _save_json_data(key: str, data: List[BaseModel]):
    """Saves a list of Pydantic models as JSON to db.storage."""
    try:
        # Ensure data is a list of dicts before saving
        db.storage.json.put(key, [item.dict() for item in data])
    except Exception as e:
        print(f"Error saving JSON to {key}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save data to {key}")


# --- Helper Functions (Metric Definitions) ---

def _load_metric_definitions() -> List[BenchmarkMetricDefinition]:
    return _load_json_data(METRIC_DEFINITIONS_JSON_KEY, BenchmarkMetricDefinition)

def _save_metric_definitions(definitions: List[BenchmarkMetricDefinition]):
    _save_json_data(METRIC_DEFINITIONS_JSON_KEY, definitions)


# Helper function to initialize sample data (kept for backward compatibility)
def initialize_benchmark_data() -> List[Dict[str, Any]]:
    """
    Initialize sample benchmark data for demonstration purposes
    """
    current_year = str(datetime.now().year)
    previous_year = str(datetime.now().year - 1)
    
    sample_data = [
        # ATO Small Business Benchmarks
        {
            "industry_code": "4121",
            "industry_name": "Residential Building Construction",
            "metric_name": "Cost of sales/turnover",
            "value": 0.65,
            "year": previous_year,
            "turnover_range": "$350,000 to $2 million",
            "source_id": "ato_small_business",
            "version": "1.0"
        },
        {
            "industry_code": "4121",
            "industry_name": "Residential Building Construction",
            "metric_name": "Total expenses/turnover",
            "value": 0.82,
            "year": previous_year,
            "turnover_range": "$350,000 to $2 million",
            "source_id": "ato_small_business",
            "version": "1.0"
        },
        # Additional sample data entries with version
        {
            "industry_code": "4121",
            "industry_name": "Residential Building Construction",
            "metric_name": "Rent/turnover",
            "value": 0.03,
            "year": previous_year,
            "turnover_range": "$350,000 to $2 million",
            "source_id": "ato_small_business",
            "version": "1.0"
        },
        {
            "industry_code": "4121",
            "industry_name": "Residential Building Construction",
            "metric_name": "Labour/turnover",
            "value": 0.20,
            "year": previous_year,
            "turnover_range": "$350,000 to $2 million",
            "source_id": "ato_small_business",
            "version": "1.0"
        },
        # A few minimal examples for other industries and sources
        {
            "industry_code": "M",
            "industry_name": "Professional, Scientific and Technical Services",
            "metric_name": "Operating profit before tax",
            "value": 14.2,
            "year": previous_year,
            "source_id": "abs_industry_stats",
            "version": "1.0"
        },
        {
            "industry_code": "CPA",
            "industry_name": "Accounting Services",
            "metric_name": "Revenue per FTE",
            "value": 180000.0,
            "year": previous_year,
            "source_id": "industry_associations",
            "version": "1.0"
        }
    ]
    
    # Store the sample data in database
    storage_key = sanitize_storage_key("benchmark_data_all")
    existing_data = db.storage.json.get(storage_key, default=[])
    
    # Only initialize if no data exists
    if not existing_data:
        db.storage.json.put(storage_key, sample_data)
        print(f"Initialized {len(sample_data)} benchmark data points")
        
        # Also initialize source-specific data stores
        sources = set(dp["source_id"] for dp in sample_data)
        for source_id in sources:
            source_data = [dp for dp in sample_data if dp["source_id"] == source_id]
            source_key = sanitize_storage_key(f"benchmark_data_{source_id}")
            db.storage.json.put(source_key, source_data)
    
    return sample_data

# Run initialization
initialize_benchmark_data()


# --- Benchmark Metric Definition CRUD ---

@router.post("/metrics", response_model=BenchmarkMetricDefinition, status_code=201)
def create_benchmark_metric_definition(payload: CreateMetricDefinitionPayload):
    """Creates a new benchmark metric definition."""
    definitions = _load_metric_definitions()

    if any(d.name.lower() == payload.name.lower() for d in definitions):
        raise HTTPException(status_code=400, detail=f"Metric definition with name '{payload.name}' already exists.")

    new_definition = BenchmarkMetricDefinition(**payload.dict())
    definitions.append(new_definition)
    _save_metric_definitions(definitions)
    print(f"Created metric definition: ID={new_definition.metric_id}, Name={new_definition.name}")
    return new_definition

@router.get("/metrics", response_model=List[BenchmarkMetricDefinition])
def list_benchmark_metric_definitions():
    """Lists all available benchmark metric definitions."""
    return _load_metric_definitions()

@router.put("/metrics/{metric_id}", response_model=BenchmarkMetricDefinition)
def update_benchmark_metric_definition(metric_id: str, payload: UpdateMetricDefinitionPayload):
    """Updates an existing benchmark metric definition."""
    definitions = _load_metric_definitions()
    def_idx = next((i for i, d in enumerate(definitions) if d.metric_id == metric_id), None)

    if def_idx is None:
        raise HTTPException(status_code=404, detail=f"Metric definition with ID {metric_id} not found.")

    definition_to_update = definitions[def_idx]
    update_data = payload.dict(exclude_unset=True)

    # Check for name collision if name is being updated
    if 'name' in update_data and update_data['name'].lower() != definition_to_update.name.lower():
        if any(d.name.lower() == update_data['name'].lower() and d.metric_id != metric_id for d in definitions):
            raise HTTPException(status_code=400, detail=f"Metric definition with name '{update_data['name']}' already exists.")

    updated_definition = definition_to_update.copy(update=update_data)
    definitions[def_idx] = updated_definition
    _save_metric_definitions(definitions)
    print(f"Updated metric definition: ID={updated_definition.metric_id}, Name={updated_definition.name}")
    return updated_definition

@router.delete("/metrics/{metric_id}", status_code=204)
def delete_benchmark_metric_definition(metric_id: str):
    """Deletes a benchmark metric definition."""
    definitions = _load_metric_definitions()
    initial_length = len(definitions)
    definitions = [d for d in definitions if d.metric_id != metric_id]

    if len(definitions) == initial_length:
        raise HTTPException(status_code=404, detail=f"Metric definition with ID {metric_id} not found.")

    _save_metric_definitions(definitions)
    print(f"Deleted metric definition: ID={metric_id}")
    return # Return None with 204 status code


# Additional endpoints for benchmark data management

@router.post("/sources", response_model=BenchmarkSource, status_code=201)
def create_benchmark_source(payload: CreateSourcePayload):
    """
    Create a new benchmark data source.
    Uses CreateSourcePayload for input validation.
    """
    try:
        sources = get_benchmark_sources()
        
        # Check for duplicate name
        if any(s.name.lower() == payload.name.lower() for s in sources):
             raise HTTPException(status_code=400, detail=f"Source with name '{payload.name}' already exists.")

        # Generate a unique ID based on sanitized name
        # Ensure uniqueness in case of collisions
        base_id = sanitize_storage_key(payload.name.lower().replace(' ', '_'))
        source_id = base_id
        counter = 1
        while any(s.id == source_id for s in sources):
            source_id = f"{base_id}_{counter}"
            counter += 1
            
        # Create the new source using payload data
        new_source = BenchmarkSource(
            id=source_id,
            **payload.dict(),
            last_updated=None, # Ensure last_updated is None on creation
            # Initialize version history - Assuming this structure is still desired
            version_history=[{"version": "1.0", "date": datetime.now().isoformat(), "description": "Initial setup"}] 
        )
        
        sources.append(new_source)
        save_benchmark_sources(sources)
        print(f"Created benchmark source: ID={new_source.id}, Name={new_source.name}")
        
        return new_source # Return the created source object directly
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating benchmark source: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating benchmark source: {str(e)}")

@router.put("/sources/{source_id}", response_model=BenchmarkSource)
def update_benchmark_source(source_id: str, payload: UpdateSourcePayload):
    """
    Update an existing benchmark data source.
    Uses UpdateSourcePayload for input validation.
    Only updates fields provided in the payload.
    """
    try:
        sources = get_benchmark_sources()
        source_idx = next((i for i, s in enumerate(sources) if s.id == source_id), None)
        
        if source_idx is None:
            raise HTTPException(status_code=404, detail=f"Source with ID {source_id} not found")
        
        source_to_update = sources[source_idx]
        update_data = payload.dict(exclude_unset=True)

        # Check for name collision if name is being updated
        if 'name' in update_data and update_data['name'].lower() != source_to_update.name.lower():
            if any(s.name.lower() == update_data['name'].lower() and s.id != source_id for s in sources):
                 raise HTTPException(status_code=400, detail=f"Source with name '{update_data['name']}' already exists.")

        # Update the source object
        updated_source = source_to_update.copy(update=update_data)
        
        # Add a timestamp for the update? Consider if this is needed.
        # updated_source.last_updated = datetime.now().isoformat() # Maybe only update if actual data changes?

        sources[source_idx] = updated_source
        save_benchmark_sources(sources)
        print(f"Updated benchmark source: ID={updated_source.id}, Name={updated_source.name}")
        
        return updated_source # Return the updated source object directly
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating benchmark source: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating benchmark source: {str(e)}")

@router.delete("/delete-benchmark-source/{source_id}", response_model=Dict[str, Any])
async def delete_benchmark_source(source_id: str):
    """
    Delete a benchmark data source and its data
    """
    try:
        sources = get_benchmark_sources()
        source_idx = next((i for i, s in enumerate(sources) if s.id == source_id), None)
        
        if source_idx is None:
            raise HTTPException(status_code=404, detail=f"Source with ID {source_id} not found")
        
        # Get the source to delete
        source = sources[source_idx]
        
        # Delete the source from sources list
        del sources[source_idx]
        save_benchmark_sources(sources)
        
        # Delete associated data
        try:
            source_key = sanitize_storage_key(f"benchmark_data_{source_id}")
            db.storage.json.put(source_key, [])
            
            # Also delete version-specific data
            if hasattr(source, 'version_history') and source.version_history:
                for version_entry in source.version_history:
                    version = version_entry.get("version")
                    if version:
                        version_key = sanitize_storage_key(f"benchmark_data_{source_id}_v{version}")
                        db.storage.json.put(version_key, [])
        except Exception as e:
            # Non-critical error when deleting data
            print(f"Warning: Could not delete data for source {source_id}: {e}")
        
        return {
            "success": True,
            "message": f"Deleted benchmark source: {source.name}",
            "deleted_source": source.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting benchmark source: {str(e)}")

@router.get("/compare-benchmark-versions", response_model=Dict[str, Any])
async def compare_benchmark_versions(
    source_id: str = Query(..., description="Source ID to compare versions for"),
    version1: str = Query(..., description="First version to compare"),
    version2: str = Query(..., description="Second version to compare"),
    industry_code: Optional[str] = Query(None, description="Optional industry code to filter by")
):
    """
    Compare two versions of benchmark data for a source
    """
    try:
        # Get data for version 1
        v1_key = sanitize_storage_key(f"benchmark_data_{source_id}_v{version1}")
        v1_data = db.storage.json.get(v1_key, default=[])
        
        # Get data for version 2
        v2_key = sanitize_storage_key(f"benchmark_data_{source_id}_v{version2}")
        v2_data = db.storage.json.get(v2_key, default=[])
        
        # Filter by industry code if provided
        if industry_code:
            v1_data = [dp for dp in v1_data if dp.get("industry_code") == industry_code]
            v2_data = [dp for dp in v2_data if dp.get("industry_code") == industry_code]
        
        # Group by industry and metric for comparison
        v1_metrics = {}
        v2_metrics = {}
        all_industries = set()
        all_metrics = set()
        
        # Process version 1 data
        for dp in v1_data:
            industry = dp.get("industry_name")
            metric = dp.get("metric_name")
            value = dp.get("value")
            
            all_industries.add(industry)
            all_metrics.add(metric)
            
            if industry not in v1_metrics:
                v1_metrics[industry] = {}
            
            v1_metrics[industry][metric] = value
        
        # Process version 2 data
        for dp in v2_data:
            industry = dp.get("industry_name")
            metric = dp.get("metric_name")
            value = dp.get("value")
            
            all_industries.add(industry)
            all_metrics.add(metric)
            
            if industry not in v2_metrics:
                v2_metrics[industry] = {}
            
            v2_metrics[industry][metric] = value
        
        # Build comparison results
        comparison = []
        for industry in sorted(all_industries):
            for metric in sorted(all_metrics):
                v1_value = v1_metrics.get(industry, {}).get(metric)
                v2_value = v2_metrics.get(industry, {}).get(metric)
                
                if v1_value is not None or v2_value is not None:
                    diff = None
                    diff_percent = None
                    
                    if v1_value is not None and v2_value is not None:
                        diff = v2_value - v1_value
                        if v1_value != 0:
                            diff_percent = (diff / v1_value) * 100
                    
                    comparison.append({
                        "industry": industry,
                        "metric": metric,
                        "v1_value": v1_value,
                        "v2_value": v2_value,
                        "difference": diff,
                        "percent_change": diff_percent
                    })
        
        # Get version metadata
        versions = get_benchmark_versions(source_id)
        v1_meta = next((v for v in versions if v.get("version") == version1), {})
        v2_meta = next((v for v in versions if v.get("version") == version2), {})
        
        return {
            "source_id": source_id,
            "version1": {
                "version": version1,
                "date": v1_meta.get("date"),
                "description": v1_meta.get("description"),
                "data_points": len(v1_data)
            },
            "version2": {
                "version": version2,
                "date": v2_meta.get("date"),
                "description": v2_meta.get("description"),
                "data_points": len(v2_data)
            },
            "comparison": comparison,
            "summary": {
                "total_metrics": len(all_metrics),
                "total_industries": len(all_industries),
                "increases": len([c for c in comparison if c.get("difference", 0) > 0]),
                "decreases": len([c for c in comparison if c.get("difference", 0) < 0]),
                "unchanged": len([c for c in comparison if c.get("difference", 0) == 0]),
                "new_in_v2": len([c for c in comparison if c.get("v1_value") is None and c.get("v2_value") is not None]),
                "removed_in_v2": len([c for c in comparison if c.get("v1_value") is not None and c.get("v2_value") is None])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing benchmark versions: {str(e)}")

@router.get("/benchmark-data-summary", response_model=Dict[str, Any])
async def get_benchmark_data_summary(
    source_id: Optional[str] = Query(None, description="Optional source ID to filter by")
):
    """
    Get a summary of available benchmark data
    """
    try:
        # Get available sources
        sources = get_benchmark_sources()
        if source_id:
            sources = [s for s in sources if s.id == source_id]
        
        # Build summary for each source
        summary = []
        for source in sources:
            # Get all versions for this source
            versions = [v.get("version") for v in get_benchmark_versions(source.id)]
            
            # Get data for latest version
            latest_version = versions[0] if versions else "1.0"
            data = get_benchmark_data(source_id=source.id, version=latest_version)
            
            # Count distinct industries and metrics
            industries = set(dp.industry_name for dp in data)
            metrics = set(dp.metric_name for dp in data)
            years = set(dp.year for dp in data)
            
            summary.append({
                "source_id": source.id,
                "source_name": source.name,
                "data_points": len(data),
                "industries": len(industries),
                "metrics": len(metrics),
                "years": sorted(list(years)),
                "versions": len(versions),
                "latest_version": latest_version,
                "last_updated": source.last_updated
            })
        
        return {
            "sources": len(summary),
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting benchmark data summary: {str(e)}")


# Benchmark Sources CRUD
# POST /sources defined above (create_benchmark_source)
# PUT /sources/{source_id} defined above (update_benchmark_source)
# DELETE /delete-benchmark-source/{source_id} - already exists, seems okay for now

@router.get("/sources", response_model=List[BenchmarkSource])
def list_benchmark_sources():
    """List all available benchmark data sources"""
    sources = get_benchmark_sources()
    return sources

@router.get("/benchmark-data", response_model=BenchmarkDataResponse)
def get_benchmark_data_endpoint(
    industry_code: Optional[str] = Query(None, description="Industry code to filter data"),
    industry_name: Optional[str] = Query(None, description="Industry name to filter data"),
    source_id: Optional[str] = Query(None, description="Source ID to filter data"),
    year: Optional[str] = Query(None, description="Year to filter data"),
    metric: Optional[str] = Query(None, description="Metric name to filter data"),
    version: Optional[str] = Query(None, description="Version of the data to retrieve")
):
    """Get benchmark data based on filters"""
    try:
        # Use the function from models module
        data_points = get_benchmark_data(
            industry_code=industry_code,
            industry_name=industry_name,
            source_id=source_id,
            year=year,
            metric=metric,
            version=version
        )
        
        metadata = {
            "total_records": len(data_points),
            "filters_applied": {
                "industry_code": industry_code,
                "industry_name": industry_name,
                "source_id": source_id,
                "year": year,
                "metric": metric,
                "version": version
            }
        }
        
        return BenchmarkDataResponse(data=data_points, metadata=metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching benchmark data: {str(e)}")

@router.post("/update-benchmark", response_model=UpdateBenchmarkResponse)
def update_benchmark_data(request: UpdateBenchmarkRequest):
    """Trigger an update of benchmark data from the specified source"""
    try:
        # Get the source
        sources = get_benchmark_sources()
        source = next((s for s in sources if s.id == request.source_id), None)
        
        if not source:
            raise HTTPException(status_code=404, detail=f"Source with ID {request.source_id} not found")
        
        # Check if update is needed
        need_update = True
        if source.last_updated and not request.force_update:
            # Check if it's been updated recently (implementation would depend on update_frequency)
            last_updated_date = datetime.fromisoformat(source.last_updated)
            now = datetime.now()
            if (now - last_updated_date).days < 30:  # Simplified check, adjust based on update_frequency
                need_update = False
        
        if not need_update:
            return UpdateBenchmarkResponse(
                success=True,
                message=f"Source '{source.name}' was updated recently on {source.last_updated}. No update performed.",
                updated_source=source
            )
        
        # Perform the update based on the source type
        if source.id == "ato_small_business":
            # Simplified update process for demo purposes
            # In a real implementation, this would fetch data from the ATO website
            source.last_updated = datetime.now().isoformat()
            
            # Add a new version to this source's history
            current_version = "1.0"
            if hasattr(source, 'version_history') and source.version_history:
                latest_version = source.version_history[-1].get("version", "1.0")
                # Increment the minor version number
                major, minor = latest_version.split('.')
                current_version = f"{major}.{int(minor) + 1}"
            
            add_benchmark_version(
                source_id=source.id,
                version=current_version,
                description=f"Updated data from {source.name}"
            )
            
            # Save the updated source with timestamp
            for i, s in enumerate(sources):
                if s.id == source.id:
                    sources[i].last_updated = datetime.now().isoformat()
                    break
            save_benchmark_sources(sources)
            
            return UpdateBenchmarkResponse(
                success=True,
                message=f"Successfully updated data for '{source.name}' to version {current_version}",
                updated_source=source
            )
        
        else:
            # Generic handling for other sources
            return UpdateBenchmarkResponse(
                success=False,
                message=f"Update not implemented for source '{source.name}'",
                updated_source=source
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating benchmark data: {str(e)}")

@router.post("/upload-benchmark-data", response_model=ImportResponse)
async def upload_benchmark_data(
    source_id: str = Form(...),
    year: str = Form(...),
    version: str = Form("1.0"),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """Upload and process benchmark data file"""
    # Import ETL functions locally to avoid circular imports
    from app.apis.etl import process_csv_file, process_excel_file, save_benchmark_import
    
    try:
        # Check if source exists
        sources = get_benchmark_sources()
        if not any(s.id == source_id for s in sources):
            raise HTTPException(status_code=404, detail=f"Benchmark source {source_id} not found")
        
        # Process file based on file extension
        file_extension = file.filename.split('.')[-1].lower()
        data_points = []
        metadata = {}
        
        if file_extension == 'csv':
            data_points, metadata = process_csv_file(file, source_id, year, version)
        elif file_extension in ['xlsx', 'xls']:
            data_points, metadata = process_excel_file(file, source_id, year, version)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {file_extension}. Please upload CSV or Excel files.")
        
        # Check for processing errors
        if not data_points and metadata.get('error'):
            raise HTTPException(status_code=400, detail=metadata['error'])
        
        # Save the data
        import_id = save_benchmark_import(data_points, metadata)
        
        # Update the source's version history
        add_benchmark_version(source_id, version, description)
        
        return ImportResponse(
            success=True,
            import_id=import_id,
            message=f"Successfully processed {len(data_points)} data points",
            processed_points=len(data_points)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/benchmark-imports", response_model=ImportListResponse)
def list_imports2(
    source_id: Optional[str] = Query(None, description="Filter imports by source ID"),
    limit: int = Query(100, description="Maximum number of imports to return")
):
    """List all benchmark data imports"""
    # Import ETL functions locally to avoid circular imports
    from app.apis.etl import get_benchmark_imports
    
    try:
        imports = get_benchmark_imports(source_id, limit)
        return ImportListResponse(imports=imports, total=len(imports))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing imports: {str(e)}")

@router.get("/benchmark-import/{import_id}", response_model=ImportDetailResponse)
def get_import2(
    import_id: str
):
    """Get details of a specific import"""
    # Import ETL functions locally to avoid circular imports
    from app.apis.etl import get_import_details
    
    try:
        import_details = get_import_details(import_id)
        if not import_details:
            raise HTTPException(status_code=404, detail=f"Import with ID {import_id} not found")
        
        return ImportDetailResponse(
            import_details=import_details,
            metadata=import_details.get("metadata", {}),
            sample_data=import_details.get("sample_data", [])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting import details: {str(e)}")

@router.get("/benchmark-versions", response_model=Dict[str, Any])
def get_benchmark_versions_endpoint(
    source_id: Optional[str] = Query(None, description="Filter versions by source ID")
):
    """Get available versions of benchmark data"""
    try:
        versions = get_benchmark_versions(source_id)
        return {"versions": versions, "total": len(versions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting benchmark versions: {str(e)}")

@router.get("/industry-metrics", response_model=Dict[str, List[str]])
def get_industry_metrics(
    industry_name: Optional[str] = Query(None, description="Industry name to filter metrics")
):
    """Get available metrics for a specific industry or all industries"""
    try:
        sources = get_benchmark_sources()
        
        all_metrics = set()
        for source in sources:
            if industry_name:
                if any(industry_name.lower() in ind.lower() for ind in source.industries):
                    all_metrics.update(source.metrics)
            else:
                all_metrics.update(source.metrics)
        
        return {"metrics": sorted(list(all_metrics))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching industry metrics: {str(e)}")

@router.get("/industry-list", response_model=Dict[str, List[str]])
def get_industry_list():
    """Get a list of all industries from all sources"""
    try:
        sources = get_benchmark_sources()
        
        all_industries = set()
        for source in sources:
            all_industries.update(source.industries)
        
        return {"industries": sorted(list(all_industries))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching industry list: {str(e)}")

@router.get("/data-collection-strategy", response_model=Dict[str, Any])
def get_data_collection_strategy():
    """Get information about the data collection and update strategy"""
    sources = get_benchmark_sources()
    
    strategy = {
        "overview": "This API provides access to Australian industry benchmark data from various sources.",
        "collection_methods": [
            {
                "source": "Australian Taxation Office (ATO)",
                "method": "Annual download of Small Business Benchmarks dataset",
                "update_frequency": "Annual",
                "data_format": "Excel spreadsheets processed into structured JSON"
            },
            {
                "source": "Australian Bureau of Statistics (ABS)",
                "method": "API access to Australian Industry Statistics",
                "update_frequency": "Annual",
                "data_format": "JSON transformed to match internal data model"
            },
            {
                "source": "Industry Associations",
                "method": "Manual collection from association websites and reports",
                "update_frequency": "Varies by association",
                "data_format": "Various formats transformed to match internal data model"
            }
        ],
        "sources": [source.dict() for source in sources],
        "update_process": {
            "automatic_updates": "Scheduled monthly checks for new data from all sources",
            "manual_updates": "Available through the update-benchmark endpoint",
            "validation": "Automated checks for data consistency and completeness",
            "versioning": "Historical data is preserved with version tracking for year-over-year comparisons",
            "file_uploads": "Support for direct CSV and Excel file uploads with automatic transformation"
        },
        "data_structure": {
            "industry_classification": "Based on ANZSIC codes and industry names",
            "metrics": "Financial ratios and performance indicators relevant to Australian businesses",
            "time_periods": "Annual data with historical records where available",
            "versioning": "Multiple versions of benchmark data can be maintained simultaneously"
        }
    }
    
    return strategy

@router.post("/compare-with-benchmarks", response_model=BenchmarkComparisonResponse)
async def compare_with_benchmarks(request: BenchmarkComparisonRequest):
    """Compare company data with industry benchmarks"""
    try:
        # Determine the industry based on provided data
        industry_name = request.industry_name
        industry_code = request.industry_code
        
        # If industry name isn't provided but code is, try to find the name
        if not industry_name and industry_code:
            all_data = get_benchmark_data()
            matching_industries = [dp.industry_name for dp in all_data if dp.industry_code == industry_code]
            if matching_industries:
                industry_name = matching_industries[0]
        
        # If still no industry match, attempt to guess based on company metrics
        if not industry_name and not industry_code:
            industry_name = await match_industry_from_metrics(request.company_metrics)
            if not industry_name:
                raise HTTPException(status_code=400, detail="Could not determine industry. Please provide industry_name or industry_code")
        
        # Determine which benchmark source to use
        source_id = request.benchmark_source_id
        if not source_id:
            # Default to the first available source with data for this industry
            sources = get_benchmark_sources()
            for source in sources:
                if any(industry_name.lower() in ind.lower() for ind in source.industries):
                    source_id = source.id
                    break
            if not source_id and sources:
                source_id = sources[0].id
        
        # Get relevant benchmark data
        year = request.year or str(datetime.now().year)
        benchmark_data = get_benchmark_data(
            industry_name=industry_name, 
            industry_code=industry_code,
            source_id=source_id,
            year=year
        )
        
        if not benchmark_data:
            raise HTTPException(status_code=404, detail=f"No benchmark data found for industry: {industry_name or industry_code} for year {year}")
        
        # Get source name for the response
        sources = get_benchmark_sources()
        source = next((s for s in sources if s.id == source_id), None)
        source_name = source.name if source else "Unknown Source"
        
        # Match company metrics with benchmark metrics
        comparisons = []
        for company_metric in request.company_metrics:
            comparison = await compare_metric_with_benchmarks(
                company_metric=company_metric,
                benchmark_data=benchmark_data,
                comparison_method=request.comparison_method,
                company_name=request.company_name,
                turnover_range=request.turnover_range
            )
            if comparison:
                comparisons.append(comparison)
        
        # Calculate overall score (simple average of percentile ranks)
        overall_score = None
        if comparisons and any(c.percentile_rank for c in comparisons):
            percentiles = [c.percentile_rank.percentile for c in comparisons if c.percentile_rank]
            if percentiles:
                overall_score = sum(percentiles) / len(percentiles)
        
        # Generate recommendations based on comparisons
        recommendations = generate_recommendations(comparisons, request.company_name, industry_name)
        
        # Generate enhanced insights
        insights = None
        try:
            insights = generate_insights(comparisons, request.company_name, industry_name)
        except Exception as e:
            print(f"Error generating enhanced insights: {e}")
        
        # Add insights to metadata if available
        metadata = {
            "benchmark_data_points": len(benchmark_data),
            "matched_metrics": len(comparisons),
            "source_id": source_id,
            "comparison_method": request.comparison_method
        }
        
        if insights:
            metadata["insights"] = insights
        
        return BenchmarkComparisonResponse(
            company_name=request.company_name,
            industry_name=industry_name,
            industry_code=industry_code,
            benchmark_source=source_name,
            year=year,
            comparisons=comparisons,
            overall_score=overall_score,
            recommendations=recommendations,
            metadata=metadata
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing with benchmarks: {str(e)}")

async def match_industry_from_metrics(company_metrics: List[CompanyMetric]) -> Optional[str]:
    """Attempt to match an industry based on the company metrics"""
    # This is a simplified algorithm - in a real implementation, this would use
    # machine learning or more sophisticated pattern matching
    
    # Look for industry-specific metrics
    industry_indicators = {
        "Residential Building Construction": ["construction_costs", "labor_costs", "materials_cost"],
        "Professional, Scientific and Technical Services": ["billable_hours", "utilization_rate", "client_retention"],
        "Retail Trade": ["inventory_turnover", "sales_per_square_meter", "shrinkage_rate"],
        "Manufacturing": ["machine_utilization", "defect_rate", "production_cycle_time"],
        "Accommodation and Food Services": ["occupancy_rate", "revenue_per_available_room", "food_cost_percentage"]
    }
    
    metric_names = [m.name.lower() for m in company_metrics]
    
    # Check each industry for matching metrics
    matches = {}
    for industry, indicators in industry_indicators.items():
        match_count = sum(1 for indicator in indicators if any(indicator in name for name in metric_names))
        if match_count > 0:
            matches[industry] = match_count
    
    # Return the industry with the most matches
    if matches:
        return max(matches.items(), key=lambda x: x[1])[0]
    
    return None

async def compare_metric_with_benchmarks(
    company_metric: CompanyMetric,
    benchmark_data: List[BenchmarkDataPoint],
    comparison_method: ComparisonMethod,
    company_name: str,
    turnover_range: Optional[str] = None
) -> Optional[MetricComparison]:
    """Compare a single company metric with benchmark data"""
    # Filter benchmark data by metric name based on comparison method
    matching_benchmark = None
    data_points = []
    
    if comparison_method == ComparisonMethod.DIRECT:
        # Direct matching - metric name must match exactly
        data_points = [dp for dp in benchmark_data if dp.metric_name.lower() == company_metric.name.lower()]
    
    elif comparison_method == ComparisonMethod.FUZZY:
        # Fuzzy matching - look for similar metric names
        for dp in benchmark_data:
            # Simple fuzzy match - check if one is substring of the other
            if company_metric.name.lower() in dp.metric_name.lower() or dp.metric_name.lower() in company_metric.name.lower():
                data_points.append(dp)
    
    elif comparison_method == ComparisonMethod.DERIVED:
        # Derived matching - this would involve more complex logic to derive comparable metrics
        # For example, if we have "gross_profit" and "revenue", we could derive "gross_margin"
        # Simplified implementation for demonstration
        common_derivations = {
            "gross_margin": ["gross_profit", "sales"],  # gross_profit / sales
            "net_margin": ["net_profit", "sales"],      # net_profit / sales
            "asset_turnover": ["sales", "total_assets"]  # sales / total_assets
        }
        
        # Check if we have a derivation rule for this metric
        for derived_metric, components in common_derivations.items():
            if company_metric.name.lower() == derived_metric.lower():
                # Look for benchmark metrics that match the derived metric
                data_points = [dp for dp in benchmark_data if dp.metric_name.lower() == derived_metric.lower()]
                break
    
    # If we have benchmark data points, use them for comparison
    if data_points:
        # Further filter by turnover range if provided
        if turnover_range:
            filtered_points = [dp for dp in data_points if dp.turnover_range and dp.turnover_range.lower() == turnover_range.lower()]
            if filtered_points:
                data_points = filtered_points
        
        # For simplicity, we'll use the average of matching benchmark values
        benchmark_values = [dp.value for dp in data_points]
        if benchmark_values:
            benchmark_value = sum(benchmark_values) / len(benchmark_values)
            
            # Calculate difference and percentage difference
            difference = company_metric.value - benchmark_value
            difference_percent = (difference / benchmark_value) * 100 if benchmark_value != 0 else 0
            
            # Calculate percentile rank if we have enough data points
            percentile_rank = None
            if len(benchmark_values) >= 3:  # Arbitrary minimum for statistical relevance
                try:
                    # Calculate where the company's value sits in the distribution
                    rank = statistics.percentileofscore(benchmark_values, company_metric.value)
                    
                    # Interpret the percentile
                    interpretation = interpret_percentile(rank, difference > 0, is_favorable_if_higher(company_metric.name))
                    
                    percentile_rank = PercentileRank(
                        percentile=rank,
                        interpretation=interpretation
                    )
                except Exception as e:
                    print(f"Error calculating percentile rank: {e}")
            
            # Determine if the difference is favorable
            is_favorable = None
            if difference != 0:
                is_favorable = is_favorable_if_higher(company_metric.name) == (difference > 0)
            
            # Get a description for this metric
            description = get_metric_description(company_metric.name, is_favorable, difference_percent)
            
            return MetricComparison(
                metric_name=company_metric.name,
                company_value=company_metric.value,
                benchmark_value=benchmark_value,
                difference=difference,
                difference_percent=difference_percent,
                percentile_rank=percentile_rank,
                is_favorable=is_favorable,
                data_points_count=len(data_points),
                description=description
            )
    
    return None

def interpret_percentile(percentile: float, is_higher: bool, higher_is_better: bool) -> str:
    """Interpret a percentile rank in context"""
    if percentile >= 90:
        return f"Exceptional performance - in the top {100-percentile:.0f}% of businesses"
    elif percentile >= 75:
        return f"Strong performance - better than {percentile:.0f}% of businesses"
    elif percentile >= 50:
        return f"Above average - better than {percentile:.0f}% of businesses"
    elif percentile >= 25:
        return f"Below average - better than {percentile:.0f}% of businesses but room for improvement"
    else:
        return f"Needs attention - only better than {percentile:.0f}% of businesses"

def is_favorable_if_higher(metric_name: str) -> bool:
    """Determine if a higher value for a given metric is favorable"""
    # Define metrics where higher values are typically better
    higher_is_better = [
        "profit", "margin", "return", "revenue", "sales", "income",
        "turnover", "utilization", "efficiency", "productivity",
        "retention", "satisfaction", "equity", "assets"
    ]
    
    # Define metrics where lower values are typically better
    lower_is_better = [
        "cost", "expense", "debt", "liability", "loss", "ratio",
        "days", "time", "cycle", "defect", "error", "default",
        "churn", "turnover_rate", "vacancy"
    ]
    
    # Check if any higher_is_better terms are in the metric name
    metric_lower = metric_name.lower()
    for term in higher_is_better:
        if term in metric_lower:
            return True
    
    # Check if any lower_is_better terms are in the metric name
    for term in lower_is_better:
        if term in metric_lower:
            return False
    
    # Default to higher is better if we can't determine
    return True

def get_metric_description(metric_name: str, is_favorable: bool, difference_percent: float) -> str:
    """Generate a human-readable description of a metric comparison"""
    abs_diff = abs(difference_percent)
    metric_display = metric_name.replace("_", " ").title()
    
    if is_favorable is None:
        return f"{metric_display} is {abs_diff:.1f}% different from the industry benchmark."
    
    if is_favorable:
        if abs_diff > 20:
            return f"{metric_display} is significantly better than the industry benchmark by {abs_diff:.1f}%."
        elif abs_diff > 10:
            return f"{metric_display} is better than the industry benchmark by {abs_diff:.1f}%."
        else:
            return f"{metric_display} is slightly better than the industry benchmark by {abs_diff:.1f}%."
    else:
        if abs_diff > 20:
            return f"{metric_display} is significantly worse than the industry benchmark by {abs_diff:.1f}%."
        elif abs_diff > 10:
            return f"{metric_display} is worse than the industry benchmark by {abs_diff:.1f}%."
        else:
            return f"{metric_display} is slightly worse than the industry benchmark by {abs_diff:.1f}%."

def generate_recommendations(comparisons: List[MetricComparison], company_name: str, industry_name: str) -> List[str]:
    """Generate actionable recommendations based on benchmark comparisons"""
    # If we have the enhanced insights module available, use it for more comprehensive recommendations
    try:
        insights = generate_insights(comparisons, company_name, industry_name)
        if insights and "recommendations" in insights and "consolidated_recommendations" in insights["recommendations"]:
            # Extract the top recommendations from the enhanced insights engine
            consolidated = insights["recommendations"]["consolidated_recommendations"]
            return [rec["recommendation"] for rec in consolidated[:5]]
    except Exception as e:
        print(f"Error using enhanced insights engine: {e}. Falling back to basic recommendations.")
    
    # Fallback to the original basic recommendation logic if the enhanced engine fails
    recommendations = []
    
    # Filter out favorable comparisons
    unfavorable_comparisons = [c for c in comparisons if c.is_favorable is False]
    
    # Sort by the magnitude of difference (focusing on the largest gaps first)
    unfavorable_comparisons.sort(key=lambda c: abs(c.difference_percent), reverse=True)
    
    # Generate specific recommendations for the top 3 unfavorable metrics
    for comparison in unfavorable_comparisons[:3]:
        metric_display = comparison.metric_name.replace("_", " ").title()
        abs_diff = abs(comparison.difference_percent)
        
        if "cost" in comparison.metric_name.lower() or "expense" in comparison.metric_name.lower():
            recommendations.append(
                f"Reduce {metric_display} by reviewing suppliers and operational efficiency. "
                f"Currently {abs_diff:.1f}% higher than industry average."
            )
        elif "margin" in comparison.metric_name.lower() or "profit" in comparison.metric_name.lower():
            recommendations.append(
                f"Improve {metric_display} through pricing strategy review and cost controls. "
                f"Currently {abs_diff:.1f}% below industry average."
            )
        elif "turnover" in comparison.metric_name.lower() or "sales" in comparison.metric_name.lower():
            recommendations.append(
                f"Increase {metric_display} through targeted marketing and sales initiatives. "
                f"Currently {abs_diff:.1f}% below industry average."
            )
        else:
            recommendations.append(
                f"Address {metric_display} performance gap of {abs_diff:.1f}% compared to industry benchmarks."
            )
    
    # Add a general recommendation if we have overall performance data
    if comparisons and any(c.percentile_rank for c in comparisons):
        percentiles = [c.percentile_rank.percentile for c in comparisons if c.percentile_rank]
        if percentiles:
            avg_percentile = sum(percentiles) / len(percentiles)
            if avg_percentile < 50:
                recommendations.append(
                    f"Consider seeking industry-specific advice to improve overall performance, "
                    f"which is currently below the median for {industry_name}."
                )
            elif avg_percentile < 75:
                recommendations.append(
                    f"Focus on key metrics to move from average to top-tier performance in {industry_name}."
                )
    
    # Add a generic recommendation if we don't have enough specific ones
    if len(recommendations) < 2:
        recommendations.append(
            f"Regularly monitor industry benchmarks and adjust business strategies to maintain competitiveness."
        )
    
    return recommendations

def is_favorable_if_higher(metric_name: str) -> bool:
    """Determine if a higher value is favorable for this metric"""
    # This is a simplified implementation - in reality, this would be more comprehensive
    lower_is_better = [
        "cost", "expense", "ratio", "debt", "defect", "turnover", "churn", "loss", 
        "time", "days", "error"
    ]
    
    # Check if any of the lower_is_better keywords are in the metric name
    metric_lower = metric_name.lower()
    for keyword in lower_is_better:
        if keyword in metric_lower:
            return False
    
    # Special cases for specific metrics
    special_cases = {
        "debt_to_equity": False,
        "inventory_turnover": True,  # Exception to the "turnover" rule
        "asset_turnover": True,      # Exception to the "turnover" rule
        "days_sales_outstanding": False,
        "accounts_payable_turnover": True,
    }
    
    if metric_lower in special_cases:
        return special_cases[metric_lower]
    
    # Default to higher is better
    return True

def interpret_percentile(percentile: float, is_higher: bool, higher_is_better: bool) -> str:
    """Generate a text interpretation of a percentile ranking"""
    if percentile >= 90:
        if (is_higher and higher_is_better) or (not is_higher and not higher_is_better):
            return "Exceptional - in the top 10% of the industry"
        else:
            return "Concerning - in the bottom 10% of the industry"
    elif percentile >= 75:
        if (is_higher and higher_is_better) or (not is_higher and not higher_is_better):
            return "Strong - outperforming 75% of the industry"
        else:
            return "Below average - underperforming compared to 75% of the industry"
    elif percentile >= 50:
        if (is_higher and higher_is_better) or (not is_higher and not higher_is_better):
            return "Above average - better than half of the industry"
        else:
            return "Below average - in the bottom half of the industry"
    elif percentile >= 25:
        if (is_higher and higher_is_better) or (not is_higher and not higher_is_better):
            return "Below average - in the bottom half of the industry"
        else:
            return "Above average - better than half of the industry"
    else:
        if (is_higher and higher_is_better) or (not is_higher and not higher_is_better):
            return "Concerning - in the bottom 25% of the industry"
        else:
            return "Strong - outperforming 75% of the industry"

def get_metric_description(metric_name: str, is_favorable: Optional[bool], difference_percent: float) -> str:
    """Generate a description for a metric comparison"""
    # Dictionary of metric descriptions
    metric_descriptions = {
        "cost_of_sales_turnover": "The proportion of sales revenue that is spent directly on producing goods or services",
        "total_expenses_turnover": "The proportion of total sales revenue consumed by all business expenses",
        "rent_turnover": "The percentage of revenue spent on rent and occupancy costs",
        "labour_turnover": "Labor costs as a percentage of total revenue",
        "operating_profit_before_tax": "Profit before tax as a percentage of total revenue",
        "revenue_per_fte": "Average revenue generated per full-time equivalent employee",
        "gross_margin": "The percentage of revenue retained after direct costs of goods sold",
        "net_margin": "The percentage of revenue that translates to bottom-line profit",
        "asset_turnover": "How efficiently the business uses its assets to generate revenue"
    }
    
    # Normalize the metric name for lookup
    normalized_name = metric_name.lower().replace(" ", "_")
    base_description = metric_descriptions.get(normalized_name, f"Comparison of {metric_name}")
    
    # Add performance commentary if we have favorability information
    if is_favorable is not None:
        if is_favorable:
            if abs(difference_percent) > 20:
                return f"{base_description}. Significantly outperforming the industry benchmark by {abs(difference_percent):.1f}%."
            elif abs(difference_percent) > 5:
                return f"{base_description}. Outperforming the industry benchmark by {abs(difference_percent):.1f}%."
            else:
                return f"{base_description}. Slightly better than the industry benchmark by {abs(difference_percent):.1f}%."
        else:
            if abs(difference_percent) > 20:
                return f"{base_description}. Significantly underperforming compared to the industry benchmark by {abs(difference_percent):.1f}%."
            elif abs(difference_percent) > 5:
                return f"{base_description}. Underperforming compared to the industry benchmark by {abs(difference_percent):.1f}%."
            else:
                return f"{base_description}. Slightly below the industry benchmark by {abs(difference_percent):.1f}%."
    
    return base_description

def generate_recommendations(comparisons: List[MetricComparison], company_name: str, industry_name: str) -> List[str]:
    """Generate recommendations based on metric comparisons"""
    recommendations = []
    
    # Check for unfavorable metrics
    unfavorable_metrics = [c for c in comparisons if c.is_favorable is False]
    
    # Prioritize by the degree of unfavorability
    if unfavorable_metrics:
        sorted_metrics = sorted(unfavorable_metrics, key=lambda x: abs(x.difference_percent), reverse=True)
        
        # Generate specific recommendations for the most unfavorable metrics
        for i, metric in enumerate(sorted_metrics[:3]):  # Limit to top 3 issues
            metric_name = metric.metric_name.lower()
            
            if "cost" in metric_name or "expense" in metric_name:
                recommendations.append(
                    f"Review your {metric.metric_name} which is {abs(metric.difference_percent):.1f}% higher than the industry benchmark. "
                    f"Consider cost reduction strategies in this area."
                )
            elif "margin" in metric_name:
                recommendations.append(
                    f"Your {metric.metric_name} is {abs(metric.difference_percent):.1f}% below the industry average. "
                    f"Analyze pricing strategy and cost structure to improve margins."
                )
            elif "turnover" in metric_name:
                recommendations.append(
                    f"Improve your {metric.metric_name} which is underperforming by {abs(metric.difference_percent):.1f}%. "
                    f"Review your operational efficiency in this area."
                )
            else:
                recommendations.append(
                    f"Address your underperforming {metric.metric_name} which is {abs(metric.difference_percent):.1f}% "
                    f"{'below' if metric.difference < 0 else 'above'} the industry benchmark."
                )
    
    # Add general recommendation if we have an overall score
    overall_favorable = len([c for c in comparisons if c.is_favorable is True]) > len(unfavorable_metrics)
    
    if overall_favorable:
        recommendations.append(
            f"Overall, {company_name} is performing well compared to industry benchmarks for {industry_name}. "
            f"Continue to monitor and maintain your competitive advantages."
        )
    else:
        recommendations.append(
            f"Consider consulting with a business advisor to develop strategies for improving {company_name}'s "
            f"performance relative to {industry_name} benchmarks."
        )
    
    # Always add a recommendation about regular benchmarking
    recommendations.append(
        f"Regularly benchmark your performance against industry standards to identify trends and opportunities. "
        f"Consider quarterly reviews of key metrics."
    )
    
    return recommendations
