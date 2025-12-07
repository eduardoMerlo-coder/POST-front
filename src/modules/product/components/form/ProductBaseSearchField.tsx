import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import type { Key } from "react";
import { debounce } from "lodash";
import { useSearchBaseProducts } from "../../hooks/useProduct";
import type { BaseProduct } from "../../product.type";

interface ProductBaseSearchFieldProps {
  onSelect: (product: BaseProduct | null) => void;
  onCreateNew?: (searchTerm: string) => void;
  isDisabled?: boolean;
  selectedProductId?: number | null;
  selectedProduct?: BaseProduct | null;
}

type SearchItem = BaseProduct | { id: string; name: string };

export const ProductBaseSearchField = ({
  onSelect,
  onCreateNew,
  isDisabled = false,
  selectedProductId,
  selectedProduct,
}: ProductBaseSearchFieldProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rawSearch, setRawSearch] = useState("");

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // Cleanup del debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const { data, isLoading } = useSearchBaseProducts(
    searchTerm,
    searchTerm.length > 0
  );

  const products = useMemo(() => data?.products || [], [data?.products]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];

    // El backend ya filtra, así que solo agregamos la opción de crear
    const createOption: SearchItem[] =
      searchTerm.trim().length > 0 && onCreateNew
        ? [{ id: "create", name: `Crear nuevo producto "${searchTerm}"` }]
        : [];

    return [...products, ...createOption];
  }, [products, searchTerm, onCreateNew]);

  useEffect(() => {
    // Si hay un producto seleccionado pasado como prop, usarlo directamente
    if (selectedProduct) {
      setRawSearch(selectedProduct.name);
      setSearchTerm(selectedProduct.name);
    } else if (selectedProductId && products.length > 0) {
      // Si solo tenemos el ID, buscar en la lista de productos
      const selected = products.find((p) => p.id === selectedProductId);
      if (selected) {
        setRawSearch(selected.name);
        setSearchTerm(selected.name);
      }
    } else if (selectedProductId && !selectedProduct) {
      // Si tenemos un ID pero no el producto completo y no hay productos en la lista,
      // mantener el valor actual del rawSearch si existe
      // Esto evita que se borre cuando cambiamos de paso
    }
  }, [selectedProductId, selectedProduct, products]);

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (key === "create" && onCreateNew) {
        onCreateNew(searchTerm);
        return;
      }

      if (key && key !== "create") {
        const keyNumber = typeof key === "string" ? Number(key) : Number(key);
        if (!isNaN(keyNumber)) {
          const selected = products.find((p) => p.id === keyNumber);
          if (selected) {
            setRawSearch(selected.name);
            setSearchTerm(selected.name);
            onSelect(selected);
          }
        }
      } else if (key === null) {
        onSelect(null);
        setRawSearch("");
        setSearchTerm("");
      }
    },
    [products, onCreateNew, onSelect, searchTerm]
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">
        Buscar producto base
      </label>
      <Autocomplete
        placeholder="Ej: Pilsen, Coca Cola..."
        isDisabled={isDisabled}
        isLoading={isLoading}
        items={filteredItems}
        inputValue={rawSearch}
        selectedKey={selectedProductId ? String(selectedProductId) : null}
        radius="sm"
        onInputChange={(value) => {
          setRawSearch(value);
          debouncedSetSearch(value);
          if (!value) {
            onSelect(null);
            setSearchTerm("");
          }
        }}
        onSelectionChange={(key) => {
          console.log("Autocomplete selection changed:", key);
          handleSelectionChange(key);
        }}
        allowsCustomValue={false}
        classNames={{
          base: "[&_[data-slot=input-wrapper]]:bg-surface [&_[data-slot=input-wrapper]]:!h-12 [&_[data-slot=input-wrapper]]:border-1 [&_[data-slot=input-wrapper]]:border-border [&_[data-slot=input-wrapper]:hover]:bg-surface",
          listboxWrapper: " bg-surface-alt rounded-lg",
          listbox: " bg-surface-alt  rounded-lg",
        }}
      >
        {(item: SearchItem) => (
          <AutocompleteItem
            key={String(item.id)}
            textValue={item.name}
            className={item.id === "create" ? "font-bold text-accent" : ""}
          >
            <div className="flex flex-col">
              <span className="text-sm text-primary">{item.name}</span>
              {item.id !== "create" && "brand" in item && item.brand && (
                <span className="text-xs font-bold text-accent">
                  {item.brand.name}
                </span>
              )}
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
};
