export type UUID = string;

export type Supplier = {
  id: UUID;
  name: string;

  email?: string | null;
  phone?: string | null;
  address?: string | null;

  contactName?: string | null;
  taxId?: string | null;
  paymentTerms?: number | null;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type SupplierListQuery = {
  q?: string;
  includeDisabled?: boolean;
};

export type CreateSupplierDto = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  taxId?: string;
  paymentTerms?: number;
};

export type UpdateSupplierDto = Partial<CreateSupplierDto>;
