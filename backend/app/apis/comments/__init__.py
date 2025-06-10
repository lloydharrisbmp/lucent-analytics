from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Annotated
from datetime import datetime, timezone # Added timezone
from google.cloud.firestore import Query as FirestoreQuery # Aliased to avoid conflict
import google.cloud.firestore # Import the base module
import databutton as db
from app.auth import AuthorizedUser
# Import notification creation logic
from app.apis.compliance_notifications import _create_and_store_notification, NotificationCreate

# --- Firestore Client Initialization ---
try:
    # Initialize Firestore client (ensure service account setup in Databutton secrets/env)
    # In Databutton, credentials should be automatically picked up if configured correctly.
    firestore_client = google.cloud.firestore.Client()
    comments_collection = firestore_client.collection("comments")
    print("Firestore client initialized successfully.")
except Exception as e:
    print(f"Error initializing Firestore client: {e}")
    firestore_client = None
    comments_collection = None

# --- API Router ---
router = APIRouter(prefix="/comments", tags=["Comments"]) 

# --- Pydantic Models ---
class CommentBase(BaseModel):
    text: str = Field(..., description="The content of the comment.")
    contextType: str = Field(..., description="Type of entity the comment is attached to (e.g., 'report', 'dashboardWidget').")
    contextId: str = Field(..., description="ID of the specific entity instance.")
    contextSubId: Optional[str] = Field(None, description="Further identifier within the context (e.g., a specific data point ID).")
    mentions: Optional[List[str]] = Field([], description="List of Firebase Auth UIDs extracted from @-mentions.")
    parentId: Optional[str] = Field(None, description="ID of the comment this is a direct reply to. Null for top-level comments.")

class CommentCreate(CommentBase):
    # Fields specific to creation, if any, would go here.
    # For now, it inherits all from CommentBase.
    pass

class CommentUpdate(BaseModel):
    text: Optional[str] = Field(None, description="The updated content of the comment.")
    # Can potentially update mentions too if needed
    # mentions: Optional[List[str]] = Field(None, description="Updated list of mentioned user UIDs.")

class CommentRead(CommentBase):
    id: str = Field(..., description="Firestore document ID of the comment.")
    userId: str = Field(..., description="Firebase Auth UID of the user who posted the comment.")
    timestamp: datetime = Field(..., description="Server timestamp of when the comment was created.")
    threadId: str = Field(..., description="ID of the root comment in the thread.")
    lastReplyTimestamp: Optional[datetime] = Field(None, description="Timestamp of the last reply (only on root comment).")
    replyCount: Optional[int] = Field(0, description="Number of replies (only on root comment).")
    deleted: Optional[bool] = Field(False, description="Flag indicating if the comment is soft-deleted.")

    model_config = {"from_attributes": True}  # Allow creating model from ORM objects (like Firestore docs)

# --- Helper Functions (Placeholder) ---
def check_firestore_client():
    if not firestore_client or not comments_collection:
        raise HTTPException(status_code=500, detail="Firestore client not initialized.")

# --- API Endpoints (Placeholders) ---

@router.post("", response_model=CommentRead, dependencies=[Depends(check_firestore_client)])
async def create_comment(comment_data: CommentCreate, user: AuthorizedUser):
    """Creates a new comment or reply in Firestore."""
    now = datetime.now(timezone.utc) # Use UTC timezone
    user_id = user.sub # Get user ID from authenticated user

    # Prepare basic comment data
    new_comment_data = comment_data.model_dump()
    new_comment_data["userId"] = user_id
    new_comment_data["timestamp"] = now
    new_comment_data["deleted"] = False

    parent_id = comment_data.parentId

    try:
        if parent_id:
            # --- Handle Reply ---
            parent_ref = comments_collection.document(parent_id)
            parent_doc = parent_ref.get()
            if not parent_doc.exists:
                raise HTTPException(status_code=404, detail="Parent comment not found")
            
            parent_data = parent_doc.to_dict()
            thread_id = parent_data.get("threadId", parent_id) # Fallback to parent_id if threadId missing
            new_comment_data["threadId"] = thread_id

            # Use a transaction to add reply and update root comment atomically
            @google.cloud.firestore.transactional
            def add_reply_transaction(transaction, new_comment_data, thread_id):
                # 1. Add the new reply comment
                new_comment_ref = comments_collection.document()
                transaction.set(new_comment_ref, new_comment_data)
                new_comment_data["id"] = new_comment_ref.id # Get the generated ID

                # 2. Update the root comment's metadata
                root_comment_ref = comments_collection.document(thread_id)
                transaction.update(root_comment_ref, {
                    "replyCount": google.cloud.firestore.Increment(1),
                    "lastReplyTimestamp": now
                })
                return new_comment_data
            
            transaction = firestore_client.transaction()
            created_comment_data = add_reply_transaction(transaction, new_comment_data, thread_id)

        else:
            # --- Handle Root Comment ---
            new_comment_ref = comments_collection.document()
            thread_id = new_comment_ref.id # Root comment's ID is its threadId
            new_comment_data["threadId"] = thread_id
            new_comment_data["replyCount"] = 0 # Initialize reply count
            new_comment_data["lastReplyTimestamp"] = now # Initialize last reply timestamp
            
            new_comment_ref.set(new_comment_data)
            new_comment_data["id"] = new_comment_ref.id
            created_comment_data = new_comment_data

        # Fetch the full comment data to return (including server-generated fields)
        # This might be slightly inefficient but ensures consistency
        final_doc = comments_collection.document(created_comment_data["id"]).get()
        if final_doc.exists:
            # --- Mention Notification Logic ---
            mentioned_user_ids = created_comment_data.get("mentions", [])
            if mentioned_user_ids:
                # Ensure uniqueness
                unique_mentioned_ids = set(mentioned_user_ids)
                for mentioned_user_id in unique_mentioned_ids:
                    # Don't notify the user mentioning themselves
                    if mentioned_user_id == user_id:
                        continue
                    
                    # Construct notification payload
                    notification_payload = NotificationCreate(
                        userId=mentioned_user_id,
                        type="mention",
                        severity="info",
                        title="New Mention",
                        message=f"You were mentioned in a comment by user {user_id}", # Consider using user display name if available
                        actionRequired=False, 
                        # Construct a relevant link - depends on how context is used in FE routing
                        actionLink=f"/comments?contextType={created_comment_data.get('contextType')}&contextId={created_comment_data.get('contextId')}", 
                        entityId=created_comment_data.get("contextId"), # Assuming contextId relates to an entity
                        data={"commentId": created_comment_data.get("id"), "threadId": created_comment_data.get("threadId")}
                    )
                    
                    # Attempt to create notification
                    try:
                        _create_and_store_notification(notification_payload)
                        print(f"Mention notification created for user {mentioned_user_id}")
                    except Exception as notif_error:
                        # Log error but don't fail the main comment creation
                        print(f"Error creating mention notification for user {mentioned_user_id}: {notif_error}")

            # Add the id to the dict before creating the Pydantic model
            final_data = final_doc.to_dict()
            final_data["id"] = final_doc.id 
            return CommentRead(**final_data)
        else:
            # Fallback or raise error if doc not found immediately after creation (unlikely)
             raise HTTPException(status_code=500, detail="Failed to retrieve created comment")

    except google.cloud.exceptions.NotFound:
         raise HTTPException(status_code=404, detail="Parent comment not found during transaction")
    except Exception as e:
        print(f"Error creating comment: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("", response_model=List[CommentRead], dependencies=[Depends(check_firestore_client)])
async def get_comments(
    # Required query parameters
    contextType: str = Query(..., description="Filter by context type"),
    contextId: str = Query(..., description="Filter by context ID"),
    # Optional query parameters
    contextSubId: Optional[str] = Query(None, description="Filter by context sub ID"),
    threadId: Optional[str] = Query(None, description="Filter by thread ID (for retrieving replies)"),
    # user: AuthorizedUser # Added user dependency implicitly via router protection, explicitly added for clarity/future if needed
):
    """Retrieves comments based on context or thread ID."""
    try:
        query = comments_collection.where(field_path="deleted", op_string="==", value=False) # Start by excluding deleted comments

        # Apply mandatory context filters
        query = query.where(field_path="contextType", op_string="==", value=contextType)
        query = query.where(field_path="contextId", op_string="==", value=contextId)

        # Apply optional context sub ID filter
        if contextSubId:
            query = query.where(field_path="contextSubId", op_string="==", value=contextSubId)
        
        # Apply optional thread ID filter (usually used to get replies)
        if threadId:
            query = query.where(field_path="threadId", op_string="==", value=threadId)
            # When getting a specific thread, usually want parentId != null (replies)
            # But leaving this open allows fetching the root comment too if needed.
            # Consider adding another flag if only replies are desired.

        # Order results by timestamp (ascending for chronological order)
        query = query.order_by("timestamp", direction=FirestoreQuery.ASCENDING)

        # Execute query
        docs = query.stream()

        # Process results
        comments_list = []
        for doc in docs:
            comment_data = doc.to_dict()
            comment_data["id"] = doc.id # Add the document ID
            try:
                comments_list.append(CommentRead(**comment_data))
            except Exception as pydantic_error:
                # Log error if a comment fails validation but continue with others
                print(f"Error parsing comment {doc.id}: {pydantic_error}") 
                print(f"Comment data: {comment_data}")

        return comments_list

    except Exception as e:
        print(f"Error retrieving comments: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.put("/{comment_id}", response_model=CommentRead, dependencies=[Depends(check_firestore_client)])
async def update_comment(comment_id: str, comment_update: CommentUpdate, user: AuthorizedUser):
    """Updates the text of an existing comment, checking for ownership."""
    comment_ref = comments_collection.document(comment_id)
    
    try:
        comment_doc = comment_ref.get()

        if not comment_doc.exists:
            raise HTTPException(status_code=404, detail="Comment not found")

        comment_data = comment_doc.to_dict()

        # Check if comment is already deleted
        if comment_data.get("deleted", False):
            raise HTTPException(status_code=410, detail="Comment has been deleted") # 410 Gone

        # Check for ownership
        if comment_data.get("userId") != user.sub:
            raise HTTPException(status_code=403, detail="User not authorized to update this comment")

        # Prepare update data - only update text for now
        update_data = {}
        if comment_update.text is not None:
            update_data["text"] = comment_update.text
            # If mentions can be updated, parse comment_update.text and update 'mentions' field here
        
        # Only proceed if there's something to update
        if not update_data:
            # Return current data if no changes provided
            comment_data["id"] = comment_doc.id
            return CommentRead(**comment_data)

        # Perform the update
        comment_ref.update(update_data)

        # Fetch the updated document to return the latest state
        updated_doc = comment_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        return CommentRead(**updated_data)

    except google.cloud.exceptions.NotFound:
         raise HTTPException(status_code=404, detail="Comment not found during update process")
    except HTTPException as http_exc: # Re-raise known HTTP exceptions
        raise http_exc
    except Exception as e:
        print(f"Error updating comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.delete("/{comment_id}", status_code=204, dependencies=[Depends(check_firestore_client)]) # Return 204 No Content on success
async def delete_comment(comment_id: str, user: AuthorizedUser):
    """Soft-deletes a comment, checking for ownership. Decrements reply count if it's a reply."""
    comment_ref = comments_collection.document(comment_id)

    try:
        comment_doc = comment_ref.get()

        if not comment_doc.exists:
            # Idempotent: If already gone, return success (or 404 if strict needed)
            # Choosing idempotency for smoother UX.
            return # Return 204 implicitly

        comment_data = comment_doc.to_dict()

        # Check if already deleted
        if comment_data.get("deleted", False):
            # Already deleted, operation is successful (idempotent)
            return # Return 204 implicitly

        # Check for ownership
        if comment_data.get("userId") != user.sub:
            raise HTTPException(status_code=403, detail="User not authorized to delete this comment")

        # --- Perform Soft Delete --- 
        parent_id = comment_data.get("parentId")
        thread_id = comment_data.get("threadId")

        if parent_id and thread_id:
            # --- Handle Reply Deletion (Decrement Root Count) ---
            @google.cloud.firestore.transactional
            def delete_reply_transaction(transaction, comment_ref, thread_id):
                # 1. Mark the reply as deleted
                transaction.update(comment_ref, {"deleted": True})
                
                # 2. Decrement the root comment's reply count (ensure it doesn't go below 0)
                root_comment_ref = comments_collection.document(thread_id)
                root_snapshot = root_comment_ref.get(transaction=transaction) # Get within transaction
                if root_snapshot.exists:
                    current_count = root_snapshot.to_dict().get("replyCount", 0)
                    if current_count > 0:
                         transaction.update(root_comment_ref, {"replyCount": google.cloud.firestore.Increment(-1)})
                    # else: Do nothing if count is already 0 (data inconsistency?)
                # else: Root comment doesn't exist? Log potential issue, but proceed with deleting reply.
                #       This case shouldn't happen if data integrity is maintained.
                #       print(f"Warning: Root comment {thread_id} not found during delete transaction for {comment_id}")
                
            # Execute the transaction
            transaction = firestore_client.transaction()
            delete_reply_transaction(transaction, comment_ref, thread_id)

        else:
            # --- Handle Root Comment Deletion (or Reply with missing data) ---
            # Just mark as deleted, no counter decrement needed (or possible if thread_id missing)
            comment_ref.update({"deleted": True})
            # If it's a root comment, its replies still exist but are orphaned in terms of UI thread display
            # Depending on UI logic, might need further cleanup or handling.
            
        # Success, return 204 (implicitly done by FastAPI for status_code=204 routes)
        return

    except google.cloud.exceptions.NotFound:
         # Should ideally not happen due to initial check, but handle defensively
         raise HTTPException(status_code=404, detail="Comment not found during delete process")
    except HTTPException as http_exc: # Re-raise known HTTP exceptions
        raise http_exc
    except Exception as e:
        print(f"Error deleting comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


