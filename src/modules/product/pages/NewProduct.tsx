import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "../hooks/useProduct";
import { ProductForm } from "../components/ProductForm";
import type { ProductForm as ProductFormType } from "../product.type";

export const NewProduct = () => {
  const navigate = useNavigate();
  const { mutate: createProduct, isPending } = useCreateProduct();

  const handleSubmit = (data: ProductFormType) => {
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
        navigate("/product");
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

  return <ProductForm onSubmit={handleSubmit} isPending={isPending} />;
};
