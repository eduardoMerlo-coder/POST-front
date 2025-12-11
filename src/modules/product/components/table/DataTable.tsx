import { flexRender, type Table } from "@tanstack/react-table";

interface DataTableProps<T> {
  table: Table<T>;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

/**
 * Componente de tabla genérico reutilizable
 * Puede usarse para productos, categorías u otros datos
 */
export const DataTable = <T,>({
  table,
  isLoading = false,
  error = null,
  emptyMessage = "No hay datos disponibles",
  loadingMessage = "Cargando...",
  errorMessage = "Se produjo un error al cargar los datos",
}: DataTableProps<T>) => {
  if (error) {
    return (
      <div className="w-full p-4 text-center text-red-500">{errorMessage}</div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        {loadingMessage}
      </div>
    );
  }

  const columns = table.getAllColumns();

  return (
    <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
      <table className="w-full text-xs border-b-1 border-border">
        <thead className="bg-transparent h-10 border-b-2 border-border sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
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
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-secondary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="h-10 even:bg-base">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="pl-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
