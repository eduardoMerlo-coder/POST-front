import { Select, SelectItem } from "@heroui/react";
import type { Table } from "@tanstack/react-table";
import type { Product } from "../../product.type";
import { PAGE_SIZE_OPTIONS } from "../../constants/product.constants";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface ProductTablePaginationProps {
  table: Table<Product>;
  total: number;
}

/**
 * Componente de paginación para la tabla de productos
 * Incluye navegación entre páginas y selector de tamaño de página
 */
export const ProductTablePagination = ({
  table,
  total,
}: ProductTablePaginationProps) => {
  const { pagination } = table.getState();
  const pageCount = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  // Calcular el rango de items mostrados
  const startItem = pagination.pageIndex * pagination.pageSize + 1;
  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    total
  );

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pageCount;

    if (totalPages <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay más de 7 páginas, mostrar con elipsis
      if (currentPage <= 3) {
        // Al inicio
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Al final
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Selector de items por página y texto de información a la izquierda */}
      <div className="flex items-center gap-2">
        <Select
          selectedKeys={[String(pagination.pageSize)]}
          onSelectionChange={(keys) => {
            const selectedValue = Array.from(keys)[0] as string;
            table.setPageSize(Number(selectedValue));
          }}
          className="max-w-20"
          radius="sm"
          classNames={{
            trigger:
              "bg-surface border border-border rounded-md h-9 min-h-9 data-[hover=true]:bg-surface",
            value: "text-sm text-gray-700",
          }}
        >
          {PAGE_SIZE_OPTIONS.map((pageSize) => (
            <SelectItem key={pageSize} textValue={String(pageSize)}>
              {pageSize}
            </SelectItem>
          ))}
        </Select>
        <span className="text-sm text-secondary">
          Mostrando {startItem} - {endItem} de {total} productos
        </span>
      </div>

      {/* Controles de paginación a la derecha */}
      <div className="flex items-center gap-1">
        {/* Botón Previous */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="flex items-center gap-1 size-10 justify-center rounded-md border border-border bg-surface text-secondary text-sm font-medium disabled:opacity-50"
        >
          <FaChevronLeft className="w-3 h-3" />
        </button>

        {/* Números de página */}
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-gray-700 text-sm px-1"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => table.setPageIndex(pageNumber - 1)}
              className={`size-10 rounded-md border text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white border-border"
                  : "bg-surface border-border text-secondary hover:bg-surface"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Botón Next */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="flex items-center gap-1 size-10 justify-center rounded-md border border-border bg-surface text-secondary text-sm font-medium disabled:opacity-50 hover:bg-surface"
        >
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
