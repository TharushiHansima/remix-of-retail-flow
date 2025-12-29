import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
  cost_price: number;
  is_serialized: boolean;
  is_batched: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  credit_limit: number | null;
  credit_balance: number | null;
}

export interface Branch {
  id: string;
  name: string;
}

export function useInvoiceData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes, branchesRes] = await Promise.all([
          supabase.from("products").select("id, name, sku, unit_price, cost_price, is_serialized, is_batched").eq("is_active", true),
          supabase.from("customers").select("id, name, email, phone, credit_limit, credit_balance").eq("is_active", true),
          supabase.from("branches").select("id, name").eq("is_active", true),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (customersRes.error) throw customersRes.error;
        if (branchesRes.error) throw branchesRes.error;

        setProducts(productsRes.data || []);
        setCustomers(customersRes.data || []);
        setBranches(branchesRes.data || []);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { products, customers, branches, loading };
}
