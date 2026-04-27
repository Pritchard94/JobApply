import { google } from "googleapis";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { supabaseAdmin } from "../config/supabase.js";

export class EmailService {
  private oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );

  /**
   * Sends an email via Gmail API using the user's OAuth tokens
   */
  async sendJobApplication(
    userId: string,
    to: string,
    subject: string,
    body: string,
    attachments: Array<{ filename: string; content: Buffer | string; contentType: string }> = []
  ) {
    try {
      // 1. Get user's Gmail tokens
      const { data: tokens, error } = await supabaseAdmin
        .from("gmail_tokens")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !tokens) {
        throw new Error("Gmail tokens not found for user");
      }

      // 2. Set credentials and refresh if needed
      this.oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: new Date(tokens.token_expiry).getTime(),
      });

      // Google handles refresh automatically if refresh_token is set
      const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

      // 3. Construct MIME message
      const boundary = "boundary_" + Date.now().toString(16);
      const nl = "\r\n";
      
      let rawMessage = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: 7bit",
        "",
        body,
        "",
      ].join(nl);

      for (const attachment of attachments) {
        const contentBase64 = Buffer.isBuffer(attachment.content) 
          ? attachment.content.toString("base64") 
          : Buffer.from(attachment.content).toString("base64");

        rawMessage += [
          `--${boundary}`,
          `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
          "Content-Transfer-Encoding: base64",
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          "",
          contentBase64,
          "",
        ].join(nl);
      }

      rawMessage += `--${boundary}--`;

      const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // 4. Send
      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      return {
        messageId: res.data.id,
        threadId: res.data.threadId,
      };
    } catch (error) {
      logger.error({ err: error }, "Error sending email via Gmail:");
      throw error;
    }
  }
}

export const emailService = new EmailService();
