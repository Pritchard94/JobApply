import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

export async function getSettings(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(data);
}

export async function updateSettings(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const allowedFields = [
    "full_name",
    "phone",
    "location",
    "linkedin_url",
    "portfolio_url",
    "years_of_experience",
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
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to update settings" });
    return;
  }

  res.json(data);
}

export async function updateAutoApply(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { auto_apply_enabled, daily_apply_limit } = req.body;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof auto_apply_enabled === "boolean") {
    updates.auto_apply_enabled = auto_apply_enabled;
  }
  if (
    typeof daily_apply_limit === "number" &&
    daily_apply_limit >= 1 &&
    daily_apply_limit <= 50
  ) {
    updates.daily_apply_limit = daily_apply_limit;
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to update auto-apply settings" });
    return;
  }

  res.json(data);
}
