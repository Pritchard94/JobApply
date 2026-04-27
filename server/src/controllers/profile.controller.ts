import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

export async function createProfile(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("search_profiles")
    .insert({ ...req.body, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ error: "Failed to create search profile" });
    return;
  }

  res.status(201).json(data);
}

export async function listProfiles(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("search_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: "Failed to fetch profiles" });
    return;
  }

  res.json(data);
}

export async function getProfile(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("search_profiles")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(data);
}

export async function updateProfile(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("search_profiles")
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(data);
}

export async function deleteProfile(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { error } = await supabaseAdmin
    .from("search_profiles")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", user.id);

  if (error) {
    res.status(500).json({ error: "Failed to delete profile" });
    return;
  }

  res.json({ success: true });
}

export async function triggerSearch(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data: profile } = await supabaseAdmin
    .from("search_profiles")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  // TODO: Enqueue job search with BullMQ
  // await jobSearchQueue.add('search', { searchProfileId: profile.id, userId: user.id });

  res.json({ message: "Search job queued", profile_id: profile.id });
}
