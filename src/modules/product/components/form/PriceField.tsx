import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface PriceFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
}

export const PriceField = ({
  register,
  errors,
  isDisabled = false,
}: PriceFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">Precio *</label>
      <Input
        {...register("price", {
          required: "El precio es requerido",
          min: { value: 0.01, message: "El precio debe ser mayor a 0" },
          valueAsNumber: true,
        })}
        type="number"
        step="0.01"
        isDisabled={isDisabled}
        radius="sm"
        placeholder="0.00"
        onFocus={(e) => e.target.select()}
        classNames={{
          inputWrapper:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
        }}
        min={0}
      />
      <ErrorMessage existError={!!errors.price} msg={errors.price?.message} />
    </div>
  );
};
