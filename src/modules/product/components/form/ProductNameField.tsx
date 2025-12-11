import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface ProductNameFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
  setValue?: UseFormSetValue<ProductFormUserType>;
  showEndButton?: boolean;
}

export const ProductNameField = ({
  register,
  errors,
  isDisabled = false,
  setValue,
  showEndButton = false,
}: ProductNameFieldProps) => {
  const handleUnidadClick = () => {
    if (setValue) {
      setValue("name", "unidad", { shouldValidate: true });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">
        Nombre de producto *
      </label>
      <Input
        {...register("name", { required: "Este campo es requerido." })}
        radius="sm"
        isDisabled={isDisabled}
        placeholder="Ingrese nombre del producto"
        classNames={{
          inputWrapper:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
        }}
        endContent={
          showEndButton && (
            <button
              type="button"
              onClick={handleUnidadClick}
              disabled={isDisabled}
              className="text-xs border-1 border-accent text-accent px-3 py-1 rounded-sm cursor-pointer font-medium hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              unidad
            </button>
          )
        }
      />
      <ErrorMessage existError={!!errors.name} msg={errors.name?.message} />
    </div>
  );
};
