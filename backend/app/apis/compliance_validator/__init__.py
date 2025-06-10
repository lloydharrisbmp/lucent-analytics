from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta
import re

router = APIRouter(prefix="/compliance-validator")

# Models for request and response
class BusinessEntityValidationRequest(BaseModel):
    entity_id: str
    abn: str
    tfn: Optional[str] = None
    business_structure: str
    gst_registered: bool
    gst_frequency: Optional[str] = None
    financial_year_end: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None

class TaxObligationValidationRequest(BaseModel):
    entity_id: str
    obligations: List[Dict[str, Any]]
    financial_data: Optional[Dict[str, Any]] = None
    additional_data: Optional[Dict[str, Any]] = None

class ValidationIssue(BaseModel):
    severity: str = Field(..., description="error, warning, or info")
    code: str = Field(..., description="Unique code for the issue type")
    message: str
    field: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    remediation: Optional[str] = None

class ValidationResponse(BaseModel):
    valid: bool
    issues: List[ValidationIssue] = []

# ABN validation utility
def validate_abn(abn: str) -> bool:
    # Remove any non-digit characters
    abn_digits = re.sub(r'\D', '', abn)
    
    # Check if the ABN is 11 digits
    if len(abn_digits) != 11:
        return False
    
    # Apply ABN validation algorithm
    # Subtract 1 from the first digit
    weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    
    # Calculate weighted sum
    weighted_sum = 0
    for i, digit in enumerate(abn_digits):
        weight = weights[i]
        if i == 0:
            weighted_sum += (int(digit) - 1) * weight
        else:
            weighted_sum += int(digit) * weight
    
    # Valid ABN should be divisible by 89
    return weighted_sum % 89 == 0

# TFN validation utility
def validate_tfn(tfn: str) -> bool:
    # Remove any non-digit characters
    tfn_digits = re.sub(r'\D', '', tfn)
    
    # Check if the TFN is between 8 and 9 digits
    if len(tfn_digits) < 8 or len(tfn_digits) > 9:
        return False
    
    # Apply TFN validation algorithm (simplified)
    weights = [1, 4, 3, 7, 5, 8, 6, 9, 10]
    
    # Calculate weighted sum
    weighted_sum = 0
    for i, digit in enumerate(tfn_digits.zfill(9)):
        weighted_sum += int(digit) * weights[i]
    
    # Valid TFN should be divisible by 11
    return weighted_sum % 11 == 0

@router.post("/validate-entity")
def validate_business_entity(request: BusinessEntityValidationRequest) -> ValidationResponse:
    issues = []
    
    # 1. Validate ABN format and checksum
    if not validate_abn(request.abn):
        issues.append(ValidationIssue(
            severity="error",
            code="INVALID_ABN",
            message="The provided ABN is not valid",
            field="abn",
            remediation="Check the ABN on the Australian Business Register"
        ))
    
    # 2. Validate TFN if provided
    if request.tfn and not validate_tfn(request.tfn):
        issues.append(ValidationIssue(
            severity="error",
            code="INVALID_TFN",
            message="The provided TFN appears to be invalid",
            field="tfn",
            remediation="Check the TFN format and digits"
        ))
    
    # 3. Check GST registration consistency
    if request.gst_registered and not request.gst_frequency:
        issues.append(ValidationIssue(
            severity="error",
            code="MISSING_GST_FREQUENCY",
            message="GST frequency is required when registered for GST",
            field="gst_frequency",
            remediation="Specify whether reporting is monthly, quarterly, or annually"
        ))
    
    # 4. Validate business structure
    valid_structures = ["company", "trust", "partnership", "soleTrader"]
    if request.business_structure not in valid_structures:
        issues.append(ValidationIssue(
            severity="error",
            code="INVALID_BUSINESS_STRUCTURE",
            message=f"Business structure must be one of: {', '.join(valid_structures)}",
            field="business_structure",
            remediation="Select a valid business structure"
        ))
    
    # 5. Structure-specific validations
    if request.business_structure == "company" and request.additional_data:
        # Check for ACN (Australian Company Number)
        if not request.additional_data.get("acn"):
            issues.append(ValidationIssue(
                severity="warning",
                code="MISSING_ACN",
                message="No ACN provided for company",
                field="additional_data.acn",
                remediation="Add the ACN for this company"
            ))
    
    return ValidationResponse(
        valid=len([i for i in issues if i.severity == "error"]) == 0,
        issues=issues
    )

@router.post("/validate-obligations")
def validate_tax_obligations(request: TaxObligationValidationRequest) -> ValidationResponse:
    issues = []
    
    # Skip if no obligations
    if not request.obligations:
        return ValidationResponse(valid=True, issues=[])
    
    now = datetime.now()
    
    # 1. Check for overdue obligations
    for obligation in request.obligations:
        due_date = obligation.get("dueDate")
        if due_date and not obligation.get("lodgementDate") and not obligation.get("paymentDate"):
            due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00')) if isinstance(due_date, str) else due_date
            if due_date < now:
                issues.append(ValidationIssue(
                    severity="error",
                    code="OVERDUE_OBLIGATION",
                    message=f"Obligation is past due: {obligation.get('description', 'Unknown')}",
                    details={
                        "obligation_id": obligation.get("id"),
                        "due_date": due_date.isoformat(),
                        "days_overdue": (now - due_date).days
                    },
                    remediation="Lodge or pay immediately to avoid penalties"
                ))
    
    # 2. Check for upcoming obligations
    upcoming_warning_days = 14  # Warning for obligations due within 14 days
    for obligation in request.obligations:
        due_date = obligation.get("dueDate")
        if due_date and not obligation.get("lodgementDate") and not obligation.get("paymentDate"):
            due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00')) if isinstance(due_date, str) else due_date
            if now < due_date < (now + timedelta(days=upcoming_warning_days)):
                issues.append(ValidationIssue(
                    severity="warning",
                    code="UPCOMING_OBLIGATION",
                    message=f"Obligation due soon: {obligation.get('description', 'Unknown')}",
                    details={
                        "obligation_id": obligation.get("id"),
                        "due_date": due_date.isoformat(),
                        "days_remaining": (due_date - now).days
                    },
                    remediation="Prepare to lodge and pay on time"
                ))
    
    # 3. Check for missing obligations (based on expected schedule)
    # This is a simplified check - a real system would have more sophisticated logic
    obligation_types = set(o.get("obligationType") for o in request.obligations)
    
    # Assuming monthly PAYG if financial data has employees
    if (request.financial_data and 
        request.financial_data.get("hasEmployees", False) and 
        "payg" not in obligation_types):
        issues.append(ValidationIssue(
            severity="warning",
            code="MISSING_PAYG_OBLIGATIONS",
            message="No PAYG withholding obligations found for an entity with employees",
            remediation="Check if PAYG withholding obligations need to be registered"
        ))
    
    return ValidationResponse(
        valid=len([i for i in issues if i.severity == "error"]) == 0,
        issues=issues
    )

@router.post("/detect-anomalies")
def detect_compliance_anomalies(request: TaxObligationValidationRequest) -> ValidationResponse:
    issues = []
    
    # Skip if no financial data
    if not request.financial_data:
        return ValidationResponse(valid=True, issues=[])
    
    # 1. Check for unusual GST ratios (simplified example)
    if request.financial_data.get("totalSales") and request.financial_data.get("gstCollected"):
        sales = float(request.financial_data["totalSales"])
        gst = float(request.financial_data["gstCollected"])
        
        # GST in Australia is 10%, so gst/sales should be close to 0.1
        if sales > 0 and (gst / sales < 0.08 or gst / sales > 0.12):
            issues.append(ValidationIssue(
                severity="warning",
                code="UNUSUAL_GST_RATIO",
                message="The GST collected appears unusual compared to total sales",
                details={
                    "gst_collected": gst,
                    "total_sales": sales,
                    "actual_ratio": round(gst / sales, 3),
                    "expected_ratio": 0.1
                },
                remediation="Review GST calculations and ensure all taxable supplies are captured"
            ))
    
    # 2. Check for unusual income tax ratios (simplified example)
    if request.financial_data.get("netProfit") and request.financial_data.get("taxPayable"):
        profit = float(request.financial_data["netProfit"])
        tax = float(request.financial_data["taxPayable"])
        
        # Effective tax rate should be somewhat close to company tax rate (25-30%)
        if profit > 0 and (tax / profit < 0.1 or tax / profit > 0.4):
            issues.append(ValidationIssue(
                severity="info",
                code="UNUSUAL_TAX_RATE",
                message="The effective tax rate appears unusual compared to standard rates",
                details={
                    "tax_payable": tax,
                    "net_profit": profit,
                    "effective_rate": round(tax / profit * 100, 1),
                    "expected_range": "25-30%"
                },
                remediation="Review deductions and ensure correct tax calculations"
            ))
    
    # 3. Check for patterns in deductions (simplified)
    if request.financial_data.get("deductions"):
        total_deductions = sum(float(d.get("amount", 0)) for d in request.financial_data["deductions"])
        total_revenue = float(request.financial_data.get("totalRevenue", 0))
        
        if total_revenue > 0 and (total_deductions / total_revenue > 0.7):
            issues.append(ValidationIssue(
                severity="warning",
                code="HIGH_DEDUCTION_RATIO",
                message="Deductions are unusually high compared to revenue",
                details={
                    "total_deductions": total_deductions,
                    "total_revenue": total_revenue,
                    "ratio": round(total_deductions / total_revenue, 2)
                },
                remediation="Review deduction calculations and ensure proper documentation"
            ))
    
    return ValidationResponse(
        valid=True,  # Anomalies don't make the data invalid, just worthy of attention
        issues=issues
    )

@router.post("/run-all-checks")
def run_compliance_checks(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run all compliance checks in a single request
    """
    results = {}
    
    # Validate business entity if provided
    if "entity" in request:
        entity_request = BusinessEntityValidationRequest(**request["entity"])
        results["entity_validation"] = validate_business_entity(entity_request).dict()
    
    # Validate tax obligations if provided
    if "obligations" in request:
        obligations_request = TaxObligationValidationRequest(
            entity_id=request.get("entity", {}).get("entity_id", ""),
            obligations=request["obligations"],
            financial_data=request.get("financial_data", {})
        )
        results["obligations_validation"] = validate_tax_obligations(obligations_request).dict()
    
    # Detect anomalies if financial data is provided
    if "financial_data" in request:
        anomalies_request = TaxObligationValidationRequest(
            entity_id=request.get("entity", {}).get("entity_id", ""),
            obligations=request.get("obligations", []),
            financial_data=request["financial_data"]
        )
        results["anomaly_detection"] = detect_compliance_anomalies(anomalies_request).dict()
    
    # Aggregate all issues
    all_issues = []
    for validation_type, validation_result in results.items():
        for issue in validation_result.get("issues", []):
            issue["validation_type"] = validation_type
            all_issues.append(issue)
    
    # Sort issues by severity (error > warning > info)
    severity_order = {"error": 0, "warning": 1, "info": 2}
    all_issues.sort(key=lambda x: severity_order.get(x.get("severity"), 3))
    
    results["all_issues"] = all_issues
    results["has_errors"] = any(issue.get("severity") == "error" for issue in all_issues)
    results["has_warnings"] = any(issue.get("severity") == "warning" for issue in all_issues)
    
    return results
