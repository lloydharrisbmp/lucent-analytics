import React, { useState, useEffect, useCallback, useMemo } from "react";
import brain from "brain";
import { CommentRead } from "types";
import { CommentItem } from "components/CommentItem";
import { useCurrentUser } from "app";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Added import
import { Loader2 } from "lucide-react"; // Added import
import { toast } from "sonner";
import { getFirestore, collection, query, where, getDocs, FirestoreError } from "firebase/firestore"; // Firestore imports
import { firebaseApp } from "app";

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

// --- Types ---

// Define a type for the nested comment structure
interface CommentNode extends CommentRead {
  replies: CommentNode[];
}

interface Props {
  contextType: string;
  contextId: string;
  contextSubId?: string;
}

// Define a simple UserProfile type (adjust as needed based on actual Firestore structure)
interface UserProfile {
  userId: string; // Should match the document ID and Firebase UID
  displayName: string;
  avatarUrl?: string;
}

// Helper function to build the tree structure
const buildCommentTree = (comments: CommentRead[]): CommentNode[] => {
  const commentMap: { [key: string]: CommentNode } = {};
  const rootComments: CommentNode[] = [];

  // First pass: Create nodes and map them by ID
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Second pass: Build the tree structure
  comments.forEach(comment => {
    const node = commentMap[comment.id];
    if (comment.parentId && commentMap[comment.parentId]) {
      // Ensure parent exists before pushing
      commentMap[comment.parentId].replies.push(node);
    } else {
      // If no parentId or parent not found in the current batch, treat as root
      rootComments.push(node);
    }
  });

  // Optional: Sort root comments and replies by timestamp if needed (API already sorts)
  // const sortNodes = (nodes: CommentNode[]) => {
  //   nodes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  //   nodes.forEach(node => sortNodes(node.replies));
  // };
  // sortNodes(rootComments);

  return rootComments;
};

export const CommentThread: React.FC<Props> = ({ contextType, contextId, contextSubId }) => {
  const { user } = useCurrentUser();
  const [commentTree, setCommentTree] = useState<CommentNode[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false); // Added state
  const [error, setError] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const db = useMemo(() => getFirestore(firebaseApp), []);

  // --- Data Fetching ---

  const fetchCommentsAndProfiles = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingProfiles(true); // Start loading profiles
    setError(null);
    let fetchedComments: CommentRead[] = [];

    // 1. Fetch Comments
    try {
      const queryParams = { contextType, contextId, contextSubId: contextSubId ?? null };
      const response = await brain.get_comments(queryParams);
      fetchedComments = await response.json();
      const tree = buildCommentTree(fetchedComments);
      setCommentTree(tree);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      const errorMsg = `Failed to load comments: ${err.message || "Unknown error"}`;
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false); // Stop main loading on comment fetch error
      setIsLoadingProfiles(false); // Also stop profile loading
      return; // Don't proceed to profile fetching if comments failed
    } finally {
      setIsLoading(false); // Comments part finished
    }

    // 2. Fetch User Profiles if comments were fetched successfully
    if (fetchedComments.length > 0) {
      try {
        const userIds = [...new Set(fetchedComments.map(c => c.userId))]; // Get unique user IDs
        
        if (userIds.length > 0) {
          const db = getFirestore(firebaseApp);
          const profilesCol = collection(db, "profiles"); // Assuming 'profiles' collection
          // Firestore 'in' query supports max 30 elements per query
          // For simplicity, fetch all at once. For large threads, batching might be needed.
          const q = query(profilesCol, where("userId", "in", userIds)); 
          const querySnapshot = await getDocs(q);
          
          const profilesMap = new Map<string, UserProfile>();
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<UserProfile, 'userId'>;
            profilesMap.set(doc.id, { userId: doc.id, ...data });
          });
          setUserProfiles(profilesMap);
        } else {
           setUserProfiles(new Map()); // Reset if no users
        }
      } catch (err: any) {
        console.error("Error fetching user profiles:", err);
        const errorMsg = `Failed to load author details: ${err.message || "Unknown error"}`;
        // Don't overwrite main error, maybe show a specific warning?
        toast.warning(errorMsg); // Use warning for profile fetch errors
      } finally {
        setIsLoadingProfiles(false); // Profiles part finished
      }
    }
  }, [contextType, contextId, contextSubId]);

  useEffect(() => {
    fetchCommentsAndProfiles();
  }, [fetchCommentsAndProfiles]); // useEffect depends on the memoized fetchCommentsAndProfiles

  const handlePostComment = async (parentId: string | null = null) => { // Allow passing parentId
    if (!newCommentText.trim() || !user) return;
    setIsPosting(true);
    setError(null);
    try {
      const extractedMentions = extractMentions(newCommentText);
      const payload = {
        text: newCommentText,
        contextType,
        contextId,
        contextSubId: contextSubId ?? undefined,
        mentions: extractedMentions, // Pass extracted mentions
        parentId: parentId,
      };
      await brain.create_comment(payload);
      setNewCommentText(""); // Clear input
      toast.success("Comment posted successfully!"); // Success toast
      await fetchCommentsAndProfiles(); // Refresh comments AND potentially new profiles
    } catch (err: any) {
      console.error("Error posting comment:", err);
      const errorMsg = `Failed to post comment: ${err.message || "Unknown error"}`;
      setError(errorMsg);
      toast.error(errorMsg); // Toast on post error
    } finally {
      setIsPosting(false);
    }
  };

  // Recursive function to render comment nodes
  const renderCommentNode = (node: CommentNode, level: number = 0) => (
    <CommentItem 
      key={node.id} 
      comment={node} 
      authorProfile={userProfiles.get(node.userId)} // Pass profile data
      indentationLevel={level}
      onActionSuccess={fetchCommentsAndProfiles} // Use combined fetch for refresh
      allProfilesMap={userProfiles} // Pass the full map for mention lookups
    >
      {/* Recursively render replies */}
      {node.replies && node.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.replies.map(replyNode => renderCommentNode(replyNode, level + 1))}
        </div>
      )}
    </CommentItem>
  );

  return (
    <div className="space-y-4 p-4"> {/* Added padding */}
       {/* Display primary error first */}
      {error && !isLoading && (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* New Comment Form (Root Level) */}
      {user && (
        <div className="flex items-start space-x-3">
           <Avatar className="h-8 w-8 mt-1"> {/* Align avatar */} 
             <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
             <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
           </Avatar>
           <div className="flex-1 space-y-2">
             <Textarea
               placeholder="Add a comment... You can @mention users."
               value={newCommentText}
               onChange={(e) => setNewCommentText(e.target.value)}
               disabled={isPosting}
               rows={2}
               className="text-sm"
             />
             <div className="flex justify-end">
               <Button 
                 onClick={() => handlePostComment(null)} 
                 disabled={isPosting || !newCommentText.trim()}
                 size="sm" // Consistent size
               >
                 {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                 {isPosting ? "Posting..." : "Post Comment"}
               </Button>
             </div>
           </div>
        </div>
      )}

      {/* Display Comments */}
      {isLoading ? (
        <div className="space-y-4 p-4"> {/* Added padding */}
          {/* Skeleton for input */}
          <div className="flex items-start space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          {/* Skeleton for comments */}
          {[...Array(2)].map((_, i) => (
             <div key={i} className="flex items-start space-x-3">
               <Skeleton className="h-8 w-8 rounded-full" />
               <div className="flex-1 space-y-2">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-4 w-1/2" />
               </div>
             </div>
          ))}
        </div>
      ) : commentTree.length === 0 ? (
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {/* Optionally show a loading indicator for profiles while comments are visible */}
          {isLoadingProfiles && (
            <div className="flex items-center space-x-2 text-muted-foreground text-sm p-2 justify-center">
               {/* Using a simple loading text for now */}
               <span>Loading author details...</span> 
            </div>
          )}
          {/* Render root comment nodes */}
          {commentTree.map(node => renderCommentNode(node, 0))}
        </div>
      )}
    </div>
  );
};
