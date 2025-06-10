from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import re
import json
import databutton as db
from datetime import datetime
import io
from fastapi import UploadFile, APIRouter

# Create an empty router to indicate this is not an API
router = APIRouter()

# Helper functions
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Import File Handlers
def process_csv_file(file: UploadFile, source_id: str, year: str, version: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Process a CSV file into benchmark data points with enhanced validation and transformation
    
    Args:
        file: The uploaded CSV file
        source_id: The ID of the data source
        year: The year of the data
        version: The version of the import
        
    Returns:
        Tuple containing processed data points and metadata
    """
    # Read the CSV into a pandas DataFrame
    contents = file.file.read()
    data = pd.read_csv(io.BytesIO(contents))
    
    # Generate import metadata
    metadata = {
        "filename": file.filename,
        "timestamp": datetime.now().isoformat(),
        "source_id": source_id,
        "year": year,
        "version": version,
        "original_columns": data.columns.tolist(),
        "row_count": len(data),
        "column_count": len(data.columns),
        "file_type": "csv"
    }
    
    # Transform data - this would need customization based on the specific CSV format
    # Here's a generic example that assumes the CSV has columns that match our data model
    data_points = []
    required_columns = ['industry_code', 'industry_name', 'metric_name', 'value']
    
    # Check if all required columns exist
    missing_columns = [col for col in required_columns if col not in data.columns]
    if missing_columns:
        # If columns are missing, try to map standard formats
        # Example mapping for ATO Small Business Benchmarks
        if source_id == 'ato_small_business':
            possible_mappings = [
                {'ANZSIC code': 'industry_code', 'Industry': 'industry_name', 'Ratio/Item': 'metric_name', 'Value': 'value'},
                {'Industry code': 'industry_code', 'Industry name': 'industry_name', 'Measure': 'metric_name', 'Value': 'value'},
                {'Code': 'industry_code', 'Description': 'industry_name', 'Metric': 'metric_name', 'Result': 'value'}
            ]
            
            for mapping in possible_mappings:
                # Try each mapping
                renamed_cols = {k: v for k, v in mapping.items() if k in data.columns}
                if len(renamed_cols) >= 3:  # At least 3 columns mapped successfully
                    data = data.rename(columns=renamed_cols)
                    break
            
            # Check again after mapping
            missing_columns = [col for col in required_columns if col not in data.columns]
            if missing_columns:
                metadata['error'] = f"Missing required columns after mapping: {', '.join(missing_columns)}"
                return [], metadata
        else:
            # For unknown formats, return empty data with error in metadata
            metadata['error'] = f"Missing required columns: {', '.join(missing_columns)}"
            return [], metadata
    
    # Ensure value is a float
    if 'value' in data.columns:
        data['value'] = pd.to_numeric(data['value'], errors='coerce')
    
    # Convert DataFrame to list of dictionaries
    for _, row in data.iterrows():
        # Skip rows with missing critical data
        if pd.isna(row.get('industry_code')) or pd.isna(row.get('metric_name')) or pd.isna(row.get('value')):
            continue
            
        data_point = {
            "industry_code": str(row.get('industry_code', "")),
            "industry_name": str(row.get('industry_name', "")),
            "metric_name": str(row.get('metric_name', "")),
            "value": float(row.get('value', 0)),
            "year": year,
            "source_id": source_id,
        }
        
        # Add optional fields if they exist
        if 'turnover_range' in data.columns and not pd.isna(row.get('turnover_range')):
            data_point["turnover_range"] = str(row['turnover_range'])
            
        # Add version for historical tracking
        data_point["version"] = version
        
        # Add any additional metadata fields that might be in the CSV
        for col in data.columns:
            if col not in required_columns and col != 'turnover_range' and not pd.isna(row.get(col)):
                # Store as metadata
                if "metadata" not in data_point:
                    data_point["metadata"] = {}
                data_point["metadata"][col] = str(row[col])
        
        data_points.append(data_point)
    
    metadata['processed_points'] = len(data_points)
    return data_points, metadata

def process_excel_file(file: UploadFile, source_id: str, year: str, version: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Process an Excel file into benchmark data points with enhanced support for multiple formats
    
    Args:
        file: The uploaded Excel file
        source_id: The ID of the data source
        year: The year of the data
        version: The version of the import
        
    Returns:
        Tuple containing processed data points and metadata
    """
    # Read the Excel file into a pandas DataFrame
    contents = file.file.read()
    
    # Generate import metadata before processing
    metadata = {
        "filename": file.filename,
        "timestamp": datetime.now().isoformat(),
        "source_id": source_id,
        "year": year,
        "version": version,
        "sheets": [],
        "file_type": "excel"
    }
    
    try:
        # Try to read all sheets
        excel_file = pd.ExcelFile(io.BytesIO(contents))
        sheet_names = excel_file.sheet_names
        metadata["sheets"] = sheet_names
        
        all_data_points = []
        
        # Process each sheet
        for sheet in sheet_names:
            data = pd.read_excel(excel_file, sheet_name=sheet)
            metadata[f"sheet_{sheet}_rows"] = len(data)
            metadata[f"sheet_{sheet}_columns"] = len(data.columns)
            metadata[f"sheet_{sheet}_column_names"] = data.columns.tolist()
            
            # Perform source-specific transformations
            if source_id == 'ato_small_business':
                # Detect ATO format by looking at column names
                if any(col in data.columns for col in ['ANZSIC code', 'Industry', 'Industry code', 'Industry name']):
                    industry_col = next((col for col in ['Industry', 'Industry name'] if col in data.columns), None)
                    code_col = next((col for col in ['ANZSIC code', 'Industry code'] if col in data.columns), None)
                    
                    if industry_col and code_col:
                        # Iterate through rows to extract metrics from column headers
                        for _, row in data.iterrows():
                            industry_code = row.get(code_col)
                            industry_name = row.get(industry_col)
                            
                            # Skip header or empty rows
                            if pd.isna(industry_code) or pd.isna(industry_name) or \
                               str(industry_code).lower() in ['anzsic', 'code', 'industry code'] or \
                               str(industry_name).lower() in ['industry', 'description', 'industry name']:
                                continue
                                
                            # Extract turnover range if available
                            turnover_range = None
                            if 'Turnover range' in data.columns and not pd.isna(row.get('Turnover range')):
                                turnover_range = str(row.get('Turnover range'))
                            elif 'Annual turnover' in data.columns and not pd.isna(row.get('Annual turnover')):
                                turnover_range = str(row.get('Annual turnover'))
                            
                            # Process metrics from remaining columns
                            for col in data.columns:
                                if col not in [industry_col, code_col, 'Turnover range', 'Annual turnover']:
                                    try:
                                        value = row.get(col)
                                        if not pd.isna(value) and str(value).strip():
                                            # Convert percentage strings to floats
                                            if isinstance(value, str):
                                                value = value.strip().rstrip('%')
                                                try:
                                                    value = float(value) / 100 if '%' in str(row.get(col)) else float(value)
                                                except ValueError:
                                                    # Skip non-numeric values
                                                    continue
                                            
                                            data_point = {
                                                "industry_code": str(industry_code),
                                                "industry_name": str(industry_name),
                                                "metric_name": str(col),
                                                "value": float(value),
                                                "year": year,
                                                "source_id": source_id,
                                                "version": version
                                            }
                                            
                                            if turnover_range:
                                                data_point["turnover_range"] = turnover_range
                                                
                                            all_data_points.append(data_point)
                                    except (ValueError, TypeError):
                                        # Skip non-numeric values
                                        pass
                    else:
                        metadata[f"sheet_{sheet}_error"] = "Could not identify industry code or name columns"
                else:
                    metadata[f"sheet_{sheet}_error"] = "Sheet does not appear to contain ATO benchmark data"
            elif source_id == 'abs_industry_stats':
                # Custom processing for ABS data format
                # This would need to be tailored to the actual ABS format
                # Simplified example with common column detection
                industry_col = next((col for col in ['Industry', 'Industry name', 'Industry Division', 'Division'] if col in data.columns), None)
                metric_cols = [col for col in data.columns if col not in ['Industry', 'Industry name', 'Industry Division', 'Division', 'Year', 'Code', 'ANZSIC']]
                
                if industry_col and metric_cols:
                    for _, row in data.iterrows():
                        industry_name = row.get(industry_col)
                        
                        # Skip header or empty rows
                        if pd.isna(industry_name) or str(industry_name).lower() in ['industry', 'description', 'name']:
                            continue
                        
                        # Get industry code if available
                        industry_code = "unknown"
                        for code_col in ['Code', 'ANZSIC', 'Industry code']:
                            if code_col in data.columns and not pd.isna(row.get(code_col)):
                                industry_code = str(row.get(code_col))
                                break
                        
                        # Process each metric column
                        for metric_col in metric_cols:
                            try:
                                value = row.get(metric_col)
                                if not pd.isna(value):
                                    data_point = {
                                        "industry_code": industry_code,
                                        "industry_name": str(industry_name),
                                        "metric_name": str(metric_col),
                                        "value": float(value),
                                        "year": year,
                                        "source_id": source_id,
                                        "version": version
                                    }
                                    all_data_points.append(data_point)
                            except (ValueError, TypeError):
                                # Skip non-numeric values
                                pass
                else:
                    metadata[f"sheet_{sheet}_error"] = "Sheet does not appear to contain ABS industry statistics"
            else:
                # Generic processing for other sources
                # Assuming a standard format with recognizable columns
                # First, try to detect column structure
                industry_col = next((col for col in ['Industry', 'Industry name', 'Business type'] if col in data.columns), None)
                code_col = next((col for col in ['ANZSIC code', 'Industry code', 'Code'] if col in data.columns), None)
                metric_col = next((col for col in ['Metric', 'Measure', 'Ratio', 'Indicator'] if col in data.columns), None)
                value_col = next((col for col in ['Value', 'Result', 'Amount', 'Percentage'] if col in data.columns), None)
                
                if industry_col and value_col:
                    # If we have industry and value columns, we can extract data
                    if metric_col:
                        # Format where metrics are in a column
                        for _, row in data.iterrows():
                            try:
                                industry_name = row.get(industry_col)
                                metric_name = row.get(metric_col)
                                value = row.get(value_col)
                                
                                if pd.isna(industry_name) or pd.isna(metric_name) or pd.isna(value):
                                    continue
                                
                                industry_code = row.get(code_col) if code_col and not pd.isna(row.get(code_col)) else "unknown"
                                
                                data_point = {
                                    "industry_code": str(industry_code),
                                    "industry_name": str(industry_name),
                                    "metric_name": str(metric_name),
                                    "value": float(value),
                                    "year": year,
                                    "source_id": source_id,
                                    "version": version
                                }
                                
                                # Add turnover range if available
                                if 'Turnover range' in data.columns and not pd.isna(row.get('Turnover range')):
                                    data_point["turnover_range"] = str(row.get('Turnover range'))
                                
                                all_data_points.append(data_point)
                            except (ValueError, TypeError):
                                # Skip invalid rows
                                pass
                    else:
                        # Format where columns are metrics
                        metric_cols = [col for col in data.columns if col not in [industry_col, code_col]]
                        
                        for _, row in data.iterrows():
                            industry_name = row.get(industry_col)
                            if pd.isna(industry_name) or str(industry_name).lower() in ['industry', 'description', 'name']:
                                continue
                            
                            industry_code = row.get(code_col) if code_col and not pd.isna(row.get(code_col)) else "unknown"
                            
                            for metric in metric_cols:
                                try:
                                    value = row.get(metric)
                                    if not pd.isna(value):
                                        data_point = {
                                            "industry_code": str(industry_code),
                                            "industry_name": str(industry_name),
                                            "metric_name": str(metric),
                                            "value": float(value),
                                            "year": year,
                                            "source_id": source_id,
                                            "version": version
                                        }
                                        all_data_points.append(data_point)
                                except (ValueError, TypeError):
                                    # Skip non-numeric values
                                    pass
                else:
                    # Try standard format with required columns
                    required_columns = ['industry_code', 'industry_name', 'metric_name', 'value']
                    missing_columns = [col for col in required_columns if col not in data.columns]
                    
                    if missing_columns:
                        metadata[f"sheet_{sheet}_error"] = f"Missing required columns: {', '.join(missing_columns)}"
                        continue
                    
                    # Process the data with standard column names
                    for _, row in data.iterrows():
                        try:
                            if pd.isna(row.get('industry_code')) or pd.isna(row.get('industry_name')) or \
                               pd.isna(row.get('metric_name')) or pd.isna(row.get('value')):
                                continue
                                
                            data_point = {
                                "industry_code": str(row.get('industry_code')),
                                "industry_name": str(row.get('industry_name')),
                                "metric_name": str(row.get('metric_name')),
                                "value": float(row.get('value')),
                                "year": year,
                                "source_id": source_id,
                                "version": version
                            }
                            
                            # Add optional fields if they exist
                            if 'turnover_range' in row and not pd.isna(row.get('turnover_range')):
                                data_point["turnover_range"] = str(row['turnover_range'])
                                
                            all_data_points.append(data_point)
                        except (ValueError, TypeError):
                            # Skip invalid rows
                            pass
        
        metadata['processed_points'] = len(all_data_points)
        return all_data_points, metadata
        
    except Exception as e:
        metadata['error'] = str(e)
        return [], metadata

# Save and Retrieve Functions
def save_benchmark_import(data_points: List[Dict[str, Any]], metadata: Dict[str, Any]) -> str:
    """
    Save imported benchmark data and metadata with versioning support
    
    Args:
        data_points: The processed benchmark data points
        metadata: The import metadata
        
    Returns:
        import_id: The ID of the saved import
    """
    # Generate a unique import ID
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    source_id = metadata.get("source_id", "unknown")
    import_id = f"{source_id}_{timestamp}"
    
    # Add import_id and timestamp to each data point for tracking
    for dp in data_points:
        dp["import_id"] = import_id
        dp["timestamp"] = datetime.now().isoformat()
    
    # Save metadata
    metadata_key = sanitize_storage_key(f"benchmark_import_{import_id}_metadata")
    db.storage.json.put(metadata_key, metadata)
    
    # Save data points
    data_key = sanitize_storage_key(f"benchmark_import_{import_id}_data")
    db.storage.json.put(data_key, data_points)
    
    # Update the main benchmark data store
    version = metadata.get("version", "1.0")
    source_id = metadata.get("source_id")
    
    if source_id:
        # Get existing data for this source
        source_key = sanitize_storage_key(f"benchmark_data_{source_id}")
        existing_data = db.storage.json.get(source_key, default=[])
        
        # Remove data points with the same version if it exists
        if version:
            # Keep historical data points with different versions
            existing_data = [dp for dp in existing_data if dp.get("version") != version]
        
        # Add the new data points
        existing_data.extend(data_points)
        
        # Save the updated data
        db.storage.json.put(source_key, existing_data)
        
        # Also save version-specific data for this source
        version_key = sanitize_storage_key(f"benchmark_data_{source_id}_v{version}")
        db.storage.json.put(version_key, data_points)
        
        # Update the consolidated store
        all_key = sanitize_storage_key("benchmark_data_all")
        all_data = db.storage.json.get(all_key, default=[])
        
        # Remove existing data points for this source and version
        all_data = [dp for dp in all_data if not (dp.get("source_id") == source_id and dp.get("version") == version)]
        
        # Add the new data points
        all_data.extend(data_points)
        
        # Save the updated consolidated data
        db.storage.json.put(all_key, all_data)
    
    # Keep track of imports
    imports_key = sanitize_storage_key("benchmark_imports")
    imports = db.storage.json.get(imports_key, default=[])
    
    import_summary = {
        "import_id": import_id,
        "source_id": metadata.get("source_id", "unknown"),
        "timestamp": metadata.get("timestamp"),
        "filename": metadata.get("filename", "unknown"),
        "data_points": len(data_points),
        "year": metadata.get("year", "unknown"),
        "version": version,
        "status": "success" if data_points else "error",
        "error": metadata.get("error")
    }
    
    imports.append(import_summary)
    db.storage.json.put(imports_key, imports)
    
    # Update the source's last_updated timestamp
    update_source_timestamp(source_id)
    
    return import_id

def update_source_timestamp(source_id: str):
    """
    Update the last_updated timestamp for a benchmark source
    
    Args:
        source_id: The ID of the source to update
    """
    from app.apis.models import get_benchmark_sources, save_benchmark_sources
    
    sources = get_benchmark_sources()
    for i, source in enumerate(sources):
        if source.id == source_id:
            sources[i].last_updated = datetime.now().isoformat()
            break
    
    save_benchmark_sources(sources)

def get_benchmark_imports(source_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get list of benchmark data imports
    
    Args:
        source_id: Optional filter for a specific source
        limit: Maximum number of imports to return
        
    Returns:
        List of import summaries
    """
    imports_key = sanitize_storage_key("benchmark_imports")
    imports = db.storage.json.get(imports_key, default=[])
    
    # Filter by source_id if provided
    if source_id:
        imports = [imp for imp in imports if imp.get("source_id") == source_id]
    
    # Sort by timestamp descending
    imports.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Limit the number of results
    return imports[:limit]

def get_import_details(import_id: str) -> Dict[str, Any]:
    """
    Get comprehensive details for a specific import with sample data
    
    Args:
        import_id: The ID of the import
        
    Returns:
        Dictionary with import details, metadata, and sample data
    """
    # Get metadata
    metadata_key = sanitize_storage_key(f"benchmark_import_{import_id}_metadata")
    metadata = db.storage.json.get(metadata_key, default={})
    
    # Get import summary
    imports_key = sanitize_storage_key("benchmark_imports")
    imports = db.storage.json.get(imports_key, default=[])
    summary = next((imp for imp in imports if imp.get("import_id") == import_id), {})
    
    # Combine metadata and summary
    details = {**summary}
    
    # Add sample data
    data_key = sanitize_storage_key(f"benchmark_import_{import_id}_data")
    data = db.storage.json.get(data_key, default=[])
    
    return {
        "import_details": summary,
        "metadata": metadata,
        "sample_data": data[:10]  # First 10 records as a sample
    }