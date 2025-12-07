import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface StockQuantityFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
}

export const StockQuantityField = ({
  register,
  errors,
  isDisabled = false,
}: StockQuantityFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">Stock *</label>
      <Input
        {...register("stock_quantity", {
          required: "El stock es requerido",
          min: { value: 0, message: "El stock no puede ser negativo" },
          valueAsNumber: true,
        })}
        type="number"
        isDisabled={isDisabled}
        radius="sm"
        placeholder="0"
        onFocus={(e) => e.target.select()}
        classNames={{
          inputWrapper:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
        }}
        min={0}
      />
      <ErrorMessage
        existError={!!errors.stock_quantity}
        msg={errors.stock_quantity?.message}
      />
    </div>
  );
};
