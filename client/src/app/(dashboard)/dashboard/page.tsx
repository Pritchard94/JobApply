"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Send,
  MessageSquare,
  Trophy,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/store/user";
import { api } from "@/lib/api";

interface AppStats {
  total: number;
  pending: number;
  sent: number;
  interview: number;
  offer: number;
}

interface JobStats {
  total_matches: number;
  high_matches: number;
}

interface SetupStatus {
  hasCv: boolean;
  hasProfile: boolean;
  hasGmail: boolean;
}

export default function DashboardPage() {
  const session = useUserStore((s) => s.session);
  const [appStats, setAppStats] = useState<AppStats | null>(null);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [setup, setSetup] = useState<SetupStatus>({
    hasCv: false,
    hasProfile: false,
    hasGmail: false,
  });

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;

    // Load data independently to avoid blocking the whole UI
    api<AppStats>("/applications/stats", { token })
      .then(setAppStats)
      .catch(() => {});

    api<JobStats>("/jobs/stats", { token })
      .then(setJobStats)
      .catch(() => {});

    // For setup steps, we check multiple things
    Promise.all([
      api<any[]>("/cv", { token }).catch(() => []),
      api<any[]>("/profiles", { token }).catch(() => []),
      api<{ connected: boolean }>("/auth/gmail/status", { token }).catch(() => ({
        connected: false,
      })),
    ]).then(([cvs, profiles, gmail]) => {
      setSetup({
        hasCv: Array.isArray(cvs) && cvs.length > 0,
        hasProfile: Array.isArray(profiles) && profiles.length > 0,
        hasGmail: !!gmail?.connected,
      });
    });
  }, [session]);

  const stats = [
    {
      label: "Total Applications",
      value: appStats?.total ?? "—",
      icon: FileText,
      change: appStats ? `${appStats.pending} pending` : "Loading...",
    },
    {
      label: "Applications Sent",
      value: appStats?.sent ?? "—",
      icon: Send,
      change: appStats ? `${appStats.pending} pending` : "Loading...",
    },
    {
      label: "Interviews",
      value: appStats?.interview ?? "—",
      icon: MessageSquare,
      change: jobStats ? `${jobStats.high_matches} high matches` : "Loading...",
    },
    {
      label: "Offers",
      value: appStats?.offer ?? "—",
      icon: Trophy,
      change:
        appStats && appStats.offer > 0 ? "🎉 Congratulations!" : "Keep going!",
    },
  ];

  const setupSteps = [
    {
      step: "1",
      title: "Upload Your CV",
      desc: "Upload a PDF of your resume",
      href: "/profile",
      done: setup.hasCv,
    },
    {
      step: "2",
      title: "Create Search Profile",
      desc: "Define your ideal job criteria",
      href: "/search-profiles",
      done: setup.hasProfile,
    },
    {
      step: "3",
      title: "Connect Gmail",
      desc: "Allow sending applications via your email",
      href: "/settings",
      done: setup.hasGmail,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your job search progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="hover:shadow-elegant transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload your CV and create a search profile to get started
              </p>
              <Link
                href="/profile"
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Upload your CV <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Top Job Matches
              {jobStats && jobStats.total_matches > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {jobStats.total_matches} found
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobStats && jobStats.total_matches > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {jobStats.high_matches} high-scoring matches (70%+) waiting for you.
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View all matches <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No matches yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a search profile to start finding jobs
                </p>
                <Link
                  href="/search-profiles"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Create search profile <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {setupSteps.map((item) => (
              <Link key={item.step} href={item.href}>
                <div className="rounded-lg border p-4 hover:border-primary/30 hover:bg-accent/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {item.step}
                    </span>
                    <Badge variant={item.done ? "success" : "pending"}>
                      {item.done ? "Done" : "Pending"}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
