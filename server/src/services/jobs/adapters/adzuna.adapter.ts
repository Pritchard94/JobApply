import axios from "axios";
import { env } from "../../../config/env.js";
import { JobAdapter, JobSearchOptions } from "../types.js";
import { FoundJob } from "@job-auto-apply/shared";
import { logger } from "../../../utils/logger.js";

export class AdzunaAdapter implements JobAdapter {
  sourceName = "adzuna";
  private appId = env.ADZUNA_APP_ID;
  private appKey = env.ADZUNA_APP_KEY;
  private baseUrl = "https://api.adzuna.com/v1/api/jobs/gb/search"; // Default to GB, can be parameterized

  async search(options: JobSearchOptions): Promise<Partial<FoundJob>[]> {
    if (!this.appId || !this.appKey) {
      logger.warn("Adzuna credentials missing, skipping search");
      return [];
    }

    try {
      // Adzuna URL format: /search/{page}?app_id={id}&app_key={key}&what={query}&where={location}
      const response = await axios.get(`${this.baseUrl}/${options.page || 1}`, {
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          what: options.query,
          where: options.location,
          results_per_page: options.limit || 20,
          content_type: "application/json",
        },
      });

      const data = response.data.results || [];

      return data.map((job: any) => ({
        external_id: job.id,
        source: "adzuna",
        title: job.title,
        company: job.company?.display_name,
        location: job.location?.display_name,
        is_remote: job.title.toLowerCase().includes("remote") || job.description.toLowerCase().includes("remote"),
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_currency: "GBP", // Default for /gb/ search
        description: job.description,
        apply_url: job.redirect_url,
        posted_at: job.created,
        raw_data: job,
      }));
    } catch (error) {
      logger.error({ err: error }, "Adzuna adapter error:");
      return [];
    }
  }
}
