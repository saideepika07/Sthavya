// STHAVYA Pure MERN Authentication & State Service
// Pure JWT in httpOnly Cookie + MongoDB User Collection
import { authApi, uploadApi } from "./api";

export interface SthavyaUser {
  id?: string;
  _id?: string;
  uid?: string;
  email: string | null;
  mobile?: string | null;
  displayName: string | null;
  name?: string | null;
  photoURL: string | null;
  avatar?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  role?: "client" | "architect" | "worker" | "admin";
  city?: string;
}

const USER_STORAGE_KEY = "STHAVYA_AUTH_USER";
const TOKEN_STORAGE_KEY = "STHAVYA_AUTH_TOKEN";

type AuthListener = (user: SthavyaUser | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: SthavyaUser | null) {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error("Auth listener error:", e);
    }
  });
}

function normalizeUser(rawUser: any): SthavyaUser {
  if (!rawUser) return null as any;
  const id = rawUser._id || rawUser.id || rawUser.uid || "usr-anon";
  const mobile = rawUser.mobile || rawUser.phoneNumber || rawUser.phone || "";
  return {
    id,
    _id: id,
    uid: id,
    email: rawUser.email || null,
    mobile: mobile || null,
    displayName: rawUser.displayName || rawUser.name || (rawUser.email ? rawUser.email.split("@")[0] : "Client"),
    name: rawUser.name || rawUser.displayName || "Client",
    photoURL: rawUser.photoURL || rawUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&auto=format",
    avatar: rawUser.avatar || rawUser.photoURL || "",
    phoneNumber: mobile,
    phone: mobile,
    role: rawUser.role || "client",
    city: rawUser.city || "Bangalore",
  };
}

/**
 * Get current authenticated user from local storage
 */
export function getCurrentUser(): SthavyaUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChanged(callback: AuthListener): () => void {
  listeners.add(callback);
  callback(getCurrentUser());

  // Also verify session with backend /api/auth/me
  authApi
    .getMe()
    .then((res) => {
      if (res?.success && res.user) {
        const normalized = normalizeUser(res.user);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
        notifyListeners(normalized);
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        notifyListeners(null);
      }
    })
    .catch(() => {
      // Offline or unauthenticated
    });

  return () => {
    listeners.delete(callback);
  };
}

/**
 * Universal sign in method using email or mobile + password
 */
export async function signIn(credentials: {
  identifier?: string;
  email?: string;
  mobile?: string;
  password?: string;
  rememberMe?: boolean;
}): Promise<SthavyaUser> {
  const res = await authApi.login(credentials);
  if (!res?.success) {
    throw new Error(res?.message || "Invalid credentials.");
  }
  const user = normalizeUser(res.user);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    if (res.token) window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
  }

  notifyListeners(user);
  return user;
}

/**
 * Sign in using email and password via Express JWT endpoint
 */
export async function signInWithEmail(email: string, password = "Password@123"): Promise<SthavyaUser> {
  return signIn({ identifier: email, email, password });
}

/**
 * Register user with full name, mobile, email, and password
 */
export async function register(userData: {
  name: string;
  email: string;
  mobile: string;
  password?: string;
}) {
  const res = await authApi.register(userData);
  if (!res?.success) {
    throw new Error(res?.message || "Registration failed.");
  }
  return res;
}

/**
 * Sign up using email and password via Express JWT endpoint (legacy compatibility)
 */
export async function signUpWithEmail(email: string, password = "Password@123", name?: string): Promise<SthavyaUser> {
  const res = await authApi.register({
    email,
    password,
    name: name || (email ? email.split("@")[0] : "Client"),
  });
  const user = normalizeUser(res.user);
  return user;
}

/**
 * Sign in using contact details (Instant login / register)
 */
export async function signInWithContactDetails(
  name: string,
  email: string,
  phone: string
): Promise<SthavyaUser> {
  let user: SthavyaUser;

  try {
    // Try login first with standard password
    const loginRes = await authApi.login({ email, password: "Password@123" });
    user = normalizeUser(loginRes.user);
    if (loginRes.token) window.localStorage.setItem(TOKEN_STORAGE_KEY, loginRes.token);
  } catch {
    // If not existing, register new user in MongoDB
    const regRes = await authApi.register({
      name,
      email,
      phone,
      password: "Password@123",
      role: "client",
    });
    user = normalizeUser(regRes.user);
    if (regRes.token) window.localStorage.setItem(TOKEN_STORAGE_KEY, regRes.token);
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    window.localStorage.setItem("STHAVYA_USER_CONTACT", phone);
  }

  notifyListeners(user);
  return user;
}

/**
 * Instant sign in with verified demo account
 */
export async function signInWithGoogle(): Promise<SthavyaUser> {
  return signInWithContactDetails("Deepika Reddy", "deepika.reddy@example.com", "+91 98765 43210");
}

/**
 * Sign out user & clear cookie
 */
export async function signOutUser(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // Non-blocking
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  notifyListeners(null);
}

/**
 * Upload image to Multer upload endpoint (Cloudinary / GridFS)
 */
export async function uploadImageToStorage(file: File, folder = "blueprints"): Promise<string> {
  if (folder === "blueprints") {
    const res = await uploadApi.uploadBlueprint(file);
    return res.url;
  } else {
    const res = await uploadApi.uploadInterior(file);
    return res.url;
  }
}

export default {
  getCurrentUser,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signInWithContactDetails,
  signOutUser,
  uploadImageToStorage,
};
