from fastapi import APIRouter, UploadFile, File, Query, HTTPException, Form, Request # Added Request
from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import pandas as pd
import io
import json
import databutton as db
import uuid
import re
from datetime import datetime
from pathlib import Path
import pytz # Added for timezone handling
from app.auth import AuthorizedUser
from app.apis.utils import log_audit_event # Correct import

router = APIRouter(prefix="/financial-import")


def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Remove potentially harmful characters, keep structure
    key = key.replace('..', '') # Avoid directory traversal
    key = re.sub(r'[^a-zA-Z0-9._-]', '_', key) # Replace disallowed chars with underscore
    return key


class FinancialDataType(str, Enum):
    TRIAL_BALANCE = "trial_balance"
    PROFIT_LOSS = "profit_loss"
    BALANCE_SHEET = "balance_sheet"


class UploadResponse(BaseModel):
    upload_id: str
    file_name: str
    data_type: FinancialDataType
    columns: List[str]
    preview_rows: List[Dict]
    row_count: int


class ColumnMapping(BaseModel):
    source_column: str
    target_field: Optional[str] = None  # For financial data
    user_metric_name: Optional[str] = None # For non-financial data


class ImportMappingRequest(BaseModel):
    upload_id: str
    data_type: str # Changed from FinancialDataType enum to string to accept 'non-financial'
    date: str  # ISO format date
    organization_id: str
    business_entity_id: str
    mappings: List[ColumnMapping] # Uses the updated ColumnMapping
    date_format: Optional[str] = None


class ImportResponse(BaseModel):
    success: bool
    message: str
    import_id: Optional[str] = None
    item_count: Optional[int] = None


@router.post("/upload-legacy", response_model=UploadResponse)
async def upload_financial_data_legacy(
    file: UploadFile,
    data_type: str # Changed from FinancialDataType enum to string
):
    """Upload a CSV file containing financial data for preview and column mapping"""
    if file.content_type not in ["text/csv", "application/vnd.ms-excel"]:
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        # Read CSV file content
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Generate a unique ID for this upload
        upload_id = f"upload_{uuid.uuid4().hex}"

        # Save the dataframe temporarily
        db.storage.dataframes.put(sanitize_storage_key(upload_id), df)

        # Get preview data
        preview_rows = df.head(5).to_dict(orient="records")
        columns = df.columns.tolist()

        return UploadResponse(
            upload_id=upload_id,
            file_name=file.filename,
            data_type=data_type,
            columns=columns,
            preview_rows=preview_rows,
            row_count=len(df)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/process", response_model=ImportResponse)
def process_financial_data(
    payload: ImportMappingRequest,
    user: AuthorizedUser, # Added for audit logging
    request: Request # Added for audit logging
):
    """Process the uploaded financial data using the provided column mappings"""
    try:
        # Retrieve the uploaded dataframe
        df = db.storage.dataframes.get(sanitize_storage_key(request.upload_id))
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail="Uploaded data not found")

        # Apply column mappings
        mapped_data = transform_data(df, request)

        # Generate an import ID
        import_id = f"import_{uuid.uuid4().hex}"

        # Save the processed data
        save_imported_data(
            import_id=import_id,
            organization_id=request.organization_id,
            business_entity_id=request.business_entity_id, # Pass entity ID
            data_type=request.data_type,
            import_date=request.date, # Pass date
            data=mapped_data
        )

        response = ImportResponse(
            success=True,
            message="Data imported successfully",
            import_id=import_id,
            item_count=len(mapped_data)
        )

        # Audit log success
        log_details = {
            "import_id": import_id,
            "upload_id": payload.upload_id,
            "organization_id": payload.organization_id,
            "business_entity_id": payload.business_entity_id,
            "data_type": payload.data_type,
            "item_count": len(mapped_data)
        }
        log_audit_event(
            user_identifier=user.sub,
            action_type="FINANCIAL_DATA_PROCESS",
            status="SUCCESS",
            request=request,
            target_object_type="IMPORT",
            target_object_id=import_id,
            details=log_details
        )
        return response

    except HTTPException as http_err: # Catch specific HTTP exceptions from sub-functions
        print(f"HTTP error processing data: {http_err.detail}")
        # Audit log failure (HTTPException)
        log_details = {
            "upload_id": payload.upload_id,
            "organization_id": payload.organization_id,
            "business_entity_id": payload.business_entity_id,
            "data_type": payload.data_type,
            "error": f"HTTPException: {http_err.status_code} - {http_err.detail}"
        }
        log_audit_event(
            user_identifier=user.sub,
            action_type="FINANCIAL_DATA_PROCESS",
            status="FAILURE",
            request=request,
            target_object_type="IMPORT", # Even if import failed, the attempt was on an import process
            target_object_id=None, # Import ID might not be generated
            details=log_details
        )
        # Re-raise the exception so FastAPI handles it
        raise http_err
        
    except Exception as e:
        error_message = f"Error processing data: {str(e)}"
        print(error_message)
        # Audit log failure (generic Exception)
        log_details = {
            "upload_id": payload.upload_id,
            "organization_id": payload.organization_id,
            "business_entity_id": payload.business_entity_id,
            "data_type": payload.data_type,
            "error": f"Unhandled exception: {str(e)}"
        }
        log_audit_event(
            user_identifier=user.sub,
            action_type="FINANCIAL_DATA_PROCESS",
            status="FAILURE",
            request=request,
            target_object_type="IMPORT",
            target_object_id=None,
            details=log_details
        )
        return ImportResponse(
            success=False,
            message=error_message,
        )


def transform_data(df: pd.DataFrame, request: ImportMappingRequest) -> List[Dict]:
    """Transform data based on column mappings and data type"""
    # Create mapping dictionary
    mapping_dict = {m.source_column: m.target_field for m in request.mappings}

    # Rename columns based on mapping
    renamed_df = df.rename(columns=mapping_dict)

    # Keep only mapped columns
    target_fields = [m.target_field for m in request.mappings]
    filtered_df = renamed_df[target_fields]

    # Validate and transform data based on type
    if request.data_type == FinancialDataType.TRIAL_BALANCE:
        return transform_trial_balance(filtered_df)
    elif request.data_type == FinancialDataType.PROFIT_LOSS:
        return transform_profit_loss(filtered_df)
    elif request.data_type == FinancialDataType.BALANCE_SHEET:
        return transform_balance_sheet(filtered_df)
    else:
        raise ValueError(f"Unsupported data type: {request.data_type}")


def transform_trial_balance(df: pd.DataFrame) -> List[Dict]:
    """Transform trial balance data and add is_intercompany flag"""
    required_fields = ['account_code', 'account_name', 'debit', 'credit']
    for field in required_fields:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")

    # Ensure debit and credit columns are numeric
    df['debit'] = pd.to_numeric(df['debit'], errors='coerce').fillna(0)
    df['credit'] = pd.to_numeric(df['credit'], errors='coerce').fillna(0)

    # Calculate balance
    df['balance'] = df['debit'] - df['credit']
    
    # Add the intercompany flag, defaulting to False
    # TODO: Implement logic to set this flag based on account code or mapping later
    df['is_intercompany'] = False 

    # Select and return relevant columns including the new flag
    output_columns = required_fields + ['balance', 'is_intercompany']
    # Ensure only existing columns are selected to avoid errors if optional fields aren't present
    columns_to_select = [col for col in output_columns if col in df.columns]
    
    return df[columns_to_select].to_dict(orient="records")


def transform_profit_loss(df: pd.DataFrame) -> List[Dict]:
    """Transform profit and loss data"""
    required_fields = ['item_name', 'amount']
    for field in required_fields:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")

    # Ensure amount column is numeric
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)

    # Categorize items if a category column exists
    if 'category' in df.columns:
        categories = df['category'].unique()
        categorized_data = []
        for category in categories:
            category_items = df[df['category'] == category].to_dict(orient="records")
            categorized_data.extend(category_items)
        return categorized_data
    else:
        # Add a default category if none exists
        df['category'] = 'uncategorized'
        return df.to_dict(orient="records")


def transform_balance_sheet(df: pd.DataFrame) -> List[Dict]:
    """Transform balance sheet data"""
    required_fields = ['item_name', 'amount']
    for field in required_fields:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")

    # Ensure amount column is numeric
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)

    # Categorize items if a category column exists
    if 'category' in df.columns:
        categories = df['category'].unique()
        categorized_data = []
        for category in categories:
            category_items = df[df['category'] == category].to_dict(orient="records")
            categorized_data.extend(category_items)
        return categorized_data
    else:
        # Add a default category if none exists
        df['category'] = 'uncategorized'
        return df.to_dict(orient="records")


def save_imported_data(
    import_id: str, 
    organization_id: str, 
    business_entity_id: str, # Added
    data_type: FinancialDataType, 
    import_date: str, # Added
    data: List[Dict]
):
    """Save imported and processed financial data"""
    # Create storage key based on org ID, entity ID, data type and import ID
    storage_key = sanitize_storage_key(f"{organization_id}_{business_entity_id}_{data_type}_{import_id}") # Updated key format
    
    # Save as JSON in storage
    db.storage.json.put(storage_key, {
        "import_id": import_id,
        "organization_id": organization_id,
        "business_entity_id": business_entity_id, # Added field
        "data_type": data_type,
        "date": import_date, # Added import date
        "timestamp": pd.Timestamp.now().isoformat(),
        "data": data
    })


# Define the structure expected by the frontend
# This should match the FinancialImport type used in the frontend (e.g., in types.ts)
class FinancialImport(BaseModel):
    import_id: str
    file_name: str
    data_type: str
    import_date: str # Using string for ISO format datetime
    status: str
    row_count: int
    user_id: Optional[str] = None # Optional field
    organization_id: str

@router.get("/organizations/{organization_id}/imports", response_model=List[FinancialImport])
def list_imports(organization_id: str):
    """Lists import history for a given organization."""
    print(f"Listing imports for organization: {organization_id}")
    
    imports_list = []
    try:
        # List all metadata files potentially related to imports
        # We assume metadata files are stored like 'temp_uploads/{upload_id}/metadata.json'
        all_metadata_files = db.storage.json.list()
        # Filter for files that seem to be metadata files in the temp structure
        potential_metadata_keys = [
            f.name for f in all_metadata_files 
            if f.name.startswith("temp_uploads/") and f.name.endswith("/metadata.json")
        ]
        
        print(f"Found {len(potential_metadata_keys)} potential metadata files.")

        for metadata_key in potential_metadata_keys:
            try:
                metadata = db.storage.json.get(metadata_key)
                # Check if the metadata belongs to the requested organization
                if metadata.get("organization_id") == organization_id:
                    # Map metadata to the FinancialImport structure
                    # Status needs refinement - based on actual processing state later
                    # For now, use 'Uploaded' or infer from presence
                    import_record = {
                        "import_id": metadata.get("upload_id", "unknown_id"),
                        "file_name": metadata.get("original_filename", "unknown_file"),
                        "data_type": metadata.get("data_type", "unknown_type"),
                        "import_date": metadata.get("upload_timestamp", datetime.utcnow().isoformat() + "Z"),
                        "status": "Uploaded", # Placeholder status
                        "row_count": metadata.get("row_count", 0),
                        "user_id": metadata.get("user_id"), # Assuming user_id might be stored later
                        "organization_id": organization_id,
                    }
                    imports_list.append(import_record)
            except FileNotFoundError:
                print(f"Warning: Metadata file {metadata_key} listed but not found.")
            except Exception as e:
                print(f"Error reading or processing metadata file {metadata_key}: {e}")
                
    except Exception as e:
        print(f"Error listing storage files: {e}")
        # Depending on requirements, might want to raise an HTTPException here

    # Sort by date descending (most recent first)
    imports_list.sort(key=lambda x: x['import_date'], reverse=True)
    
    print(f"Returning {len(imports_list)} imports for organization {organization_id}")
    # Ensure the return type matches the Pydantic model defined/expected by the frontend (FinancialImport)
    # If FinancialImport model exists:
    # return [FinancialImport(**imp) for imp in imports_list]
    # For now, returning list of dicts matching the structure
    return imports_list


# Simplified UploadResponseData matching frontend interface
class UploadResponseData(BaseModel):
    upload_id: str
    file_name: str
    data_type: str
    columns: list[str]
    preview_rows: list[dict[str, Any]]
    row_count: int
    # organization_id: str | None = None # Keep track if needed later


@router.post("/upload-for-organization", response_model=UploadResponseData)
async def upload_organization_financial_data(
    user: AuthorizedUser, # Added for audit logging, placed first
    request: Request, # Added for audit logging
    organization_id: str = Form(...),
    data_type: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Handles file upload specifically for the DataImports page, requiring organization_id upfront.
    Saves the file temporarily and returns metadata for column mapping.
    """
    print(f"Upload received for org: {organization_id}, type: {data_type}, file: {file.filename}")
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name provided.")
        
    # Basic validation for allowed file types (e.g., CSV)
    allowed_extensions = {'.csv'}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
         raise HTTPException(status_code=400, detail=f"Invalid file type. Only {', '.join(allowed_extensions)} allowed.")
         
    # Sanitize filename (optional but recommended)
    safe_filename = sanitize_storage_key(file.filename) # Use existing sanitize function

    # Generate a unique ID for this upload session
    upload_id = f"upload_{uuid.uuid4()}"
    # Define storage key for the temporary file and its metadata
    temp_file_key = f"temp_uploads/{upload_id}/{safe_filename}"
    metadata_key = f"temp_uploads/{upload_id}/metadata.json"

    columns = []
    preview_rows = []
    row_count = 0

    try:
        # Read file content into memory (consider streaming for large files)
        content = await file.read()

        # --- Process the file based on data_type ---
        if data_type == "budget":
            print(f"Processing BUDGET file: {file.filename}")
            # For now, we just save the file and metadata for budget type.
            # Specific budget parsing/validation logic based on MYA-100 can be added later.
            # Set empty columns/preview for budget files for now.
            columns = []
            preview_rows = []
            row_count = 0 # Or potentially try a simple line count? Let's keep 0 for now.
            # Consider saving budget files to a different storage path if needed:
            # temp_file_key = f"temp_budget_uploads/{upload_id}/{safe_filename}"
            # metadata_key = f"temp_budget_uploads/{upload_id}/metadata.json"
            # db.storage.binary.put(temp_file_key, content) 
            # --> Sticking to the same temp path for now for simplicity.
            db.storage.binary.put(temp_file_key, content)
            print(f"Temporary BUDGET file saved to: {temp_file_key}")

        elif data_type == "trial_balance":
            print(f"Processing TRIAL_BALANCE file: {file.filename}")
            db.storage.binary.put(temp_file_key, content) # Save the raw file first
            print(f"Temporary TRIAL_BALANCE file saved to: {temp_file_key}")
            try:
                # Use BytesIO to treat the byte content as a file for pandas
                file_like_object = io.BytesIO(content)
                # Attempt to read CSV, be robust to encoding issues
                try:
                    df = pd.read_csv(file_like_object)
                except UnicodeDecodeError:
                    # Try common alternative encoding
                    file_like_object.seek(0) # Reset stream position
                    df = pd.read_csv(file_like_object, encoding='latin1')
                
                # Limit preview rows for performance
                preview_limit = 5 
                preview_df = df.head(preview_limit)

                columns = df.columns.tolist()
                # Convert preview rows to dict format, handle potential NaN/NaT values
                preview_rows = preview_df.fillna('').to_dict('records') 
                row_count = len(df)
                print(f"CSV processed: {row_count} rows, {len(columns)} columns. Preview generated.")

            except pd.errors.EmptyDataError:
                print("Warning: Uploaded CSV file is empty.")
                # Handle empty file case: return empty columns/rows
                columns = []
                preview_rows = []
                row_count = 0
            except Exception as e:
                print(f"Error processing CSV file: {e}")
                # If file processing fails critically (e.g., not a CSV), raise HTTP error
                raise HTTPException(status_code=400, detail=f"Could not process file. Ensure it's a valid CSV. Error: {e}")
        else:
             # Handle unknown data types
             print(f"Warning: Unknown data_type received: {data_type}")
             # For now, treat as generic file - save it but maybe raise warning/error?
             # Let's raise an error for unsupported types for now.
             raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}. Supported types: trial_balance, budget.")

        # --- Save metadata (including org_id and data_type) ---
        metadata = {
            "upload_id": upload_id,
            "original_filename": file.filename,
            "safe_filename": safe_filename,
            "temp_file_key": temp_file_key,
            "data_type": data_type,
            "organization_id": organization_id, # Store the org ID
            "columns": columns,
            "row_count": row_count,
            "upload_timestamp": datetime.utcnow().isoformat() + "Z",
        }
        db.storage.json.put(metadata_key, metadata)
        print(f"Upload metadata saved to: {metadata_key}")


        # --- Prepare response ---
        response_data = UploadResponseData(
            upload_id=upload_id,
            file_name=file.filename,
            data_type=data_type,
            columns=columns,
            preview_rows=preview_rows,
            row_count=row_count,
            # organization_id=organization_id # Include if frontend type expects it
        )
        # Audit successful upload
        log_details = {
            "organization_id": organization_id,
            "upload_id": upload_id,
            "filename": file.filename,
            "data_type": data_type,
            "row_count": row_count,
            "columns": columns,
            "metadata_key": metadata_key
        }
        log_audit_event(
            user_identifier=user.sub,
            action_type="ORG_FINANCIAL_DATA_UPLOAD",
            status="SUCCESS",
            request=request,
            target_object_type="UPLOAD",
            target_object_id=upload_id,
            details=log_details
        )
        return response_data

    except HTTPException as http_err: # Catch HTTPExceptions specifically to log details
        print(f"HTTP error during upload for org {organization_id}: {http_err.detail}")
        # Audit failed upload (HTTPException)
        log_details = {
            "organization_id": organization_id,
            "filename": file.filename,
            "data_type": data_type,
            "error": f"HTTPException: {http_err.status_code} - {http_err.detail}"
        }
        log_audit_event(
            user_identifier=user.sub,
            action_type="ORG_FINANCIAL_DATA_UPLOAD",
            status="FAILURE",
            request=request,
            target_object_type="UPLOAD",
            target_object_id=upload_id if 'upload_id' in locals() else None, # ID might not be generated
            details=log_details
        )
        raise http_err # Re-raise the original exception
        
    except Exception as e:
        # Catch any broader errors during upload/processing
        error_message = f"Internal server error during file upload processing: {e}"
        print(f"Unhandled error during upload for org {organization_id}: {e}")
        # Clean up any partially saved data if possible (optional)
        # db.storage.binary.delete(temp_file_key)
        # db.storage.json.delete(metadata_key)
        
        # Audit failed upload (generic Exception)
        log_details = {
            "organization_id": organization_id,
            "filename": file.filename,
            "data_type": data_type,
            "error": f"Unhandled exception: {str(e)}"
        }
        log_audit_event(
            user_identifier=user.sub,
            action_type="ORG_FINANCIAL_DATA_UPLOAD",
            status="FAILURE",
            request=request,
            target_object_type="UPLOAD",
            target_object_id=upload_id if 'upload_id' in locals() else None,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_message) from e


@router.post("/upload", response_model=UploadResponseData)
async def upload_financial_data(
    user: AuthorizedUser, # Moved before parameters with defaults
    request: Request, # Add Request dependency
    data_type: str = Query(...),
    file: UploadFile = File(...)
):
    """
    Handles the initial file upload for the wizard.
    Saves the file temporarily and returns metadata for column mapping.
    Does NOT require organization_id at this stage.
    """
    # TODO: Refactor to share logic with upload_organization_financial_data
    # This endpoint is kept for the existing FileImportWizard component compatibility
    print(f"Upload received for wizard, type: {data_type}, file: {file.filename}")
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name provided.")
        
    allowed_extensions = {'.csv'}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
         raise HTTPException(status_code=400, detail=f"Invalid file type. Only {', '.join(allowed_extensions)} allowed.")
         
    safe_filename = sanitize_storage_key(file.filename)
    upload_id = f"upload_{uuid.uuid4()}"
    temp_file_key = f"temp_uploads/{upload_id}/{safe_filename}"
    metadata_key = f"temp_uploads/{upload_id}/metadata.json"
    
    log_details = {
        "filename": file.filename,
        "content_type": file.content_type,
        "data_type": data_type,
        "upload_id": upload_id
    }

    try:
        content = await file.read()
        db.storage.binary.put(temp_file_key, content)
        print(f"Temporary file saved to: {temp_file_key}")

        # Process CSV
        try:
            file_like_object = io.BytesIO(content)
            try:
                df = pd.read_csv(file_like_object)
            except UnicodeDecodeError:
                 file_like_object.seek(0)
                 df = pd.read_csv(file_like_object, encoding='latin1')
            
            preview_limit = 5 
            preview_df = df.head(preview_limit)
            columns = df.columns.tolist()
            preview_rows = preview_df.fillna('').to_dict('records') 
            row_count = len(df)
            print(f"CSV processed: {row_count} rows, {len(columns)} columns. Preview generated.")
            csv_processing_error = None
        except pd.errors.EmptyDataError:
            print("Warning: Uploaded CSV file is empty.")
            columns = []
            preview_rows = []
            row_count = 0
            csv_processing_error = "Empty CSV file"
        except Exception as csv_err:
            csv_processing_error = f"CSV processing error: {str(csv_err)}"
            print(f"Error processing CSV file: {csv_err}")
            # Log failure immediately if CSV processing fails
            log_details["error"] = csv_processing_error
            log_audit_event(
                user_identifier=user.sub, 
                action_type="FINANCIAL_DATA_UPLOAD",
                status="FAILURE",
                request=request,
                target_object_type="UPLOAD",
                target_object_id=upload_id,
                details=log_details
            )
            raise HTTPException(status_code=400, detail=f"Could not process file. Ensure it's a valid CSV. Error: {csv_err}") from csv_err

        # Save metadata only if CSV processing didn't raise an exception
        metadata = {
            "upload_id": upload_id,
            "original_filename": file.filename,
            "safe_filename": safe_filename,
            "temp_file_key": temp_file_key,
            "data_type": data_type,
            "organization_id": None, # Explicitly null for wizard uploads initially
            "columns": columns,
            "row_count": row_count,
            "upload_timestamp": datetime.utcnow().replace(tzinfo=pytz.utc).isoformat(),
            "csv_processing_error": csv_processing_error # Store potential non-fatal processing issues
        }
        db.storage.json.put(metadata_key, metadata)
        print(f"Upload metadata saved to: {metadata_key}")

        response_data = UploadResponseData(
            upload_id=upload_id,
            file_name=file.filename,
            data_type=data_type,
            columns=columns,
            preview_rows=preview_rows,
            row_count=row_count,
        )
        
        # Log successful upload event
        log_details.update({
            "row_count": row_count,
            "columns_detected": len(columns),
            "metadata_key": metadata_key
        })
        log_audit_event(
            user_identifier=user.sub,
            action_type="FINANCIAL_DATA_UPLOAD",
            status="SUCCESS",
            request=request,
            target_object_type="UPLOAD",
            target_object_id=upload_id,
            details=log_details
        )
        return response_data

    except HTTPException as http_exc:
        # Log specific validation errors (e.g., bad file type checked before try block)
        # This might catch errors from the initial checks if they are moved inside the try later
        log_details["error"] = f"HTTP Error: {http_exc.status_code} - {http_exc.detail}"
        log_audit_event(
            user_identifier=user.sub,
            action_type="FINANCIAL_DATA_UPLOAD",
            status="FAILURE",
            request=request,
            target_object_type="UPLOAD",
            target_object_id=upload_id, # ID was generated
            details=log_details
        )
        raise http_exc # Re-raise the original exception

    except Exception as e:
        # Log general processing errors (e.g., failure to save to storage)
        error_message = f"Internal server error during file upload processing: {e}"
        print(f"Unhandled error during wizard upload: {e}")
        log_details["error"] = f"Unhandled exception: {str(e)}"
        log_audit_event(
            user_identifier=user.sub, 
            action_type="FINANCIAL_DATA_UPLOAD",
            status="FAILURE",
            request=request,
            target_object_type="UPLOAD",
            target_object_id=upload_id,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_message) from e
        raise HTTPException(status_code=500, detail=f"Internal server error during file upload processing: {e}")



def list_imports(organization_id: str):
    """List all imports for an organization"""
    # List all files in storage
    all_files = db.storage.json.list()
    
    # Filter for files that match the organization
    org_imports = []
    for file in all_files:
        if file.name.startswith(sanitize_storage_key(organization_id)):
            org_imports.append(file.name)
    
    return org_imports


@router.get("/imports/{import_id}")
def get_import(import_id: str):
    """Get imported data by import ID"""
    # List all files in storage
    all_files = db.storage.json.list()
    
    # Find the file containing this import ID
    import_file = None
    for file in all_files:
        if import_id in file.name:
            import_file = file.name
            break
    
    if not import_file:
        raise HTTPException(status_code=404, detail="Import not found")
    
    # Return the imported data
    return db.storage.json.get(import_file)
