export type Brand = {
  id: string;
  name: string;
  isActive?: boolean; // backend likely has it
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBrandInput = {
  name: string; // matches CreateBrandDto
};

export type UpdateBrandInput = Partial<CreateBrandInput>; // matches UpdateBrandDto (PartialType)
