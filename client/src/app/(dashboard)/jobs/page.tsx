"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Star,
  X,
  Search,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { useUserStore } from "@/store/user";
import { useNotificationStore } from "@/store/notification";
import { api } from "@/lib/api";

interface JobMatch {
  id: string;
  job_id: string;
  match_score: number;
  found_jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    job_type: string;
    source: string;
    url: string;
    posted_at: string;
  };
}

export default function JobsPage() {
  const [filter, setFilter] = useState("");
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const session = useUserStore((s) => s.session);

  useEffect(() => {
    if (!session?.access_token) return;
    fetchJobs();
  }, [session]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await api<{ data: JobMatch[] }>("/jobs", {
        token: session?.access_token,
      });
      setJobs(res.data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId: string) {
    if (!session?.access_token) return;
    setActionLoading(jobId);
    try {
      await api(`/jobs/${jobId}/apply`, {
        method: "POST",
        token: session.access_token,
      });
      useNotificationStore.getState().showSuccess("Application queued successfully!");
    } catch (error: any) {
      // Handled by api utility
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDismiss(jobId: string) {
    if (!session?.access_token) return;
    try {
      await api(`/jobs/${jobId}/dismiss`, {
        method: "POST",
        token: session.access_token,
      });
      setJobs(jobs.filter((j) => j.job_id !== jobId));
    } catch (error) {
      console.error("Failed to dismiss job:", error);
    }
  }

  function getScoreClass(score: number) {
    if (score >= 0.8) return "text-success border-success bg-success/10";
    if (score >= 0.5) return "text-warning border-warning bg-warning/10";
    return "text-destructive border-destructive bg-destructive/10";
  }

  const filteredJobs = jobs.filter((match) => {
    const searchStr = filter.toLowerCase();
    const job = match.found_jobs;
    return (
      job.title.toLowerCase().includes(searchStr) ||
      job.company.toLowerCase().includes(searchStr) ||
      job.location.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Matches</h1>
        <p className="text-muted-foreground mt-1">
          Jobs found matching your search profiles, ranked by AI
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company, or location..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Score Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">Match score:</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-success" /> 80%+
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-warning" />{" "}
          50-79%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-destructive" />{" "}
          &lt;50%
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 w-full animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No job matches yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Create a search profile and trigger a search to start finding
              matching jobs
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((match) => {
            const job = match.found_jobs;
            return (
              <Card
                key={match.id}
                className="hover:shadow-elegant hover:border-primary/20 transition-all group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {job.source}
                    </Badge>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getScoreClass(match.match_score)}`}
                    >
                      <Star className="h-3 w-3" />
                      {Math.round(match.match_score * 100)}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" /> {job.company}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary" className="text-xs">
                      {job.job_type || "N/A"}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => handleApply(job.id)}
                      disabled={actionLoading === job.id}
                    >
                      {actionLoading === job.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(job.url, "_blank")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDismiss(job.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
