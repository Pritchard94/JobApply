"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user";
import { api } from "@/lib/api";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const profile = useUserStore((s) => s.profile);
  const session = useUserStore((s) => s.session);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.access_token) return;

    async function fetchNotifications() {
      try {
        // Assuming there is an endpoint for unread count or just list all
        const res = await api<any>("/notifications", { token: session?.access_token });
        // Assuming the response has a list of notifications
        const unread = res.filter((n: any) => !n.read_at).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    fetchNotifications();
    // Refresh every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-md px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      {/* Notification bell */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* User avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium leading-none">
            {profile?.full_name || "User"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {profile?.email || ""}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-primary-foreground">
          {(profile?.full_name || profile?.email || "U").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
