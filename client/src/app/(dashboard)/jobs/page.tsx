"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

export default function JobsPage() {
  const [filter, setFilter] = useState("");

  // Placeholder - will be populated from API
  const jobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    match_score: number;
    job_type: string;
    source: string;
    posted_at: string;
  }> = [];

  function getScoreClass(score: number) {
    if (score >= 0.8) return "score-high";
    if (score >= 0.5) return "score-medium";
    return "score-low";
  }

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

      {jobs.length === 0 ? (
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
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-elegant hover:border-primary/20 transition-all group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {job.source}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getScoreClass(job.match_score)}`}
                  >
                    <Star className="h-3 w-3" />
                    {Math.round(job.match_score * 100)}%
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
                    {job.job_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {job.posted_at}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    Apply
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
