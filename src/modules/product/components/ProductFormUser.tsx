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

  // Data fetching hooks
  const { data: uomList, isLoading: loadingUomList } = useGetAllUom();
  const { data: categories } = useGetAllCategories();
  const { data: brands = [], isLoading: loadingBrands } = useGetBrands();

  // Mutations
  const { mutate: createProductBase, isPending: isCreatingProductBase } =
    useCreateProductBase();
  const { mutate: createBrand, isPending: isCreatingBrand } = useCreateBrand();

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
    quantity_per_package: 1,
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
    if (initialData) {
      reset({ ...defaultValues, ...initialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, reset]);

  // Auto-completar campos cuando se selecciona un producto base
  useEffect(() => {
    if (selectedProductBase) {
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
  }, [selectedProductBase, setValue, watch]);

  // Manejar selección de producto base
  const handleProductBaseSelect = (product: BaseProduct | null) => {
    console.log("handleProductBaseSelect llamado con:", product);
    if (!product) {
      setFormState({ step: "search", productBaseId: null });
      setSelectedProductBase(null);
      onVariantSelected?.(null);
      return;
    }

    console.log("Actualizando estado con producto:", product.name, product.id);
    setSelectedProductBase(product);
    // Actualizar el estado inmediatamente para que el hook de variantes se active
    setFormState({
      step: "create-variant",
      productBaseId: product.id,
      variantId: null,
      showVariantForm: false, // Inicialmente no mostrar el formulario hasta que se decida
    });
    console.log(
      "Estado actualizado, formState.step debería ser create-variant"
    );
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
                const cat = categories?.find((c) => String(c.id) === catId);
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
      if (variant.units) setValue("quantity_per_package", variant.units);
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

  // Renderizar según el paso actual
  const renderStepContent = () => {
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

  console.log(
    "Render ProductFormUser - formState:",
    formState,
    "selectedProductBase:",
    selectedProductBase?.name
  );

  return (
    <div className="pt-10 max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditMode ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          {formState.step !== "search" && (
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
        {formState.step !== "search" && (
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
      {selectedProductBase &&
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

        {/* Mostrar botones solo cuando la variante está seleccionada o el formulario de variante está visible */}
        {(formState.step === "variant-exists" ||
          (formState.step === "create-variant" &&
            !loadingVariants &&
            (variants.length === 0 || formState.showVariantForm === true))) && (
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
