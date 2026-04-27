import axios from "axios";
import { env } from "../../../config/env.js";
import { JobAdapter, JobSearchOptions } from "../types.js";
import { FoundJob } from "@job-auto-apply/shared";
import { logger } from "../../../utils/logger.js";

export class JSearchAdapter implements JobAdapter {
  sourceName = "jsearch";
  private apiKey = env.RAPIDAPI_KEY;
  private baseUrl = "https://jsearch.p.rapidapi.com";

  async search(options: JobSearchOptions): Promise<Partial<FoundJob>[]> {
    if (!this.apiKey) {
      logger.warn("JSearch API key missing, skipping search");
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          query: `${options.query} ${options.location || ""}`,
          page: options.page || 1,
          num_pages: 1,
          remote_jobs_only: options.remote || false,
          employment_types: options.jobTypes?.join(","),
        },
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      });

      const data = response.data.data || [];
      
      return data.map((job: any) => ({
        external_id: job.job_id,
        source: "jsearch",
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city || ""}, ${job.job_state || ""}, ${job.job_country || ""}`.trim(),
        is_remote: job.job_is_remote,
        job_type: job.job_employment_type?.toLowerCase() as any,
        description: job.job_description,
        requirements: job.job_highlights?.Qualifications?.join("\n"),
        apply_url: job.job_apply_link,
        company_logo_url: job.employer_logo,
        posted_at: job.job_posted_at_datetime_utc,
        raw_data: job,
      }));
    } catch (error) {
      logger.error("JSearch adapter error:", error);
      return [];
    }
  }
}
