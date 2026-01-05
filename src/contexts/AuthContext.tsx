import { createContext, useContext, useState, ReactNode } from "react";

export type AppRole = "admin" | "manager" | "cashier" | "storekeeper" | "technician" | "accountant";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
  role: AppRole;
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
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-existing admin account
const adminUser: User = {
  id: "admin-001",
  email: "admin@devlabco.com",
};

const adminProfile: Profile = {
  id: "admin-001",
  user_id: "admin-001",
  email: "admin@devlabco.com",
  full_name: "System Administrator",
  avatar_url: null,
  approval_status: "approved",
  role: "admin",
  created_at: "2024-01-01T00:00:00Z",
};

// Mock registered users database (with passwords for demo)
const initialRegisteredUsers: Map<string, { user: User; profile: Profile; password: string }> = new Map([
  ["admin@devlabco.com", { 
    user: adminUser, 
    profile: adminProfile, 
    password: "admin123" 
  }],
]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<unknown | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [registeredUsers] = useState(initialRegisteredUsers);

  const signIn = async (email: string, password: string) => {
    const userRecord = registeredUsers.get(email.toLowerCase());
    
    if (!userRecord) {
      return { error: new Error("Invalid login credentials") };
    }
    
    if (userRecord.password !== password) {
      return { error: new Error("Invalid login credentials") };
    }
    
    if (userRecord.profile.approval_status === "pending") {
      return { error: new Error("Your account is pending approval. Please wait for admin approval.") };
    }
    
    if (userRecord.profile.approval_status === "rejected") {
      return { error: new Error("Your account has been rejected. Please contact administrator.") };
    }
    
    setUser(userRecord.user);
    setSession({});
    setProfile(userRecord.profile);
    setRoles([{ role: userRecord.profile.role }]);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    const emailLower = email.toLowerCase();
    
    // Check if user already exists
    if (registeredUsers.has(emailLower)) {
      return { error: new Error("An account with this email already exists") };
    }
    
    // Check if already in pending list
    if (pendingUsers.some(u => u.email.toLowerCase() === emailLower)) {
      return { error: new Error("An account with this email is already pending approval") };
    }
    
    // Add to pending users
    const newPendingUser: PendingUser = {
      id: `user-${Date.now()}`,
      email: emailLower,
      full_name: fullName,
      role,
      password,
      created_at: new Date().toISOString(),
      approval_status: "pending",
    };
    
    setPendingUsers(prev => [...prev, newPendingUser]);
    
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => {
    return roles.some((r) => r.role === role);
  };

  const approveUser = (userId: string) => {
    const pendingUser = pendingUsers.find(u => u.id === userId);
    if (!pendingUser) return;
    
    // Create approved user
    const newUser: User = {
      id: pendingUser.id,
      email: pendingUser.email,
    };
    
    const newProfile: Profile = {
      id: pendingUser.id,
      user_id: pendingUser.id,
      email: pendingUser.email,
      full_name: pendingUser.full_name,
      avatar_url: null,
      approval_status: "approved",
      role: pendingUser.role,
      created_at: pendingUser.created_at,
    };
    
    // Add to registered users
    registeredUsers.set(pendingUser.email, {
      user: newUser,
      profile: newProfile,
      password: pendingUser.password,
    });
    
    // Remove from pending
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
  };

  const rejectUser = (userId: string) => {
    setPendingUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, approval_status: "rejected" as const } : u
    ));
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
        pendingUsers,
        signIn,
        signUp,
        signOut,
        hasRole,
        approveUser,
        rejectUser,
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
