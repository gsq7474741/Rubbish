export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  institution: string | null;
  research_field: string | null;
  title: string | null;
  karma: number;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  impact_factor: number;
  accepting_submissions: boolean;
  review_mode: "open" | "blind" | "instant";
  website: string | null;
  contact: string | null;
  location: string | null;
  instructions: string | null;
  deadline: string | null;
  submission_open: string | null;
  date: string | null;
  created_by: string | null;
  parent_venue_id: string | null;
  paper_count: number;
  reviewer_count: number;
  created_at: string;
}

export interface Paper {
  id: string;
  number: number;
  venue_id: string;
  author_id: string;
  title: string;
  abstract: string | null;
  keywords: string[];
  content_type: "latex" | "pdf" | "markdown" | "image";
  content_markdown: string | null;
  content_latex: string | null;
  latex_template: string | null;
  latex_compile_status: string | null;
  latex_compile_log: string | null;
  latex_source_url: string | null;
  pdf_url: string | null;
  image_urls: string[];
  review_mode: "open" | "blind" | "instant";
  status: "submitted" | "under_review" | "published" | "rejected_too_good";
  decision: "certified_rubbish" | "recyclable" | "too_good" | null;
  decision_at: string | null;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  bookmark_count: number;
  view_count: number;
  review_count: number;
  avg_rubbish_score: number;
  avg_uselessness_score: number;
  avg_entertainment_score: number;
  hot_score: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: Profile;
  venue?: Venue;
}

export interface PaperAuthor {
  id: string;
  paper_id: string;
  user_id: string | null;
  name: string;
  institution: string | null;
  email: string | null;
  position: number;
  is_corresponding: boolean;
  created_at: string;
  user?: Profile;
}

export interface Review {
  id: string;
  paper_id: string;
  reviewer_id: string;
  is_anonymous: boolean;
  rubbish_score: number;
  uselessness_score: number;
  entertainment_score: number;
  summary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: "certified_rubbish" | "recyclable" | "too_good";
  upvote_count: number;
  created_at: string;
  updated_at: string;
  reviewer?: Profile;
  rebuttals?: Rebuttal[];
}

export interface Rebuttal {
  id: string;
  review_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  paper_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  comment_type: "public_comment" | "official_comment" | "meta_review" | "decision";
  upvote_count: number;
  created_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface Vote {
  id: string;
  user_id: string;
  target_type: "paper" | "comment" | "review";
  target_id: string;
  value: -1 | 1;
  created_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  target_type: "paper" | "comment";
  target_id: string;
  emoji: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "new_review" | "new_comment" | "decision" | "achievement" | "mention";
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  condition_type: string | null;
  condition_value: number | null;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface ActivityLog {
  id: string;
  venue_id: string | null;
  user_id: string | null;
  action: "submission" | "review" | "comment" | "decision";
  target_type: "paper" | "review" | "comment";
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: Profile;
}
