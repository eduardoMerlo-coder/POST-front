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
    <table className="w-full overflow-x-auto text-xs border-b-1 border-border">
      <thead className="bg-transparent h-10 border-b-2 border-border">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="relative font-semibold text-left pl-2 pr-3
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
              <td key={cell.id} className="pl-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
