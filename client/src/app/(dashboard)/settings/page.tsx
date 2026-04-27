"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Shield,
  Bell,
  BellOff,
  Zap,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailAddress, setGmailAddress] = useState("");
  const [autoApply, setAutoApply] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Check URL params for Gmail OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "success") {
      setGmailConnected(true);
      // Clean URL
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  async function connectGmail() {
    // TODO: Call backend to get Gmail OAuth URL
    // const { url } = await api('/auth/gmail', { token });
    // window.location.href = url;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, email connection, and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gmail Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Gmail Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Gmail to send job applications through your own email
              address.
            </p>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              {gmailConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Connected</p>
                    <p className="text-xs text-muted-foreground">
                      {gmailAddress || "your@gmail.com"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGmailConnected(false)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Not connected</p>
                    <p className="text-xs text-muted-foreground">
                      Required for auto-apply
                    </p>
                  </div>
                  <Button size="sm" onClick={connectGmail}>
                    Connect Gmail
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-accent/50 p-3">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                We only request permission to send emails and read replies. Your
                credentials are encrypted and stored securely. You can
                disconnect at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Apply Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Auto-Apply
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When enabled, high-scoring job matches will be automatically
              applied to on your behalf.
            </p>
            <div
              className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => setAutoApply(!autoApply)}
            >
              <div>
                <p className="text-sm font-medium">Auto-Apply</p>
                <p className="text-xs text-muted-foreground">
                  Automatically apply to jobs with 70%+ match score
                </p>
              </div>
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoApply ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-primary-foreground transition-transform ${autoApply ? "translate-x-6" : "translate-x-1"}`}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Daily Application Limit: {dailyLimit}
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
            <Button className="w-full">Save Settings</Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  key: "app_sent",
                  label: "Application Sent",
                  desc: "When an application is submitted",
                },
                {
                  key: "response",
                  label: "Response Received",
                  desc: "When a company replies to your application",
                },
                {
                  key: "matches",
                  label: "New Matches",
                  desc: "When new high-scoring jobs are found",
                },
                {
                  key: "summary",
                  label: "Daily Summary",
                  desc: "A daily recap of your job search activity",
                },
              ].map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Bell className="h-3 w-3" /> Push
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Enable Push */}
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pushEnabled
                      ? "You will receive push notifications on this device"
                      : "Enable push notifications to get real-time updates"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={pushEnabled ? "outline" : "default"}
                  onClick={() => setPushEnabled(!pushEnabled)}
                >
                  {pushEnabled ? (
                    <>
                      <BellOff className="h-3.5 w-3.5" /> Disable
                    </>
                  ) : (
                    <>
                      <Bell className="h-3.5 w-3.5" /> Enable
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
