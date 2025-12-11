import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type {
  ProductFormUserType,
  FormState,
  BaseProduct,
  ProductVariant,
  ProductBaseForm,
  CategoryItem,
} from "../product.type";

interface UseProductFormHandlersProps {
  isEditMode?: boolean;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  selectedProductBase: BaseProduct | null;
  setSelectedProductBase: React.Dispatch<
    React.SetStateAction<BaseProduct | null>
  >;
  initialProductBaseData: {
    name: string;
    brand_id: number;
    categories: string[];
  } | null;
  setInitialProductBaseData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      brand_id: number;
      categories: string[];
    } | null>
  >;
  initialPresentationData: {
    presentation: string;
    capacity: number;
    unit_id: string;
    units: number;
    barcode: string;
  } | null;
  setInitialPresentationData: React.Dispatch<
    React.SetStateAction<{
      presentation: string;
      capacity: number;
      unit_id: string;
      units: number;
      barcode: string;
    } | null>
  >;
  selectedVariantIdForCheck: number | null;
  setSelectedVariantIdForCheck: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  initialData?: Partial<ProductFormUserType>;
  categories: CategoryItem[];
  variants: ProductVariant[];
  loadingVariants: boolean;
  user_id: string | null;
  productExists: boolean | undefined;
  checkingProductExists: boolean;
  onVariantSelected?: (variantId: number | null) => void;
  // Form methods
  watch: any;
  setValue: any;
  reset: any;
  handleSubmit: any;
  // Mutations
  createProductBase: any;
  isCreatingProductBase: boolean;
  createBrand: any;
  isCreatingBrand: boolean;
  updateProductBase: any;
  isUpdatingProductBase: boolean;
  updateUserVariant: any;
  isUpdatingVariant: boolean;
  updateProductVariant: any;
  isUpdatingProductVariant: boolean;
}

const resetFormState = () => {
  return {
    step: "search" as const,
    productBaseId: null,
  };
};

export const useProductFormHandlers = ({
  isEditMode = false,
  formState,
  setFormState,
  setSelectedProductBase,
  initialProductBaseData,
  setInitialProductBaseData,
  initialPresentationData,
  setInitialPresentationData,
  selectedVariantIdForCheck,
  setSelectedVariantIdForCheck,
  initialData,
  categories,
  variants,
  user_id,
  productExists,
  checkingProductExists,
  onVariantSelected,
  watch,
  setValue,
  reset,
  createProductBase,
  createBrand,
  isCreatingBrand,
  updateProductBase,
  updateUserVariant,
  updateProductVariant,
}: UseProductFormHandlersProps) => {
  const navigate = useNavigate();

  // Back handler
  const handleBack = useCallback(() => {
    setFormState(resetFormState());
    setSelectedProductBase(null);
    setSelectedVariantIdForCheck(null);
    onVariantSelected?.(null);
    reset();
  }, [
    setFormState,
    setSelectedProductBase,
    setSelectedVariantIdForCheck,
    onVariantSelected,
    reset,
  ]);

  // Manejar selección de producto base
  const handleProductBaseSelect = (product: BaseProduct | null) => {
    if (!product) {
      setFormState({ step: "search", productBaseId: null });
      setSelectedProductBase(null);
      onVariantSelected?.(null);
      return;
    }
    setSelectedProductBase(product);
    setFormState({
      step: "create-variant",
      productBaseId: product.id,
      variantId: null,
      showVariantForm: false,
    });
  };

  // Manejar creación de nuevo producto base
  const handleCreateNewProductBase = (searchTerm: string) => {
    setFormState({
      step: "create-product-base",
      productBaseId: null,
      searchTerm,
    });
    setValue("name", searchTerm);
  };

  // Handler para crear producto base
  const handleCreateProductBaseSubmit = (data: ProductFormUserType) => {
    const productBaseData: ProductBaseForm = {
      name: data.name,
      brand_id: data.brand_id || 0,
      categories: data.categories || [],
    };

    createProductBase(productBaseData, {
      onSuccess: (response: any) => {
        const newProductBase: BaseProduct = {
          id: response.data.id,
          name: response.data.name,
          brand_id: response.data.brand_id,
          barcode: response.data.barcode,
          categories:
            data.categories
              ?.map((catId) => {
                const cat = categories.find(
                  (c: CategoryItem) => String(c.id) === catId
                );
                return cat ? { id: cat.id, name: cat.name } : null;
              })
              .filter((cat): cat is CategoryItem => cat !== null) || [],
        };

        toast.success("Producto base creado exitosamente");
        setSelectedProductBase(newProductBase);
        setFormState({
          step: "create-variant",
          productBaseId: newProductBase.id,
          variantId: null,
          showVariantForm: false,
        });
      },
      onError: (error: any) => {
        const message =
          error?.data?.data?.message ??
          error?.data?.message ??
          "Error al crear producto base";
        toast.error(message);
      },
    });
  };

  // Handler para crear marca
  const handleCreateBrand = (
    name: string,
    onSuccess: (id: number, name: string) => void
  ) => {
    if (isCreatingBrand) return;
    createBrand(
      { name },
      {
        onSuccess: ({ data }: any) => {
          toast.success("Marca creada exitosamente.");
          onSuccess(Number(data.id), data.name);
        },
        onError: (error: any) => {
          const message = error?.data?.data?.message ?? "Error al crear marca";
          toast.error(message);
        },
      }
    );
  };

  // Manejar selección de variante existente
  const handleVariantSelect = (variantId: number | null) => {
    if (!variantId || !user_id) return;
    setSelectedVariantIdForCheck(variantId);
  };

  // Manejar creación de nueva variante
  const handleCreateNewVariant = () => {
    setFormState({
      step: "create-variant",
      productBaseId: formState.productBaseId!,
      variantId: null,
      showVariantForm: true,
    });
    onVariantSelected?.(null);
  };

  // Cancel handler
  const handleCancel = () => {
    if (isEditMode) {
      navigate("/product");
    } else {
      if (formState.step !== "search") {
        setFormState({ step: "search", productBaseId: null });
        setSelectedProductBase(null);
        onVariantSelected?.(null);
        reset();
      } else {
        reset();
      }
    }
  };

  // Detectar cambios en campos del producto base
  const hasProductBaseChanges = () => {
    if (!isEditMode || !initialProductBaseData) return false;
    const currentName = watch("name");
    const currentBrandId = watch("brand_id");
    const currentCategories = watch("categories") || [];

    return (
      currentName !== initialProductBaseData.name ||
      currentBrandId !== initialProductBaseData.brand_id ||
      JSON.stringify(currentCategories.sort()) !==
        JSON.stringify(initialProductBaseData.categories.sort())
    );
  };

  // Detectar cambios en campos de datos del usuario
  const hasVariantDataChanges = () => {
    if (!isEditMode || !initialData) return false;
    const userDataFields = ["price", "stock_quantity", "min_stock", "status"];

    return userDataFields.some((field) => {
      const currentValue = watch(field as keyof ProductFormUserType);
      const initialValue = initialData[field as keyof ProductFormUserType];
      return currentValue !== initialValue;
    });
  };

  // Detectar cambios solo en la sección de presentación
  const hasPresentationChanges = () => {
    if (!isEditMode || !initialPresentationData) return false;
    const currentPresentation = watch("presentation");
    const currentCapacity = watch("capacity");
    const currentUnitId = watch("unit_id");
    const currentUnits = watch("units");
    const currentBarcode = watch("barcode");

    return (
      currentPresentation !== initialPresentationData.presentation ||
      currentCapacity !== initialPresentationData.capacity ||
      currentUnitId !== initialPresentationData.unit_id ||
      currentUnits !== initialPresentationData.units ||
      currentBarcode !== initialPresentationData.barcode
    );
  };

  // Handler para actualizar producto base
  const handleUpdateProductBase = () => {
    if (!isEditMode || !initialData) return;
    const productBaseId = (initialData as any).product_id;
    if (!productBaseId) return;
    const currentName = watch("name");
    const currentBrandId = watch("brand_id");
    const currentCategories = watch("categories") || [];

    const productBaseData = {
      name: currentName,
      brand_id: currentBrandId,
      categories: currentCategories,
      barcode: watch("barcode"),
      capacity: Number(watch("capacity")),
      unit_id: watch("unit_id"),
      business_types: initialData.business_types || [1],
      units: Number(watch("units")),
    };

    updateProductBase(
      { id: productBaseId, data: productBaseData },
      {
        onSuccess: () => {
          toast.success("Producto base actualizado exitosamente");
          setInitialProductBaseData({
            name: currentName,
            brand_id: currentBrandId,
            categories: currentCategories,
          });
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.data?.message ??
            error?.response?.data?.message ??
            error?.data?.data?.message ??
            error?.data?.message ??
            "Error al actualizar producto base";
          toast.error(message);
        },
      }
    );
  };

  // Handler para actualizar solo datos del usuario
  const handleUpdateVariantData = () => {
    if (!isEditMode || !initialData) return;
    const userProductVariantId = (initialData as any).user_product_variant_id;
    const user_id = localStorage.getItem("user_id");
    if (!userProductVariantId || !user_id) {
      toast.error("Error: Faltan datos necesarios para actualizar");
      return;
    }

    const variantData = {
      user_product_variant_id: userProductVariantId,
      price: Number(watch("price")),
      stock_quantity: Number(watch("stock_quantity")),
      min_stock: Number(watch("min_stock")),
    };

    updateUserVariant(
      { user_product_variant_id: userProductVariantId, data: variantData },
      {
        onSuccess: () => {
          toast.success("Datos del producto actualizados exitosamente");
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.data?.message ??
            error?.response?.data?.message ??
            error?.data?.data?.message ??
            error?.data?.message ??
            "Error al actualizar datos del producto";
          toast.error(message);
        },
      }
    );
  };

  // Handler para cancelar cambios en producto base
  const handleCancelProductBase = () => {
    if (!initialProductBaseData) return;
    setValue("name", initialProductBaseData.name);
    setValue("brand_id", initialProductBaseData.brand_id);
    setValue("categories", initialProductBaseData.categories);
  };

  // Handler para actualizar solo la sección de presentación
  const handleUpdatePresentation = () => {
    if (!isEditMode || !initialData) return;
    const variantId = (initialData as any).variant_id;
    if (!variantId) {
      toast.error("Error: Faltan datos necesarios para actualizar");
      return;
    }

    const presentationData = {
      variant_id: variantId,
      presentation: watch("presentation"),
      capacity: watch("capacity") ? Number(watch("capacity")) : undefined,
      unit_id: watch("unit_id"),
      units: Number(watch("units")),
      barcode: watch("barcode"),
    };

    updateProductVariant(
      { id: variantId, data: presentationData },
      {
        onSuccess: () => {
          toast.success("Presentación actualizada exitosamente");
          setInitialPresentationData({
            presentation: watch("presentation") || "",
            capacity: watch("capacity") || 0,
            unit_id: watch("unit_id") || "",
            units: watch("units") || 1,
            barcode: watch("barcode") || "",
          });
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.data?.message ??
            error?.response?.data?.message ??
            error?.data?.data?.message ??
            error?.data?.message ??
            "Error al actualizar presentación";
          toast.error(message);
        },
      }
    );
  };

  // Handler para cancelar cambios en la sección de presentación
  const handleCancelPresentation = () => {
    if (!initialPresentationData) return;
    setValue("presentation", initialPresentationData.presentation);
    setValue("capacity", initialPresentationData.capacity);
    setValue("unit_id", initialPresentationData.unit_id);
    setValue("units", initialPresentationData.units);
    setValue("barcode", initialPresentationData.barcode);
  };

  // Efecto para manejar cuando el producto existe o no existe
  useEffect(() => {
    if (
      !checkingProductExists &&
      productExists === true &&
      selectedVariantIdForCheck !== null &&
      user_id
    ) {
      toast.warning("Este producto ya existe en tu inventario", {
        autoClose: 2000,
      });

      const timer = setTimeout(() => {
        handleBack();
      }, 2000);

      return () => clearTimeout(timer);
    } else if (
      !checkingProductExists &&
      productExists === false &&
      selectedVariantIdForCheck !== null &&
      formState.step !== "variant-exists" &&
      formState.productBaseId
    ) {
      const variant = variants.find(
        (v: ProductVariant) => v.id === selectedVariantIdForCheck
      );
      if (variant) {
        setFormState({
          step: "variant-exists",
          productBaseId: formState.productBaseId,
          variantId: selectedVariantIdForCheck,
        });
        onVariantSelected?.(selectedVariantIdForCheck);
        setValue("name", variant.name);
        if (variant.capacity) setValue("capacity", variant.capacity);
        if (variant.units) setValue("units", variant.units);
        if (variant.uom_id) setValue("unit_id", String(variant.uom_id));
        setSelectedVariantIdForCheck(null);
      }
    }
  }, [
    checkingProductExists,
    productExists,
    selectedVariantIdForCheck,
    user_id,
    formState.step,
    formState.productBaseId,
    variants,
    setValue,
    onVariantSelected,
    handleBack,
  ]);

  return {
    handleProductBaseSelect,
    handleCreateNewProductBase,
    handleCreateProductBaseSubmit,
    handleCreateBrand,
    handleVariantSelect,
    handleCreateNewVariant,
    handleCancel,
    handleBack,
    hasProductBaseChanges,
    hasVariantDataChanges,
    hasPresentationChanges,
    handleUpdateProductBase,
    handleUpdateVariantData,
    handleCancelProductBase,
    handleUpdatePresentation,
    handleCancelPresentation,
  };
};
