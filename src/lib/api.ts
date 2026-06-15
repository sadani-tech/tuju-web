import axios from "axios";
import type { ChatMessage, SSEEvent } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tuju_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("tuju_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post("/api/v1/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/v1/auth/login", data),
  me: () => api.get("/api/v1/auth/me"),
  onboarding: (data: {
    segment: string;
    city?: string;
    birth_date?: string;
    interest_domains?: string[];
    personality?: Record<string, string>;
    work_style?: Record<string, number>;
  }) => api.put("/api/v1/auth/onboarding", data),
  verifyEmail: (token: string) =>
    api.post("/api/v1/auth/verify-email", { token }),
  resendVerification: () => api.post("/api/v1/auth/resend-verification"),
};

export const profileApi = {
  me: () => api.get("/api/v1/profile/me"),
  getCompleteness: () => api.get("/api/v1/profile/completeness"),
  updateSegment: (data: object) => api.put("/api/v1/profile/segment", data),
  updateAcademic: (data: object) => api.put("/api/v1/profile/academic", data),
  updatePersonality: (data: object) => api.put("/api/v1/profile/personality", data),
  updateInterests: (data: object) => api.put("/api/v1/profile/interests", data),
  updateGoals: (data: object) => api.put("/api/v1/profile/goals", data),
  updateWorkStyle: (data: object) => api.put("/api/v1/profile/work_style", data),
};

export const reportApi = {
  generate: () => api.post("/api/v1/report/generate"),
  getLatest: () => api.get("/api/v1/report/latest"),
  getStatus: (id: string) => api.get(`/api/v1/report/${id}/status`),
  getLayered: () => api.get("/api/v1/report/layered"),
  getHistory: () => api.get("/api/v1/report/history"),
};

export const evolutionApi = {
  list:    (params?: object) => api.get("/api/v1/evolution",         { params }),
  summary: ()               => api.get("/api/v1/evolution/summary"),
};

export const roadmapApi = {
  init:            ()                  => api.post("/api/v1/roadmap/init"),
  get:             ()                  => api.get("/api/v1/roadmap"),
  completeTask:    (userTaskId: string)=> api.post(`/api/v1/roadmap/tasks/${userTaskId}/complete`),
  updateMilestone: (data: object)      => api.post("/api/v1/roadmap/milestone", data),
};

export const pointsApi = {
  get:          ()             => api.get("/api/v1/points"),
  transactions: (params?: object) => api.get("/api/v1/points/transactions", { params }),
  redeem:       (data: object) => api.post("/api/v1/points/redeem", data),
};

export const professionsApi = {
  list:       (params?: object) => api.get("/api/v1/professions", { params }),
  categories: ()                => api.get("/api/v1/professions/categories"),
  detail:     (slug: string)    => api.get(`/api/v1/professions/${slug}`),
};

export const settingsApi = {
  get:                ()             => api.get("/api/v1/settings"),
  updateProfile:      (data: object) => api.put("/api/v1/settings/profile", data),
  updatePassword:     (data: object) => api.put("/api/v1/settings/password", data),
  updateNotifications:(data: object) => api.put("/api/v1/settings/notifications", data),
  deleteAccount:      (data: object) => api.delete("/api/v1/settings/account", { data }),
};

export const rewardsApi = {
  list:   ()             => api.get("/api/v1/points/rewards"),
  redeem: (data: object) => api.post("/api/v1/points/redeem", data),
};

export const chatApi = {
  getProfessions: (category?: string) =>
    api.get("/api/v1/chat/professions", {
      params: category ? { category } : {},
    }),
  startSession: (data: {
    profession_id: string;
    resume_session_id?: string;
  }) => api.post("/api/v1/chat/start", data),
  getSessions: (limit = 20, offset = 0) =>
    api.get("/api/v1/chat/sessions", { params: { limit, offset } }),
  getMessages: (sessionId: string) =>
    api.get(`/api/v1/chat/sessions/${sessionId}/messages`),
};

export const streamChat = async (
  data: { session_id: string; message: string; history: ChatMessage[] },
  onChunk: (text: string) => void,
  onDone: (event: SSEEvent) => void,
  onPointsAwarded: (points: number) => void,
  onError: (message: string) => void,
): Promise<void> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("tuju_token") : null;

  let response: Response;
  try {
    response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
  } catch {
    onError("Koneksi terputus");
    return;
  }

  if (!response.ok) {
    onError("Terjadi kesalahan pada server");
    return;
  }

  if (!response.body) {
    onError("Stream tidak tersedia");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event: SSEEvent = JSON.parse(line.slice(6));
          if (event.type === "chunk" && event.content != null) {
            onChunk(event.content);
          } else if (event.type === "done") {
            onDone(event);
          } else if (event.type === "points_awarded" && event.points != null) {
            onPointsAwarded(event.points);
          } else if (event.type === "error" && event.message) {
            onError(event.message);
          }
        } catch {
          // skip malformed SSE line
        }
      }
    }
  } catch {
    onError("Koneksi terputus di tengah streaming");
  }
};

export default api;
