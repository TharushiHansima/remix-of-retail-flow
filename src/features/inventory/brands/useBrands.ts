import { useCallback, useEffect, useMemo, useState } from "react";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "./brands.types";
import { createBrand, disableBrand, listBrands, updateBrand } from "./brands.api";

export function useBrands(options?: { includeDisabled?: boolean }) {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const includeDisabled = options?.includeDisabled ?? false;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBrands({ includeDisabled });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [includeDisabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(async (input: CreateBrandInput) => {
    const created = await createBrand(input);
    // keep list fresh
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const edit = useCallback(async (id: string, input: UpdateBrandInput) => {
    const updated = await updateBrand(id, input);
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    return updated;
  }, []);

  const disable = useCallback(async (id: string) => {
    const updated = await disableBrand(id);
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    return updated;
  }, []);

  return useMemo(
    () => ({
      brands: items,
      loading,
      error,
      reload: load,
      addBrand: add,
      updateBrand: edit,
      disableBrand: disable,
    }),
    [items, loading, error, load, add, edit, disable],
  );
}
