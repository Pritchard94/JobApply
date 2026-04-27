import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { google } from "googleapis";
import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}

export async function initiateGmailOAuth(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;
  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    state: Buffer.from(JSON.stringify({ userId: user.id })).toString("base64"),
    prompt: "consent",
  });

  res.json({ url: authUrl });
}

export async function handleGmailCallback(req: Request, res: Response) {
  const { code, state } = req.query;

  if (!code || !state) {
    res.redirect(
      `${env.CLIENT_URL}/settings?gmail=error&reason=missing_params`,
    );
    return;
  }

  try {
    const { userId } = JSON.parse(
      Buffer.from(state as string, "base64").toString(),
    );
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code as string);

    if (!tokens.access_token || !tokens.refresh_token) {
      res.redirect(`${env.CLIENT_URL}/settings?gmail=error&reason=no_tokens`);
      return;
    }

    // Get the Gmail address
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });

    // Upsert tokens
    const { error } = await supabaseAdmin.from("gmail_tokens").upsert(
      {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: new Date(
          tokens.expiry_date || Date.now() + 3600 * 1000,
        ).toISOString(),
        gmail_address: profile.data.emailAddress || "",
        scopes: tokens.scope?.split(" ") || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Failed to store Gmail tokens:", error);
      res.redirect(
        `${env.CLIENT_URL}/settings?gmail=error&reason=storage_failed`,
      );
      return;
    }

    res.redirect(`${env.CLIENT_URL}/settings?gmail=success`);
  } catch (err) {
    console.error("Gmail OAuth callback error:", err);
    res.redirect(
      `${env.CLIENT_URL}/settings?gmail=error&reason=exchange_failed`,
    );
  }
}

export async function getGmailStatus(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  const { data } = await supabaseAdmin
    .from("gmail_tokens")
    .select("gmail_address, created_at")
    .eq("user_id", user.id)
    .single();

  res.json({
    connected: !!data,
    gmail_address: data?.gmail_address || null,
    connected_at: data?.created_at || null,
  });
}

export async function disconnectGmail(req: Request, res: Response) {
  const { user } = req as AuthenticatedRequest;

  await supabaseAdmin.from("gmail_tokens").delete().eq("user_id", user.id);

  res.json({ success: true });
}
