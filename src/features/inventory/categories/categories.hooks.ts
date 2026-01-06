import { useCallback, useEffect, useState } from "react";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "./categories.types";
import { createCategory, disableCategory, listCategories, updateCategory } from "./categories.api";

export function useCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCategories();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const add = useCallback(async (dto: CreateCategoryDto) => {
    const created = await createCategory(dto);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const edit = useCallback(async (id: string, dto: UpdateCategoryDto) => {
    const updated = await updateCategory(id, dto);
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    return updated;
  }, []);

  const disable = useCallback(async (id: string) => {
    await disableCategory(id);
    // simplest UI behavior: remove from list (same as your delete button expectation)
    setItems((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
  }, []);

  return { categories: items, loading, error, reload, addCategory: add, updateCategory: edit, disableCategory: disable };
}
