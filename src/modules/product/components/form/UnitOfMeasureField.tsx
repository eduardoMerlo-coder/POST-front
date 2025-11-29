import { Select, SelectItem } from "@heroui/react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { ProductForm } from "../../product.type";

interface UnitOfMeasure {
    id: number;
    name: string;
    description?: string;
}

interface UnitOfMeasureFieldProps {
    control: Control<ProductForm>;
    errors: FieldErrors<ProductForm>;
    uomList?: UnitOfMeasure[];
    isLoading?: boolean;
    isDisabled?: boolean;
}

export const UnitOfMeasureField = ({
    control,
    errors,
    uomList = [],
    isLoading = false,
    isDisabled = false,
}: UnitOfMeasureFieldProps) => {
    return (
        <div className="flex flex-col gap-2">
            <Controller
                name="unit_id"
                control={control}
                rules={{ required: "Este campo es requerido.", min: 1 }}
                render={({ field }) => (
                    <Select
                        label="Unidad de medida"
                        radius="sm"
                        isDisabled={isLoading || isDisabled}
                        selectedKeys={[String(field.value)]}
                        onSelectionChange={(keys) => {
                            const value = Number(Array.from(keys)[0]);
                            field.onChange(value);
                        }}
                        classNames={{
                            trigger: "bg-surface border-1 border-border data-[hover=true]:bg-surface",
                        }}
                    >
                        {uomList.map((item) => (
                            <SelectItem key={item.id.toString()} textValue={item.name}>
                                <span>{item.name}</span>
                                {item.description && (
                                    <p className="w-30 truncate">({item.description})</p>
                                )}
                            </SelectItem>
                        ))}
                    </Select>
                )}
            />
            <ErrorMessage existError={!!errors.unit_id} msg={errors.unit_id?.message} />
        </div>
    );
};
