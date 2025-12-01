import { Input } from "@heroui/react";
import type { UseFormRegister } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface BarcodeFieldProps {
    register: UseFormRegister<ProductFormUserType>;
    isDisabled?: boolean;
}

export const BarcodeField = ({
    register,
    isDisabled = false,
}: BarcodeFieldProps) => {
    return (
        <Input
            {...register("barcode")}
            label="Codigo de barras"
            type="number"
            isDisabled={isDisabled}
            radius="sm"
            classNames={{
                inputWrapper: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
            }}
        />
    );
};
