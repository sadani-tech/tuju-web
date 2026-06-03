import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tuju_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally → redirect to login
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
};

export const profileApi = {
  getCompleteness: () => api.get("/api/v1/profile/completeness"),
  updateSegment: (data: object) => api.put("/api/v1/profile/segment", data),
  updateAcademic: (data: object) => api.put("/api/v1/profile/academic", data),
  updatePersonality: (data: object) => api.put("/api/v1/profile/personality", data),
  updateInterests: (data: object) => api.put("/api/v1/profile/interests", data),
  updateGoals: (data: object) => api.put("/api/v1/profile/goals", data),
};

export const reportApi = {
  generate: () => api.post("/api/v1/report/generate"),
  getLatest: () => api.get("/api/v1/report/latest"),
  getStatus: (id: string) => api.get(`/api/v1/report/${id}/status`),
};

export const roadmapApi = {
  list: () => api.get("/api/v1/roadmap/"),
};

export const pointsApi = {
  get: () => api.get("/api/v1/points/"),
};

export const professionsApi = {
  list: () => api.get("/api/v1/professions/"),
};

export default api;
