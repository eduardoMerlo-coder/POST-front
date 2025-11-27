import { Button } from "@heroui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { ProductForm as ProductFormType } from "../product.type";
import { ProductNameField } from "../components/form/ProductNameField";
import { InternalCodeField } from "../components/form/InternalCodeField";
import { BarcodeField } from "../components/form/BarcodeField";
import { UnitOfMeasureField } from "../components/form/UnitOfMeasureField";
import { BrandAutocompleteField } from "../components/form/BrandAutocompleteField";
import { PackagingTypeField } from "../components/form/PackagingTypeField";
import { CapacityField } from "../components/form/CapacityField";
import { CategoriesField } from "../components/form/CategoriesField";
import {
    useCreateBrand,
    useGetAllCategories,
    useGetAllPackagingType,
    useGetAllUom,
    useGetBrands,
} from "../hooks/useProduct";

interface ProductFormProps {
    initialData?: Partial<ProductFormType>;
    onSubmit: (data: ProductFormType) => void;
    isPending: boolean;
    isEditMode?: boolean;
}

export const ProductForm = ({
    initialData,
    onSubmit,
    isPending,
    isEditMode = false,
}: ProductFormProps) => {
    const navigate = useNavigate();

    // Data fetching hooks
    const { data: uomList, isLoading: loadingUomList } = useGetAllUom();
    const { data: packagingList, isLoading: loadingPackagingList } =
        useGetAllPackagingType();
    const { data: categories, isLoading: loadingCategories } =
        useGetAllCategories();
    const { data: brands = [], isLoading: loadingBrands } = useGetBrands();

    // Form management
    const {
        handleSubmit,
        register,
        setValue,
        watch,
        control,
        reset,
        formState: { errors },
    } = useForm<ProductFormType>({
        defaultValues: {
            name: "",
            internal_code: "",
            barcode: "",
            brand_id: 0,
            packaging_type_id: undefined,
            capacity: 0,
            unit_id: "",
            categories: [],
        },
    });

    // Mutations
    const { mutate: createBrand } = useCreateBrand();

    // Load initial data when in edit mode
    useEffect(() => {
        if (initialData) {
            Object.entries(initialData).forEach(([key, value]) => {
                setValue(key as keyof ProductFormType, value);
            });
        }
    }, [initialData, setValue]);

    // Brand creation handler
    const handleCreateBrand = (
        name: string,
        onSuccess: (id: number, name: string) => void
    ) => {
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

    // Cancel handler
    const handleCancel = () => {
        if (isEditMode) {
            navigate("/product");
        } else {
            reset();
        }
    };

    return (
        <div className="pt-10">
            <h2 className="text-2xl font-bold mb-6">
                {isEditMode ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 mb-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <ProductNameField
                        register={register}
                        errors={errors}
                        isDisabled={isPending}
                    />

                    <InternalCodeField
                        register={register}
                        setValue={setValue}
                        watch={watch}
                        isDisabled={isPending}
                    />

                    {!watch("internal_code") && (
                        <BarcodeField register={register} isDisabled={isPending} />
                    )}

                    <UnitOfMeasureField
                        control={control}
                        errors={errors}
                        uomList={uomList}
                        isLoading={loadingUomList}
                        isDisabled={isPending}
                    />

                    <BrandAutocompleteField
                        control={control}
                        errors={errors}
                        brands={brands}
                        isLoading={loadingBrands}
                        isDisabled={isPending}
                        onCreateBrand={handleCreateBrand}
                    />

                    <PackagingTypeField
                        control={control}
                        errors={errors}
                        packagingList={packagingList}
                        isLoading={loadingPackagingList}
                        isDisabled={isPending}
                    />

                    <CapacityField
                        register={register}
                        errors={errors}
                        isDisabled={isPending}
                    />

                    <CategoriesField
                        control={control}
                        categories={categories}
                        isLoading={loadingCategories}
                        isDisabled={isPending}
                    />
                </div>

                <div className="flex gap-4 justify-end">
                    <Button type="submit" disabled={isPending} className="bg-accent font-semibold">
                        {isEditMode ? "Actualizar" : "Guardar"}
                    </Button>
                    <Button
                        type="button"
                        disabled={isPending}
                        onPress={handleCancel}
                        className="bg-surface-alt font-semibold"
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};
