import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetBaseProductById, useUpdateProduct } from "../hooks/useProduct";
import type {
  ProductForm as ProductFormType,
  ProductFormUserType,
} from "../product.type";
import { ProductForm } from "../components/ProductFormUser";

export const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  // Fetch product data
  const { data: productData, isLoading } = useGetBaseProductById(productId);
  const { mutate: updateProduct, isPending } = useUpdateProduct();

  const handleSubmit = (data: ProductFormType) => {
    if (!data.barcode) {
      return toast.error("Debe completar el campo código de barras.");
    }

    const formattedData = {
      ...data,
      business_types: [1],
      brand_id: data.brand_id,
      capacity: Number(data.capacity),
    };

    updateProduct(
      { id: productId, data: formattedData },
      {
        onSuccess: () => {
          toast.success("Producto actualizado exitosamente!");
          navigate("/product");
        },
        onError: (error: any) => {
          const message =
            error?.data?.data?.message ??
            error?.data?.message ??
            "Error al actualizar producto";
          toast.error(message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="pt-10 flex justify-center">
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="pt-10 flex justify-center">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={productData.data as unknown as Partial<ProductFormUserType>}
      onSubmit={handleSubmit}
      isPending={isPending}
      isEditMode
    />
  );
};
