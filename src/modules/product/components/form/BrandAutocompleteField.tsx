import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { ErrorMessage } from "@/components/error/ErrorMessage";
import type { ProductForm, BrandItemCreate } from "../../product.type";
import { useBrandSearch } from "../../hooks/useBrandSearch";

interface Brand {
    id: number;
    name: string;
}

interface BrandAutocompleteFieldProps {
    control: Control<ProductForm>;
    errors: FieldErrors<ProductForm>;
    brands: Brand[];
    isLoading?: boolean;
    isDisabled?: boolean;
    onCreateBrand: (name: string, onSuccess: (id: number, name: string) => void) => void;
}

export const BrandAutocompleteField = ({
    control,
    errors,
    brands,
    isLoading = false,
    isDisabled = false,
    onCreateBrand,
}: BrandAutocompleteFieldProps) => {
    const { search, rawSearch, setRawSearch, debouncedSetSearch, filteredItems } =
        useBrandSearch(brands);

    return (
        <div className="flex flex-col gap-2">
            <Controller
                control={control}
                name="brand_id"
                rules={{
                    validate: (value) => {
                        if (!value) return "Este campo es requerido.";
                        return true;
                    },
                }}
                render={({ field }) => (
                    <div className="[&_[data-slot=input-wrapper]]:bg-surface [&_[data-slot=input-wrapper]]:border-1 [&_[data-slot=input-wrapper]]:border-border [&_[data-slot=input-wrapper]:hover]:bg-surface">
                        <Autocomplete
                            label="Marca"
                            isDisabled={isLoading || isDisabled}
                            items={filteredItems}
                            inputValue={rawSearch}
                            radius="sm"
                            onInputChange={(value) => {
                                setRawSearch(value);
                                debouncedSetSearch(value);
                            }}
                            onBlur={() => {
                                if (!field.value) {
                                    setRawSearch("");
                                }
                            }}
                            selectedKey={field.value ? Number(field.value) : undefined}
                            onSelectionChange={(key) => {
                                if (key === "create") {
                                    onCreateBrand(search, (id, name) => {
                                        field.onChange(Number(id));
                                        setRawSearch(name);
                                    });
                                    return;
                                }

                                const selectedBrand = brands.find((b) => Number(b.id) === key);
                                if (selectedBrand) {
                                    setRawSearch(selectedBrand.name);
                                    field.onChange(Number(selectedBrand.id));
                                } else {
                                    field.onChange(undefined);
                                }
                            }}
                        >
                            {(brand: BrandItemCreate) => (
                                <AutocompleteItem
                                    key={brand.id}
                                    className={
                                        brand.id === "create" ? " font-bold text-secondary" : ""
                                    }
                                >
                                    {brand.name}
                                </AutocompleteItem>
                            )}
                        </Autocomplete>
                    </div>
                )}
            />
            <ErrorMessage existError={!!errors.brand_id} msg={errors.brand_id?.message} />
        </div>
    );
};
