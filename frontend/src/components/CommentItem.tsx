import React, { useState } from "react"; // Added useState
import { CommentRead } from "types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "app";
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import brain from "brain";
import { toast } from "sonner"; // Import toast
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { Loader2, History } from "lucide-react"; // Import Loader2 and History icon

interface Props {
  comment: CommentRead;
  authorProfile?: UserProfile;
  indentationLevel: number;
  children?: React.ReactNode;
  onActionSuccess: () => void;
  allProfilesMap: Map<string, UserProfile>; // Add map for mention lookups
}

// Define UserProfile locally too, or move to a shared types file
interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

// --- Utils ---

// Basic mention extraction (finds @ followed by non-space characters)
const extractMentions = (text: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_\-]+)/g;
  const matches = text.match(mentionRegex);
  if (!matches) {
    return [];
  }
  // Extract the user ID part (remove the '@')
  return matches.map(mention => mention.substring(1));
};

// --- Helper Component for Rendering Text --- 

// Component to render text with mentions highlighted
const RenderCommentText: React.FC<{ text: string; profilesMap: Map<string, UserProfile> }> = ({ text, profilesMap }) => {
  // Simple split and replace logic for now. More robust parsing might be needed for edge cases.
  const mentionRegex = /(@[a-zA-Z0-9_\-]+)/g; // Regex to find mentions
  const parts = text.split(mentionRegex);

  return (
    <p className="text-sm text-muted-foreground whitespace-pre-wrap"> {/* Use pre-wrap to preserve line breaks */}
      {parts.map((part, index) => {
        if (mentionRegex.test(part)) {
          const userId = part.substring(1); // Extract userId
          const profile = profilesMap.get(userId);
          const displayName = profile?.displayName || userId; // Fallback to userId if profile not found
          // TODO: Add link to user profile page if available
          return <strong key={index} className="text-primary">@{displayName}</strong>; 
        }
        return <span key={index}>{part}</span>; // Render normal text
      })}
    </p>
  );
};

// --- Main Component --- 

export const CommentItem: React.FC<Props> = ({ comment, authorProfile, indentationLevel, children, onActionSuccess, allProfilesMap }) => {
  const { user: currentUser } = useCurrentUser();
  const isAuthor = currentUser?.uid === comment.userId;
  
  // Reply State
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text); // Initialize with current text
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- Determine Author Display --- 
  const authorName = authorProfile?.displayName || "Unknown User";
  const initials = authorName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "??";
  const avatarUrl = authorProfile?.avatarUrl;
  
  let formattedDate = "";
  try {
    // Ensure comment.timestamp is a valid Date object or timestamp number
    const timestampDate = new Date(comment.timestamp);
    if (!isNaN(timestampDate.getTime())) {
         formattedDate = formatDistanceToNow(timestampDate, { addSuffix: true });
    } else {
        formattedDate = "Invalid date";
    }
  } catch (e) {
    console.error("Error formatting date:", e);
    formattedDate = "Error loading date";
  }

  // --- Reply Handlers ---
  const handleToggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
    setIsEditing(false); // Close edit form if open
    setReplyText("");
    setReplyError(null);
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !currentUser) return;
    setIsPostingReply(true);
    setReplyError(null);
    try {
      const extractedMentions = extractMentions(replyText);
      const payload = {
        text: replyText,
        contextType: comment.contextType,
        contextId: comment.contextId,
        contextSubId: comment.contextSubId ?? undefined,
        mentions: extractedMentions, // Pass extracted mentions
        parentId: comment.id,
      };
      await brain.create_comment(payload);
      setReplyText("");
      setShowReplyForm(false); // Hide form on success
      onActionSuccess(); // Trigger refresh
      toast.success("Reply posted successfully!"); // Success toast
    } catch (err: any) {
      console.error("Error posting reply:", err);
      const errorMsg = `Failed to post reply: ${err.message || "Unknown error"}`;
      setReplyError(errorMsg);
      toast.error(errorMsg); // Error toast
    } finally {
      setIsPostingReply(false);
    }
  };

  // --- Edit Handlers ---
  const handleToggleEditForm = () => {
    setIsEditing(!isEditing);
    setShowReplyForm(false); // Close reply form if open
    setEditText(comment.text); // Reset text on toggle
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === comment.text) {
      setIsEditing(false); // Just close if no changes
      return;
    }
    setIsSavingEdit(true);
    setEditError(null);
    try {
      const extractedMentions = extractMentions(editText);
      const payload = {
        text: editText,
        mentions: extractedMentions, // Pass extracted mentions for edits
      };
      await brain.update_comment({ commentId: comment.id }, payload);
      setIsEditing(false);
      onActionSuccess(); // Refresh thread
      toast.success("Comment updated successfully!"); // Success toast
    } catch (err: any) {
      console.error("Error updating comment:", err);
      const errorMsg = `Failed to save changes: ${err.message || "Unknown error"}`;
      setEditError(errorMsg);
      toast.error(errorMsg); // Error toast
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- Delete Handler ---
  const handleDeleteConfirm = async () => {
    // This is called when user confirms in the AlertDialog
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await brain.delete_comment({ commentId: comment.id });
      toast.success("Comment deleted successfully!"); // Success toast
      onActionSuccess(); // Refresh thread
      // Component will unmount, no need to reset state
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      const errorMsg = `Failed to delete comment: ${err.message || "Unknown error"}`;
      setDeleteError(errorMsg); 
      toast.error(errorMsg); // Error toast
      setIsDeleting(false); // Reset deleting state only on error
    }
  };

  // Determine padding based on indentation level for visual hierarchy
  const paddingLeftClass = `pl-${indentationLevel * 6}`; // e.g., pl-0, pl-6, pl-12

  return (
    <div style={indentationStyle}>
      {deleteError && (
        <Alert variant="destructive" className="text-xs p-2 mb-2">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}
      <div className={`flex space-x-3 py-3 ${isDeleting ? 'opacity-50' : ''}`}> 
        <Avatar className="h-8 w-8"> {/* Slightly smaller avatar */}
          {avatarUrl ? (
             <AvatarImage src={avatarUrl} alt={authorName} />
          ) : (
             <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm flex items-center">
                 <span>{authorName}</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                  <span>{formattedDate}</span>
                  {comment.edited && !isEditing && (
                     <TooltipProvider delayDuration={100}>
                       <Tooltip>
                         <TooltipTrigger>
                             <History className="h-3 w-3 text-muted-foreground" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Edited</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                  )}
              </div>
            </div>

          {/* Display Comment Text or Edit Form */}
          {isEditing ? (
            <div className="space-y-2 pt-2">
              {editError && (
                 <Alert variant="destructive" className="text-xs p-2 mb-2">
                   <AlertDescription>{editError}</AlertDescription>
                 </Alert>
              )}
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                disabled={isSavingEdit}
                rows={2}
                className="text-sm"
                placeholder="Edit your comment... You can @mention users."
              />
              <div className="flex items-center space-x-2 pt-1">
                 <Button 
                    onClick={handleSaveEdit} 
                    disabled={isSavingEdit || !editText.trim() || editText === comment.text}
                    size="sm"
                 >
                    {isSavingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                 </Button>
                 <Button variant="ghost" size="sm" onClick={handleToggleEditForm} disabled={isSavingEdit}>
                    Cancel
                 </Button>
              </div>
            </div>
          ) : (
            // Use the new component to render text with mentions
            <RenderCommentText text={comment.text} profilesMap={allProfilesMap} />
          )}

          {/* Action Buttons (only show if not editing) */}
          {!isEditing && (
            <div className="flex items-center space-x-1 pt-1">
              <Button variant="ghost" size="xs" onClick={handleToggleReplyForm} disabled={isDeleting}>
                {showReplyForm ? "Cancel" : "Reply"}
              </Button>
              {/* Re-add Edit and Delete for author */}
              {isAuthor && (
                <>
                  <Button variant="ghost" size="xs" onClick={handleToggleEditForm} disabled={isDeleting}>
                    Edit
                  </Button>
                  {/* Delete Button triggers AlertDialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        className="text-destructive hover:text-destructive" 
                        disabled={isDeleting}
                      >
                        {isDeleting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the comment.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
                          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isDeleting ? "Deleting..." : "Confirm Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          )}

          {/* Reply Form (only show if not editing) */}
          {showReplyForm && !isEditing && (
            <div className="pt-2 pl-8 space-y-2">
              {replyError && (
                 <Alert variant="destructive" className="text-xs p-2">
                   <AlertDescription>{replyError}</AlertDescription>
                 </Alert>
              )}
              <Textarea
                placeholder={`Replying to @${authorName}... You can @mention users.`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isPostingReply}
                rows={2}
                className="text-sm"
              />
              <div className="flex items-center space-x-2 pt-1">
                 <Button 
                    onClick={handlePostReply} 
                    disabled={isPostingReply || !replyText.trim()}
                    size="sm"
                 >
                    {isPostingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    {isPostingReply ? "Posting..." : "Post Reply"}
                 </Button>
                 <Button variant="ghost" size="sm" onClick={handleToggleReplyForm} disabled={isPostingReply}>
                    Cancel
                 </Button>
              </div>
            </div>
          )}

          {/* Render children (replies) passed from CommentThread */}
          {children}
        </div>
      </div>
    </div>
  );
};
