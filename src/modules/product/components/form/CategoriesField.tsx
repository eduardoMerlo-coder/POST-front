import { Select, SelectItem } from "@heroui/react";
import { Controller, type Control } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface CategoriesFieldProps {
  control: Control<ProductFormUserType>;
  categories?: Category[];
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const CategoriesField = ({
  control,
  categories = [],
  isLoading = false,
  isDisabled = false,
}: CategoriesFieldProps) => {
  // Asegurar que categories siempre sea un array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">Categories</label>
      <Controller
        name="categories"
        control={control}
        render={({ field }) => {
          // Crear el Set de selectedKeys desde el valor del campo
          const selectedKeysSet =
            field.value && Array.isArray(field.value) && field.value.length > 0
              ? new Set(field.value.map((v) => String(v)))
              : new Set<string>();

          return (
            <Select
              key={`categories-select-${field.value?.join(",") || "empty"}-${
                categoriesArray.length
              }`}
              radius="sm"
              isDisabled={isLoading || isDisabled}
              selectedKeys={selectedKeysSet}
              selectionMode="multiple"
              placeholder="Seleccione categorías"
              onSelectionChange={(keys) => {
                const arr = Array.from(keys).map(String);
                field.onChange(arr);
              }}
              classNames={{
                base: "!h-12",
                trigger:
                  "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
              }}
            >
              {categoriesArray.map((item) => (
                <SelectItem
                  key={item.id.toString()}
                  classNames={{ title: "flex gap-2" }}
                  textValue={item.name}
                >
                  <span>{item.name}</span>
                  {item.description && (
                    <p className="w-30 truncate">({item.description})</p>
                  )}
                </SelectItem>
              ))}
            </Select>
          );
        }}
      />
    </div>
  );
};
