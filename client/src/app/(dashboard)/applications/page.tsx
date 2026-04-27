"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  Calendar,
  ChevronRight,
  Filter,
} from "lucide-react";

type Status = "all" | "pending" | "sent" | "interview" | "rejected" | "offer";

const statusVariantMap: Record<
  string,
  "pending" | "success" | "warning" | "destructive" | "offer"
> = {
  pending: "pending",
  sending: "pending",
  sent: "success",
  interview: "warning",
  rejected: "destructive",
  offer: "offer",
  failed: "destructive",
};

const statusFilters: { value: Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState<Status>("all");

  // Placeholder - will be populated from API
  const applications: Array<{
    id: string;
    status: string;
    job: { title: string; company: string };
    applied_at: string | null;
    created_at: string;
  }> = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track all your job applications and their status
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={activeFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No applications yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              When you apply to jobs, they will appear here with real-time
              status tracking
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="hover:shadow-card hover:border-primary/10 transition-all"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {app.job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {app.job.company}
                  </p>
                </div>
                <Badge variant={statusVariantMap[app.status] || "pending"}>
                  {app.status}
                </Badge>
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {app.applied_at
                    ? new Date(app.applied_at).toLocaleDateString()
                    : "Pending"}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
