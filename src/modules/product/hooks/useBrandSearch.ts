import { useState, useMemo } from "react";
import { debounce } from "lodash";
import type { BrandItemCreate } from "../product.type";

interface Brand {
  id: number;
  name: string;
}

export const useBrandSearch = (brands: Brand[]) => {
  const [search, setSearch] = useState("");
  const [rawSearch, setRawSearch] = useState("");

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    []
  );

  const filteredItems = useMemo(() => {
    const brandsString = brands.map((b) => ({
      ...b,
      id: String(b.id),
    }));

    const filtered = brandsString.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );

    const createOption: BrandItemCreate[] =
      search.trim().length > 0
        ? [{ id: "create", name: `Crear "${search}"` }]
        : [];

    return [...filtered, ...createOption];
  }, [brands, search]);

  return {
    search,
    rawSearch,
    setSearch,
    setRawSearch,
    debouncedSetSearch,
    filteredItems,
  };
};
