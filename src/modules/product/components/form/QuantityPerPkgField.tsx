import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface QuantityPerPkgFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
}

export const QuantityPerPkgField = ({
  register,
  errors,
  isDisabled = false,
}: QuantityPerPkgFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">
        Cantidad por paquete *
      </label>
      <Input
        {...register("units", { min: 1 })}
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
        existError={!!errors.units}
        msg={"Cantidad por paquete debe ser al menos 1."}
      />
    </div>
  );
};
