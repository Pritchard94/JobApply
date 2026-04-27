import { FoundJob, SearchProfile } from "@job-auto-apply/shared";
import { JobAdapter, JobSearchOptions } from "./types.js";
import { JSearchAdapter } from "./adapters/jsearch.adapter.js";
import { AdzunaAdapter } from "./adapters/adzuna.adapter.js";
import { TheMuseAdapter } from "./adapters/themuse.adapter.js";
import { logger } from "../../utils/logger.js";
import crypto from "crypto";

export class JobSearchService {
  private adapters: JobAdapter[] = [
    new JSearchAdapter(),
    new AdzunaAdapter(),
    new TheMuseAdapter(),
  ];

  /**
   * Run a search across all adapters based on a search profile
   */
  async searchForProfile(profile: SearchProfile): Promise<Partial<FoundJob>[]> {
    const allJobs: Partial<FoundJob>[] = [];
    
    // Create search tasks for each combination of titles and locations
    const searchOptions: JobSearchOptions[] = [];
    for (const title of profile.job_titles) {
      if (profile.locations.length > 0) {
        for (const loc of profile.locations) {
          searchOptions.push({
            query: title,
            location: loc,
            remote: profile.remote_only,
          });
        }
      } else {
        searchOptions.push({
          query: title,
          remote: profile.remote_only,
        });
      }
    }

    // Limit the number of search variations to avoid rate limits
    const limitedOptions = searchOptions.slice(0, 5);

    for (const options of limitedOptions) {
      const results = await Promise.all(
        this.adapters.map(async (adapter) => {
          try {
            return await adapter.search(options);
          } catch (error) {
            logger.error(`Adapter ${adapter.sourceName} failed:`, error);
            return [];
          }
        })
      );

      allJobs.push(...results.flat());
    }

    // Deduplicate jobs by external_id and source, or by title/company
    return this.deduplicateJobs(allJobs);
  }

  private deduplicateJobs(jobs: Partial<FoundJob>[]): Partial<FoundJob>[] {
    const seen = new Set<string>();
    const unique: Partial<FoundJob>[] = [];

    for (const job of jobs) {
      // Create a hash for deduplication
      const dedupHash = job.dedup_hash || this.createDedupHash(job);
      
      if (!seen.has(dedupHash)) {
        seen.add(dedupHash);
        unique.push({ ...job, dedup_hash: dedupHash });
      }
    }

    return unique;
  }

  private createDedupHash(job: Partial<FoundJob>): string {
    const data = `${job.title}-${job.company}-${job.location}`.toLowerCase().replace(/\s/g, "");
    return crypto.createHash("md5").update(data).digest("hex");
  }
}

export const jobSearchService = new JobSearchService();
