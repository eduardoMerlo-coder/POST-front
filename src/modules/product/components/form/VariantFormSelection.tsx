import { Input } from "@heroui/react";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { ProductFormUserType } from "../../product.type";
import { ProductPresentationField } from "./ProductPresentationField";
import { CapacityField } from "./CapacityField";
import { UnitOfMeasureField } from "./UnitOfMeasureField";
import { BarcodeField } from "./BarcodeField";
import type { UomItem } from "../../product.type";
import { MdTipsAndUpdates } from "react-icons/md";

interface VariantFormSectionProps {
  control: Control<ProductFormUserType>;
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  uomList?: UomItem[];
  isLoadingUom?: boolean;
  isDisabled?: boolean;
  productBaseName?: string;
  setValue?: UseFormSetValue<ProductFormUserType>;
  watch?: UseFormWatch<ProductFormUserType>;
}

export const VariantFormSection = ({
  control,
  register,
  errors,
  uomList,
  isLoadingUom = false,
  isDisabled = false,
  productBaseName,
  setValue,
  watch,
}: VariantFormSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-primary">
          Presentación del producto
        </h3>
        <p className="text-sm text-secondary mt-1">
          Define las características específicas de la presentación del producto
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ProductPresentationField
          register={register}
          errors={errors}
          isDisabled={isDisabled}
          setValue={setValue}
          watch={watch}
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
          <label className="text-sm font-medium text-primary">Unidades *</label>
          <Input
            {...register("quantity_per_package", {
              required: "Este campo es requerido.",
              min: { value: 1, message: "Debe ser al menos 1." },
              valueAsNumber: true,
            })}
            type="number"
            isDisabled={isDisabled}
            radius="sm"
            placeholder="1"
            onFocus={(e) => e.target.select()}
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
            min={1}
          />
          <ErrorMessage
            existError={!!errors.quantity_per_package}
            msg={errors.quantity_per_package?.message}
          />
        </div>

        <BarcodeField
          register={register}
          setValue={setValue}
          watch={watch}
          isDisabled={isDisabled}
        />
      </div>

      {productBaseName && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-transparent border border-yellow-300 flex items-start gap-3">
          <MdTipsAndUpdates className="size-5 text-yellow-300 border-yellow-300" />

          <p className="text-sm text-primary">
            <span className="font-semibold text-yellow-300 border-yellow-300">
              Sugerencia:
            </span>{" "}
            El campo{" "}
            <span className="font-semibold text-accent ">
              presentación del producto
            </span>{" "}
            puede ser unidad, pack, six-pack, bolsa, lata, caja, etc.
          </p>
        </div>
      )}
    </div>
  );
};
