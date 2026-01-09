import { http } from "@/lib/http";
import type {
  Customer,
  CustomersListResponse,
  CustomersStats,
  ListCustomersQuery,
} from "./customers.types";

export type CreateCustomerPayload = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  type: "individual" | "business";
  creditLimit?: number | null;
};

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

function cleanQuery<T extends Record<string, any>>(q: T): Record<string, any> {
  const out: Record<string, any> = {};
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    out[k] = v;
  });
  return out;
}

function toQueryString(q: Record<string, any>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) usp.set(k, String(v));
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export const customersApi = {
  list: (query: ListCustomersQuery = {}) => {
    const qs = toQueryString(cleanQuery(query));
    return http<CustomersListResponse>(`/sales/customers${qs}`, { auth: true });
  },

  getById: (id: string) => {
    return http<Customer>(`/sales/customers/${id}`, { auth: true });
  },

  stats: () => {
    return http<CustomersStats>(`/sales/customers/stats`, { auth: true });
  },

  create: (payload: CreateCustomerPayload) => {
    return http<Customer>(`/sales/customers`, { auth: true, json: payload, method: "POST" });
  },

  update: (id: string, payload: UpdateCustomerPayload) => {
    return http<Customer>(`/sales/customers/${id}`, { auth: true, json: payload, method: "PATCH" });
  },

  disable: (id: string) => {
    return http<Customer>(`/sales/customers/${id}/disable`, { auth: true, method: "PATCH" });
  },

  enable: (id: string) => {
    return http<Customer>(`/sales/customers/${id}/enable`, { auth: true, method: "PATCH" });
  },

  listInvoices: async (customerId: string) => {
  // Try common invoices endpoint first
  try {
    return await http<any>(`/sales/invoices?customerId=${customerId}`, { auth: true });
  } catch (e: any) {
    // If your backend doesn't have /sales/invoices yet, fallback to service-history
    if (e?.status === 404) {
      return await http<any>(
        `/sales/customers/service-history?customerId=${customerId}`,
        { auth: true },
      );
    }
    throw e;
  }
},

};
