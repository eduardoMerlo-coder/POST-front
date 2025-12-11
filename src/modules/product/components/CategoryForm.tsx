import { useForm } from "react-hook-form";
import { Input, Textarea, Button } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import { useCreateCategory } from "../hooks/useProduct";
import { useModal } from "@/setup/context/ModalContext";

interface CategoryFormData {
  name: string;
  description: string;
}

export const CategoryForm = () => {
  const { closeModal } = useModal();
  const { mutate: createCategory, isPending } = useCreateCategory();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    createCategory(
      {
        name: data.name.trim(),
        description: data.description.trim(),
      },
      {
        onSuccess: () => {
          closeModal?.();
        },
        onError: (error) => {
          console.error("Error al crear categoría:", error);
        },
      }
    );
  };

  return (
    <div className="bg-base-alt rounded-lg shadow-lg p-6 w-[400px]">
      <h2 className="text-xl font-semibold text-primary mb-6">
        Crear Nueva Categoría
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">
            Nombre de la categoría *
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
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          />
          <ErrorMessage existError={!!errors.name} msg={errors.name?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">
            Descripción
          </label>
          <Textarea
            {...register("description")}
            radius="sm"
            isDisabled={isPending}
            minRows={3}
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface",
            }}
          />
          <ErrorMessage
            existError={!!errors.description}
            msg={errors.description?.message}
          />
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="button"
            radius="sm"
            className="bg-surface"
            onPress={closeModal}
            isDisabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            radius="sm"
            color="primary"
            isLoading={isPending}
            className="bg-accent font-semibold"
          >
            Crear Categoría
          </Button>
        </div>
      </form>
    </div>
  );
};
