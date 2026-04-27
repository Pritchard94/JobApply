import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis.js";
import { supabaseAdmin } from "../../config/supabase.js";
import { aiService } from "../../services/ai.service.js";
import { extractTextFromFile } from "../../utils/file-parser.js";
import { logger } from "../../utils/logger.js";
import axios from "axios";

export const cvParseWorker = new Worker(
  "cv-parse",
  async (job: Job) => {
    const { cvId } = job.data;
    logger.info(`Starting CV parsing for ID: ${cvId}`);

    // 1. Fetch CV details
    const { data: cv, error: cvError } = await supabaseAdmin
      .from("cvs")
      .select("*")
      .eq("id", cvId)
      .single();

    if (cvError || !cv) {
      throw new Error(`CV not found: ${cvId}`);
    }

    try {
      await supabaseAdmin.from("cvs").update({ parse_status: "processing" }).eq("id", cvId);

      // 2. Download file from storage
      const response = await axios.get(cv.file_url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);

      // 3. Extract text
      // We'll guess the mime type from extension if not stored
      const ext = cv.file_name.split(".").pop()?.toLowerCase();
      let mimeType = "application/pdf";
      if (ext === "docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      if (ext === "txt") mimeType = "text/plain";

      const text = await extractTextFromFile(buffer, mimeType);

      // 4. Parse with AI
      const parsedData = await aiService.parseCV(text);

      // 5. Update CV with parsed data
      await supabaseAdmin
        .from("cvs")
        .update({
          parsed_data: parsedData,
          parse_status: "completed",
        })
        .eq("id", cvId);

      // Update profile with extracted info if it's primary or profile is empty
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", cv.user_id)
        .single();

      if (profile && (!profile.full_name || cv.is_primary)) {
        await supabaseAdmin
          .from("profiles")
          .update({
            full_name: parsedData.personalInfo.fullName,
            email: parsedData.personalInfo.email,
            phone: parsedData.personalInfo.phone,
            location: parsedData.personalInfo.location,
            active_cv_id: cvId,
          })
          .eq("id", cv.user_id);
      }

      logger.info(`Successfully parsed CV: ${cvId}`);
    } catch (error) {
      logger.error({ err: error }, `Failed to parse CV ${cvId}:`);
      await supabaseAdmin.from("cvs").update({ parse_status: "failed" }).eq("id", cvId);
      throw error;
    }
  },
  { connection: redis }
);
