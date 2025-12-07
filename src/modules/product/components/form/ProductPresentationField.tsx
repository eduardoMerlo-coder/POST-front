import { Input } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { ProductFormUserType } from "../../product.type";

interface ProductPresentationFieldProps {
  register: UseFormRegister<ProductFormUserType>;
  errors: FieldErrors<ProductFormUserType>;
  isDisabled?: boolean;
  setValue?: UseFormSetValue<ProductFormUserType>;
  watch?: UseFormWatch<ProductFormUserType>;
}

export const ProductPresentationField = ({
  register,
  errors,
  isDisabled = false,
  setValue,
  watch,
}: ProductPresentationFieldProps) => {
  const handleUnidadClick = () => {
    if (setValue) {
      setValue("presentation", "unidad", { shouldValidate: true });
    }
  };

  const presentationValue = watch ? watch("presentation") : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">
        Presentación del producto *
      </label>
      <Input
        {...register("presentation", { required: "Este campo es requerido." })}
        radius="sm"
        isDisabled={isDisabled}
        value={presentationValue || ""}
        placeholder="Ej: unidad, pack, six-pack..."
        classNames={{
          inputWrapper:
            "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
        }}
        endContent={
          <button
            type="button"
            onClick={handleUnidadClick}
            disabled={isDisabled}
            className="text-xs border-1 border-accent text-accent px-3 py-1 rounded-sm cursor-pointer font-medium hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            unidad
          </button>
        }
      />
      <ErrorMessage
        existError={!!errors.presentation}
        msg={errors.presentation?.message}
      />
    </div>
  );
};
