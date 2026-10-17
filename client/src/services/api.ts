// STHAVYA Unified Pure MERN REST API Client
// Interfaces with the Express.js Backend via VITE_API_URL

export const API_BASE_URL =
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ||
  (typeof window !== "undefined" && window.localStorage?.getItem("STHAVYA_API_URL")) ||
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api");

const REQUEST_TIMEOUT_MS = 30000;

async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("STHAVYA_AUTH_TOKEN") : null;
  const headers = new Headers(init.headers || {});

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include", // Sends httpOnly JWT cookie automatically
    signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function parseJson(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server returned non-JSON response (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// ─── AUTH API ─────────────────────────────────────────────────────────────────
export const authApi = {
  async register(userData: {
    name?: string;
    email: string;
    mobile?: string;
    phone?: string;
    password?: string;
    role?: string;
    city?: string;
  }) {
    const res = await apiFetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return parseJson(res);
  },

  async login(credentials: {
    identifier?: string;
    email?: string;
    mobile?: string;
    password?: string;
    rememberMe?: boolean;
  }) {
    const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return parseJson(res);
  },

  async logout() {
    const res = await apiFetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });
    return parseJson(res);
  },

  async getMe() {
    const res = await apiFetch(`${API_BASE_URL}/auth/me`);
    return parseJson(res);
  },

  async updateProfile(updates: Record<string, any>) {
    const res = await apiFetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return parseJson(res);
  },

  // Backwards compatibility alias
  async syncUser(userData: any) {
    return this.register(userData);
  },
};

// ─── HOUSE PLANS API ──────────────────────────────────────────────────────────
export const housePlanApi = {
  async getPlans(filter?: { userId?: string; bhk?: string; style?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filter?.userId) params.set("userId", filter.userId);
    if (filter?.bhk) params.set("bhk", filter.bhk);
    if (filter?.style) params.set("style", filter.style);
    if (filter?.search) params.set("search", filter.search);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`${API_BASE_URL}/plans${qs}`);
    return parseJson(res);
  },

  async getPlanById(id: string) {
    const res = await apiFetch(`${API_BASE_URL}/plans/${id}`);
    return parseJson(res);
  },

  async savePlan(planData: any) {
    const res = await apiFetch(`${API_BASE_URL}/plans`, {
      method: "POST",
      body: JSON.stringify(planData),
    });
    return parseJson(res);
  },

  async updatePlan(id: string, updates: any) {
    const res = await apiFetch(`${API_BASE_URL}/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return parseJson(res);
  },

  async deletePlan(id: string) {
    const res = await apiFetch(`${API_BASE_URL}/plans/${id}`, {
      method: "DELETE",
    });
    return parseJson(res);
  },
};

// ─── BOOKINGS API ─────────────────────────────────────────────────────────────
export const bookingApi = {
  async createBooking(bookingData: {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    workerId: string;
    workerName: string;
    workerRole?: string;
    workerCategory?: string;
    days?: number;
    dayRate?: number;
    scopeContext?: string;
    notes?: string;
    userId?: string;
  }) {
    const res = await apiFetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
    return parseJson(res);
  },

  async getBookings(filter?: { userId?: string; phone?: string; workerId?: string }) {
    const params = new URLSearchParams();
    if (filter?.userId) params.set("userId", filter.userId);
    if (filter?.phone) params.set("phone", filter.phone);
    if (filter?.workerId) params.set("workerId", filter.workerId);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`${API_BASE_URL}/bookings${qs}`);
    return parseJson(res);
  },

  async getBookingById(id: string) {
    const res = await apiFetch(`${API_BASE_URL}/bookings/${id}`);
    return parseJson(res);
  },

  async updateBookingStatus(id: string, status: string, notes?: string) {
    const res = await apiFetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
    return parseJson(res);
  },
};

// ─── AI API (SERVER-ONLY GEMINI GATEWAY) ──────────────────────────────────────
export const aiApi = {
  async analyzeRoom(base64Data: string, mimeType = "image/jpeg", roomContext = "space photo or architectural blueprint") {
    const res = await apiFetch(`${API_BASE_URL}/ai/analyze-room`, {
      method: "POST",
      body: JSON.stringify({ base64Data, mimeType, roomContext }),
    });
    return parseJson(res);
  },

  async enhancePrompt(prompt: string, style?: string, roomType?: string) {
    const res = await apiFetch(`${API_BASE_URL}/ai/enhance-prompt`, {
      method: "POST",
      body: JSON.stringify({ prompt, style, roomType }),
    });
    return parseJson(res);
  },

  async auditFloorPlan(planInfo: any) {
    const res = await apiFetch(`${API_BASE_URL}/ai/audit-floorplan`, {
      method: "POST",
      body: JSON.stringify(planInfo),
    });
    return parseJson(res);
  },
};

// ─── ARCHITECTS & WORKFORCE API ───────────────────────────────────────────────
export const workforceApi = {
  async getWorkers(filter?: { category?: string; location?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filter?.category) params.set("category", filter.category);
    if (filter?.location) params.set("location", filter.location);
    if (filter?.search) params.set("search", filter.search);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`${API_BASE_URL}/workers${qs}`);
    return parseJson(res);
  },

  async getWorkerById(id: string) {
    const res = await apiFetch(`${API_BASE_URL}/workers/${id}`);
    return parseJson(res);
  },

  async getArchitects(filter?: { location?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filter?.location) params.set("location", filter.location);
    if (filter?.search) params.set("search", filter.search);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`${API_BASE_URL}/architects${qs}`);
    return parseJson(res);
  },

  async getArchitectById(id: string) {
    const res = await apiFetch(`${API_BASE_URL}/architects/${id}`);
    return parseJson(res);
  },
};

export const architectApi = {
  getArchitects: workforceApi.getArchitects,
  getArchitectById: workforceApi.getArchitectById,
};

export const workerApi = {
  getWorkers: workforceApi.getWorkers,
  getWorkerById: workforceApi.getWorkerById,
};

// ─── MEDIA UPLOAD API (GRIDFS) ────────────────────────────────────────────────
export const uploadApi = {
  async uploadBlueprint(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiFetch(`${API_BASE_URL}/upload/blueprint`, {
      method: "POST",
      body: formData,
    });
    return parseJson(res);
  },

  async uploadInterior(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiFetch(`${API_BASE_URL}/upload/interior`, {
      method: "POST",
      body: formData,
    });
    return parseJson(res);
  },
};

// ─── SAVED PROJECTS API ───────────────────────────────────────────────────────
export const projectApi = {
  async saveProject(projectData: any) {
    const res = await apiFetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      body: JSON.stringify(projectData),
    });
    return parseJson(res);
  },

  async getProjects(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const res = await apiFetch(`${API_BASE_URL}/projects${query}`);
    return parseJson(res);
  },

  async deleteProject(id: string) {
    const res = await apiFetch(`${API_BASE_URL}/projects/${id}`, {
      method: "DELETE",
    });
    return parseJson(res);
  },
};

export default {
  authApi,
  housePlanApi,
  bookingApi,
  aiApi,
  workforceApi,
  uploadApi,
  projectApi,
};
