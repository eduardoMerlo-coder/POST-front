import { Select, SelectItem } from "@heroui/react";
import type { ProductVariant } from "../../product.type";

interface VariantSelectorFieldProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelect: (variantId: number | null) => void;
  onCreateNew?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

type SelectItemType = {
  id: number | string;
  name: string;
};

export const VariantSelectorField = ({
  variants,
  selectedVariantId,
  onSelect,
  onCreateNew,
  isDisabled = false,
  isLoading = false,
}: VariantSelectorFieldProps) => {
  const getVariantDisplayName = (variant: ProductVariant) => {
    const parts = [variant.name];
    if (variant.capacity) {
      parts.push(`${variant.capacity}`);
    }
    if (variant.uom?.name) {
      parts.push(variant.uom.name);
    }
    if (variant.units > 1) {
      parts.push(`(${variant.units} unidades)`);
    }
    return parts.join(" ");
  };

  // Preparar items para el Select
  const selectItems: SelectItemType[] = [
    ...variants.map((v) => ({ id: v.id, name: getVariantDisplayName(v) })),
    ...(onCreateNew ? [{ id: "create", name: "Crear nueva variante" }] : []),
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">
        Seleccionar presentacion
      </label>
      <Select
        placeholder="Selecciona una variante existente"
        selectedKeys={selectedVariantId ? [String(selectedVariantId)] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          if (selectedKey === "create") {
            onCreateNew?.();
          } else if (selectedKey) {
            onSelect(Number(selectedKey));
          } else {
            onSelect(null);
          }
        }}
        isDisabled={isDisabled || isLoading}
        isLoading={isLoading}
        radius="sm"
        items={selectItems}
        classNames={{
          trigger:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
        }}
      >
        {(item: SelectItemType) => (
          <SelectItem
            key={String(item.id)}
            className={item.id === "create" ? "font-bold text-accent" : ""}
          >
            {item.name}
          </SelectItem>
        )}
      </Select>
      {variants.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">
          No hay variantes disponibles. Crea una nueva variante.
        </p>
      )}
    </div>
  );
};
