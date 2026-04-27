import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

export async function listJobs(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = (page - 1) * limit;
  const minScore = parseFloat(req.query.min_score as string) || 0;

  // Get matched jobs for this user
  const {
    data: matches,
    error,
    count,
  } = await supabaseAdmin
    .from("job_matches")
    .select("*, found_jobs(*)", { count: "exact" })
    .eq("user_id", user.id)
    .eq("is_dismissed", false)
    .gte("match_score", minScore)
    .order("match_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
    return;
  }

  res.json({
    data: matches,
    total: count || 0,
    page,
    limit,
    has_more: (count || 0) > offset + limit,
  });
}

export async function getJob(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("job_matches")
    .select("*, found_jobs(*)")
    .eq("job_id", req.params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    // Try direct found_jobs lookup
    const { data: job } = await supabaseAdmin
      .from("found_jobs")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json({ job, match: null });
    return;
  }

  res.json(data);
}

export async function dismissJob(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { error } = await supabaseAdmin
    .from("job_matches")
    .update({ is_dismissed: true })
    .eq("job_id", req.params.id)
    .eq("user_id", user.id);

  if (error) {
    res.status(500).json({ error: "Failed to dismiss job" });
    return;
  }

  res.json({ success: true });
}

export async function applyToJob(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const jobId = req.params.id;

  // Check if already applied
  const { data: existing } = await supabaseAdmin
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .single();

  if (existing) {
    res.status(409).json({ error: "Already applied to this job" });
    return;
  }

  // Check Gmail is connected
  const { data: gmailToken } = await supabaseAdmin
    .from("gmail_tokens")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!gmailToken) {
    res
      .status(400)
      .json({
        error: "Gmail not connected. Please connect your Gmail in settings.",
      });
    return;
  }

  // Create pending application
  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .insert({
      user_id: user.id,
      job_id: jobId,
      status: "pending",
      apply_method: "email",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to create application" });
    return;
  }

  // TODO: Enqueue apply job with BullMQ
  // await applyQueue.add('apply', { applicationId: application.id, userId: user.id, jobId });

  res.status(201).json(application);
}

export async function getJobStats(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { count: totalMatches } = await supabaseAdmin
    .from("job_matches")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_dismissed", false);

  const { count: highMatches } = await supabaseAdmin
    .from("job_matches")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_dismissed", false)
    .gte("match_score", 0.7);

  res.json({
    total_matches: totalMatches || 0,
    high_matches: highMatches || 0,
  });
}
