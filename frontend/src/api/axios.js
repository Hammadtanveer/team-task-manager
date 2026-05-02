import axios from "axios";

const API = axios.create({
  baseURL: 'https://team-task-manager-production-b9e4.up.railway.app/api',
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor: attach JWT token ───────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ───────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/signup")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => API.post("/auth/signup", data),
  login: (data) => API.post("/auth/login", data),
  me: () => API.get("/auth/me"),
};

// ── Projects API ────────────────────────────────────────────────
export const projectsAPI = {
  list: (params) => API.get("/projects/", { params }),
  get: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post("/projects/", data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
};

// ── Tasks API ───────────────────────────────────────────────────
export const tasksAPI = {
  list: (params) => API.get("/tasks/", { params }),
  my: (params) => API.get("/tasks/my", { params }),
  get: (id) => API.get(`/tasks/${id}`),
  create: (data) => API.post("/tasks/", data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => API.patch(`/tasks/${id}/status`, data),
  assign: (id, data) => API.patch(`/tasks/${id}/assign`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
};
// ── Users API ───────────────────────────────────────────────────
export const usersAPI = {
  list: () => API.get("/auth/users"),
};

// ── Aliases (camelCase, with getAll) for page components ────────
export const projectsApi = {
  getAll: (params) => projectsAPI.list(params),
  get: projectsAPI.get,
  create: projectsAPI.create,
  update: projectsAPI.update,
  delete: projectsAPI.delete,
};

export const tasksApi = {
  getAll: (params) => tasksAPI.list(params),
  get: tasksAPI.get,
  create: tasksAPI.create,
  update: tasksAPI.update,
  updateStatus: (id, status) => tasksAPI.updateStatus(id, { status }),
  delete: tasksAPI.delete,
};

export const usersApi = {
  getAll: () => usersAPI.list(),
};

export default API;
