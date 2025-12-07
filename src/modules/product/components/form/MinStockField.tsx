import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface MinStockFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
}

export const MinStockField = ({
  register,
  errors,
  isDisabled = false,
}: MinStockFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">Minimo Stock *</label>
      <Input
        {...register("min_stock", {
          required: "El stock mínimo es requerido",
          min: { value: 0, message: "El stock mínimo no puede ser negativo" },
          valueAsNumber: true,
        })}
        type="number"
        isDisabled={isDisabled}
        radius="sm"
        placeholder="1"
        onFocus={(e) => e.target.select()}
        classNames={{
          inputWrapper:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
        }}
        min={0}
      />
      <ErrorMessage
        existError={!!errors.min_stock}
        msg={errors.min_stock?.message}
      />
    </div>
  );
};
