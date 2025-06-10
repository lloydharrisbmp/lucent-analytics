import databutton as db
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from pydantic import BaseModel, Field, AnyUrl
from typing import List, Dict, Any, Optional

# Import shared models
from app.apis.models import WidgetConfig, WidgetConfiguration

# Import the new function and models from cash_flow api
from app.apis.cash_flow import generate_enhanced_waterfall_data, ChartDataItemModel

# Assuming WidgetConfiguration is defined somewhere accessible, possibly generated from OpenAPI/types
# If not, define a basic Pydantic model for it here for type hinting
# Define a flexible WidgetConfig that can hold various settings
# We use Dict[str, Any] for maximum flexibility, but specific models per widget type
# could be defined for stricter validation if needed later.
# Example fields shown, adjust based on actual widget needs.
# Removed local WidgetConfig definition

# Removed local WidgetConfiguration definition

# Define a response model for fetch_widget_data
class FetchWidgetDataResponse(BaseModel):
    data: Any # Can be list of ChartDataItemModel or other types
from datetime import datetime, timezone
from app.auth import AuthorizedUser # Re-added

router = APIRouter(prefix="/widget-data", tags=["Widget Data"])

# Response model removed for debugging

# --- Endpoint ---

@router.post("/fetch", response_model=FetchWidgetDataResponse)
async def fetch_widget_data(
    widget_config: WidgetConfiguration, # Uses imported WidgetConfiguration
    user: AuthorizedUser, # Ensure user is authorized
    background_tasks: BackgroundTasks
):
    """
    SIMPLIFIED FOR DEBUGGING
    Fetches and processes data for a given widget configuration.
    Currently supports 'reportApi' sourceType.
    """
    from datetime import datetime, timezone

    print(f"User {user.sub} requested widget data for type: {widget_config.type}")

    data_to_return: Any = None

    if widget_config.type == 'enhancedCashFlowWaterfall':
        if widget_config.config is None:
             raise HTTPException(status_code=400, detail="Widget config is required for enhancedCashFlowWaterfall")
        # Pass the actual WidgetConfig object (uses imported WidgetConfig)
        data_to_return = generate_enhanced_waterfall_data(config=widget_config.config)

    # elif widget_config.type == 'kpiCard':
        # TODO: Add logic for KPI cards based on widget_config.config
        # data_to_return = fetch_kpi_data(widget_config.config)
        # pass # Placeholder

    # elif widget_config.type == 'lineChart':
        # TODO: Add logic for Line charts
        # data_to_return = fetch_line_chart_data(widget_config.config)
        # pass # Placeholder
        
    # elif widget_config.type == 'barChart':
        # TODO: Add logic for Bar charts
        # data_to_return = fetch_bar_chart_data(widget_config.config)
        # pass # Placeholder
        
    else:
        # Handle unsupported or default types
        # For now, return a simple message or default data
        print(f"Unsupported widget type: {widget_config.type}")
        # Returning sample data for debugging unknown types for now
        data_to_return = {
            "message": f"Data fetching not yet implemented for widget type: {widget_config.type}",
            "config_received": widget_config.dict(by_alias=True)
        }
        # raise HTTPException(status_code=400, detail=f"Unsupported widget type: {widget_config.type}")


    if data_to_return is None:
         raise HTTPException(status_code=404, detail=f"Could not generate data for widget type {widget_config.type}")
         
    # Ensure the data is returned in the expected structure
    return FetchWidgetDataResponse(data=data_to_return)
    # from datetime import datetime, timezone

    # source_type = widget_config.dataSource.sourceType
    # requested_at = datetime.now(timezone.utc).isoformat()
    # processed_data: Any = None

    # print(f"Fetching data for widget {widget_config.id} using sourceType: {source_type}")

    # if source_type == 'reportApi':
    #     report_id = widget_config.dataSource.reportId
    #     if not report_id:
    #         raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST,
    #             detail="reportId is required for sourceType 'reportApi'"
    #         )
        
    #     # Assuming generate_report needs a specific request structure
    #     # Adapt this based on the actual generate_report signature and needs
    #     report_request = GenerateReportRequest(
    #         report_definition_id=report_id,
    #         # Pass any relevant parameters from widget_config.dataSource.parameters
    #         parameters=widget_config.dataSource.parameters or {} 
    #     )
        
    #     try:
    #         print(f"Calling generate_report for report definition ID: {report_id}")
    #         # IMPORTANT: generate_report might need different parameters or structure
    #         report_response: ReportEngineResponse = await generate_report(request=report_request, user=user)
            
    #         # Process the report_response based on widget needs (e.g., extract specific metric)
    #         # This is a placeholder - needs refinement based on widget types
    #         processed_data = report_response.data 
            
    #         # Example: If widget needs a single metric
    #         metric_key = widget_config.dataSource.metric
    #         if metric_key and isinstance(processed_data, list) and processed_data:
    #              # Attempt to find the metric in the report data structure
    #              # This assumes a simple key-value structure in the report data, which might not be true
    #              # Needs careful adaptation based on actual report structure
    #              found_metric = None
    #              for row in processed_data:
    #                  if isinstance(row, dict) and metric_key in row:
    #                      found_metric = row[metric_key]
    #                      break
    #              if found_metric is not None:
    #                   processed_data = {"value": found_metric}
    #              else:
    #                   print(f"Warning: Metric '{metric_key}' not found directly in report data for widget {widget_config.id}")
    #                   # Keep full data or handle error? Keeping full data for now.
                 

    #     except HTTPException as he:
    #          print(f"HTTPException from generate_report for widget {widget_config.id}: {he.detail}")
    #          raise he # Re-raise the exception
    #     except Exception as e:
    #         print(f"Error calling generate_report for widget {widget_config.id}: {e}")
    #         raise HTTPException(
    #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Failed to generate report data from source: {e}"
    #         )

    # # elif source_type == 'directQuery':
    # #     # Implementation for direct database queries (e.g., Firestore)
    # #     raise HTTPException(status_code=501, detail="sourceType 'directQuery' not yet implemented")
    # # elif source_type == 'static':
    # #      # Implementation for static data defined in config
    # #      processed_data = widget_config.dataSource.parameters.get('value') # Example
    # #      if processed_data is None:
    # #            raise HTTPException(status_code=400, detail="Missing 'value' in parameters for static data")
    
    # else:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail=f"Unsupported sourceType: {source_type}"
    #     )

    # if processed_data is None:
    #      # Should ideally not happen if logic is correct, but as a safeguard
    #      raise HTTPException(status_code=500, detail="Failed to process data for the widget")


    # return WidgetDataResponse(
    #     widgetId=widget_config.id,
    #     data=processed_data,
    #     sourceType=source_type,
    #     requestedAt=requested_at
    # )
