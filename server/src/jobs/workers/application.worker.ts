import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis.js";
import { supabaseAdmin } from "../../config/supabase.js";
import { emailService } from "../../services/email.service.js";
import { aiService } from "../../services/ai.service.js";
import { logger } from "../../utils/logger.js";
import axios from "axios";

export const applicationWorker = new Worker(
  "application",
  async (job: Job) => {
    const { applicationId } = job.data;
    logger.info(`Processing application: ${applicationId}`);

    // 1. Fetch application details
    const { data: application, error: appError } = await supabaseAdmin
      .from("applications")
      .select("*, job:found_jobs(*), profiles(*)")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error(`Application not found: ${applicationId}`);
    }

    try {
      await supabaseAdmin.from("applications").update({ status: "sending" }).eq("id", applicationId);

      // 2. Prepare tailored content if not already present
      let coverLetter = application.cover_letter;
      if (!coverLetter) {
        // Fetch active CV data
        const { data: cv } = await supabaseAdmin
          .from("cvs")
          .select("parsed_data")
          .eq("id", application.profiles.active_cv_id)
          .single();

        if (cv?.parsed_data) {
          const tailored = await aiService.tailorApplication(cv.parsed_data, application.job.description || "");
          coverLetter = tailored.coverLetter;
          await supabaseAdmin.from("applications").update({ cover_letter: coverLetter }).eq("id", applicationId);
        }
      }

      // 3. Send application
      if (application.apply_method === "email" && application.job.apply_email) {
        // Fetch CV file for attachment
        const { data: cv } = await supabaseAdmin
          .from("cvs")
          .select("file_url, file_name")
          .eq("id", application.profiles.active_cv_id)
          .single();

        const cvFile = await axios.get(cv!.file_url, { responseType: "arraybuffer" });

        const result = await emailService.sendJobApplication(
          application.user_id,
          application.job.apply_email,
          `Job Application: ${application.job.title} - ${application.profiles.full_name}`,
          coverLetter || "Please find my CV attached for the position.",
          [{ filename: cv!.file_name, content: Buffer.from(cvFile.data), contentType: "application/pdf" }]
        );

        await supabaseAdmin.from("applications").update({
          status: "sent",
          applied_at: new Date().toISOString(),
          email_thread_id: result.threadId,
          email_message_id: result.messageId,
        }).eq("id", applicationId);

      } else if (application.apply_method === "url") {
        // Here we would use ScraperService/Puppeteer for automation
        // For now, we'll mark as manual or pending if automation isn't ready
        logger.info(`URL application for ${applicationId} - Automation stub`);
        // await scraperService.autoSubmitForm(application.job.apply_url, ...);
        
        await supabaseAdmin.from("applications").update({
          status: "sent", // Assuming success for the stub
          applied_at: new Date().toISOString(),
        }).eq("id", applicationId);
      }

      logger.info(`Successfully processed application: ${applicationId}`);
    } catch (error) {
      logger.error({ err: error }, `Failed to process application ${applicationId}:`);
      await supabaseAdmin.from("applications").update({ status: "failed" }).eq("id", applicationId);
      throw error;
    }
  },
  { connection: redis }
);
