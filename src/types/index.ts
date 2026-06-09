export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  segment: string | null;
  city: string | null;
  completeness_pct: number;
  is_verified: boolean;
  current_level: string;
  total_points: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type Segment = "smp" | "sma" | "mahasiswa" | "fresh_grad" | "career_switcher" | "orang_tua";

export interface CompletenessResult {
  total: number;
  sections: {
    academic: boolean;
    personality: boolean;
    interests: boolean;
    goals: boolean;
    documents: boolean;
  };
  weights: Record<string, number>;
  completion_label: string;
  is_verified: boolean;
}

export interface ProfileMe {
  profile: { segment: string; city: string | null; completeness_pct: number; is_verified: boolean } | null;
  academic: { education_level: string | null; school_name: string | null; current_grade: string | null; avg_score: number | null; favorite_subjects: string[] | null; achievements: string[] | null } | null;
  personality: { riasec_r: number | null; riasec_i: number | null; riasec_a: number | null; riasec_s: number | null; riasec_e: number | null; riasec_c: number | null; extrovert_score: number | null; analytical_score: number | null; creative_score: number | null; work_style: Record<string, number> | null } | null;
  interests: { interest_categories: string[] | null; hobbies: string[] | null; extracurricular: string[] | null; hard_skills: string[] | null; soft_skills: string[] | null } | null;
  goals: { financial_condition: string | null; education_target: string | null; career_target_5y: string | null; current_obstacles: string | null } | null;
  documents: Array<{ id: string; document_type: string; file_name: string; file_url: string }>;
}

export interface RecommendationItem {
  profession_id: string;
  profession_slug: string;
  profession_name: string;
  category: string;
  score: number;
  rank: number;
  breakdown: {
    riasec: number;
    work_style: number;
    interests: number;
    academic: number;
    personality: number;
    goals: number;
  };
}

export interface MajorResult {
  major_id: string;
  major_slug: string;
  major_name: string;
  faculty: string;
  score: number;
  rank: number;
}

export interface TrackResult {
  track_id: string;
  track_slug: string;
  track_name: string;
  track_type: string;
  score: number;
  rank: number;
}

export interface LifePathReport {
  id: string;
  version: number;
  recommendations: RecommendationItem[];
  ai_narrative: string | null;
  strengths: string[] | null;
  areas_to_grow: string[] | null;
  status: "pending" | "generating" | "done" | "failed";
  generated_at: string | null;
  trigger: string;
}

export interface LayeredOutput {
  segment: string;
  layers: Array<{
    layer: number;
    type: "profession" | "university_major" | "highschool_track";
    label: string;
    items: Array<RecommendationItem | MajorResult | TrackResult>;
  }>;
}

export interface PointsData {
  total_points: number;
  current_level: string;
}

export interface ChatProfession {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  category: string;
  description: string | null;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface ChatSession {
  session_id: string;
  profession: {
    id: string;
    slug: string;
    name: string;
    emoji: string | null;
    category: string;
    description?: string | null;
  };
  message_count: number;
  points_awarded: boolean;
  started_at: string;
  last_message_preview?: string | null;
}

export interface SSEEvent {
  type: "chunk" | "done" | "points_awarded" | "error";
  content?: string;
  session_id?: string;
  message_count?: number;
  points?: number;
  message?: string;
}

// ── Evolution ─────────────────────────────────────────────────────────────────

export interface EvolutionEvent {
  id: string;
  event_type: string;
  description: string;
  points_earned: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  icon: string;
}

export interface EvolutionSummary {
  total_events: number;
  total_points_earned: number;
  chat_sessions: number;
  tasks_completed: number;
  reports_generated: number;
  current_streak: number;
  longest_streak: number;
}

// ── Roadmap ───────────────────────────────────────────────────────────────────

export interface RoadmapTask {
  id: string;
  task_id: string;
  title: string;
  description: string;
  layer: number;
  difficulty: "easy" | "medium" | "hard";
  points_reward: number;
  status: "available" | "completed" | "locked";
  completed_at: string | null;
  segment_filter: string[] | null;
}

export interface RoadmapLayer {
  layer: number;
  label: string;
  color: string;
  locked: boolean;
  progress: { completed: number; total: number };
  tasks: RoadmapTask[];
}

export interface RoadmapResponse {
  layers: RoadmapLayer[];
  total_progress: { completed: number; total: number };
  next_task: RoadmapTask | null;
}

// ── Points ────────────────────────────────────────────────────────────────────

export interface PointsBalance {
  total_points: number;
  current_level: string;
  next_level: string | null;
  points_to_next_level: number;
  progress_to_next_pct: number;
  current_streak: number;
  longest_streak: number;
}

export interface PointsTransaction {
  id: string;
  amount: number;
  type: string;
  source: string;
  description: string;
  balance_after: number;
  created_at: string;
}
