export type Branch = {
  id: string;
  code?: string | null;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBranchInput = {
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
};

export type UpdateBranchInput = Partial<CreateBranchInput>;
