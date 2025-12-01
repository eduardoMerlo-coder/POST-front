import { toast } from "react-toastify";
import { useCreateProductVariant } from "../hooks/useProduct";
import type { ProductFormUserType } from "../product.type";
import type { UseFormReset } from "react-hook-form";
import { ProductFormUser } from "../components/ProductFormUser";
import { ProductStatusValues } from "../product.type";

export const NewProductUser = () => {
    const { mutate: createProduct, isPending } = useCreateProductVariant();
    const user_id = localStorage.getItem("user_id");

    const handleSubmit = (data: ProductFormUserType, reset: UseFormReset<ProductFormUserType>) => {

        console.log("llega");
        if (!data.barcode && !data.internal_code) {
            return toast.error(
                "Debe completar el campo codigo de barras o el codigo interno."
            );
        }

        const formattedData = {
            ...data,
            business_types: [1],
            brand_id: data.brand_id,
            capacity: Number(data.capacity),
            quantity_per_package: Number(data.quantity_per_package),
            price: Number(data.price),
            packaging_type_id: data.packaging_type_id
                ? Number(data.packaging_type_id)
                : 0,
            stock_quantity: Number(data.stock_quantity),
            min_stock: Number(data.min_stock),
            status: ProductStatusValues.ACTIVE,
            user_id
        };

        createProduct(formattedData, {
            onSuccess: () => {
                toast.success("Producto creado !!!");
                reset();
            },
            onError: (error: any) => {
                const message =
                    error?.data?.data?.message ??
                    error?.data?.message ??
                    "Error al crear producto";
                toast.error(message);
            },
        });
    };

    return <ProductFormUser onSubmit={handleSubmit} isPending={isPending} />;
};
