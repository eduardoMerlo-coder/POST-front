import { toast } from "react-toastify";
import type { ProductForm } from "../product.type";
import type { UseFormReset } from "react-hook-form";

interface ApiErrorResponse {
    data: {
        data?: {
            message?: string;
        };
        message?: string;
    };
}

interface UseProductFormSubmitProps {
    mutate: (data: any, options?: any) => void;
    reset: UseFormReset<ProductForm>;
}

export const useProductFormSubmit = ({
    mutate,
    reset,
}: UseProductFormSubmitProps) => {
    const onSubmit = (data: ProductForm) => {
        if (!data.barcode && !data.internal_code) {
            return toast.error(
                "Debe completar el campo codigo de barras o el codigo interno."
            );
        }

        mutate(
            {
                ...data,
                business_types: [1],
                brand_id: data.brand_id,
                capacity: Number(data.capacity),
                packaging_type_id: data.packaging_type_id
                    ? Number(data.packaging_type_id)
                    : 0,
            },
            {
                onSuccess: () => {
                    toast.success("Producto creado !!!");
                    reset();
                },
                onError: (error: ApiErrorResponse) => {
                    const message =
                        error?.data?.data?.message ?? error?.data?.message ?? "Error al crear producto";
                    toast.error(message);
                    reset();
                },
            }
        );
    };

    return { onSubmit };
};
