from fastapi import APIRouter, HTTPException, Request, Depends, Header
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import stripe
import json
import databutton as db
import uuid
from enum import Enum
from app.auth import AuthorizedUser

router = APIRouter(prefix="/subscriptions")

from app.apis.utils import log_audit_event # Import audit logging function
try:
    stripe.api_key = db.secrets.get("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = db.secrets.get("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = db.secrets.get("STRIPE_WEBHOOK_SECRET")
    APP_DOMAIN = db.secrets.get("APP_DOMAIN", "https://bmpadvisory.databutton.app/lucent-analytics")
    
    # Define Constants
    SUBSCRIPTION_STORAGE_PREFIX = "subscriptions"
except Exception as e:
    print(f"Error loading Stripe configuration: {e}")


class SubscriptionTier(str, Enum):
    FREE = "free"  # Limited features, single entity
    BASIC = "basic"  # Standard features, up to 3 entities
    PROFESSIONAL = "professional"  # All features, up to 10 entities
    ENTERPRISE = "enterprise"  # All features, unlimited entities, white-labeling


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    CANCELED = "canceled"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    TRIALING = "trialing"


class CreateCheckoutSessionRequest(BaseModel):
    price_id: str
    organization_id: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class SubscriptionDetails(BaseModel):
    id: str
    organization_id: str
    customer_id: str
    subscription_id: Optional[str] = None
    tier: SubscriptionTier
    status: SubscriptionStatus
    current_period_end: Optional[int] = None
    cancel_at_period_end: bool = False
    created: int
    product_id: Optional[str] = None
    price_id: Optional[str] = None
    payment_method: Optional[str] = None


class SubscriptionPortalRequest(BaseModel):
    customer_id: str
    return_url: Optional[str] = None


class SubscriptionTierInfo(BaseModel):
    tier: SubscriptionTier
    name: str
    description: str
    price: float
    price_id: str
    features: List[str]
    entity_limit: int = Field(..., description="Number of entities allowed (0 for unlimited)")
    is_recommended: bool = False


class SubscriptionPlanResponse(BaseModel):
    plans: List[SubscriptionTierInfo]
    publishable_key: str


def get_subscription_storage_key(organization_id: str) -> str:
    """Generate a storage key for subscription data"""
    return f"{SUBSCRIPTION_STORAGE_PREFIX}_{organization_id}"


@router.get("/plans", response_model=SubscriptionPlanResponse)
def get_subscription_plans():
    """Get all available subscription plans with pricing"""
    # These would typically come from Stripe Products and Prices
    # For MVP, we'll hardcode the tiers but link to actual Stripe price IDs
    plans = [
        SubscriptionTierInfo(
            tier=SubscriptionTier.FREE,
            name="Free",
            description="For individuals just getting started",
            price=0,
            price_id="free",  # No price ID for free tier
            features=[
                "Single organization",
                "Basic financial reports",
                "Manual data import"
            ],
            entity_limit=1,
            is_recommended=False
        ),
        SubscriptionTierInfo(
            tier=SubscriptionTier.BASIC,
            name="Basic",
            description="For small businesses and startups",
            price=29.99,
            price_id="price_1O1XXXXXXXXXXXXBasic",  # Replace with actual Stripe Price ID
            features=[
                "Up to 3 organizations",
                "Standard financial reports",
                "CSV data import",
                "Basic forecasting"
            ],
            entity_limit=3,
            is_recommended=True
        ),
        SubscriptionTierInfo(
            tier=SubscriptionTier.PROFESSIONAL,
            name="Professional",
            description="For growing businesses and accounting firms",
            price=79.99,
            price_id="price_1O1XXXXXXXXXXXXPro",  # Replace with actual Stripe Price ID
            features=[
                "Up to 10 organizations",
                "Advanced financial reports",
                "Automated data import",
                "Advanced forecasting",
                "Team collaboration"
            ],
            entity_limit=10,
            is_recommended=False
        ),
        SubscriptionTierInfo(
            tier=SubscriptionTier.ENTERPRISE,
            name="Enterprise",
            description="For large firms and enterprises",
            price=199.99,
            price_id="price_1O1XXXXXXXXXXXXEnt",  # Replace with actual Stripe Price ID
            features=[
                "Unlimited organizations",
                "Custom financial reports",
                "Advanced data integrations",
                "Custom forecasting models",
                "White-labeling",
                "Dedicated support"
            ],
            entity_limit=0,  # 0 means unlimited
            is_recommended=False
        )
    ]
    
    return SubscriptionPlanResponse(
        plans=plans,
        publishable_key=STRIPE_PUBLISHABLE_KEY
    )


@router.post("/create-checkout-session")
async def create_checkout_session(request: CreateCheckoutSessionRequest, user: AuthorizedUser):
    """Create a Stripe checkout session for subscription"""
    try:
        # For free tier, handle differently
        if request.price_id == "free":
            # Create a free subscription record
            subscription_id = f"free_{uuid.uuid4().hex}"
            subscription = SubscriptionDetails(
                id=subscription_id,
                organization_id=request.organization_id,
                customer_id="free_customer",
                subscription_id=None,
                tier=SubscriptionTier.FREE,
                status=SubscriptionStatus.ACTIVE,
                current_period_end=None,  # No expiration for free tier
                cancel_at_period_end=False,
                created=int(import_module('time').time()),
                product_id=None,
                price_id=None
            )
            
            # Save subscription details
            storage_key = get_subscription_storage_key(request.organization_id)
            db.storage.json.put(storage_key, subscription.dict())
            
            return {"redirect_url": request.success_url or f"{APP_DOMAIN}/dashboard"}
            
        # For paid tiers, create Stripe checkout session
        success_url = request.success_url or f"{APP_DOMAIN}/subscription-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = request.cancel_url or f"{APP_DOMAIN}/pricing"
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            success_url=success_url,
            cancel_url=cancel_url,
            mode="subscription",
            client_reference_id=request.organization_id,
            customer_email=user.email,  # Use the authenticated user's email
            line_items=[{
                "price": request.price_id,
                "quantity": 1
            }],
            metadata={"organization_id": request.organization_id}
        )
        
        return {"redirect_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(request: SubscriptionPortalRequest):
    """Create a Stripe billing portal session for subscription management"""
    try:
        return_url = request.return_url or f"{APP_DOMAIN}/dashboard"
        
        # Create portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=request.customer_id,
            return_url=return_url
        )
        
        return {"redirect_url": portal_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organization/{organization_id}", response_model=Optional[SubscriptionDetails])
async def get_organization_subscription(organization_id: str, user: AuthorizedUser):
    """Get subscription details for an organization"""
    try:
        storage_key = get_subscription_storage_key(organization_id)
        
        try:
            subscription_data = db.storage.json.get(storage_key)
            if subscription_data:
                return SubscriptionDetails(**subscription_data)
            return None
        except:
            # No subscription found
            return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Handle Stripe webhook events"""
    payload = None # Initialize payload to None
    event_type = "unknown"
    event_id = "unknown"
    
    # Log receiving the request *before* body parsing/verification
    try:
        log_audit_event(
            user_identifier="stripe_webhook", # Generic identifier for webhook source
            action_type="STRIPE_WEBHOOK_RECEIVED",
            status="INFO",
            request=request, # Log raw request headers
            target_object_type="STRIPE_EVENT",
            details={"message": "Webhook request received"}
        )
    except Exception as log_e:
        print(f"Initial webhook audit log failed: {log_e}")

    try:
        # Get raw request body
        payload = await request.body()
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=STRIPE_WEBHOOK_SECRET
        )
        event_id = event.get('id', event_id)
        event_type = event.get('type', event_type)

    except ValueError as e:
        # Invalid payload
        print(f"Stripe webhook error: Invalid payload. {e}")
        log_audit_event(
            user_identifier="stripe_webhook",
            action_type="STRIPE_WEBHOOK_VERIFY",
            status="FAILURE",
            request=request,
            target_object_type="STRIPE_EVENT",
            error_message=f"Invalid payload: {e}",
            status_code=400,
            details={"payload_snippet": payload[:100].decode('utf-8', errors='ignore') if payload else None} # Log partial payload
        )
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print(f"Stripe webhook error: Invalid signature. {e}")
        log_audit_event(
            user_identifier="stripe_webhook",
            action_type="STRIPE_WEBHOOK_VERIFY",
            status="FAILURE",
            request=request,
            target_object_type="STRIPE_EVENT",
            error_message=f"Invalid signature: {e}",
            status_code=400,
            details={"stripe_signature_header": stripe_signature}
        )
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        # Catch other potential errors during construction/verification
        print(f"Stripe webhook error: Unexpected error during event construction. {e}")
        log_audit_event(
            user_identifier="stripe_webhook",
            action_type="STRIPE_WEBHOOK_VERIFY",
            status="FAILURE",
            request=request,
            target_object_type="STRIPE_EVENT",
            error_message=f"Event construction error: {e}",
            status_code=500,
            details={"payload_snippet": payload[:100].decode('utf-8', errors='ignore') if payload else None}
        )
        raise HTTPException(status_code=500, detail=f"Error processing webhook event: {e}")
        
    # Signature verified, log the event type
    log_audit_event(
        user_identifier="stripe_webhook",
        action_type="STRIPE_WEBHOOK_PROCESS",
        status="INFO",
        request=request,
        target_object_type="STRIPE_EVENT",
        target_object_id=event_id,
        details={"event_type": event_type, "message": "Processing event"}
    )
    print(f"Processing Stripe event: {event_type} ({event_id})")

    try:
        # Only handle subscription-related events
        if event_type.startswith('customer.subscription.'):
            await handle_subscription_event(event)
            
            log_audit_event(
                user_identifier="stripe_webhook", 
                action_type="STRIPE_SUBSCRIPTION_EVENT",
                status="SUCCESS",
                request=request,
                target_object_type="STRIPE_EVENT",
                target_object_id=event_id,
                details={
                    "event_type": event_type,
                    "subscription_id": event['data']['object'].get('id')
                }
            )
        elif event_type == 'checkout.session.completed':
            await handle_checkout_completed(event)
            
            log_audit_event(
                user_identifier="stripe_webhook", 
                action_type="STRIPE_CHECKOUT_COMPLETE",
                status="SUCCESS",
                request=request,
                target_object_type="STRIPE_EVENT",
                target_object_id=event_id,
                details={
                    "event_type": event_type,
                    "checkout_session_id": event['data']['object'].get('id')
                }
            )
        else:
            print(f"Unhandled Stripe event type: {event_type}")
            # Optionally log unhandled events
            log_audit_event(
                user_identifier="stripe_webhook",
                action_type="STRIPE_WEBHOOK_UNHANDLED",
                status="WARNING",
                request=request,
                target_object_type="STRIPE_EVENT",
                target_object_id=event_id,
                details={"event_type": event_type}
            )
        
        # Return a response to acknowledge receipt of the event
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        # Catch errors during event handling logic
        error_message = f"Error handling Stripe event {event_type} ({event_id}): {e}"
        print(f"Error handling webhook: {e}")
        log_audit_event(
            user_identifier="stripe_webhook",
            action_type="STRIPE_WEBHOOK_PROCESS",
            status="FAILURE",
            request=request,
            target_object_type="STRIPE_EVENT",
            target_object_id=event_id,
            error_message=error_message,
            status_code=500,
            details={"event_type": event_type}
        )
        # Return 500 to Stripe so it retries (if applicable)
        raise HTTPException(status_code=500, detail=str(e))


async def handle_subscription_event(event):
    """Handle subscription-related events from Stripe"""
    subscription = event['data']['object']
    organization_id = subscription.get('metadata', {}).get('organization_id')
    
    if not organization_id:
        # Try to find the customer to get the organization ID
        try:
            customer = stripe.Customer.retrieve(subscription.get('customer'))
            organization_id = customer.get('metadata', {}).get('organization_id')
        except Exception as e:
            print(f"Error retrieving customer: {e}")
            return
    
    if not organization_id:
        print("Could not determine organization_id from event")
        return
    
    # Determine subscription tier based on price/product
    tier = determine_subscription_tier(subscription)
    
    # Create subscription record
    subscription_record = SubscriptionDetails(
        id=str(uuid.uuid4()),
        organization_id=organization_id,
        customer_id=subscription.get('customer'),
        subscription_id=subscription.get('id'),
        tier=tier,
        status=map_stripe_status_to_app_status(subscription.get('status')),
        current_period_end=subscription.get('current_period_end'),
        cancel_at_period_end=subscription.get('cancel_at_period_end', False),
        created=subscription.get('created'),
        product_id=get_subscription_product_id(subscription),
        price_id=get_subscription_price_id(subscription)
    )
    
    # Save subscription record
    storage_key = get_subscription_storage_key(organization_id)
    db.storage.json.put(storage_key, subscription_record.dict())
    print(f"Updated subscription for organization {organization_id}")


async def handle_checkout_completed(event):
    """Handle checkout.session.completed events"""
    session = event['data']['object']
    
    # Only handle subscription checkouts
    if session.get('mode') != 'subscription':
        return
    
    # Get organization ID from metadata or client_reference_id
    organization_id = session.get('metadata', {}).get('organization_id') or session.get('client_reference_id')
    
    if not organization_id:
        print("Could not determine organization_id from checkout session")
        return
    
    # The subscription ID is not directly available in the checkout session
    # We'll need to wait for the customer.subscription.created event for full details
    # But we can create an initial record with the customer ID
    
    customer_id = session.get('customer')
    if customer_id:
        # Update Stripe customer with organization metadata
        try:
            stripe.Customer.modify(
                customer_id,
                metadata={"organization_id": organization_id}
            )
        except Exception as e:
            print(f"Error updating customer metadata: {e}")
    
    print(f"Checkout completed for organization {organization_id}")


def determine_subscription_tier(subscription) -> SubscriptionTier:
    """Determine subscription tier based on product/price"""
    # This should match price_ids to tiers
    # For now, use a simple mapping based on price amount
    price_id = get_subscription_price_id(subscription)
    
    # Determine tier based on price amount
    if not price_id:
        return SubscriptionTier.FREE
    
    # Get price details
    try:
        price = stripe.Price.retrieve(price_id)
        amount = price.get('unit_amount', 0)
        
        # Determine tier based on price amount
        if amount == 0:
            return SubscriptionTier.FREE
        elif amount <= 3000:  # $30.00
            return SubscriptionTier.BASIC
        elif amount <= 10000:  # $100.00
            return SubscriptionTier.PROFESSIONAL
        else:
            return SubscriptionTier.ENTERPRISE
    except Exception as e:
        print(f"Error determining subscription tier: {e}")
        return SubscriptionTier.FREE


def get_subscription_product_id(subscription) -> Optional[str]:
    """Extract product ID from subscription"""
    items = subscription.get('items', {}).get('data', [])
    if items and len(items) > 0:
        return items[0].get('price', {}).get('product')
    return None


def get_subscription_price_id(subscription) -> Optional[str]:
    """Extract price ID from subscription"""
    items = subscription.get('items', {}).get('data', [])
    if items and len(items) > 0:
        return items[0].get('price', {}).get('id')
    return None


def map_stripe_status_to_app_status(stripe_status: str) -> SubscriptionStatus:
    """Map Stripe subscription status to app subscription status"""
    status_map = {
        'active': SubscriptionStatus.ACTIVE,
        'past_due': SubscriptionStatus.PAST_DUE,
        'unpaid': SubscriptionStatus.UNPAID,
        'canceled': SubscriptionStatus.CANCELED,
        'incomplete': SubscriptionStatus.INCOMPLETE,
        'incomplete_expired': SubscriptionStatus.INCOMPLETE_EXPIRED,
        'trialing': SubscriptionStatus.TRIALING
    }
    return status_map.get(stripe_status, SubscriptionStatus.INCOMPLETE)


# Fix for missing import in async function
from importlib import import_module
