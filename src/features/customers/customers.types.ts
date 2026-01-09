export type CustomerType = "individual" | "business";

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  type: CustomerType;
  creditLimit?: number | null;
  balance?: number | null;
  totalPurchases?: number | null;
  lastVisit?: string | null;
  isActive: boolean;
}


export interface CustomersStats {
  totalCustomers: number;
  businessAccounts: number;
  totalReceivables: number;
  lifetimeValue: number;
}

// if your backend returns a plain array, this still works
export type CustomersListResponse =
  | Customer[]
  | {
      items: Customer[];
      total: number;
      page: number;
      pageSize: number;
    };

export interface ListCustomersQuery {
  search?: string;
  type?: CustomerType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
