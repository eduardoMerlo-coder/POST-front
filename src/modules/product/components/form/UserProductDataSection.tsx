import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";
import { PriceField } from "./PriceField";
import { StockQuantityField } from "./StockQuantityField";
import { MinStockField } from "./MinStockField";

interface UserProductDataSectionProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
}

export const UserProductDataSection = ({
  register,
  errors,
  isDisabled = false,
}: UserProductDataSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-primary">
          Datos del Producto
        </h3>
        <p className="text-sm text-secondary mt-1">
          Define el precio y stock específico para tu negocio
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <PriceField
          register={register}
          errors={errors}
          isDisabled={isDisabled}
        />

        <StockQuantityField
          register={register}
          errors={errors}
          isDisabled={isDisabled}
        />

        <MinStockField
          register={register}
          errors={errors}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  );
};
