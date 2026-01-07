import { api } from "@/lib/api";
import type { ListUsersParams, UserWithRoles } from "./users.types";

function buildQuery(params: Record<string, any>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

type ApiUser = any;

/**
 * GET /users?q=&includeDisabled=
 */
export async function listUsers(params: ListUsersParams = {}) {
  const qs = buildQuery({
    q: params.q,
    includeDisabled: params.includeDisabled ? "true" : undefined,
  });

  const data = await api<ApiUser[]>(`/users${qs}`, { method: "GET", auth: true });

  // Mapper: supports different backend shapes safely
  return (data || []).map((u) => {
    const roles: string[] =
      Array.isArray(u.roles) ? u.roles
      : u.role ? [u.role]
      : u.appRole ? [u.appRole]
      : u.profile?.role ? [u.profile.role]
      : u.profile?.appRole ? [u.profile.appRole]
      : [];

    const full_name =
      (u.full_name ??
        u.fullName ??
        u.name ??
        u.profile?.full_name ??
        u.profile?.fullName ??
        u.profile?.name ??
        null) as string | null;

    return {
      id: String(u.id ?? u.profileId ?? u.profile?.id ?? u.user_id ?? u.userId),
      user_id: String(
        u.user_id ??
          u.userId ??
          u.user?.id ??
          u.profile?.user_id ??
          u.profile?.userId ??
          u.id
      ),
      email: String(u.email ?? u.user?.email ?? u.profile?.email ?? ""),
      full_name,
      created_at: String(
        u.created_at ??
          u.createdAt ??
          u.profile?.created_at ??
          u.profile?.createdAt ??
          new Date().toISOString()
      ),
      roles,
      is_active: u.is_active ?? u.isActive ?? u.profile?.is_active ?? u.profile?.isActive,
    } as UserWithRoles;
  });
}

/**
 * PATCH /users/:id/role
 * body: { role: "admin" | "manager" | ... }
 */
export async function updateUserRole(userId: string, role: string) {
  // backend expects enum role (AppRole)
  return api(`/users/${userId}/role`, {
    method: "PATCH",
    auth: true,
    json: { role },
  });
}
