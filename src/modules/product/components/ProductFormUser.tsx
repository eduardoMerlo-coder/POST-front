import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type {
  ProductFormUserType,
  FormState,
  BaseProduct,
  ProductVariant,
  ProductBaseForm,
  CategoryItem,
} from "../product.type";
import { ProductBaseSearchField } from "./form/ProductBaseSearchField";
import { VariantSelectorField } from "./form/VariantSelectorField";
import { VariantFormSection } from "./form/VariantFormSelection";
import { UserProductDataSection } from "./form/UserProductDataSection";
import { ProductNameField } from "./form/ProductNameField";
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
} from "../hooks/useProduct";
import { BrandAutocompleteField } from "./form/BrandAutocompleteField";
import { CategoriesField } from "./form/CategoriesField";
import { toast } from "react-toastify";
import { FaChevronLeft } from "react-icons/fa6";
import { MdTipsAndUpdates } from "react-icons/md";

interface ProductFormProps {
  initialData?: Partial<ProductFormUserType>;
  onSubmit: (
    data: ProductFormUserType,
    reset: () => void,
    productBaseId?: number
  ) => void;
  isPending: boolean;
  isEditMode?: boolean;
  onVariantSelected?: (variantId: number | null) => void;
}

const resetFormState = () => {
  return {
    step: "search" as const,
    productBaseId: null,
  };
};

export const ProductForm = ({
  initialData,
  onSubmit,
  isPending,
  isEditMode = false,
  onVariantSelected,
}: ProductFormProps) => {
  const navigate = useNavigate();

  // Estado del formulario (flujo de dos pasos)
  const [formState, setFormState] = useState<FormState>({
    step: "search",
    productBaseId: null,
  });
  const [selectedProductBase, setSelectedProductBase] =
    useState<BaseProduct | null>(null);
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

  // Data fetching hooks
  const { data: uomList, isLoading: loadingUomList } = useGetAllUom();
  const { data: categoriesData } = useGetAllCategories();
  // Asegurar que categories siempre sea un array, manejando diferentes estructuras de respuesta
  const categories = (() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    // Si la respuesta tiene una estructura diferente (objeto con data o categories)
    const data = categoriesData as any;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.categories)) return data.categories;
    return [];
  })();
  const { data: brands = [], isLoading: loadingBrands } = useGetBrands();

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
      // Convertir categories de números a strings si vienen como números
      const categoriesAsStrings = initialData.categories
        ? initialData.categories.map((cat) => String(cat))
        : [];

      reset({
        ...defaultValues,
        ...initialData,
        categories: categoriesAsStrings,
      });

      // Asegurar que categories se establezca explícitamente después del reset
      setValue("categories", categoriesAsStrings, { shouldValidate: false });

      // Guardar valores iniciales del producto base para detectar cambios
      setInitialProductBaseData({
        name: initialData.name || "",
        brand_id: initialData.brand_id || 0,
        categories: categoriesAsStrings,
      });
      // Guardar valores iniciales de la sección de presentación para detectar cambios
      setInitialPresentationData({
        presentation: initialData.presentation || "",
        capacity: initialData.capacity || 0,
        unit_id: initialData.unit_id || "",
        units: initialData.units || 1,
        barcode: initialData.barcode || "",
      });
      // Si hay datos iniciales, configurar el estado para mostrar todos los campos
      if (initialData.name) {
        // Simular que hay un producto base seleccionado
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
  // NO ejecutar en modo edición para no sobrescribir los valores iniciales
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
      // No auto-completar el nombre de presentación, debe ser ingresado manualmente
    }
  }, [selectedProductBase, setValue, watch, isEditMode]);

  // Manejar selección de producto base
  const handleProductBaseSelect = (product: BaseProduct | null) => {
    if (!product) {
      setFormState({ step: "search", productBaseId: null });
      setSelectedProductBase(null);
      onVariantSelected?.(null);
      return;
    }
    setSelectedProductBase(product);
    // Actualizar el estado inmediatamente para que el hook de variantes se active
    setFormState({
      step: "create-variant",
      productBaseId: product.id,
      variantId: null,
      showVariantForm: false, // Inicialmente no mostrar el formulario hasta que se decida
    });
  };

  // Manejar creación de nuevo producto base
  const handleCreateNewProductBase = (searchTerm: string) => {
    setFormState({
      step: "create-product-base",
      productBaseId: null,
      searchTerm,
    });
    // Pre-llenar el nombre en el formulario
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
                const cat = categories.find((c: CategoryItem) => String(c.id) === catId);
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
        onSuccess: ({ data }) => {
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

  // Cuando se cargan las variantes, decidir el siguiente paso
  useEffect(() => {
    if (
      selectedProductBase &&
      formState.productBaseId === selectedProductBase.id &&
      !loadingVariants &&
      formState.step === "create-variant" &&
      formState.variantId === null
    ) {
      // Si hay variantes, mostramos el selector
      // Si no hay variantes, mantenemos create-variant para crear nueva
      // No cambiamos el estado aquí, solo cuando el usuario selecciona
    }
  }, [loadingVariants, selectedProductBase, formState]);

  // Manejar selección de variante existente
  const handleVariantSelect = (variantId: number | null) => {
    if (!variantId) return;

    const variant = variants.find((v: ProductVariant) => v.id === variantId);
    if (variant) {
      setFormState({
        step: "variant-exists",
        productBaseId: formState.productBaseId!,
        variantId,
      });
      // Notificar al componente padre sobre la variante seleccionada
      onVariantSelected?.(variantId);
      // Auto-completar campos de la variante (solo para mostrar, no se usan)
      setValue("name", variant.name);
      if (variant.capacity) setValue("capacity", variant.capacity);
      if (variant.units) setValue("units", variant.units);
      if (variant.uom_id) setValue("unit_id", String(variant.uom_id));
    }
  };

  // Manejar creación de nueva variante
  const handleCreateNewVariant = () => {
    setFormState({
      step: "create-variant",
      productBaseId: formState.productBaseId!,
      variantId: null,
      showVariantForm: true, // Flag para indicar que el usuario quiere crear nueva variante
    });
    // Notificar que no hay variante seleccionada (se creará nueva)
    onVariantSelected?.(null);
  };

  // Cancel handler
  const handleCancel = () => {
    if (isEditMode) {
      navigate("/product");
    } else {
      if (formState.step !== "search") {
        // Volver al paso de búsqueda
        setFormState({ step: "search", productBaseId: null });
        setSelectedProductBase(null);
        onVariantSelected?.(null);
        reset();
      } else {
        reset();
      }
    }
  };

  // Back handler
  const handleBack = () => {
    setFormState({ step: "search", productBaseId: null });
    setSelectedProductBase(null);
    onVariantSelected?.(null);
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

  // Detectar cambios en campos de datos del usuario (excluyendo presentación)
  const hasVariantDataChanges = () => {
    if (!isEditMode || !initialData) return false;
    // Solo detectar cambios en campos de datos del usuario, no en presentación
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
          // Actualizar los valores iniciales
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

  // Handler para actualizar solo datos del usuario (user_product_variant)
  // Envía: user_id, variant_id, price, stock_quantity, min_stock
  const handleUpdateVariantData = () => {
    if (!isEditMode || !initialData) return;
    const userProductVariantId = (initialData as any).user_product_variant_id;
    const user_id = localStorage.getItem("user_id");
    if (!userProductVariantId || !user_id) {
      toast.error("Error: Faltan datos necesarios para actualizar");
      return;
    }

    // Solo enviar campos de la tabla user_product_variant
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
          // Actualizar los valores iniciales de presentación
          const currentPresentation = watch("presentation");
          const currentCapacity = watch("capacity");
          const currentUnitId = watch("unit_id");
          const currentUnits = watch("units");
          const currentBarcode = watch("barcode");
          setInitialPresentationData({
            presentation: currentPresentation || "",
            capacity: currentCapacity || 0,
            unit_id: currentUnitId || "",
            units: currentUnits || 1,
            barcode: currentBarcode || "",
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

  // Renderizar según el paso actual
  const renderStepContent = () => {
    // En modo edición, mostrar todos los campos de una vez
    if (isEditMode) {
      return (
        <div className="space-y-6">
          {/* Producto Base */}
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-semibold text-primary">
                Producto Base
              </h3>
              <p className="text-sm text-secondary mt-1">
                Información básica del producto
              </p>
            </div>

            {!isEditMode && (
              <div className="max-w-2xl">
                <ProductBaseSearchField
                  onSelect={handleProductBaseSelect}
                  onCreateNew={handleCreateNewProductBase}
                  isDisabled={isPending}
                  selectedProductId={selectedProductBase?.id}
                  selectedProduct={selectedProductBase}
                />
              </div>
            )}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <ProductNameField
                register={register}
                errors={errors}
                isDisabled={isPending || isUpdatingProductBase}
                setValue={setValue}
                showEndButton={false}
              />

              <BrandAutocompleteField
                control={control}
                errors={errors}
                brands={brands}
                isLoading={loadingBrands}
                isCreating={isCreatingBrand}
                isDisabled={isPending || isUpdatingProductBase}
                onCreateBrand={handleCreateBrand}
              />

              <CategoriesField
                control={control}
                categories={categories}
                isLoading={false}
                isDisabled={isPending || isUpdatingProductBase}
              />
            </div>

            {/* Botones para actualizar producto base (solo en modo edición y si hay cambios) */}
            {isEditMode && hasProductBaseChanges() && (
              <div className="flex gap-4 justify-end mt-4">
                <Button
                  type="button"
                  radius="sm"
                  disabled={isPending || isUpdatingProductBase}
                  onPress={handleCancelProductBase}
                  className="bg-surface-alt font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  radius="sm"
                  disabled={isPending || isUpdatingProductBase}
                  onPress={handleUpdateProductBase}
                  className="bg-accent font-semibold"
                >
                  {isUpdatingProductBase
                    ? "Actualizando..."
                    : "Actualizar producto base"}
                </Button>
              </div>
            )}
          </div>

          {/* Presentación del Producto */}
          <VariantFormSection
            control={control}
            register={register}
            errors={errors}
            uomList={uomList}
            isLoadingUom={loadingUomList}
            isDisabled={isPending || isUpdatingProductVariant}
            productBaseName={selectedProductBase?.name}
            setValue={setValue}
            watch={watch}
          />

          {/* Botones para actualizar presentación (solo en modo edición y si hay cambios) */}
          {isEditMode && hasPresentationChanges() && (
            <div className="flex gap-4 justify-end mt-4">
              <Button
                type="button"
                radius="sm"
                disabled={isPending || isUpdatingProductVariant}
                onPress={handleCancelPresentation}
                className="bg-surface-alt font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                radius="sm"
                disabled={isPending || isUpdatingProductVariant}
                onPress={handleUpdatePresentation}
                className="bg-accent font-semibold"
              >
                {isUpdatingProductVariant
                  ? "Actualizando..."
                  : "Actualizar presentación"}
              </Button>
            </div>
          )}

          {/* Datos del Usuario */}
          <UserProductDataSection
            register={register}
            errors={errors}
            isDisabled={isPending}
          />
        </div>
      );
    }

    if (formState.step === "search") {
      return (
        <div className="space-y-6">
          <div className="max-w-2xl">
            <ProductBaseSearchField
              onSelect={handleProductBaseSelect}
              onCreateNew={handleCreateNewProductBase}
              isDisabled={isPending}
              selectedProductId={selectedProductBase?.id}
              selectedProduct={selectedProductBase}
            />
          </div>
          {selectedProductBase && loadingVariants && (
            <div className="text-center py-4">
              <p className="text-gray-600">Cargando variantes...</p>
            </div>
          )}
        </div>
      );
    }

    if (formState.step === "create-product-base") {
      return (
        <div className="space-y-6">
          <div className="mt-4 px-4 py-3 rounded-lg bg-transparent border border-green-600 flex items-start gap-3">
            <MdTipsAndUpdates className="size-5 text-green-600" />
            <p className="text-sm text-primary">
              <span className="font-semibold text-green-600">Nota:</span>{" "}
              Primero necesitas crear el producto base, luego podrás crear la
              variante.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <ProductNameField
              register={register}
              errors={errors}
              isDisabled={isPending || isCreatingProductBase}
              setValue={setValue}
              showEndButton={true}
            />

            <BrandAutocompleteField
              control={control}
              errors={errors}
              brands={brands}
              isLoading={loadingBrands}
              isCreating={isCreatingBrand}
              isDisabled={isPending || isCreatingProductBase}
              onCreateBrand={handleCreateBrand}
            />

            <CategoriesField
              control={control}
              categories={categories}
              isLoading={false}
              isDisabled={isPending || isCreatingProductBase}
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              radius="sm"
              disabled={isPending || isCreatingProductBase}
              onPress={handleBack}
              className="bg-surface-alt font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              radius="sm"
              disabled={isPending || isCreatingProductBase}
              onPress={() => handleSubmit(handleCreateProductBaseSubmit)()}
              className="bg-accent font-semibold"
            >
              {isCreatingProductBase ? "Creando..." : "Crear Producto Base"}
            </Button>
          </div>
        </div>
      );
    }

    if (formState.step === "variant-exists") {
      return (
        <div className="space-y-6">
          {/* Mostrar selector de variantes con la variante seleccionada */}
          {variants.length > 0 && (
            <div className="mb-6">
              <VariantSelectorField
                variants={variants}
                selectedVariantId={formState.variantId}
                onSelect={handleVariantSelect}
                onCreateNew={handleCreateNewVariant}
                isDisabled={isPending}
                isLoading={loadingVariants}
              />
            </div>
          )}

          <UserProductDataSection
            register={register}
            errors={errors}
            isDisabled={isPending}
          />
        </div>
      );
    }

    // create-variant
    return (
      <div className="space-y-6">
        {/* Mostrar mensaje si está cargando variantes */}
        {loadingVariants && formState.step === "create-variant" && (
          <div className="text-center py-4">
            <p className="text-gray-600">Cargando variantes...</p>
          </div>
        )}

        {/* Mostrar selector de variantes si hay variantes disponibles y no se ha elegido crear nueva */}
        {!loadingVariants &&
          formState.step === "create-variant" &&
          variants.length > 0 &&
          formState.showVariantForm !== true && (
            <div className="mb-6">
              <VariantSelectorField
                variants={variants}
                selectedVariantId={null}
                onSelect={handleVariantSelect}
                onCreateNew={handleCreateNewVariant}
                isDisabled={isPending}
                isLoading={loadingVariants}
              />
            </div>
          )}

        {/* Mostrar formulario de nueva variante solo si:
            - No hay variantes disponibles, O
            - El usuario explícitamente eligió crear nueva variante */}
        {formState.step === "create-variant" &&
          !loadingVariants &&
          (variants.length === 0 || formState.showVariantForm === true) && (
            <>
              <VariantFormSection
                control={control}
                register={register}
                errors={errors}
                uomList={uomList}
                isLoadingUom={loadingUomList}
                isDisabled={isPending}
                productBaseName={selectedProductBase?.name}
                setValue={setValue}
                watch={watch}
              />

              <UserProductDataSection
                register={register}
                errors={errors}
                isDisabled={isPending}
              />
            </>
          )}
      </div>
    );
  };
  return (
    <div className="pt-10 max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditMode ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          {!isEditMode && formState.step !== "search" && (
            <p className="text-sm text-secondary mt-1">
              Paso 2 de 2:{" "}
              {formState.step === "variant-exists"
                ? "Datos del usuario"
                : formState.step === "create-product-base"
                ? "Crear producto base"
                : "Crear variante y datos del usuario"}
            </p>
          )}
        </div>
        {!isEditMode && formState.step !== "search" && (
          <Button
            type="button"
            onPress={handleBack}
            isDisabled={isPending}
            className="text-secondary hover:text-primary bg-transparent text-sm"
          >
            <FaChevronLeft /> Volver a búsqueda
          </Button>
        )}
      </div>

      {/* Mostrar select de producto base cuando hay un producto seleccionado y no estamos en el paso de búsqueda */}
      {!isEditMode &&
        selectedProductBase &&
        formState.step !== "search" &&
        formState.step !== "create-product-base" && (
          <div className="mb-6">
            <ProductBaseSearchField
              onSelect={handleProductBaseSelect}
              onCreateNew={handleCreateNewProductBase}
              isDisabled={isPending}
              selectedProductId={selectedProductBase?.id}
              selectedProduct={selectedProductBase}
            />
          </div>
        )}

      <form
        onSubmit={handleSubmit((data) => {
          const customReset = () => {
            reset();
            setFormState(resetFormState());
            setSelectedProductBase(null);
            onVariantSelected?.(null);
          };
          onSubmit(
            data,
            customReset,
            formState.productBaseId ?? selectedProductBase?.id ?? undefined
          );
        })}
        onKeyDown={(e) => {
          // Prevenir el envío del formulario al presionar Enter
          // Solo permitir envío mediante el botón "Guardar"
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        {renderStepContent()}

        {/* Mostrar botones en modo edición o cuando la variante está seleccionada o el formulario de variante está visible */}
        {isEditMode
          ? // En modo edición, mostrar botones solo si hay cambios en variante/datos usuario
            hasVariantDataChanges() && (
              <div className="flex gap-4 justify-end mt-6">
                <Button
                  type="button"
                  radius="sm"
                  disabled={isPending || isUpdatingVariant}
                  onPress={handleCancel}
                  className="bg-surface-alt font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  radius="sm"
                  disabled={isPending || isUpdatingVariant}
                  onPress={handleUpdateVariantData}
                  className="bg-accent font-semibold"
                >
                  {isUpdatingVariant ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            )
          : // En modo creación, mostrar botones normales
            (formState.step === "variant-exists" ||
              (formState.step === "create-variant" &&
                !loadingVariants &&
                (variants.length === 0 ||
                  formState.showVariantForm === true))) && (
              <div className="flex gap-4 justify-end mt-6">
                <Button
                  type="submit"
                  radius="sm"
                  disabled={isPending}
                  className="bg-accent font-semibold"
                >
                  {isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  type="button"
                  radius="sm"
                  disabled={isPending}
                  onPress={handleCancel}
                  className="bg-surface-alt font-semibold"
                >
                  Cancelar
                </Button>
              </div>
            )}
      </form>
    </div>
  );
};
