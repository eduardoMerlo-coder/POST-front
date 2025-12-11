import { useState } from "react";
import { Button } from "@heroui/react";
import type {
  ProductFormUserType,
  FormState,
  BaseProduct,
} from "../product.type";
import { FaChevronLeft } from "react-icons/fa6";
import { useProductFormState } from "../hooks/useProductFormState";
import { useProductFormHandlers } from "../hooks/useProductFormHandlers";
import { ProductFormSteps } from "./ProductFormSteps";
import { ProductBaseSearchField } from "./form/ProductBaseSearchField";

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
  // Estados principales del formulario
  const [formState, setFormState] = useState<FormState>({
    step: "search",
    productBaseId: null,
  });
  const [selectedProductBase, setSelectedProductBase] =
    useState<BaseProduct | null>(null);

  // Hook para manejar estado, data fetching y efectos
  const state = useProductFormState({
    initialData,
    isEditMode,
    selectedProductBase,
    formState,
    setFormState,
    setSelectedProductBase,
    onVariantSelected,
  });

  // Hook para manejar todos los handlers
  const handlers = useProductFormHandlers({
    isEditMode,
    formState,
    setFormState,
    selectedProductBase,
    setSelectedProductBase,
    initialProductBaseData: state.initialProductBaseData,
    setInitialProductBaseData: state.setInitialProductBaseData,
    initialPresentationData: state.initialPresentationData,
    setInitialPresentationData: state.setInitialPresentationData,
    selectedVariantIdForCheck: state.selectedVariantIdForCheck,
    setSelectedVariantIdForCheck: state.setSelectedVariantIdForCheck,
    initialData,
    categories: state.categories,
    variants: state.variants,
    loadingVariants: state.loadingVariants,
    user_id: state.user_id,
    productExists: state.productExists,
    checkingProductExists: state.checkingProductExists,
    onVariantSelected,
    watch: state.watch,
    setValue: state.setValue,
    reset: state.reset,
    handleSubmit: state.handleSubmit,
    createProductBase: state.createProductBase,
    isCreatingProductBase: state.isCreatingProductBase,
    createBrand: state.createBrand,
    isCreatingBrand: state.isCreatingBrand,
    updateProductBase: state.updateProductBase,
    isUpdatingProductBase: state.isUpdatingProductBase,
    updateUserVariant: state.updateUserVariant,
    isUpdatingVariant: state.isUpdatingVariant,
    updateProductVariant: state.updateProductVariant,
    isUpdatingProductVariant: state.isUpdatingProductVariant,
  });

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
            onPress={handlers.handleBack}
            isDisabled={isPending}
            className="text-secondary hover:text-primary bg-transparent text-sm"
          >
            <FaChevronLeft /> Volver a búsqueda
          </Button>
        )}
      </div>

      {/* Mostrar select de producto base cuando hay un producto seleccionado */}
      {!isEditMode &&
        selectedProductBase &&
        formState.step !== "search" &&
        formState.step !== "create-product-base" && (
          <div className="mb-6">
            <ProductBaseSearchField
              onSelect={handlers.handleProductBaseSelect}
              onCreateNew={handlers.handleCreateNewProductBase}
              isDisabled={isPending}
              selectedProductId={selectedProductBase?.id}
              selectedProduct={selectedProductBase}
            />
          </div>
        )}

      <form
        onSubmit={state.handleSubmit((data) => {
          const customReset = () => {
            state.reset();
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
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        <ProductFormSteps
          isEditMode={isEditMode}
          isPending={isPending}
          formState={formState}
          selectedProductBase={selectedProductBase}
          loadingVariants={state.loadingVariants}
          variants={state.variants}
          categories={state.categories}
          brands={state.brands}
          loadingBrands={state.loadingBrands}
          uomList={state.uomList}
          loadingUomList={state.loadingUomList}
          register={state.register}
          control={state.control}
          errors={state.errors}
          setValue={state.setValue}
          watch={state.watch}
          handleSubmit={state.handleSubmit}
          handleProductBaseSelect={handlers.handleProductBaseSelect}
          handleCreateNewProductBase={handlers.handleCreateNewProductBase}
          handleCreateProductBaseSubmit={handlers.handleCreateProductBaseSubmit}
          handleCreateBrand={handlers.handleCreateBrand}
          handleVariantSelect={handlers.handleVariantSelect}
          handleCreateNewVariant={handlers.handleCreateNewVariant}
          handleBack={handlers.handleBack}
          hasProductBaseChanges={handlers.hasProductBaseChanges}
          hasVariantDataChanges={handlers.hasVariantDataChanges}
          hasPresentationChanges={handlers.hasPresentationChanges}
          handleUpdateProductBase={handlers.handleUpdateProductBase}
          handleUpdateVariantData={handlers.handleUpdateVariantData}
          handleUpdatePresentation={handlers.handleUpdatePresentation}
          handleCancelProductBase={handlers.handleCancelProductBase}
          handleCancelPresentation={handlers.handleCancelPresentation}
          isCreatingProductBase={state.isCreatingProductBase}
          isCreatingBrand={state.isCreatingBrand}
          isUpdatingProductBase={state.isUpdatingProductBase}
          isUpdatingVariant={state.isUpdatingVariant}
          isUpdatingProductVariant={state.isUpdatingProductVariant}
        />

        {/* Mostrar botones en modo edición o cuando la variante está seleccionada */}
        {isEditMode
          ? handlers.hasVariantDataChanges &&
            handlers.hasVariantDataChanges() && (
              <div className="flex gap-4 justify-end mt-6">
                <Button
                  type="button"
                  radius="sm"
                  disabled={isPending || state.isUpdatingVariant}
                  onPress={handlers.handleCancel}
                  className="bg-surface-alt font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  radius="sm"
                  disabled={isPending || state.isUpdatingVariant}
                  onPress={handlers.handleUpdateVariantData}
                  className="bg-accent font-semibold"
                >
                  {state.isUpdatingVariant ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            )
          : (formState.step === "variant-exists" ||
              (formState.step === "create-variant" &&
                !state.loadingVariants &&
                (state.variants.length === 0 ||
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
                  onPress={handlers.handleCancel}
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
