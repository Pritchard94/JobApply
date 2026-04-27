import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

export async function listApplications(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;

  let query = supabaseAdmin
    .from("applications")
    .select("*, found_jobs(*)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
    return;
  }

  res.json({
    data,
    total: count || 0,
    page,
    limit,
    has_more: (count || 0) > offset + limit,
  });
}

export async function getApplication(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("applications")
    .select("*, found_jobs(*), application_events(*)")
    .eq("id", req.params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(data);
}

export async function updateApplicationStatus(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { status } = req.body;
  const validStatuses = [
    "pending",
    "sending",
    "sent",
    "failed",
    "interview",
    "rejected",
    "offer",
  ];

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  // Get current status
  const { data: current } = await supabaseAdmin
    .from("applications")
    .select("status")
    .eq("id", req.params.id)
    .eq("user_id", user.id)
    .single();

  if (!current) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  // Update status
  const { data, error } = await supabaseAdmin
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to update status" });
    return;
  }

  // Log event
  await supabaseAdmin.from("application_events").insert({
    application_id: req.params.id,
    event_type: "status_changed",
    old_status: current.status,
    new_status: status,
  });

  res.json(data);
}

export async function updateApplicationNotes(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { notes } = req.body;

  const { data, error } = await supabaseAdmin
    .from("applications")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(data);
}

export async function getApplicationStats(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("applications")
    .select("status")
    .eq("user_id", user.id);

  if (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
    return;
  }

  const stats = {
    total: data.length,
    pending: data.filter((a) => a.status === "pending").length,
    sent: data.filter((a) => a.status === "sent").length,
    interview: data.filter((a) => a.status === "interview").length,
    rejected: data.filter((a) => a.status === "rejected").length,
    offer: data.filter((a) => a.status === "offer").length,
    failed: data.filter((a) => a.status === "failed").length,
  };

  res.json(stats);
}
