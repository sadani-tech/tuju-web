export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserProfile {
  id: string;
  user_id: string;
  segment: Segment;
  city: string | null;
  completeness_pct: number;
  is_verified: boolean;
}

export type Segment =
  | "smp" | "sma" | "mahasiswa"
  | "fresh_grad" | "career_switcher" | "orang_tua";

export interface CompletenessResult {
  total: number;
  sections: {
    academic: boolean;
    personality: boolean;
    interests: boolean;
    goals: boolean;
    documents: boolean;
  };
}

export interface Profession {
  id: string;
  slug: string;
  name: string;
  description: string;
  riasec_types: string[];
  cost_level: string;
  salary_min: number;
  salary_max: number;
  education_paths: string[];
}

export interface LifePathReport {
  id: string;
  version: number;
  recommendations: RecommendationItem[];
  ai_narrative: string;
  strengths: string[];
  areas_to_grow: string[];
  status: "pending" | "generating" | "done" | "failed";
  generated_at: string | null;
}

export interface RecommendationItem {
  profession_id: string;
  profession_name: string;
  score: number;
  rank: number;
}

export interface RoadmapTask {
  id: string;
  layer: 1 | 2 | 3;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points_reward: number;
  status: "locked" | "available" | "completed";
}

export interface PointsData {
  total_points: number;
  current_level: string;
}

export interface EvolutionEntry {
  id: string;
  event_type: string;
  description: string;
  points_earned: number | null;
  created_at: string;
}
