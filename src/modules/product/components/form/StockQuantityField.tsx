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
      <Input
        {...register("stock_quantity", {
          required: "El stock es requerido",
          min: { value: 0, message: "El stock no puede ser negativo" },
          valueAsNumber: true,
        })}
        label="Stock"
        type="number"
        isDisabled={isDisabled}
        radius="sm"
        classNames={{
          inputWrapper:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface",
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
