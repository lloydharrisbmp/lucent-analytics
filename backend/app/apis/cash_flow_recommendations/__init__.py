from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union, Literal
import numpy as np
from datetime import datetime, timedelta
import databutton as db
import json

router = APIRouter()

# Models for API requests and responses
class CashFlowData(BaseModel):
    company_id: str
    receivables: List[Dict[str, Union[str, float]]] = Field(
        description="List of receivable items with dates, amounts, and customer info"
    )
    payables: List[Dict[str, Union[str, float]]] = Field(
        description="List of payable items with dates, amounts, and vendor info"
    )
    cash_balance: float = Field(description="Current cash balance")
    min_cash_threshold: Optional[float] = Field(
        None, description="Minimum cash threshold for alerts"
    )
    monthly_fixed_expenses: Optional[float] = Field(
        None, description="Monthly fixed expenses"
    )
    historical_payment_data: Optional[Dict[str, Dict[str, float]]] = Field(
        None, description="Historical data about customer payment behaviors"
    )
    historical_vendor_data: Optional[Dict[str, Dict[str, float]]] = Field(
        None, description="Historical data about vendor payment terms"
    )

class CashFlowTimingRecommendation(BaseModel):
    entity_id: str
    entity_name: str
    entity_type: Literal["customer", "vendor"]
    amount: float
    original_date: str
    recommended_date: str
    days_shift: int
    impact: float
    confidence: float
    reasoning: str

class WorkingCapitalRecommendation(BaseModel):
    category: Literal[
        "receivables", "payables", "inventory", "cash_management", "financing"
    ]
    recommendation_type: str
    title: str
    description: str
    potential_impact: float
    implementation_difficulty: Literal["low", "medium", "high"]
    timeframe: Literal["immediate", "short_term", "long_term"]
    confidence: float
    action_items: List[str]

class CashShortfallAlert(BaseModel):
    alert_date: str
    shortfall_amount: float
    confidence: float
    contributing_factors: List[str]
    mitigation_options: List[str]
    severity: Literal["low", "medium", "high", "critical"]

class CashFlowOptimizationResponse(BaseModel):
    timing_recommendations: List[CashFlowTimingRecommendation]
    working_capital_recommendations: List[WorkingCapitalRecommendation]
    cash_shortfall_alerts: List[CashShortfallAlert]
    expected_cash_impact: float
    recommendation_date: str

# Helper functions for recommendations
def calculate_payment_optimization(receivables, payables, cash_balance, min_cash_threshold):
    """Calculate optimal payment timing based on receivables and payables"""
    timing_recommendations = []
    
    # Sort receivables and payables by date
    sorted_receivables = sorted(receivables, key=lambda x: x.get("due_date", ""))
    sorted_payables = sorted(payables, key=lambda x: x.get("due_date", ""))
    
    # Project cash flow over time
    cash_flow_timeline = {}
    projected_balance = cash_balance
    
    # Initialize with receivables
    for receivable in sorted_receivables:
        due_date = receivable.get("due_date", "")
        amount = float(receivable.get("amount", 0))
        
        if due_date in cash_flow_timeline:
            cash_flow_timeline[due_date] += amount
        else:
            cash_flow_timeline[due_date] = amount
    
    # Subtract payables
    for payable in sorted_payables:
        due_date = payable.get("due_date", "")
        amount = float(payable.get("amount", 0))
        
        if due_date in cash_flow_timeline:
            cash_flow_timeline[due_date] -= amount
        else:
            cash_flow_timeline[due_date] = -amount
    
    # Identify cash crunch periods
    cash_crunch_periods = []
    running_balance = cash_balance
    
    for date in sorted(cash_flow_timeline.keys()):
        running_balance += cash_flow_timeline[date]
        if running_balance < (min_cash_threshold or 0):
            cash_crunch_periods.append((date, running_balance))
    
    # Generate recommendations
    if cash_crunch_periods:
        # For each cash crunch, recommend delaying nearby payables or accelerating receivables
        for crunch_date, crunch_balance in cash_crunch_periods:
            crunch_datetime = datetime.fromisoformat(crunch_date.replace('Z', '+00:00'))
            
            # Look for payables we can delay
            for payable in sorted_payables:
                payable_date = payable.get("due_date", "")
                payable_datetime = datetime.fromisoformat(payable_date.replace('Z', '+00:00'))
                
                # If payable is within 10 days before cash crunch, consider delaying
                days_diff = (crunch_datetime - payable_datetime).days
                if 0 <= days_diff <= 10:
                    amount = float(payable.get("amount", 0))
                    vendor_id = payable.get("vendor_id", "unknown")
                    vendor_name = payable.get("vendor_name", "Unknown Vendor")
                    
                    # Calculate new suggested date (7 days after original or just after crunch)
                    new_date = (payable_datetime + timedelta(days=7)).isoformat()
                    
                    timing_recommendations.append(CashFlowTimingRecommendation(
                        entity_id=vendor_id,
                        entity_name=vendor_name,
                        entity_type="vendor",
                        amount=amount,
                        original_date=payable_date,
                        recommended_date=new_date,
                        days_shift=7,
                        impact=amount,  # Positive impact on immediate cash flow
                        confidence=0.8,
                        reasoning=f"Delaying payment will help avoid cash shortfall around {crunch_date}"
                    ))
            
            # Look for receivables we can accelerate
            for receivable in sorted_receivables:
                receivable_date = receivable.get("due_date", "")
                receivable_datetime = datetime.fromisoformat(receivable_date.replace('Z', '+00:00'))
                
                # If receivable is within 15 days after cash crunch, consider accelerating
                days_diff = (receivable_datetime - crunch_datetime).days
                if 0 <= days_diff <= 15:
                    amount = float(receivable.get("amount", 0))
                    customer_id = receivable.get("customer_id", "unknown")
                    customer_name = receivable.get("customer_name", "Unknown Customer")
                    
                    # Calculate new suggested date (just before crunch)
                    new_date = (crunch_datetime - timedelta(days=1)).isoformat()
                    
                    timing_recommendations.append(CashFlowTimingRecommendation(
                        entity_id=customer_id,
                        entity_name=customer_name,
                        entity_type="customer",
                        amount=amount,
                        original_date=receivable_date,
                        recommended_date=new_date,
                        days_shift=-days_diff,
                        impact=amount,  # Positive impact on immediate cash flow
                        confidence=0.7,
                        reasoning=f"Accelerating collection will help avoid cash shortfall around {crunch_date}"
                    ))
    else:
        # If no cash crunches, still look for general optimization opportunities
        # Identify clusters of payments that could be spread out
        dates = sorted(cash_flow_timeline.keys())
        for i in range(len(dates) - 1):
            current_date = datetime.fromisoformat(dates[i].replace('Z', '+00:00'))
            next_date = datetime.fromisoformat(dates[i + 1].replace('Z', '+00:00'))
            
            # If two payment dates are very close, consider spreading them
            if (next_date - current_date).days < 3 and cash_flow_timeline[dates[i]] < 0 and cash_flow_timeline[dates[i+1]] < 0:
                # Identify payables on these dates
                for payable in sorted_payables:
                    payable_date = payable.get("due_date", "")
                    if payable_date == dates[i+1]:  # Only move the second cluster
                        amount = float(payable.get("amount", 0))
                        vendor_id = payable.get("vendor_id", "unknown")
                        vendor_name = payable.get("vendor_name", "Unknown Vendor")
                        
                        # Suggest a 5 day delay for better cash flow management
                        new_date = (next_date + timedelta(days=5)).isoformat()
                        
                        timing_recommendations.append(CashFlowTimingRecommendation(
                            entity_id=vendor_id,
                            entity_name=vendor_name,
                            entity_type="vendor",
                            amount=amount,
                            original_date=payable_date,
                            recommended_date=new_date,
                            days_shift=5,
                            impact=amount,  # Positive impact by distributing cash outflows
                            confidence=0.75,
                            reasoning="Spreading out closely timed payments for better cash flow management"
                        ))
    
    return timing_recommendations

def generate_working_capital_recommendations(receivables, payables, historical_data=None):
    """Generate recommendations for improving working capital efficiency"""
    working_capital_recommendations = []
    
    # Calculate receivables metrics
    total_receivables = sum(float(r.get("amount", 0)) for r in receivables)
    num_receivables = len(receivables)
    avg_receivable_amount = total_receivables / num_receivables if num_receivables > 0 else 0
    
    # Calculate payables metrics
    total_payables = sum(float(p.get("amount", 0)) for p in payables)
    num_payables = len(payables)
    avg_payable_amount = total_payables / num_payables if num_payables > 0 else 0
    
    # Analyze receivables concentration
    customer_receivables = {}
    for receivable in receivables:
        customer_id = receivable.get("customer_id", "unknown")
        amount = float(receivable.get("amount", 0))
        if customer_id in customer_receivables:
            customer_receivables[customer_id] += amount
        else:
            customer_receivables[customer_id] = amount
    
    # Check for customer concentration risk
    if customer_receivables:
        max_customer_exposure = max(customer_receivables.values())
        max_customer_percent = (max_customer_exposure / total_receivables) * 100 if total_receivables > 0 else 0
        
        if max_customer_percent > 30:  # If more than 30% from one customer
            max_customer_id = [k for k, v in customer_receivables.items() if v == max_customer_exposure][0]
            
            working_capital_recommendations.append(WorkingCapitalRecommendation(
                category="receivables",
                recommendation_type="concentration_risk",
                title="Reduce Customer Concentration Risk",
                description=f"One customer represents {max_customer_percent:.1f}% of your receivables. Consider diversifying your customer base to reduce risk.",
                potential_impact=max_customer_exposure * 0.2,  # 20% of the concentrated amount
                implementation_difficulty="medium",
                timeframe="short_term",
                confidence=0.85,
                action_items=[
                    "Identify opportunities to grow sales with other existing customers",
                    "Develop a customer acquisition plan targeting new sectors",
                    "Consider requesting partial upfront payments from major customers"
                ]
            ))
    
    # Analyze payment terms
    receivable_days = []
    for receivable in receivables:
        issue_date = receivable.get("issue_date")
        due_date = receivable.get("due_date")
        if issue_date and due_date:
            issue_datetime = datetime.fromisoformat(issue_date.replace('Z', '+00:00'))
            due_datetime = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            days = (due_datetime - issue_datetime).days
            receivable_days.append(days)
    
    avg_receivable_days = sum(receivable_days) / len(receivable_days) if receivable_days else 0
    
    # If average receivable days are too high, recommend shortening
    if avg_receivable_days > 45:
        working_capital_recommendations.append(WorkingCapitalRecommendation(
            category="receivables",
            recommendation_type="payment_terms",
            title="Shorten Customer Payment Terms",
            description=f"Your average payment terms are {avg_receivable_days:.1f} days. Consider reducing terms to improve cash flow.",
            potential_impact=total_receivables * (avg_receivable_days - 30) / avg_receivable_days * 0.5,  # Impact of reducing to 30 days
            implementation_difficulty="medium",
            timeframe="immediate",
            confidence=0.8,
            action_items=[
                "Review and revise standard payment terms in contracts",
                "Offer early payment discounts to incentivize faster payment",
                "Implement automated reminders for approaching due dates",
                "Consider factoring for large invoices to improve immediate cash flow"
            ]
        ))
    
    # Analyze payables
    payable_days = []
    for payable in payables:
        issue_date = payable.get("issue_date")
        due_date = payable.get("due_date")
        if issue_date and due_date:
            issue_datetime = datetime.fromisoformat(issue_date.replace('Z', '+00:00'))
            due_datetime = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            days = (due_datetime - issue_datetime).days
            payable_days.append(days)
    
    avg_payable_days = sum(payable_days) / len(payable_days) if payable_days else 0
    
    # If average payable days are too low, recommend extending
    if avg_payable_days < 30 and total_payables > 0:
        working_capital_recommendations.append(WorkingCapitalRecommendation(
            category="payables",
            recommendation_type="payment_terms",
            title="Optimize Vendor Payment Terms",
            description=f"Your average payable period is {avg_payable_days:.1f} days. Consider negotiating longer payment terms with vendors.",
            potential_impact=total_payables * (30 - avg_payable_days) / 30 * 0.3,  # Impact of extending to 30 days
            implementation_difficulty="medium",
            timeframe="short_term",
            confidence=0.75,
            action_items=[
                "Identify key vendors and initiate payment term negotiations",
                "Consider consolidated ordering to gain negotiating leverage",
                "Review early payment discounts to determine if they're beneficial",
                "Implement a payables timing strategy to optimize cash flow"
            ]
        ))
    
    # Add cash management recommendations
    working_capital_recommendations.append(WorkingCapitalRecommendation(
        category="cash_management",
        recommendation_type="idle_cash",
        title="Optimize Cash Reserves",
        description="Consider investing excess cash in short-term, liquid investments to generate returns while maintaining accessibility.",
        potential_impact=total_receivables * 0.02,  # Assuming 2% potential return
        implementation_difficulty="low",
        timeframe="immediate",
        confidence=0.9,
        action_items=[
            "Analyze cash flow patterns to determine minimum required operating cash",
            "Research short-term investment options (T-bills, money market funds)",
            "Implement a tiered cash management strategy with varying liquidity levels",
            "Set up automatic sweeps for excess cash into interest-bearing accounts"
        ]
    ))
    
    return working_capital_recommendations

def detect_cash_shortfalls(receivables, payables, cash_balance, min_cash_threshold, monthly_fixed_expenses):
    """Detect potential cash shortfalls and provide alerts"""
    cash_shortfall_alerts = []
    
    # Set a default minimum threshold if not provided
    if min_cash_threshold is None:
        if monthly_fixed_expenses:
            min_cash_threshold = monthly_fixed_expenses * 1.5  # 1.5 months of expenses
        else:
            # Estimate based on payables
            total_monthly_payables = sum(float(p.get("amount", 0)) for p in payables)
            min_cash_threshold = total_monthly_payables * 0.5  # Half of monthly payables
    
    # Create a timeline of cash flows
    cash_flow_timeline = {}
    today = datetime.now().date()
    
    # Add current cash balance
    cash_flow_timeline[today.isoformat()] = cash_balance
    
    # Add receivables
    for receivable in receivables:
        due_date_str = receivable.get("due_date", "")
        try:
            due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).date()
            amount = float(receivable.get("amount", 0))
            
            if due_date in cash_flow_timeline:
                cash_flow_timeline[due_date.isoformat()] += amount
            else:
                cash_flow_timeline[due_date.isoformat()] = amount
        except:
            # Skip invalid dates
            continue
    
    # Subtract payables
    for payable in payables:
        due_date_str = payable.get("due_date", "")
        try:
            due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).date()
            amount = float(payable.get("amount", 0))
            
            if due_date.isoformat() in cash_flow_timeline:
                cash_flow_timeline[due_date.isoformat()] -= amount
            else:
                cash_flow_timeline[due_date.isoformat()] = -amount
        except:
            # Skip invalid dates
            continue
    
    # Add fixed expenses (prorated daily and applied to each day)
    if monthly_fixed_expenses:
        daily_expenses = monthly_fixed_expenses / 30
        
        # Get the date range (today + 90 days)
        end_date = today + timedelta(days=90)
        current_date = today
        
        while current_date <= end_date:
            date_str = current_date.isoformat()
            if date_str in cash_flow_timeline:
                cash_flow_timeline[date_str] -= daily_expenses
            else:
                cash_flow_timeline[date_str] = -daily_expenses
            
            current_date += timedelta(days=1)
    
    # Calculate running balances and detect shortfalls
    running_balance = 0
    sorted_dates = sorted(cash_flow_timeline.keys())
    
    for date_str in sorted_dates:
        running_balance += cash_flow_timeline[date_str]
        
        if running_balance < min_cash_threshold:
            # Identify the factors contributing to this shortfall
            contributing_factors = []
            
            # Check if there are large payables around this time
            date = datetime.fromisoformat(date_str).date() if 'T' in date_str else datetime.strptime(date_str, '%Y-%m-%d').date()
            large_payables = []
            
            for payable in payables:
                due_date_str = payable.get("due_date", "")
                try:
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).date()
                    if abs((due_date - date).days) <= 5:
                        amount = float(payable.get("amount", 0))
                        if amount > min_cash_threshold * 0.2:  # If payable is > 20% of threshold
                            large_payables.append((payable.get("vendor_name", "Unknown"), amount))
                except:
                    continue
            
            if large_payables:
                contributing_factors.append(f"Large payables due: {', '.join([f'{name} (${amount:,.2f})' for name, amount in large_payables])}") 
            
            # Check if there are delayed receivables
            delayed_receivables = []
            for receivable in receivables:
                due_date_str = receivable.get("due_date", "")
                try:
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).date()
                    if (date - due_date).days > 0:  # If receivable was due before this date
                        amount = float(receivable.get("amount", 0))
                        if amount > min_cash_threshold * 0.1:  # If receivable is > 10% of threshold
                            delayed_receivables.append((receivable.get("customer_name", "Unknown"), amount))
                except:
                    continue
            
            if delayed_receivables:
                contributing_factors.append(f"Delayed receivables: {', '.join([f'{name} (${amount:,.2f})' for name, amount in delayed_receivables])}") 
            
            # If no specific factors, add general ones
            if not contributing_factors:
                contributing_factors = ["Cumulative cash outflows exceeding inflows", "Insufficient initial cash reserves"]
            
            # Calculate total outstanding receivables for mitigation options
            total_outstanding_receivables = sum(float(r.get("amount", 0)) for r in receivables)
            
            # Generate mitigation options
            shortfall_amount = min_cash_threshold - running_balance
            mitigation_options = [
                f"Accelerate collection of receivables (${total_outstanding_receivables:,.2f} outstanding)",
                "Negotiate extended payment terms with vendors",
                "Reduce discretionary expenses",
                f"Secure short-term financing of ${shortfall_amount:,.2f}"
            ]
            
            # Determine severity
            severity = "low"
            if shortfall_amount > min_cash_threshold * 0.5:
                severity = "medium"
            if shortfall_amount > min_cash_threshold:
                severity = "high"
            if shortfall_amount > min_cash_threshold * 2:
                severity = "critical"
            
            cash_shortfall_alerts.append(CashShortfallAlert(
                alert_date=date_str,
                shortfall_amount=shortfall_amount,
                confidence=0.85,
                contributing_factors=contributing_factors,
                mitigation_options=mitigation_options,
                severity=severity
            ))
    
    return cash_shortfall_alerts

@router.post("/optimize")
async def optimize_cash_flow(data: CashFlowData) -> CashFlowOptimizationResponse:
    """Generate cash flow optimization recommendations"""
    try:
        # Calculate timing recommendations
        timing_recommendations = calculate_payment_optimization(
            data.receivables, 
            data.payables, 
            data.cash_balance, 
            data.min_cash_threshold
        )
        
        # Generate working capital recommendations
        working_capital_recommendations = generate_working_capital_recommendations(
            data.receivables,
            data.payables,
            data.historical_payment_data
        )
        
        # Detect cash shortfalls
        cash_shortfall_alerts = detect_cash_shortfalls(
            data.receivables,
            data.payables,
            data.cash_balance,
            data.min_cash_threshold,
            data.monthly_fixed_expenses
        )
        
        # Calculate expected financial impact
        timing_impact = sum(rec.impact for rec in timing_recommendations)
        working_capital_impact = sum(rec.potential_impact for rec in working_capital_recommendations)
        total_impact = timing_impact + working_capital_impact
        
        # Create response
        response = CashFlowOptimizationResponse(
            timing_recommendations=timing_recommendations,
            working_capital_recommendations=working_capital_recommendations,
            cash_shortfall_alerts=cash_shortfall_alerts,
            expected_cash_impact=total_impact,
            recommendation_date=datetime.now().isoformat()
        )
        
        # Store the recommendations for future reference
        try:
            key = f"cash_flow_recommendations_{data.company_id}_{datetime.now().strftime('%Y%m%d')}"
            db.storage.json.put(key, response.dict())
        except Exception as e:
            print(f"Failed to store recommendations: {e}")
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/historical/{company_id}")
async def get_historical_recommendations(company_id: str):
    """Get historical cash flow recommendations for a company"""
    try:
        # List all files that match the pattern
        all_files = db.storage.json.list()
        recommendation_files = [f for f in all_files if f.name.startswith(f"cash_flow_recommendations_{company_id}_")]
        
        # Sort by date (newest first)
        recommendation_files.sort(key=lambda x: x.name, reverse=True)
        
        # Get the latest 5 recommendations
        results = []
        for file in recommendation_files[:5]:
            try:
                data = db.storage.json.get(file.name)
                date_str = file.name.split('_')[-1]
                date = datetime.strptime(date_str, '%Y%m%d').strftime('%Y-%m-%d')
                
                results.append({
                    "date": date,
                    "data": data
                })
            except Exception as e:
                print(f"Error reading file {file.name}: {e}")
        
        return {"historical_recommendations": results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve historical recommendations: {str(e)}")
