import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface CapacityFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
}

export const CapacityField = ({
  register,
  errors,
  isDisabled = false,
}: CapacityFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">Capacidad *</label>
      <Input
        {...register("capacity", {
          min: { value: 0, message: "La capacidad no puede ser negativa" },
          valueAsNumber: true,
        })}
        type="number"
        step="any"
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
        existError={!!errors.capacity}
        msg={errors.capacity?.message}
      />
    </div>
  );
};
