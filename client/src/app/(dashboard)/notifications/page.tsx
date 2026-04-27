"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Briefcase, Mail, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  // Placeholder - will be populated from real-time data
  const notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    created_at: string;
  }> = [];

  const iconMap: Record<string, typeof Bell> = {
    application_sent: Mail,
    response_received: CheckCircle,
    new_matches: Briefcase,
    daily_summary: Bell,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated on your application progress
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Notifications will appear here when applications are sent,
              responses are received, or new matches are found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <Card
                key={notif.id}
                className={
                  !notif.read ? "border-primary/20 bg-primary/[0.02]" : ""
                }
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{notif.title}</h3>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notif.body}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
