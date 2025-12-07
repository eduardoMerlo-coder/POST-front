import { toast } from "react-toastify";
import {
  useCreateProductVariant,
  useCreateUserProductVariant,
} from "../hooks/useProduct";
import type { ProductFormUserType, ProductVariantForm } from "../product.type";
import type { UseFormReset } from "react-hook-form";
import { ProductForm } from "../components/ProductFormUser";
import { useState } from "react";

export const NewProductUser = () => {
  const { mutate: createProductVariant, isPending: isPendingVariant } =
    useCreateProductVariant();
  const { mutate: createUserVariant, isPending: isPendingUser } =
    useCreateUserProductVariant();
  const user_id = localStorage.getItem("user_id");
  const [variantId, setVariantId] = useState<number | null>(null);

  const isPending = isPendingVariant || isPendingUser;

  const handleSubmit = (
    data: ProductFormUserType,
    reset: UseFormReset<ProductFormUserType>,
    productBaseId?: number
  ) => {
    if (!user_id) {
      return toast.error("Usuario no autenticado");
    }

    // Si ya tenemos un variantId, significa que estamos usando una variante existente
    // Solo creamos el user_product_variant
    if (variantId) {
      if (!productBaseId) {
        return toast.error("Debe seleccionar un producto base");
      }
      const userVariantData = {
        product_base_id: productBaseId,
        variant_id: variantId,
        price: Number(data.price),
        stock_quantity: Number(data.stock_quantity),
        min_stock: Number(data.min_stock),
        user_id,
      };

      createUserVariant(userVariantData, {
        onSuccess: () => {
          toast.success("Producto agregado exitosamente");
          reset();
          setVariantId(null);
        },
        onError: (error: any) => {
          const message =
            error?.data?.data?.message ??
            error?.data?.message ??
            "Error al agregar producto";
          toast.error(message);
        },
      });
      return;
    }

    // Si no hay variantId, necesitamos crear la variante primero
    // Validar campos requeridos para crear variante
    if (!productBaseId) {
      return toast.error("Debe seleccionar un producto base");
    }
    if (!data.presentation) {
      return toast.error("La presentación del producto es requerida");
    }
    if (!data.unit_id) {
      return toast.error("La unidad de medida es requerida");
    }

    const variantData: ProductVariantForm = {
      product_base_id: productBaseId,
      presentation: data.presentation,
      capacity: data.capacity ? Number(data.capacity) : undefined,
      unit_id: data.unit_id,
      quantity_per_package: Number(data.quantity_per_package) || 1,
      barcode: data.barcode || undefined,
      price: Number(data.price),
      stock_quantity: Number(data.stock_quantity),
      min_stock: Number(data.min_stock),
      user_id,
    };

    createProductVariant(variantData, {
      onSuccess: () => {
        toast.success("Producto creado exitosamente");
        reset();
        setVariantId(null);
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

  return (
    <ProductForm
      onSubmit={handleSubmit}
      isPending={isPending}
      onVariantSelected={setVariantId}
    />
  );
};
