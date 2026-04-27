import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

export async function subscribePush(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { endpoint, p256dh_key, auth_key, user_agent } = req.body;

  if (!endpoint || !p256dh_key || !auth_key) {
    res.status(400).json({ error: "Missing push subscription fields" });
    return;
  }

  const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh_key,
      auth_key,
      user_agent: user_agent || null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    res.status(500).json({ error: "Failed to save subscription" });
    return;
  }

  res.status(201).json({ success: true });
}

export async function unsubscribePush(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { endpoint } = req.body;

  if (!endpoint) {
    res.status(400).json({ error: "Missing endpoint" });
    return;
  }

  await supabaseAdmin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  res.json({ success: true });
}

export async function getPreferences(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  let { data } = await supabaseAdmin
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Create defaults if not exists
  if (!data) {
    const { data: created } = await supabaseAdmin
      .from("notification_preferences")
      .insert({ user_id: user.id })
      .select()
      .single();
    data = created;
  }

  res.json(data);
}

export async function updatePreferences(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const allowedFields = [
    "notify_application_sent",
    "notify_response_received",
    "notify_new_matches",
    "notify_daily_summary",
    "email_notifications",
    "push_notifications",
    "quiet_hours_start",
    "quiet_hours_end",
  ];

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const { data, error } = await supabaseAdmin
    .from("notification_preferences")
    .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to update preferences" });
    return;
  }

  res.json(data);
}
