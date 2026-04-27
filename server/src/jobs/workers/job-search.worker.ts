import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis.js";
import { supabaseAdmin } from "../../config/supabase.js";
import { jobSearchService } from "../../services/jobs/job-search.service.js";
import { aiService } from "../../services/ai.service.js";
import { logger } from "../../utils/logger.js";
import { SearchProfile, CV } from "@job-auto-apply/shared";

export const jobSearchWorker = new Worker(
  "job-search",
  async (job: Job) => {
    const { profileId } = job.data;
    logger.info(`Starting job search for profile: ${profileId}`);

    // 1. Fetch search profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("search_profiles")
      .select("*, profiles(*)")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    // 2. Run search
    const foundJobs = await jobSearchService.searchForProfile(profile as SearchProfile);
    logger.info(`Found ${foundJobs.length} potential jobs for profile ${profileId}`);

    // 3. Upsert jobs into found_jobs table
    const { data: insertedJobs, error: upsertError } = await supabaseAdmin
      .from("found_jobs")
      .upsert(foundJobs, { onConflict: "dedup_hash" })
      .select();

    if (upsertError) {
      logger.error({ err: upsertError }, "Error upserting jobs:");
      return;
    }

    // 4. Match analysis for new/relevant jobs
    // Get active CV for the user
    const { data: cv } = await supabaseAdmin
      .from("cvs")
      .select("*")
      .eq("id", profile.profiles.active_cv_id)
      .single();

    if (!cv || !cv.parsed_data) {
      logger.warn(`No active parsed CV found for user ${profile.user_id}, skipping matching`);
      return;
    }

    for (const foundJob of insertedJobs || []) {
      // Check if match already exists
      const { data: existingMatch } = await supabaseAdmin
        .from("job_matches")
        .select("id")
        .eq("search_profile_id", profileId)
        .eq("job_id", foundJob.id)
        .single();

      if (existingMatch) continue;

      // Perform AI matching
      const matchResult = await aiService.matchJob(cv.parsed_data, foundJob.description || "");

      // Save match
      await supabaseAdmin.from("job_matches").insert({
        search_profile_id: profileId,
        job_id: foundJob.id,
        user_id: profile.user_id,
        match_score: matchResult.score,
        match_reasoning: matchResult.reasoning,
      });

      // If score is high and auto-apply is enabled, queue application
      if (matchResult.score >= 80 && profile.profiles.auto_apply_enabled) {
        logger.info(`High match score (${matchResult.score}) for job ${foundJob.id}, queueing auto-apply`);
        // We'll implement the application queue next
      }
    }

    // Update last_searched_at
    await supabaseAdmin
      .from("search_profiles")
      .update({ last_searched_at: new Date().toISOString() })
      .eq("id", profileId);
  },
  { connection: redis }
);
