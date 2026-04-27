export const APPLICATION_STATUS = {
  PENDING: "pending",
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
  INTERVIEW: "interview",
  REJECTED: "rejected",
  OFFER: "offer",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const JOB_TYPE = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
  FREELANCE: "freelance",
} as const;

export type JobType = (typeof JOB_TYPE)[keyof typeof JOB_TYPE];

export const APPLY_METHOD = {
  EMAIL: "email",
  URL: "url",
  FORM: "form",
  MANUAL: "manual",
  UNKNOWN: "unknown",
} as const;

export type ApplyMethod = (typeof APPLY_METHOD)[keyof typeof APPLY_METHOD];

export const JOB_SOURCE = {
  JSEARCH: "jsearch",
  ADZUNA: "adzuna",
  THE_MUSE: "the_muse",
  SCRAPED_LINKEDIN: "scraped_linkedin",
  SCRAPED_INDEED: "scraped_indeed",
} as const;

export type JobSource = (typeof JOB_SOURCE)[keyof typeof JOB_SOURCE];

export const CV_PARSE_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CVParseStatus =
  (typeof CV_PARSE_STATUS)[keyof typeof CV_PARSE_STATUS];

export const SEARCH_FREQUENCY = {
  DAILY: "daily",
  TWICE_DAILY: "twice_daily",
  WEEKLY: "weekly",
} as const;

export type SearchFrequency =
  (typeof SEARCH_FREQUENCY)[keyof typeof SEARCH_FREQUENCY];

export const NOTIFICATION_TYPE = {
  APPLICATION_SENT: "application_sent",
  RESPONSE_RECEIVED: "response_received",
  NEW_MATCHES: "new_matches",
  DAILY_SUMMARY: "daily_summary",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const EVENT_TYPE = {
  CREATED: "created",
  SENT: "sent",
  OPENED: "opened",
  REPLIED: "replied",
  STATUS_CHANGED: "status_changed",
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
