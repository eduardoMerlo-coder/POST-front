import { toast } from "react-toastify";
import {
  useCreateProductVariant,
  useCreateUserProductVariant,
} from "../hooks/useProduct";
import type { ProductFormUserType } from "../product.type";
import type { UseFormReset } from "react-hook-form";
import { ProductFormUser } from "../components/ProductFormUser";
import { ProductStatusValues } from "../product.type";
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
    reset: UseFormReset<ProductFormUserType>
  ) => {
    if (!user_id) {
      return toast.error("Usuario no autenticado");
    }

    // Si ya tenemos un variantId, significa que estamos usando una variante existente
    // Solo creamos el user_product_variant
    if (variantId) {
      const userVariantData = {
        variant_id: variantId,
        barcode: data.barcode || undefined,
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
    if (!data.name) {
      return toast.error("El nombre del producto es requerido");
    }
    if (!data.unit_id) {
      return toast.error("La unidad de medida es requerida");
    }
    if (!data.barcode && !data.internal_code) {
      return toast.error(
        "Debe completar el campo código de barras o el código interno."
      );
    }

    const formattedData = {
      ...data,
      business_types:
        data.business_types.length > 0 ? data.business_types : [1],
      brand_id: data.brand_id || 0,
      capacity: Number(data.capacity) || 0,
      quantity_per_package: Number(data.quantity_per_package) || 1,
      price: Number(data.price),
      stock_quantity: Number(data.stock_quantity),
      min_stock: Number(data.min_stock),
      status: ProductStatusValues.ACTIVE,
      user_id,
    };

    createProductVariant(formattedData, {
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
    <ProductFormUser
      onSubmit={handleSubmit}
      isPending={isPending}
      onVariantSelected={setVariantId}
    />
  );
};
