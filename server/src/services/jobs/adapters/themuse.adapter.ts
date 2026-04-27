import axios from "axios";
import { JobAdapter, JobSearchOptions } from "../types.js";
import { FoundJob } from "@job-auto-apply/shared";
import { logger } from "../../../utils/logger.js";

export class TheMuseAdapter implements JobAdapter {
  sourceName = "themuse";
  private baseUrl = "https://www.themuse.com/api/public/jobs";

  async search(options: JobSearchOptions): Promise<Partial<FoundJob>[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          category: options.query,
          location: options.location,
          page: (options.page || 1) - 1, // The Muse uses 0-based indexing for pages
          api_key: "", // Public API doesn't strictly require key for low volume
        },
      });

      const data = response.data.results || [];

      return data.map((job: any) => ({
        external_id: job.id.toString(),
        source: "themuse",
        title: job.name,
        company: job.company?.name,
        location: job.locations?.[0]?.name,
        is_remote: job.locations?.some((l: any) => l.name.toLowerCase().includes("remote")),
        description: job.contents,
        apply_url: job.refs?.landing_page,
        posted_at: job.publication_date,
        raw_data: job,
      }));
    } catch (error) {
      logger.error({ err: error }, "The Muse adapter error:");
      return [];
    }
  }
}
