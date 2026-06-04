import axios from "axios";

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
  }) => api.put("/api/v1/auth/onboarding", data),
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

export const pointsApi = {
  get: () => api.get("/api/v1/points/"),
};

export const professionsApi = {
  list: () => api.get("/api/v1/professions/"),
};

export default api;
