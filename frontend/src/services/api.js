const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const TOKEN_KEY = "veris_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = "GET", body, headers, isFormData = false } = {}) {
  const token = getToken();

  const finalHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (err) {
    throw new ApiError("Service unavailable. Please try again later.", 0, null);
  }

  if (res.status === 204) return null;

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const message =
      res.status >= 500
        ? "Internal server error."
        : data?.message ||
          data?.error ||
          data?.detail ||
          (res.status === 401
            ? "Invalid email or password."
            : res.status === 404
            ? "We couldn't find what you were looking for."
            : "Something went wrong. Please try again.");
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) =>
    request("/auth/reset-password", {
      method: "POST",
      body: { password },
      headers: { Authorization: `Bearer ${token}` },
    }),
  changePassword: (payload) => request("/auth/change-password", { method: "POST", body: payload }),

  // Profile
  getProfile: () => request("/profile"),
  updateProfile: (payload) => request("/profile", { method: "PATCH", body: payload }),
  deleteAccount: () => request("/profile", { method: "DELETE" }),

  // Reports
  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports${query ? `?${query}` : ""}`);
  },
  getReport: (id) => request(`/reports/${id}`),
  downloadReport: async (id) => {
    const res = await fetch(`${BASE_URL}/reports/${id}/download`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    });
    if (!res.ok) throw new ApiError("We couldn't download this report.", res.status, null);
    return res.blob();
  },
  renameReport: (id, fileName) =>
    request(`/reports/${id}/name`, { method: "PATCH", body: { fileName } }),
  deleteReport: (id) => request(`/reports/${id}`, { method: "DELETE" }),
  chat: (message, reportId) =>
    request("/chat", { method: "POST", body: { message, ...(reportId ? { reportId } : {}) } }),
  uploadReport: (formData) => request("/reports/upload", { method: "POST", body: formData, isFormData: true }),
};

export { ApiError };
