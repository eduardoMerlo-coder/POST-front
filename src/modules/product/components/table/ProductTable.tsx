import { flexRender, type Table } from "@tanstack/react-table";
import type { Product } from "../../product.type";

interface ProductTableProps {
  table: Table<Product>;
  isLoading?: boolean;
  error?: Error | null;
}

/**
 * Componente de tabla genérico para mostrar productos
 * Maneja estados de carga y error
 */
export const ProductTable = ({
  table,
  isLoading = false,
  error = null,
}: ProductTableProps) => {
  if (error) {
    return (
      <div className="w-full p-4 text-center text-red-500">
        Se produjo un error al cargar los productos
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Cargando productos...
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
      <table className="w-full text-xs border-b-1 border-border">
        <thead className="bg-transparent h-10 border-b-2 border-border sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    width: header.column.columnDef.size
                      ? `${header.column.columnDef.size}px`
                      : undefined,
                    minWidth: header.column.columnDef.minSize
                      ? `${header.column.columnDef.minSize}px`
                      : undefined,
                  }}
                  className="relative font-semibold text-left pl-2 pr-3 bg-base-alt
                    after:content-[''] after:absolute after:right-0 after:top-1/2 
                    after:-translate-y-1/2 after:h-4 after:w-px last:after:hidden text-secondary"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="h-10 even:bg-base">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    width: cell.column.columnDef.size
                      ? `${cell.column.columnDef.size}px`
                      : undefined,
                    minWidth: cell.column.columnDef.minSize
                      ? `${cell.column.columnDef.minSize}px`
                      : undefined,
                  }}
                  className="pl-2"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
