const RAW_URL = import.meta.env.VITE_API_URL || "https://niajiri-backend.onrender.com/api";
const API_URL = RAW_URL.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function request(path, { token, ...options } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.message || "Something went wrong. Please try again.", response.status);
  return body;
}

export const api = {
  health: () => request("/health"),
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: (token) => request("/auth/me", { token }),
  logout: (token) => request("/auth/logout", { method: "POST", token }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) => request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) }),

  jobs: () => request("/jobs"),
  getJob: (slug) => request(`/jobs/${slug}`),
  myJobs: (token) => request("/jobs/employer/mine", { token }),
  createJob: (token, data) => request("/jobs", { method: "POST", token, body: JSON.stringify(data) }),
  updateJob: (token, id, data) => request(`/jobs/${id}`, { method: "PUT", token, body: JSON.stringify(data) }),
  deleteJob: (token, id) => request(`/jobs/${id}`, { method: "DELETE", token }),

  applications: (token, query = {}) => {
    const params = new URLSearchParams(query).toString();
    return request(`/applications${params ? `?${params}` : ""}`, { token });
  },
  getApplication: (token, id) => request(`/applications/${id}`, { token }),
  updateApplicationStatus: (token, id, status, note) => request(`/applications/${id}/status`, { method: "PATCH", token, body: JSON.stringify({ status, note }) }),
  dashboard: (token) => request("/applications/dashboard", { token }),

  startChat: (data) => request("/chat/sessions", { method: "POST", body: JSON.stringify(data) }),
  answerChat: (sessionId, value) => request(`/chat/sessions/${sessionId}/answer`, { method: "POST", body: JSON.stringify({ value }) }),
  applicationStatus: (query) => request(`/chat/status?${new URLSearchParams(query).toString()}`),
  uploadCv: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return fetch(`${API_URL}/chat/upload-cv`, {
      method: "POST",
      body: formData
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(body.message || "File upload failed.", response.status);
      return body;
    });
  }
};
