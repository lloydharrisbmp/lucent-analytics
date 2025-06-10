import React, { useEffect } from "react";
import { useCurrentUser } from "app";
import { useNotificationsStore, Notification } from "utils/notificationsStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Bell, CheckCircle, Clock, Info, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const navigate = useNavigate();
  
  const handleAction = () => {
    if (notification.actionLink) {
      navigate(notification.actionLink);
    }
  };

  // Set icon based on severity
  const getIcon = () => {
    switch (notification.severity) {
      case "error":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Calculate relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  };

  return (
    <div 
      className={`p-4 rounded-lg mb-2 ${notification.readAt ? "bg-gray-50" : "bg-white border-l-4"} 
      ${notification.severity === "error" ? "border-destructive" : 
        notification.severity === "warning" ? "border-amber-500" : 
        "border-blue-500"}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm mb-1">{notification.title}</div>
            <p className="text-sm text-gray-600">{notification.message}</p>
            
            {/* Additional details */}
            {notification.data?.remediation && (
              <p className="text-xs mt-2 text-gray-500">Recommended action: {notification.data.remediation}</p>
            )}
            
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getRelativeTime(notification.createdAt)}
              </span>
              
              {notification.type.includes('deadline') && notification.data?.daysUntilDue && (
                <Badge variant={notification.severity === "error" ? "destructive" : 
                  notification.severity === "warning" ? "outline" : "secondary"}
                >
                  Due in {notification.data.daysUntilDue} days
                </Badge>
              )}
              
              {notification.type.includes('deadline') && notification.data?.daysOverdue && (
                <Badge variant="destructive">
                  Overdue by {notification.data.daysOverdue} days
                </Badge>
              )}
            </div>
            
            {notification.actionRequired && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleAction}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full" 
          onClick={() => onDismiss(notification.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  entityId?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose,
  entityId 
}) => {
  const { user, loading } = useCurrentUser();
  const { 
    notifications, 
    unreadCount,
    fetchNotifications, 
    markAsRead, 
    dismissNotification,
    dismissAll,
    generateDeadlineAlerts,
    generateComplianceAlerts
  } = useNotificationsStore();

  useEffect(() => {
    if (isOpen && user && !loading) {
      // Mark notifications as read when opening
      fetchNotifications(user.uid, entityId);
      // Mark all as read would go here if desired
    }
  }, [isOpen, user, loading, entityId, fetchNotifications]);

  // Filter notifications
  const filteredNotifications = notifications
    .filter(n => !n.dismissedAt) // Only show non-dismissed notifications
    .filter(n => !entityId || n.entityId === entityId); // Filter by entity if provided
  
  const hasErrors = filteredNotifications.some(n => n.severity === "error");
  const hasWarnings = filteredNotifications.some(n => n.severity === "warning");

  const handleDismiss = (id: string) => {
    dismissNotification(id);
  };

  const handleDismissAll = () => {
    if (user && !loading) {
      dismissAll(user.uid);
    }
  };

  const handleRefresh = () => {
    if (user && !loading) {
      // Generate new alerts
      generateDeadlineAlerts(user.uid, entityId);
      generateComplianceAlerts(user.uid, entityId);
      
      // Then fetch all notifications
      fetchNotifications(user.uid, entityId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-lg flex flex-col animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-medium">Notifications</h2>
            {unreadCount > 0 && (
              <Badge>{unreadCount} new</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>Refresh</Button>
            <Button variant="ghost" size="sm" onClick={handleDismissAll}>Clear All</Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Alert summary banner */}
        {(hasErrors || hasWarnings) && (
          <div className={`p-3 ${hasErrors ? "bg-red-50" : "bg-amber-50"} border-b`}>
            <div className="flex items-center gap-2">
              {hasErrors ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-sm font-medium">
                {hasErrors 
                  ? "You have critical compliance issues that need attention" 
                  : "You have warnings that should be reviewed"}
              </span>
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1 p-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
              <CheckCircle className="h-10 w-10 mb-2" />
              <p>You're all caught up!</p>
              <p className="text-sm">No pending notifications</p>
            </div>
          ) : (
            <div>
              {/* Group notifications */}
              {hasErrors && (
                <div>
                  <h3 className="text-sm font-medium text-destructive mb-2">Critical</h3>
                  {filteredNotifications
                    .filter(n => n.severity === "error")
                    .map(notification => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        onDismiss={handleDismiss} 
                      />
                    ))}
                  <Separator className="my-4" />
                </div>
              )}
              
              {hasWarnings && (
                <div>
                  <h3 className="text-sm font-medium text-amber-500 mb-2">Warnings</h3>
                  {filteredNotifications
                    .filter(n => n.severity === "warning")
                    .map(notification => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        onDismiss={handleDismiss} 
                      />
                    ))}
                  <Separator className="my-4" />
                </div>
              )}
              
              {filteredNotifications.some(n => n.severity === "info") && (
                <div>
                  <h3 className="text-sm font-medium text-blue-500 mb-2">Information</h3>
                  {filteredNotifications
                    .filter(n => n.severity === "info")
                    .map(notification => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        onDismiss={handleDismiss} 
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default NotificationCenter;
