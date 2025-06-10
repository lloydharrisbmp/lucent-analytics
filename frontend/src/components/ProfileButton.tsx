import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "app";
import { toast } from "sonner";
import { useAuthStore } from "utils/authStore";

export interface Props {
  user: User;
}

export const ProfileButton = ({ user }: Props) => {
  const navigate = useNavigate();
  const { userData, fetchUserData } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Fetch user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      await fetchUserData(user);
      setIsLoading(false);
    };
    
    loadUserData();
  }, [user, fetchUserData]);
  
  const handleSignOut = async () => {
    try {
      await firebaseAuth.signOut();
      toast.success("You have been signed out");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <Skeleton className="h-10 w-10 rounded-full" />
    );
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0" aria-label="User menu">
          <Avatar>
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.displayName || user.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{userData?.email || user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          setIsDropdownOpen(false);
          navigate("/dashboard");
        }}>Dashboard</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setIsDropdownOpen(false);
          navigate("/profile");
        }}>Profile Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setIsDropdownOpen(false);
          navigate("/settings");
        }}>Account Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          setIsDropdownOpen(false);
          handleSignOut();
        }}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

