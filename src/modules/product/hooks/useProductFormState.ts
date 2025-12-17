import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type {
  ProductFormUserType,
  FormState,
  BaseProduct,
  CategoryItem,
} from "../product.type";
import {
  useGetAllCategories,
  useGetAllUom,
  useGetVariantsByProductId,
  useCreateProductBase,
  useGetBrands,
  useCreateBrand,
  useUpdateProduct,
  useUpdateUserProductVariant,
  useUpdateProductVariant,
  useCheckUserProductExists,
} from "./useProduct";

interface UseProductFormStateProps {
  initialData?: Partial<ProductFormUserType>;
  isEditMode?: boolean;
  selectedProductBase: BaseProduct | null;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  setSelectedProductBase: React.Dispatch<
    React.SetStateAction<BaseProduct | null>
  >;
  onVariantSelected?: (variantId: number | null) => void;
}

export const useProductFormState = ({
  initialData,
  isEditMode = false,
  selectedProductBase,
  setFormState,
  setSelectedProductBase,
}: UseProductFormStateProps) => {
  // Estados locales
  const [initialProductBaseData, setInitialProductBaseData] = useState<{
    name: string;
    brand_id: number;
    categories: string[];
  } | null>(null);
  const [initialPresentationData, setInitialPresentationData] = useState<{
    presentation: string;
    capacity: number;
    unit_id: string;
    units: number;
    barcode: string;
  } | null>(null);
  const [selectedVariantIdForCheck, setSelectedVariantIdForCheck] = useState<
    number | null
  >(null);

  const user_id = localStorage.getItem("user_id");

  // Data fetching hooks
  const { data: uomList, isLoading: loadingUomList } = useGetAllUom();
  const { data: categoriesData } = useGetAllCategories(user_id);

  // Asegurar que categories siempre sea un array, manejando diferentes estructuras de respuesta
  const categories = (() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    const data = categoriesData as any;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.categories)) return data.categories;
    return [];
  })();

  const { data: brands = [], isLoading: loadingBrands } = useGetBrands(user_id);

  // Mutations
  const { mutate: createProductBase, isPending: isCreatingProductBase } =
    useCreateProductBase();
  const { mutate: createBrand, isPending: isCreatingBrand } = useCreateBrand();
  const { mutate: updateProductBase, isPending: isUpdatingProductBase } =
    useUpdateProduct();
  const { mutate: updateUserVariant, isPending: isUpdatingVariant } =
    useUpdateUserProductVariant();
  const { mutate: updateProductVariant, isPending: isUpdatingProductVariant } =
    useUpdateProductVariant();

  // Cargar variantes cuando se selecciona un producto base
  const { data: variants = [], isLoading: loadingVariants } =
    useGetVariantsByProductId(
      selectedProductBase?.id ?? null,
      selectedProductBase !== null
    );

  // Verificar si el producto ya existe cuando se selecciona una variante
  const { data: productExists, isLoading: checkingProductExists } =
    useCheckUserProductExists(
      selectedVariantIdForCheck,
      user_id,
      selectedVariantIdForCheck !== null && !!user_id
    );

  const defaultValues: ProductFormUserType = {
    images: [],
    name: "",
    barcode: "",
    brand_id: 0,
    capacity: 0,
    unit_id: "",
    categories: [],
    business_types: [],
    price: 0,
    units: 1,
    status: "ACTIVE",
    stock_quantity: 0,
    min_stock: 1,
    presentation: "",
  };

  // Form management
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormUserType>({
    defaultValues,
    mode: "onSubmit",
  });

  // Load initial data when in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      const categoriesAsStrings = initialData.categories
        ? initialData.categories.map((cat) => String(cat))
        : [];

      reset({
        ...defaultValues,
        ...initialData,
        categories: categoriesAsStrings,
      });

      setValue("categories", categoriesAsStrings, { shouldValidate: false });

      setInitialProductBaseData({
        name: initialData.name || "",
        brand_id: initialData.brand_id || 0,
        categories: categoriesAsStrings,
      });

      setInitialPresentationData({
        presentation: initialData.presentation || "",
        capacity: initialData.capacity || 0,
        unit_id: initialData.unit_id || "",
        units: initialData.units || 1,
        barcode: initialData.barcode || "",
      });

      if (initialData.name) {
        setSelectedProductBase({
          id: (initialData as any).id || 0,
          name: initialData.name || "",
          brand_id: initialData.brand_id,
          categories:
            initialData.categories
              ?.map((catId) => {
                const cat = categories.find(
                  (c: CategoryItem) => String(c.id) === String(catId)
                );
                return cat
                  ? { id: cat.id, name: cat.name, description: "" }
                  : null;
              })
              .filter((cat): cat is CategoryItem => cat !== null) || [],
        });
        setFormState({
          step: "create-variant",
          productBaseId: (initialData as any).id || 0,
          variantId: null,
          showVariantForm: true,
        });
      }
    } else if (initialData) {
      reset({ ...defaultValues, ...initialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, reset, isEditMode]);

  // Auto-completar campos cuando se selecciona un producto base
  useEffect(() => {
    if (selectedProductBase && !isEditMode) {
      if (selectedProductBase.brand_id) {
        setValue("brand_id", selectedProductBase.brand_id);
      }
      if (selectedProductBase.categories) {
        setValue(
          "categories",
          selectedProductBase.categories.map((c) => String(c.id))
        );
      }
      if (selectedProductBase.business_types) {
        setValue("business_types", selectedProductBase.business_types);
      }
    }
  }, [selectedProductBase, setValue, watch, isEditMode]);

  return {
    // Estados
    initialProductBaseData,
    setInitialProductBaseData,
    initialPresentationData,
    setInitialPresentationData,
    selectedVariantIdForCheck,
    setSelectedVariantIdForCheck,

    // Data
    uomList,
    loadingUomList,
    categories,
    brands,
    loadingBrands,
    variants,
    loadingVariants,
    user_id,
    productExists,
    checkingProductExists,

    // Mutations
    createProductBase,
    isCreatingProductBase,
    createBrand,
    isCreatingBrand,
    updateProductBase,
    isUpdatingProductBase,
    updateUserVariant,
    isUpdatingVariant,
    updateProductVariant,
    isUpdatingProductVariant,

    // Form
    handleSubmit,
    register,
    setValue,
    watch,
    control,
    reset,
    errors,
    defaultValues,
  };
};
