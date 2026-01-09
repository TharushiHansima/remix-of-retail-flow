import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type AppRole =
  | "admin"
  | "manager"
  | "cashier"
  | "store_keeper"
  | "technician"
  | "accountant";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
  role: AppRole;
  branch_id: string | null; // ✅ NEW
  created_at: string;
}

interface UserRole {
  role: AppRole;
}

interface User {
  id: string;
  email: string;
}

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  password: string;
  created_at: string;
  approval_status: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  session: unknown | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  isApproved: boolean;
  isPendingApproval: boolean;
  pendingUsers: PendingUser[];

  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;

  // ✅ UPDATED: add branchId
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: AppRole,
    branchId: string
  ) => Promise<{ error: Error | null }>;

  signOut: () => Promise<void>;

  hasRole: (role: AppRole) => boolean;

  // keep for UI compatibility (backend approval not wired yet)
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "erp.accessToken";

type ApiErrorShape =
  | { message?: string | string[]; error?: string; statusCode?: number }
  | string
  | null
  | undefined;

function extractErrorMessage(data: ApiErrorShape): string {
  if (!data) return "Request failed";
  if (typeof data === "string") return data;
  const msg = (data as any).message;
  if (Array.isArray(msg)) return msg.join(", ");
  return msg || (data as any).error || "Request failed";
}

async function requestJSON<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    throw new Error(extractErrorMessage(data as any));
  }

  return data as T;
}

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * ✅ frontend role -> backend role
 * (fixed store_keeper mapping to underscore)
 */
function toBackendRole(
  role: AppRole
): "admin" | "manager" | "cashier" | "technician" | "store_keeper" | "accountant" {
  if (role === "admin") return "admin";
  if (role === "manager") return "manager";
  if (role === "technician") return "technician";
  if (role === "store_keeper") return "store_keeper";
  if (role === "accountant") return "accountant";
  return "cashier";
}

type AuthTokensResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: {
    userId?: string;
    profileId?: string;
    role?: string;
    branchId?: string | null;
  };
};

type MeResponse = {
  user: { id: string; email: string };
  profile: {
    id: string;
    email: string;
    name: string | null;
    appRole: string;
    branchId: string | null;
    isActive: boolean;
  } | null;
};

function buildProfileFromMe(me: MeResponse): { user: User; profile: Profile } {
  const role = (me.profile?.appRole as AppRole) || "cashier";
  const active = me.profile?.isActive ?? true;

  const user: User = { id: me.user.id, email: me.user.email };

  const profile: Profile = {
    id: me.profile?.id ?? me.user.id,
    user_id: me.user.id,
    email: me.profile?.email ?? me.user.email,
    full_name: me.profile?.name ?? null,
    avatar_url: null,
    approval_status: active ? "approved" : "pending",
    role,
    branch_id: me.profile?.branchId ?? null, // ✅ NEW
    created_at: new Date().toISOString(),
  };

  return { user, profile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<unknown | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // keep for UI compatibility (approval flow not connected yet)
  const [pendingUsers] = useState<PendingUser[]>([]);

  // Restore session on refresh (if token exists)
  useEffect(() => {
    const boot = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setSession({ accessToken: token });

      try {
        const me = await requestJSON<MeResponse>("/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = buildProfileFromMe(me);
        setUser(mapped.user);
        setProfile(mapped.profile);
        setRoles([{ role: mapped.profile.role }]);
      } catch {
        clearAccessToken();
        setUser(null);
        setProfile(null);
        setRoles([]);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    void boot();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await requestJSON<AuthTokensResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      setAccessToken(res.accessToken);
      setSession({ accessToken: res.accessToken });

      try {
        const me = await requestJSON<MeResponse>("/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${res.accessToken}` },
        });

        const mapped = buildProfileFromMe(me);
        setUser(mapped.user);
        setProfile(mapped.profile);
        setRoles([{ role: mapped.profile.role }]);
      } catch {
        setUser({ id: res.user?.userId || "unknown", email: email.toLowerCase() });
        setProfile({
          id: res.user?.profileId || "unknown",
          user_id: res.user?.userId || "unknown",
          email: email.toLowerCase(),
          full_name: null,
          avatar_url: null,
          approval_status: "approved",
          role: (res.user?.role as AppRole) || "cashier",
          branch_id: res.user?.branchId ?? null,
          created_at: new Date().toISOString(),
        });
        setRoles([{ role: ((res.user?.role as AppRole) || "cashier") }]);
      }

      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  // ✅ SIGN UP (REGISTER) WITH BRANCH
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: AppRole,
    branchId: string
  ) => {
    try {
      const res = await requestJSON<AuthTokensResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          name: fullName,
          role: toBackendRole(role),
          branchId, // ✅ NEW
        }),
      });

      setAccessToken(res.accessToken);
      setSession({ accessToken: res.accessToken });

      try {
        const me = await requestJSON<MeResponse>("/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${res.accessToken}` },
        });

        const mapped = buildProfileFromMe(me);
        setUser(mapped.user);
        setProfile(mapped.profile);
        setRoles([{ role: mapped.profile.role }]);
      } catch {
        const safeRole = role;
        const userId = res.user?.userId || `user-${Date.now()}`;
        const profileId = res.user?.profileId || userId;

        setUser({ id: userId, email: email.toLowerCase() });
        setProfile({
          id: profileId,
          user_id: userId,
          email: email.toLowerCase(),
          full_name: fullName,
          avatar_url: null,
          approval_status: "approved",
          role: safeRole,
          branch_id: branchId, // ✅ NEW
          created_at: new Date().toISOString(),
        });
        setRoles([{ role: safeRole }]);
      }

      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signOut = async () => {
    clearAccessToken();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.some((r) => r.role === role);

  const approveUser = () => {};
  const rejectUser = () => {};

  const isApproved = profile?.approval_status === "approved";
  const isPendingApproval = profile?.approval_status === "pending";

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      roles,
      isLoading,
      isApproved,
      isPendingApproval,
      pendingUsers,
      signIn,
      signUp,
      signOut,
      hasRole,
      approveUser,
      rejectUser,
    }),
    [user, session, profile, roles, isLoading, isApproved, isPendingApproval, pendingUsers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
