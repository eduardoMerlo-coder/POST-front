import { Input } from "@heroui/react";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { ProductFormUserType } from "../../product.type";
import { ProductNameField } from "./ProductNameField";
import { CapacityField } from "./CapacityField";
import { UnitOfMeasureField } from "./UnitOfMeasureField";
import { BarcodeField } from "./BarcodeField";
import type { UomItem } from "../../product.type";

interface VariantFormSectionProps {
  control: Control<ProductFormUserType>;
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  uomList?: UomItem[];
  isLoadingUom?: boolean;
  isDisabled?: boolean;
  productBaseName?: string;
}

export const VariantFormSection = ({
  control,
  register,
  errors,
  uomList,
  isLoadingUom = false,
  isDisabled = false,
  productBaseName,
}: VariantFormSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Datos de la Variante
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Define las características específicas de esta variante del producto
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ProductNameField
          register={register}
          errors={errors}
          isDisabled={isDisabled}
        />

        <CapacityField
          register={register}
          errors={errors}
          isDisabled={isDisabled}
        />

        <UnitOfMeasureField
          control={control}
          errors={errors}
          uomList={uomList}
          isLoading={isLoadingUom}
          isDisabled={isDisabled}
        />

        <div className="flex flex-col gap-2">
          <Input
            {...register("quantity_per_package", {
              required: "Este campo es requerido.",
              min: { value: 1, message: "Debe ser al menos 1." },
              valueAsNumber: true,
            })}
            label="Unidades por paquete"
            type="number"
            isDisabled={isDisabled}
            radius="sm"
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface",
            }}
            min={1}
          />
          <ErrorMessage
            existError={!!errors.quantity_per_package}
            msg={errors.quantity_per_package?.message}
          />
        </div>

        <BarcodeField register={register} isDisabled={isDisabled} />
      </div>

      {productBaseName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Sugerencia:</span> El nombre de la
            variante puede ser "{productBaseName}" seguido de la capacidad (ej:
            "{productBaseName} 300ml")
          </p>
        </div>
      )}
    </div>
  );
};
