import type {
  ApplicationStatus,
  ApplyMethod,
  CVParseStatus,
  JobSource,
  JobType,
  SearchFrequency,
  EventType,
} from "./constants";

// ──── User / Profile ────

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_of_experience: number | null;
  active_cv_id: string | null;
  auto_apply_enabled: boolean;
  daily_apply_limit: number;
  created_at: string;
  updated_at: string;
}

// ──── CV ────

export interface ParsedCVData {
  summary: string;
  skills: string[];
  experience: {
    company: string;
    title: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  certifications: string[];
  raw_text: string;
}

export interface CV {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_url: string;
  parsed_data: ParsedCVData | null;
  parse_status: CVParseStatus;
  is_primary: boolean;
  created_at: string;
}

// ──── Search Profile ────

export interface SearchProfile {
  id: string;
  user_id: string;
  name: string;
  job_titles: string[];
  locations: string[];
  remote_only: boolean;
  job_types: JobType[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  keywords: string[];
  excluded_companies: string[];
  is_active: boolean;
  search_frequency: SearchFrequency;
  last_searched_at: string | null;
  created_at: string;
  updated_at: string;
}

// ──── Found Job ────

export interface FoundJob {
  id: string;
  external_id: string | null;
  source: JobSource;
  dedup_hash: string;
  title: string;
  company: string;
  location: string | null;
  is_remote: boolean | null;
  job_type: JobType | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  description: string | null;
  requirements: string | null;
  apply_url: string | null;
  apply_email: string | null;
  apply_method: ApplyMethod;
  company_logo_url: string | null;
  posted_at: string | null;
  expires_at: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

// ──── Job Match ────

export interface JobMatch {
  id: string;
  search_profile_id: string;
  job_id: string;
  user_id: string;
  match_score: number;
  match_reasoning: string | null;
  is_dismissed: boolean;
  created_at: string;
  // Joined data
  job?: FoundJob;
  search_profile?: SearchProfile;
}

// ──── Application ────

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  search_profile_id: string | null;
  status: ApplicationStatus;
  apply_method: ApplyMethod;
  tailored_cv_url: string | null;
  cover_letter: string | null;
  email_thread_id: string | null;
  email_message_id: string | null;
  applied_at: string | null;
  response_received_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  job?: FoundJob;
  events?: ApplicationEvent[];
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: EventType;
  old_status: string | null;
  new_status: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ──── Gmail Tokens ────

export interface GmailTokens {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  gmail_address: string;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

// ──── Push Subscription ────

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent: string | null;
  created_at: string;
}

// ──── Notification Preferences ────

export interface NotificationPreferences {
  id: string;
  user_id: string;
  notify_application_sent: boolean;
  notify_response_received: boolean;
  notify_new_matches: boolean;
  notify_daily_summary: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string;
  updated_at: string;
}

// ──── API Request/Response types ────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface DashboardStats {
  total_applications: number;
  applications_sent: number;
  interviews: number;
  offers: number;
  rejections: number;
  active_search_profiles: number;
  new_matches_today: number;
}

export interface CreateSearchProfileInput {
  name: string;
  job_titles: string[];
  locations: string[];
  remote_only?: boolean;
  job_types?: JobType[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  keywords?: string[];
  excluded_companies?: string[];
  search_frequency?: SearchFrequency;
}

export interface UpdateSearchProfileInput extends Partial<CreateSearchProfileInput> {
  is_active?: boolean;
}

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: {
    url: string;
    type: string;
  };
}
