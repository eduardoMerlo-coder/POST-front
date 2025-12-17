import { Input } from "@heroui/react";
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";
import { generateInternalBarcode } from "../../utils";

interface BarcodeFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  setValue?: UseFormSetValue<ProductFormUserType>;
  watch?: UseFormWatch<ProductFormUserType>;
  isDisabled?: boolean;
}

export const BarcodeField = ({
  register,
  setValue,
  watch,
  isDisabled = false,
}: BarcodeFieldProps) => {
  const handleGenerate = () => {
    if (setValue) {
      setValue("barcode", generateInternalBarcode(), {
        shouldValidate: true,
      });
    }
  };

  const barcodeValue = watch ? watch("barcode") : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">
        Codigo de barras *
      </label>
      <Input
        {...register("barcode")}
        type="number"
        isDisabled={isDisabled}
        radius="sm"
        placeholder="Ingrese código de barras"
        value={barcodeValue || ""}
        onFocus={(e) => e.target.select()}
        classNames={{
          inputWrapper:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
        }}
        endContent={
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isDisabled}
            className="text-xs border-1 border-accent text-accent px-3 py-1 rounded-sm cursor-pointer font-medium hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generar
          </button>
        }
      />
    </div>
  );
};
