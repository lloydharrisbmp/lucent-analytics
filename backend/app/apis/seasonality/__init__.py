from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal, Union, Any
from enum import Enum

router = APIRouter()

class SeasonType(str, Enum):
    SUMMER = "Summer"
    AUTUMN = "Autumn"
    WINTER = "Winter"
    SPRING = "Spring"

class ImpactLevel(str, Enum):
    VERY_LOW = "Very Low"
    LOW = "Low"
    LOW_MODERATE = "Low-Moderate"
    MODERATE = "Moderate"
    MODERATE_HIGH = "Moderate-High"
    HIGH = "High"
    VERY_HIGH = "Very High"
    VARIABLE = "Variable"
    
class SeasonalFactors(BaseModel):
    cashReceiptsAdjustment: float = Field(..., description="Percentage adjustment for cash receipts during this season")
    cashDisbursementsAdjustment: float = Field(..., description="Percentage adjustment for cash disbursements during this season")

class SeasonalPattern(BaseModel):
    season: str
    impact: str
    description: str
    seasonalFactors: Optional[SeasonalFactors] = None

class CashFlowImpact(BaseModel):
    type: Literal["receipt", "disbursement", "both"]
    estimatedAmount: Optional[float] = None
    relativeImpact: str

class KeyDate(BaseModel):
    date: str
    event: str
    description: str
    cashFlowImpact: Optional[CashFlowImpact] = None

class SeasonalAdjustments(BaseModel):
    Summer: Optional[float] = None
    Autumn: Optional[float] = None
    Winter: Optional[float] = None
    Spring: Optional[float] = None

class RegionalVariation(BaseModel):
    region: str
    description: str
    seasonalAdjustments: Optional[SeasonalAdjustments] = None

class SeasonalityResponse(BaseModel):
    industry: str
    patterns: List[Union[SeasonalPattern, Dict[str, Any]]]
    key_dates: List[Union[KeyDate, Dict[str, Any]]]
    eofy_impact: str
    regional_variations: List[Union[RegionalVariation, Dict[str, Any]]]

@router.get("/seasonality/{industry}")
def get_industry_seasonality(industry: str) -> SeasonalityResponse:
    """Get seasonality patterns for a specific Australian industry"""
    
    # Map of industry seasonality patterns
    seasonality_data = {
        "retail": {
            "industry": "Retail",
            "patterns": [
                {"season": "Summer (Dec-Feb)", "impact": "High", "description": "Christmas shopping period followed by post-Christmas sales. Boxing Day (Dec 26) is traditionally the biggest sales day of the year. January also sees back-to-school shopping surge."},
                {"season": "Autumn (Mar-May)", "impact": "Moderate", "description": "Easter shopping period, Mother's Day (May) generates significant sales for gifts, flowers, and dining."},
                {"season": "Winter (Jun-Aug)", "impact": "Moderate-High", "description": "EOFY sales period in June is major shopping event. July sees mid-year sales and winter clothing demand."},
                {"season": "Spring (Sep-Nov)", "impact": "Moderate", "description": "Father's Day (September) creates targeted sales. Black Friday/Cyber Monday (Nov) increasingly important sales period."}
            ],
            "key_dates": [
                {"date": "December 26", "event": "Boxing Day", "description": "Largest shopping day of the year"},
                {"date": "Mid-June to June 30", "event": "EOFY Sales", "description": "Major sales period as retailers clear stock before financial year end"},
                {"date": "Late November", "event": "Black Friday/Cyber Monday", "description": "Growing sales period adopted from US retail calendar"}
            ],
            "eofy_impact": "Major sales period as businesses clear inventory to reduce tax liability. Followed by generally slower early July period as new financial year begins.",
            "regional_variations": [
                {"region": "Northern Australia", "description": "Tropical climate affects seasonality differently; wet season (Nov-Apr) can reduce foot traffic"},
                {"region": "Tourist areas", "description": "Coastal regions see peaks during school holiday periods, especially summer and Easter"}
            ]
        },
        
        "hospitality": {
            "industry": "Hospitality",
            "patterns": [
                {"season": "Summer (Dec-Feb)", "impact": "Very High", "description": "Peak tourism and holiday season. Christmas/New Year period sees high restaurant bookings and events. School holidays drive domestic tourism."},
                {"season": "Autumn (Mar-May)", "impact": "Moderate", "description": "Easter period creates long weekend surge. Labor Day, Anzac Day, and school holidays create pockets of high demand."},
                {"season": "Winter (Jun-Aug)", "impact": "Variable", "description": "Ski destinations experience peak season. June long weekend and school holidays boost domestic travel. EOFY business entertainment spending increases in June."},
                {"season": "Spring (Sep-Nov)", "impact": "Moderate-High", "description": "Spring racing carnival boosts hospitality in Melbourne. School holidays in September/October increase domestic tourism."}
            ],
            "key_dates": [
                {"date": "December 25-January 1", "event": "Christmas/New Year Period", "description": "Extremely high demand for accommodation and dining"},
                {"date": "Easter Long Weekend", "event": "Easter", "description": "Major travel period with high accommodation demand"},
                {"date": "School Holiday Periods", "event": "Various", "description": "Significant domestic tourism drivers (varies by state)"}
            ],
            "eofy_impact": "Increased corporate entertaining and events as businesses use remaining budgets. Often followed by slower early July period as new budgets are established.",
            "regional_variations": [
                {"region": "Queensland/Northern NSW", "description": "Winter is high season for southern visitors escaping cold"},
                {"region": "Alpine regions", "description": "Winter is peak season in ski destinations like Thredbo, Falls Creek, etc."},
                {"region": "Capital cities", "description": "Business travel drives weekday demand, leisure on weekends"}
            ]
        },
        
        "agriculture": {
            "industry": "Agriculture",
            "patterns": [
                {"season": "Summer (Dec-Feb)", "impact": "High", "description": "Harvest season for many crops. High water requirements and potential heat stress issues. Summer fruit harvesting creates seasonal labor demand."},
                {"season": "Autumn (Mar-May)", "impact": "Moderate-High", "description": "Key planting period for winter crops. Grape harvest for wine industry. Processing and shipping of summer harvests."},
                {"season": "Winter (Jun-Aug)", "impact": "Low-Moderate", "description": "Reduced growth in many sectors. Winter crop maintenance. Livestock feeding costs typically higher. EOFY tax planning crucial."},
                {"season": "Spring (Sep-Nov)", "impact": "High", "description": "Critical growing period for many crops. Lambing and calving season. Preparation for summer harvests."}
            ],
            "key_dates": [
                {"date": "Varies by region/crop", "event": "Planting windows", "description": "Critical timing for crop establishment"},
                {"date": "Varies by region/crop", "event": "Harvest periods", "description": "Intensive cash flow and labor requirements"},
                {"date": "June 30", "event": "EOFY", "description": "Critical for tax planning, farm management deposits, equipment purchases"}
            ],
            "eofy_impact": "Major planning period for agricultural businesses. Farm Management Deposits (FMDs) widely used before June 30 to manage income variability. Equipment purchases often timed for tax advantages.",
            "regional_variations": [
                {"region": "Northern Australia", "description": "Wet/dry tropical seasons rather than four seasons affect planting and harvesting"},
                {"region": "Southern Australia", "description": "Mediterranean climate with winter rainfall patterns"},
                {"region": "Central/Western regions", "description": "Dryland farming highly dependent on seasonal rainfall patterns"}
            ]
        },
        
        "construction": {
            "industry": "Construction",
            "patterns": [
                {"season": "Summer (Dec-Feb)", "impact": "Moderate", "description": "Heat can affect work hours and productivity. Industry-wide slowdown over Christmas/New Year period. Residential projects often aim for completion before Christmas."},
                {"season": "Autumn (Mar-May)", "impact": "High", "description": "Peak period for construction with ideal working conditions. March-May typically sees high activity before winter weather."},
                {"season": "Winter (Jun-Aug)", "impact": "Moderate", "description": "Weather delays more common. EOFY spending on equipment. Shift to more internal work where possible."},
                {"season": "Spring (Sep-Nov)", "impact": "Very High", "description": "Major ramp-up period. September-November often the busiest construction period with favorable weather and push to complete before Christmas."}
            ],
            "key_dates": [
                {"date": "December 15-January 15 (approx)", "event": "Christmas shutdown", "description": "Industry-wide slowdown or shutdown period"},
                {"date": "June", "event": "EOFY", "description": "Equipment purchases and budget finalization"},
                {"date": "Varies by state", "event": "Building industry RDOs", "description": "Rostered days off affect project scheduling"}
            ],
            "eofy_impact": "Major spending on equipment and materials to maximize tax deductions. Project cash flow often structured around June 30 for both builders and clients. New financial year can see project delays as new budgets are confirmed.",
            "regional_variations": [
                {"region": "Northern Australia", "description": "Wet season (Nov-Apr) significantly affects construction scheduling"},
                {"region": "Southern states", "description": "Winter weather more likely to cause delays in Victoria/Tasmania"},
                {"region": "Mining regions", "description": "Construction may follow resource company budget cycles"}
            ]
        },
        
        "professional_services": {
            "industry": "Professional Services",
            "patterns": [
                {"season": "Summer (Dec-Feb)", "impact": "Low", "description": "December busy with year-end client work. Significant slowdown between Christmas and Australia Day (Jan 26). February sees business activity resume fully."},
                {"season": "Autumn (Mar-May)", "impact": "High", "description": "Full business operations resume. Q1 reporting period for calendar year businesses."},
                {"season": "Winter (Jun-Aug)", "impact": "Very High", "description": "June extremely busy with EOFY work, especially for accounting and financial services. July/August involved with tax returns and EOFY reporting."},
                {"season": "Spring (Sep-Nov)", "impact": "Moderate-High", "description": "October is deadline for personal income tax returns with agents. Business planning for following calendar year."}
            ],
            "key_dates": [
                {"date": "June 30", "event": "EOFY", "description": "Peak period for financial services and accounting firms"},
                {"date": "October 31", "event": "Tax return deadline", "description": "For returns filed through registered agents"},
                {"date": "December", "event": "Calendar year-end", "description": "Busy period for international companies using calendar financial year"}
            ],
            "eofy_impact": "Extremely high workload for accounting, financial advisory, and legal services. Cash flow typically strong in May-July period due to EOFY work. August can see temporary slowdown as EOFY rush subsides.",
            "regional_variations": [
                {"region": "Major CBDs", "description": "Highly affected by business district activity patterns"},
                {"region": "Tourist areas", "description": "Local service providers may follow tourism seasonality"},
                {"region": "Rural areas", "description": "May align more with agricultural and regional economic cycles"}
            ]
        },
        
        "tourism": {
            "industry": "Tourism",
            "patterns": [
                {"season": "Summer (Dec-Feb)", "impact": "Very High", "description": "Peak domestic tourism season nationwide. School holidays drive family travel. International visitors peak in coastal and urban destinations."},
                {"season": "Autumn (Mar-May)", "impact": "Moderate", "description": "Easter period creates major travel spike. Shoulder season with moderate international visitors. Pleasant weather attracts travelers to northern destinations."},
                {"season": "Winter (Jun-Aug)", "impact": "Variable", "description": "Snow destinations experience peak season. Tropical north sees high international tourism. School holidays drive domestic travel. Business travel remains strong in cities."},
                {"season": "Spring (Sep-Nov)", "impact": "Moderate-High", "description": "September school holidays drive family travel. October-November sees increasing visitor numbers as weather improves. Events like Melbourne Cup drive specific regional tourism."}
            ],
            "key_dates": [
                {"date": "December-January", "event": "Summer holidays", "description": "Peak tourism period nationwide"},
                {"date": "Easter period", "event": "Easter", "description": "Major travel spike across all destinations"},
                {"date": "School holiday periods", "event": "Various", "description": "Critical for family-focused destinations (varies by state)"}
            ],
            "eofy_impact": "June can see increased business travel as companies use remaining travel budgets. Tourism operators often make major purchases in June for tax purposes. July school holidays drive strong domestic tourism despite being start of financial year.",
            "regional_variations": [
                {"region": "North Queensland/NT", "description": "Peak season is winter (dry season) when southern states are cold"},
                {"region": "Alpine regions", "description": "Winter is peak season for snow tourism"},
                {"region": "Major cities", "description": "More consistent year-round tourism with business travel supplementing leisure visits"}
            ]
        },
        
        "default": {
            "industry": "General Australian Business",
            "patterns": [
                {"season": "Summer (Dec-Feb)", "impact": "Variable", "description": "December busy leading up to Christmas. Significant slowdown from mid-December to late January. Many businesses operate with skeleton staff during this period."},
                {"season": "Autumn (Mar-May)", "impact": "High", "description": "Full business operations resume. Easter creates a brief slowdown. May sees increased activity as EOFY approaches."},
                {"season": "Winter (Jun-Aug)", "impact": "Variable", "description": "June extremely busy with EOFY activities across all sectors. July often slower as new financial year begins. August sees business activity normalize."},
                {"season": "Spring (Sep-Nov)", "impact": "High", "description": "Peak business period with few public holidays. Strong trading period before Christmas season begins."}
            ],
            "key_dates": [
                {"date": "December 25-January 26", "event": "Christmas to Australia Day", "description": "Extended period of reduced business activity"},
                {"date": "June 30", "event": "EOFY", "description": "Critical financial and tax deadline for all Australian businesses"},
                {"date": "October-November", "event": "Pre-Christmas", "description": "Planning and stock-up period before holiday season"}
            ],
            "eofy_impact": "June quarter often sees increased business spending to utilize budgets and maximize tax deductions. Cash flow planning critical around EOFY. Many businesses defer expenses to July for new financial year budgets, creating potential short-term cash flow constraints.",
            "regional_variations": [
                {"region": "Northern Australia", "description": "Wet season (Nov-Apr) impacts outdoor businesses and supply chains"},
                {"region": "Tourist areas", "description": "Local economies highly synchronized with tourism patterns"},
                {"region": "Agricultural regions", "description": "Local businesses often follow agricultural seasonality"}
            ]
        }
    }
    
        # Get the base data for the requested industry or default if not found
    industry_data = seasonality_data.get(industry.lower(), seasonality_data["default"])
    
    # Enhance the patterns with seasonal factors for cash flow analysis
    for pattern in industry_data["patterns"]:
        # Add seasonal factors based on impact level
        if "seasonalFactors" not in pattern:
            impact = pattern["impact"]
            if impact == "Very High":
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.25, "cashDisbursementsAdjustment": 0.15}
            elif impact == "High":
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.15, "cashDisbursementsAdjustment": 0.10}
            elif impact == "Moderate-High":
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.10, "cashDisbursementsAdjustment": 0.05}
            elif impact == "Moderate":
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.05, "cashDisbursementsAdjustment": 0.03}
            elif impact == "Low-Moderate":
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.03, "cashDisbursementsAdjustment": 0.02}
            elif impact == "Low":
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.02, "cashDisbursementsAdjustment": 0.01}
            elif impact == "Very Low":
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.01, "cashDisbursementsAdjustment": 0.005}
            else:  # Variable
                pattern["seasonalFactors"] = {"cashReceiptsAdjustment": 0.05, "cashDisbursementsAdjustment": 0.05}
    
    # Enhance key dates with cash flow impact information
    for key_date in industry_data["key_dates"]:
        if "cashFlowImpact" not in key_date:
            # EOFY typically involves disbursements
            if "EOFY" in key_date["event"]:
                key_date["cashFlowImpact"] = {
                    "type": "disbursement",
                    "relativeImpact": "High"
                }
            # Holiday/sales periods typically involve receipts
            elif any(term in key_date["event"] for term in ["Christmas", "Boxing Day", "sales", "holiday"]):
                key_date["cashFlowImpact"] = {
                    "type": "receipt",
                    "relativeImpact": "High"
                }
            # Tax time involves both
            elif "Tax" in key_date["event"]:
                key_date["cashFlowImpact"] = {
                    "type": "both",
                    "relativeImpact": "Moderate-High"
                }
            else:
                key_date["cashFlowImpact"] = {
                    "type": "both",
                    "relativeImpact": "Moderate"
                }
    
    # Add seasonal adjustments to regional variations
    for variation in industry_data["regional_variations"]:
        if "seasonalAdjustments" not in variation:
            if "Northern" in variation["region"]:
                variation["seasonalAdjustments"] = {
                    "Summer": 0.15,  # Wet season impact
                    "Winter": -0.10   # Dry season benefit
                }
            elif "Tourist" in variation["region"] or "tourism" in variation["description"].lower():
                variation["seasonalAdjustments"] = {
                    "Summer": 0.20,   # Peak tourism
                    "Winter": -0.15    # Off-season
                }
            elif "Southern" in variation["region"]:
                variation["seasonalAdjustments"] = {
                    "Winter": 0.10,    # Cold weather impact
                    "Spring": -0.05     # Recovery
                }
    
    # Return the enhanced data
    return SeasonalityResponse(**industry_data)
