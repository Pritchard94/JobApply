import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

export async function uploadCV(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const fileName = `${user.id}/${Date.now()}-${file.originalname}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from("cvs")
    .upload(fileName, file.buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("CV upload error:", uploadError);
    res.status(500).json({ error: "Failed to upload CV" });
    return;
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("cvs")
    .getPublicUrl(fileName);

  // Create CV record
  const { data, error } = await supabaseAdmin
    .from("cvs")
    .insert({
      user_id: user.id,
      file_name: file.originalname,
      storage_path: fileName,
      file_url: urlData.publicUrl,
      parse_status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("CV record creation error:", error);
    res.status(500).json({ error: "Failed to create CV record" });
    return;
  }

  // TODO: Enqueue CV parse job with BullMQ
  // await cvParseQueue.add('parse', { cvId: data.id, userId: user.id });

  res.status(201).json(data);
}

export async function listCVs(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data, error } = await supabaseAdmin
    .from("cvs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: "Failed to fetch CVs" });
    return;
  }

  res.json(data);
}

export async function getCV(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("cvs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "CV not found" });
    return;
  }

  res.json(data);
}

export async function deleteCV(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { id } = req.params;

  // Get the CV to find storage path
  const { data: cv } = await supabaseAdmin
    .from("cvs")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    res.status(404).json({ error: "CV not found" });
    return;
  }

  // Delete from storage
  await supabaseAdmin.storage.from("cvs").remove([cv.storage_path]);

  // Delete record
  await supabaseAdmin.from("cvs").delete().eq("id", id).eq("user_id", user.id);

  res.json({ success: true });
}

export async function setPrimaryCV(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const { id } = req.params;

  // Verify CV belongs to user
  const { data: cv } = await supabaseAdmin
    .from("cvs")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    res.status(404).json({ error: "CV not found" });
    return;
  }

  // Unset all other CVs as primary
  await supabaseAdmin
    .from("cvs")
    .update({ is_primary: false })
    .eq("user_id", user.id);

  // Set this one as primary
  await supabaseAdmin.from("cvs").update({ is_primary: true }).eq("id", id);

  // Update active_cv_id in profile
  await supabaseAdmin
    .from("profiles")
    .update({ active_cv_id: id, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  res.json({ success: true });
}
