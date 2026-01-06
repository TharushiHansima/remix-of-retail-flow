export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  isActive?: boolean; // depending on your prisma model
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryTreeNode = Category & {
  children?: CategoryTreeNode[];
};

export type CreateCategoryDto = {
  name: string;
  parentId?: string | null;
};

export type UpdateCategoryDto = {
  name?: string;
  parentId?: string | null;
};
