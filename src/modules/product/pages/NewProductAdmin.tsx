import { toast } from "react-toastify";
import { useCreateProduct } from "../hooks/useProduct";
import type { ProductForm as ProductFormType } from "../product.type";
import type { UseFormReset } from "react-hook-form";
import { ProductFormAdmin } from "../components/ProductFormAdmin";

export const NewProductAdmin = () => {
  const { mutate: createProduct, isPending } = useCreateProduct();

  const handleSubmit = (data: ProductFormType, reset: UseFormReset<ProductFormType>) => {
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
      packaging_type_id: data.packaging_type_id
        ? Number(data.packaging_type_id)
        : 0,
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

  return <ProductFormAdmin onSubmit={handleSubmit} isPending={isPending} />;
};
