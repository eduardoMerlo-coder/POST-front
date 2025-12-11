import { Button } from "@heroui/react";
import type {
  FormState,
  BaseProduct,
  ProductVariant,
  CategoryItem,
} from "../product.type";
import { ProductBaseSearchField } from "./form/ProductBaseSearchField";
import { VariantSelectorField } from "./form/VariantSelectorField";
import { VariantFormSection } from "./form/VariantFormSelection";
import { UserProductDataSection } from "./form/UserProductDataSection";
import { ProductNameField } from "./form/ProductNameField";
import { BrandAutocompleteField } from "./form/BrandAutocompleteField";
import { CategoriesField } from "./form/CategoriesField";
import { MdTipsAndUpdates } from "react-icons/md";
import type { UseFormReturn } from "react-hook-form";
import type { ProductFormUserType } from "../product.type";

interface ProductFormStepsProps {
  isEditMode: boolean;
  isPending: boolean;
  formState: FormState;
  selectedProductBase: BaseProduct | null;
  loadingVariants: boolean;
  variants: ProductVariant[];
  categories: CategoryItem[];
  brands: { id: number; name: string }[];
  loadingBrands: boolean;
  uomList: any[] | undefined;
  loadingUomList: boolean;
  // Form methods
  register: UseFormReturn<ProductFormUserType>["register"];
  control: UseFormReturn<ProductFormUserType>["control"];
  errors: UseFormReturn<ProductFormUserType>["formState"]["errors"];
  setValue: UseFormReturn<ProductFormUserType>["setValue"];
  watch: UseFormReturn<ProductFormUserType>["watch"];
  handleSubmit: UseFormReturn<ProductFormUserType>["handleSubmit"];
  // Handlers
  handleProductBaseSelect: (product: BaseProduct | null) => void;
  handleCreateNewProductBase: (searchTerm: string) => void;
  handleCreateProductBaseSubmit: (data: ProductFormUserType) => void;
  handleCreateBrand: (
    name: string,
    onSuccess: (id: number, name: string) => void
  ) => void;
  handleVariantSelect: (variantId: number | null) => void;
  handleCreateNewVariant: () => void;
  handleBack: () => void;
  // Update handlers (edit mode)
  hasProductBaseChanges?: () => boolean;
  hasVariantDataChanges?: () => boolean;
  hasPresentationChanges?: () => boolean;
  handleUpdateProductBase?: () => void;
  handleUpdateVariantData?: () => void;
  handleUpdatePresentation?: () => void;
  handleCancelProductBase?: () => void;
  handleCancelPresentation?: () => void;
  // Loading states
  isCreatingProductBase: boolean;
  isCreatingBrand: boolean;
  isUpdatingProductBase: boolean;
  isUpdatingVariant: boolean;
  isUpdatingProductVariant: boolean;
}

export const ProductFormSteps = ({
  isEditMode,
  isPending,
  formState,
  selectedProductBase,
  loadingVariants,
  variants,
  categories,
  brands,
  loadingBrands,
  uomList,
  loadingUomList,
  register,
  control,
  errors,
  setValue,
  watch,
  handleSubmit,
  handleProductBaseSelect,
  handleCreateNewProductBase,
  handleCreateProductBaseSubmit,
  handleCreateBrand,
  handleVariantSelect,
  handleCreateNewVariant,
  handleBack,
  hasProductBaseChanges,
  hasPresentationChanges,
  handleUpdateProductBase,
  handleUpdatePresentation,
  handleCancelProductBase,
  handleCancelPresentation,
  isCreatingProductBase,
  isCreatingBrand,
  isUpdatingProductBase,
  isUpdatingProductVariant,
}: ProductFormStepsProps) => {
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

          {/* Botones para actualizar producto base */}
          {hasProductBaseChanges &&
            hasProductBaseChanges() &&
            handleUpdateProductBase &&
            handleCancelProductBase && (
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
          uomList={uomList || []}
          isLoadingUom={loadingUomList}
          isDisabled={isPending || isUpdatingProductVariant}
          productBaseName={selectedProductBase?.name}
          setValue={setValue}
          watch={watch}
        />

        {/* Botones para actualizar presentación */}
        {hasPresentationChanges &&
          hasPresentationChanges() &&
          handleUpdatePresentation &&
          handleCancelPresentation && (
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

  // Paso: search
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

  // Paso: create-product-base
  if (formState.step === "create-product-base") {
    return (
      <div className="space-y-6">
        <div className="mt-4 px-4 py-3 rounded-lg bg-transparent border border-green-600 flex items-start gap-3">
          <MdTipsAndUpdates className="size-5 text-green-600" />
          <p className="text-sm text-primary">
            <span className="font-semibold text-green-600">Nota:</span> Primero
            necesitas crear el producto base, luego podrás crear la variante.
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

  // Paso: variant-exists
  if (formState.step === "variant-exists") {
    return (
      <div className="space-y-6">
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

  // Paso: create-variant
  return (
    <div className="space-y-6">
      {loadingVariants && formState.step === "create-variant" && (
        <div className="text-center py-4">
          <p className="text-gray-600">Cargando variantes...</p>
        </div>
      )}

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

      {formState.step === "create-variant" &&
        !loadingVariants &&
        (variants.length === 0 || formState.showVariantForm === true) && (
          <>
            <VariantFormSection
              control={control}
              register={register}
              errors={errors}
              uomList={uomList || []}
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
