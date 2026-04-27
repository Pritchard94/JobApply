"use client";

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
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Total Applications",
    value: "0",
    icon: FileText,
    change: "+0 today",
  },
  { label: "Applications Sent", value: "0", icon: Send, change: "0 pending" },
  {
    label: "Interviews",
    value: "0",
    icon: MessageSquare,
    change: "0 scheduled",
  },
  { label: "Offers", value: "0", icon: Trophy, change: "Keep going!" },
];

export default function DashboardPage() {
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
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload Your CV",
                desc: "Upload a PDF of your resume",
                href: "/profile",
                done: false,
              },
              {
                step: "2",
                title: "Create Search Profile",
                desc: "Define your ideal job criteria",
                href: "/search-profiles",
                done: false,
              },
              {
                step: "3",
                title: "Connect Gmail",
                desc: "Allow sending applications via your email",
                href: "/settings",
                done: false,
              },
            ].map((item) => (
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
