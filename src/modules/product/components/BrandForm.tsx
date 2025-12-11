import { useForm } from "react-hook-form";
import { Input, Button } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import { useCreateBrand } from "../hooks/useProduct";
import { useModal } from "@/setup/context/ModalContext";

interface BrandFormData {
  name: string;
}

export const BrandForm = () => {
  const { closeModal } = useModal();
  const { mutate: createBrand, isPending } = useCreateBrand();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormData>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: BrandFormData) => {
    createBrand(
      {
        name: data.name.trim(),
      },
      {
        onSuccess: () => {
          closeModal?.();
        },
        onError: (error) => {
          console.error("Error al crear marca:", error);
        },
      }
    );
  };

  return (
    <div className="bg-base-alt rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold text-primary mb-6">
        Crear Nueva Marca
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">
            Nombre de la marca *
          </label>
          <Input
            {...register("name", {
              required: "Este campo es requerido.",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres.",
              },
            })}
            radius="sm"
            isDisabled={isPending}
            placeholder="Ingrese nombre de la marca"
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          />
          <ErrorMessage existError={!!errors.name} msg={errors.name?.message} />
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="button"
            variant="light"
            onPress={closeModal}
            isDisabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isPending}
            className="bg-accent font-semibold"
          >
            Crear Marca
          </Button>
        </div>
      </form>
    </div>
  );
};
