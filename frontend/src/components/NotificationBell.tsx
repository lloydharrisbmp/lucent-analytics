import React, { useState, useEffect } from "react";
import { useCurrentUser } from "app";
import { useNotificationsStore } from "utils/notificationsStore";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "components/NotificationCenter";

interface NotificationBellProps {
  entityId?: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  entityId,
  variant = "outline",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useCurrentUser();
  const { notifications, unreadCount, fetchNotifications } = useNotificationsStore();

  // Initialize notifications
  useEffect(() => {
    if (user && !loading) {
      // Fetch notifications when component mounts
      fetchNotifications(user.uid, entityId);
      
      // Set up regular refresh (every 2 minutes)
      const intervalId = setInterval(() => {
        fetchNotifications(user.uid, entityId);
      }, 2 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [user, loading, entityId, fetchNotifications]);

  // Filter notifications by entity if specified
  const relevantCount = entityId
    ? notifications.filter(n => !n.readAt && !n.dismissedAt && n.entityId === entityId).length
    : unreadCount;

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };

  return (
    <>
      {user && !loading && (
        <>
          <Button 
            variant={variant} 
            size="icon" 
            className={`relative ${className}`} 
            onClick={toggleNotifications}
          >
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            {relevantCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                variant="destructive"
              >
                {relevantCount > 9 ? "9+" : relevantCount}
              </Badge>
            )}
          </Button>
          
          <NotificationCenter 
            isOpen={isOpen} 
            onClose={closeNotifications} 
            entityId={entityId}
          />
        </>
      )}
    </>
  );
};

export default NotificationBell;
