import { FoundJob, SearchProfile } from "@job-auto-apply/shared";

export interface JobSearchOptions {
  query: string;
  location?: string;
  remote?: boolean;
  jobTypes?: string[];
  limit?: number;
  page?: number;
}

export interface JobAdapter {
  sourceName: string;
  search(options: JobSearchOptions): Promise<Partial<FoundJob>[]>;
}

export interface SearchProfileToOptions {
  (profile: SearchProfile): JobSearchOptions[];
}
