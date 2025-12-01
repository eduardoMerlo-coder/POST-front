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
            <Input
                {...register("quantity_per_package", { min: 1 })}
                label="Cantidad por paquete"
                type="number"
                isDisabled={isDisabled}
                radius="sm"
                classNames={{
                    inputWrapper: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
                }}
                min={0}
            />
            <ErrorMessage
                existError={!!errors.quantity_per_package}
                msg={"Cantidad por paquete debe ser al menos 1."}
            />
        </div>
    );
};
