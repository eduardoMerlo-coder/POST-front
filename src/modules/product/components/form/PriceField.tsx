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
            <Input
                {...register("price", { min: 1 })}
                label="Precio"
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
