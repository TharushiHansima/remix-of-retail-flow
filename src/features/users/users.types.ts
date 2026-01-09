export type UserWithRoles = {
  id: string;          // profile id OR user id (depends on backend)
  user_id: string;     // user id
  email: string;
  full_name: string | null;
  created_at: string;  // ISO string
  roles: string[];     // backend should return roles[] or role
  is_active?: boolean; // optional, if backend returns it
};

export type ListUsersParams = {
  q?: string;
  includeDisabled?: boolean;
};
