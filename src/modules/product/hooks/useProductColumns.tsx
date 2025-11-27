import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "../product.type";
import { ProductActionsCell } from "../components/ProductActionsCell";
import { COLUMN_MIN_SIZE } from "../constants/product.constants";

interface UseProductColumnsProps {
    role: string;
    onView: (id: number) => void;
    onDelete?: (id: number) => void;
}

/**
 * Hook personalizado para definir las columnas de la tabla de productos
 * Las columnas se ajustan según el rol del usuario
 */
export const useProductColumns = ({
    role,
    onView,
    onDelete,
}: UseProductColumnsProps): ColumnDef<Product, any>[] => {
    return useMemo<ColumnDef<Product, any>[]>(
        () => [
            {
                accessorKey: "name",
                cell: (info) => info.getValue(),
                header: () => <span>Nombre</span>,
                minSize: COLUMN_MIN_SIZE,
            },
            // Columna de precio solo visible para admin
            ...(role === "admin"
                ? [
                    {
                        accessorKey: "price",
                        cell: (info: any) => info.getValue(),
                        header: () => <span>Precio</span>,
                        minSize: COLUMN_MIN_SIZE,
                    },
                ]
                : []),
            {
                accessorKey: "brand.name",
                header: "Marca",
                cell: (info) => info.getValue(),
                minSize: COLUMN_MIN_SIZE,
            },
            {
                accessorKey: "capacity_unit",
                header: "Unidad de medida",
                cell: (info) => <>{info.row.original.capacity} {info.row.original.unit.name}</>,
                minSize: COLUMN_MIN_SIZE,
            },
            {
                accessorKey: "internal_code",
                header: () => "Código interno",
                cell: (info) => info.getValue(),
                minSize: COLUMN_MIN_SIZE,
            },
            {
                accessorKey: "barcode",
                header: () => "Código de barras",
                cell: (info) => info.getValue(),
                minSize: COLUMN_MIN_SIZE,
            },
            {
                accessorKey: "actions",
                header: () => "Acciones",
                cell: (info) => (
                    <ProductActionsCell
                        productId={info.row.original.id}
                        onView={onView}
                        onDelete={onDelete}
                    />
                ),
                minSize: COLUMN_MIN_SIZE,
            },
        ],
        [role, onView, onDelete]
    );
};
