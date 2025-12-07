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
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">Categories</label>
      <Controller
        name="categories"
        control={control}
        render={({ field }) => (
          <Select
            radius="sm"
            isDisabled={isLoading || isDisabled}
            selectedKeys={field.value?.map(String) ?? []}
            selectionMode="multiple"
            placeholder="Seleccione categorías"
            onSelectionChange={(keys) => {
              const arr = Array.from(keys).map(Number);
              field.onChange(arr);
            }}
            classNames={{
              base: "!h-12",
              trigger:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          >
            {categories.map((item) => (
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
        )}
      />
    </div>
  );
};
