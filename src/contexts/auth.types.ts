// Keep aligned with backend Prisma AppRole
export type AppRole = "admin" | "manager" | "cashier" | "technician";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
  role: AppRole;
  created_at: string;
}

export interface UserRole {
  role: AppRole;
}

export interface User {
  id: string;
  email: string;
}

export interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  password: string;
  created_at: string;
  approval_status: "pending" | "approved" | "rejected";
}

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: {
    userId?: string;
    profileId?: string;
    role?: AppRole;
    branchId?: string | null;
  };
};

export type MeResponse = {
  user: { id: string; email: string };
  profile: {
    id: string;
    email: string;
    name?: string | null;
    appRole?: AppRole;
    branchId?: string | null;
    isActive?: boolean;
  } | null;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  role?: AppRole;
  adminSecret?: string;
};
