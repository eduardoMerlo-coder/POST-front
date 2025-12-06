import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";
import { PriceField } from "./PriceField";
import { StockQuantityField } from "./StockQuantityField";
import { MinStockField } from "./MinStockField";
import { BarcodeField } from "./BarcodeField";

interface UserProductDataSectionProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
  variantName?: string;
  showVariantInfo?: boolean;
}

export const UserProductDataSection = ({
  register,
  errors,
  isDisabled = false,
  variantName,
  showVariantInfo = false,
}: UserProductDataSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Mis Datos del Producto
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Define el precio, stock y código de barras específico para tu negocio
        </p>
      </div>

      {showVariantInfo && variantName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Variante seleccionada:
            </span>
            <span className="text-sm text-gray-900 font-semibold">
              {variantName}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <BarcodeField register={register} isDisabled={isDisabled} />

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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Nota:</span> Estos valores son
          específicos para tu cuenta. Otros usuarios pueden tener diferentes
          precios y stock para la misma variante.
        </p>
      </div>
    </div>
  );
};
