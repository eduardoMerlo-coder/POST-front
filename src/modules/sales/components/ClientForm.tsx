import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Button } from "@heroui/react";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import { useModal } from "@/setup/context/ModalContext";
import { clientService } from "@/services/client.service";
import { toast } from "react-toastify";

interface ClientFormData {
  name: string;
  last_name: string;
  phone: string;
  email: string;
  document_number: string;
}

interface ClientFormProps {
  searchTerm?: string;
  user_id: string;
  onClientCreated?: (client: any) => void;
}

export const ClientForm = ({
  searchTerm = "",
  user_id,
  onClientCreated,
}: ClientFormProps) => {
  const { closeModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      name: searchTerm || "",
      last_name: "",
      phone: "",
      email: "",
      document_number: "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      const newClient = await clientService.createClient({
        name: data.name.trim(),
        last_name: data.last_name.trim() || undefined,
        phone: data.phone.trim() || undefined,
        email: data.email.trim() || undefined,
        document_number: data.document_number.trim() || undefined,
        user_id,
      });

      toast.success("Cliente creado exitosamente");
      onClientCreated?.(newClient);
      closeModal?.();
    } catch (error: any) {
      console.error("Error creating client:", error);
      const message =
        error?.message || error?.error_description || "Error al crear cliente";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-base-alt rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold text-primary mb-6">
        Crear Nuevo Cliente
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">Nombre *</label>
          <Input
            {...register("name", {
              required: "El nombre es requerido",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
            })}
            radius="sm"
            isDisabled={isSubmitting}
            placeholder="Ingrese el nombre"
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          />
          <ErrorMessage existError={!!errors.name} msg={errors.name?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">Apellidos</label>
          <Input
            {...register("last_name")}
            radius="sm"
            isDisabled={isSubmitting}
            placeholder="Ingrese los apellidos"
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          />
          <ErrorMessage
            existError={!!errors.last_name}
            msg={errors.last_name?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">
            Número de documento (DNI)
          </label>
          <Input
            {...register("document_number", {
              pattern: {
                value: /^[0-9]{8,12}$/,
                message: "El DNI debe tener entre 8 y 12 dígitos",
              },
            })}
            type="text"
            radius="sm"
            isDisabled={isSubmitting}
            placeholder="Ingrese el DNI"
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          />
          <ErrorMessage
            existError={!!errors.document_number}
            msg={errors.document_number?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">Teléfono</label>
          <Input
            {...register("phone", {
              pattern: {
                value: /^[0-9+\-\s()]{7,15}$/,
                message: "Ingrese un número de teléfono válido",
              },
            })}
            type="tel"
            radius="sm"
            isDisabled={isSubmitting}
            placeholder="Ingrese el teléfono"
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          />
          <ErrorMessage
            existError={!!errors.phone}
            msg={errors.phone?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">Email</label>
          <Input
            {...register("email", {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Ingrese un email válido",
              },
            })}
            type="email"
            radius="sm"
            isDisabled={isSubmitting}
            placeholder="correo@ejemplo.com"
            classNames={{
              inputWrapper:
                "bg-surface border-1 border-border data-[hover=true]:bg-surface !h-12",
            }}
          />
          <ErrorMessage
            existError={!!errors.email}
            msg={errors.email?.message}
          />
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="button"
            variant="light"
            onPress={closeModal}
            isDisabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            className="bg-accent font-semibold"
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

