import { Input } from "@heroui/react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { ProductForm } from "../../product.type";
import { generateInternalBarcode } from "../../utils";

interface InternalCodeFieldProps {
    register: any;
    setValue: UseFormSetValue<ProductForm>;
    watch: UseFormWatch<ProductForm>;
    isDisabled?: boolean;
}

export const InternalCodeField = ({
    register,
    setValue,
    watch,
    isDisabled = false,
}: InternalCodeFieldProps) => {
    const handleGenerate = () => {
        setValue("internal_code", generateInternalBarcode());
    };

    return (
        <Input
            {...register("internal_code")}
            label="Codigo interno"
            radius="sm"
            value={watch("internal_code")}
            type="number"
            disabled
            classNames={{
                inputWrapper: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
            }}
            endContent={
                <button
                    type="button"
                    className="text-xs border-1 border-accent text-accent p-1 rounded-sm cursor-pointer font-medium"
                    disabled={isDisabled}
                    onClick={handleGenerate}
                >
                    Generar
                </button>
            }
        />
    );
};
