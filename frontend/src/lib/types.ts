export interface Preferences {
  goal: "monitoring" | "awareness";
  remind_logging: boolean;
  remind_period: boolean;
}
export interface User {
  id: number;
  name: string;
  email: string;
  timezone: string;
  onboarded: boolean;
  preferences: Preferences | null;
}
export interface Period {
  id: number;
  start_date: string;
  end_date: string | null;
}
export interface Observations {
  bleeding: string;
  cramps: string;
  mood: string;
  notes: string | null;
}
export interface Symptom {
  id: number;
  date: string;
  observations: Observations;
}
export interface Summary {
  completed_cycles: { start_date: string; next_start: string; days: number }[];
  history_count: number;
  cycle_day: number | null;
  reason: string;
  estimate: {
    from: string;
    to: string;
    kind: string;
    method_version: string;
  } | null;
}
export interface Journal {
  periods: Period[];
  symptoms: Symptom[];
  summary: Summary;
  fertility: { available: false; reason: string; policy_version: string };
}
export interface Article {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  paragraphs: string[];
  sources: { label: string; url: string }[];
  review_status: string;
  source_checked_at: string;
}
