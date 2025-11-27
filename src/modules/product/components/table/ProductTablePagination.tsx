import { Button, Select, SelectItem } from "@heroui/react";
import type { Table } from "@tanstack/react-table";
import type { Product } from "../../product.type";
import { PAGE_SIZE_OPTIONS } from "../../constants/product.constants";

interface ProductTablePaginationProps {
    table: Table<Product>;
}

/**
 * Componente de paginación para la tabla de productos
 * Incluye navegación entre páginas y selector de tamaño de página
 */
export const ProductTablePagination = ({
    table,
}: ProductTablePaginationProps) => {
    const { pagination } = table.getState();

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                onPress={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-surface rounded-lg"
            >
                {"<<"}
            </Button>
            <Button
                onPress={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-surface rounded-lg"
            >
                {"<"}
            </Button>
            <Button
                onPress={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="bg-surface rounded-lg"
            >
                {">"}
            </Button>
            <Button
                onPress={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                className="bg-surface rounded-lg"
            >
                {">>"}
            </Button>
            <Select
                defaultSelectedKeys={[String(pagination.pageSize)]}
                onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                }}
                className="text-xs h-10 w-18"
                radius="sm"
                classNames={{
                    trigger: "bg-surface",
                    listbox: "bg-surface-alt rounded-lg",
                }}
            >
                {PAGE_SIZE_OPTIONS.map((pageSize) => (
                    <SelectItem key={pageSize} textValue={String(pageSize)}>
                        {pageSize}
                    </SelectItem>
                ))}
            </Select>
            <span className="text-sm">
                Página {pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
        </div>
    );
};
