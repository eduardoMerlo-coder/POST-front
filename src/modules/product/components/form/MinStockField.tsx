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
            <Input
                {...register("min_stock", { min: 1 })}
                label="Minimo Stock"
                type="number"
                isDisabled={isDisabled}
                radius="sm"
                classNames={{
                    inputWrapper: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
                }}
                min={0}
            />
            <ErrorMessage
                existError={!!errors.min_stock}
                msg={"Minimo Stock debe ser al menos 1."}
            />
        </div>
    );
};
