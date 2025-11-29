import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductForm } from "../../product.type";

interface CapacityFieldProps {
    register: UseFormRegister<ProductForm>;
    errors: FieldErrors<ProductForm>;
    isDisabled?: boolean;
}

export const CapacityField = ({
    register,
    errors,
    isDisabled = false,
}: CapacityFieldProps) => {
    return (
        <div className="flex flex-col gap-2">
            <Input
                {...register("capacity", { min: 1 })}
                label="Capacidad"
                type="number"
                isDisabled={isDisabled}
                radius="sm"
                classNames={{
                    inputWrapper: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
                }}
                min={0}
            />
            <ErrorMessage
                existError={!!errors.capacity}
                msg={"Capacidad debe ser al menos 1."}
            />
        </div>
    );
};
