import { createContext, useContext, useState, ReactNode } from "react";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
}

interface UserRole {
  role: "admin" | "manager" | "cashier" | "technician";
}

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: unknown | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  isApproved: boolean;
  isPendingApproval: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: "admin" | "manager" | "cashier" | "technician") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development - automatically logged in as admin
const mockUser: User = {
  id: "1",
  email: "admin@gmail.com",
};

const mockProfile: Profile = {
  id: "1",
  user_id: "1",
  email: "admin@gmail.com",
  full_name: "Admin User",
  avatar_url: null,
  approval_status: "approved",
};

const mockRoles: UserRole[] = [{ role: "admin" }];

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auto-login with mock user for development
  const [user] = useState<User | null>(mockUser);
  const [session] = useState<unknown | null>({});
  const [profile] = useState<Profile | null>(mockProfile);
  const [roles] = useState<UserRole[]>(mockRoles);
  const [isLoading] = useState(false);

  const signIn = async (_email: string, _password: string) => {
    // Mock sign in - always succeeds
    return { error: null };
  };

  const signUp = async (_email: string, _password: string, _fullName: string) => {
    // Mock sign up - always succeeds
    return { error: null };
  };

  const signOut = async () => {
    // Mock sign out - does nothing in demo mode
  };

  const hasRole = (role: "admin" | "manager" | "cashier" | "technician") => {
    return roles.some((r) => r.role === role);
  };

  const isApproved = profile?.approval_status === "approved";
  const isPendingApproval = profile?.approval_status === "pending";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isLoading,
        isApproved,
        isPendingApproval,
        signIn,
        signUp,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
