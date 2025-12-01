import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface ProductNameFieldProps {
    register: UseFormRegister<ProductFormUserType>;
    errors: FieldErrors<ProductFormUserType>;
    isDisabled?: boolean;
}

export const ProductNameField = ({
    register,
    errors,
    isDisabled = false,
}: ProductNameFieldProps) => {
    return (
        <div className="flex flex-col gap-2">
            <Input
                {...register("name", { required: "Este campo es requerido." })}
                label="Nombre de producto"
                radius="sm"
                isDisabled={isDisabled}
                classNames={{
                    inputWrapper: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
                }}
            />
            <ErrorMessage existError={!!errors.name} msg={errors.name?.message} />
        </div>
    );
};
