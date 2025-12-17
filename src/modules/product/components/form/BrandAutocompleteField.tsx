import { Autocomplete, AutocompleteItem } from "@heroui/react";
import {
  Controller,
  type Control,
  type FieldErrors,
  useWatch,
} from "react-hook-form";
import { useEffect } from "react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { ProductFormUserType, BrandItemCreate } from "../../product.type";
import { useBrandSearch } from "../../hooks/useBrandSearch";

interface Brand {
  id: number;
  name: string;
}

interface BrandAutocompleteFieldProps {
  control: Control<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  brands: Brand[];
  isLoading?: boolean;
  isCreating?: boolean;
  isDisabled?: boolean;
  onCreateBrand: (
    name: string,
    onSuccess: (id: number, name: string) => void
  ) => void;
}

export const BrandAutocompleteField = ({
  control,
  errors,
  brands,
  isLoading = false,
  isCreating = false,
  isDisabled = false,
  onCreateBrand,
}: BrandAutocompleteFieldProps) => {
  const {
    search,
    setSearch,
    rawSearch,
    setRawSearch,
    debouncedSetSearch,
    filteredItems,
  } = useBrandSearch(brands);

  const brandId = useWatch({
    control,
    name: "brand_id",
  });

  useEffect(() => {
    if (brandId && brands.length > 0 && rawSearch === "") {
      const selectedBrand = brands.find(
        (b) => Number(b.id) === Number(brandId)
      );
      if (selectedBrand) {
        setRawSearch(selectedBrand.name);
      }
    }
  }, [brandId, brands, rawSearch, setRawSearch]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">Marca *</label>
      <Controller
        control={control}
        name="brand_id"
        rules={{
          validate: (value) => {
            if (!value) return "Este campo es requerido.";
            return true;
          },
        }}
        render={({ field }) => (
          <div className="[&_[data-slot=input-wrapper]]:bg-surface [&_[data-slot=input-wrapper]]:border-1 [&_[data-slot=input-wrapper]]:border-border [&_[data-slot=input-wrapper]:hover]:bg-surface [&_[data-slot=input-wrapper]]:!h-12">
            <Autocomplete
              placeholder="Buscar o crear marca"
              isDisabled={isLoading || isDisabled || isCreating}
              items={filteredItems}
              inputValue={rawSearch}
              radius="sm"
              onInputChange={(value) => {
                setRawSearch(value);
                debouncedSetSearch(value);
                if (!value) {
                  field.onChange(0);
                }
              }}
              onBlur={() => {
                if (!field.value) {
                  setRawSearch("");
                }
              }}
              selectedKey={field.value ? Number(field.value) : undefined}
              onSelectionChange={(key) => {
                if (key === "create") {
                  onCreateBrand(search, (id, name) => {
                    field.onChange(Number(id));
                    setSearch(name);
                    setRawSearch(name);
                  });
                  return;
                }

                const selectedBrand = brands.find(
                  (b) => Number(b.id) === Number(key)
                );
                if (selectedBrand) {
                  setRawSearch(selectedBrand.name);
                  field.onChange(Number(selectedBrand.id));
                } else {
                  field.onChange(undefined);
                }
              }}
            >
              {(brand: BrandItemCreate) => (
                <AutocompleteItem
                  key={brand.id}
                  className={
                    brand.id === "create" ? "font-bold text-accent" : ""
                  }
                >
                  {brand.name}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
        )}
      />
      <ErrorMessage
        existError={!!errors.brand_id}
        msg={errors.brand_id?.message}
      />
    </div>
  );
};
