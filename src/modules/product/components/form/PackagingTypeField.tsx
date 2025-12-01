import { Select, SelectItem } from "@heroui/react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { ProductFormUserType } from "../../product.type";

interface PackagingType {
    id: number;
    name: string;
    description?: string;
}

interface PackagingTypeFieldProps {
    control: Control<ProductFormUserType>;
    errors: FieldErrors<ProductFormUserType>;
    packagingList?: PackagingType[];
    isLoading?: boolean;
    isDisabled?: boolean;
}

export const PackagingTypeField = ({
    control,
    errors,
    packagingList = [],
    isLoading = false,
    isDisabled = false,
}: PackagingTypeFieldProps) => {
    return (
        <div className="flex flex-col gap-2">
            <Controller
                name="packaging_type_id"
                control={control}
                rules={{
                    validate: (value) => {
                        if (value === undefined || value === null || value === 0) {
                            return "Este campo es requerido.";
                        }
                        return true;
                    },
                }}
                render={({ field }) => (
                    <Select
                        label="Tipo de empaque"
                        radius="sm"
                        isDisabled={isLoading || isDisabled}
                        selectedKeys={field.value ? [String(field.value)] : []}
                        onSelectionChange={(keys) => {
                            const selectedKeys = Array.from(keys);
                            field.onChange(
                                selectedKeys.length > 0 ? Number(selectedKeys[0]) : undefined
                            );
                        }}
                        classNames={{
                            trigger: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
                        }}
                    >
                        {packagingList.map((item) => (
                            <SelectItem
                                key={item.id}
                                classNames={{ title: "flex gap-2" }}
                                textValue={item.name}
                            >
                                <span>{item.name}</span>
                                {item.description && (
                                    <p className="w-30 truncate">({item.description})</p>
                                )}
                            </SelectItem>
                        ))}
                    </Select>
                )}
            />
            <ErrorMessage
                existError={!!errors.packaging_type_id}
                msg={errors.packaging_type_id?.message}
            />
        </div>
    );
};
