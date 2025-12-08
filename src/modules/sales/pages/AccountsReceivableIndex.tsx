import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { AccountReceivable } from "../sales.type";
import { DEFAULT_PAGE_SIZE } from "../constants/sales.constants";

// Datos de ejemplo (temporal)
const mockData: AccountReceivable[] = [
  { id: 1, cliente: "Juan Pérez", monto_debe_pagar: 150.5 },
  { id: 2, cliente: "María García", monto_debe_pagar: 320.0 },
  { id: 3, cliente: "Carlos López", monto_debe_pagar: 75.25 },
];

export const AccountsReceivableIndex = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // Columnas de la tabla
  const columns = useMemo<ColumnDef<AccountReceivable>[]>(
    () => [
      {
        accessorKey: "cliente",
        header: () => <span>Cliente</span>,
        minSize: 200,
      },
      {
        accessorKey: "monto_debe_pagar",
        header: () => <span>Monto que debe pagar</span>,
        cell: (info) => {
          const amount = parseFloat(info.getValue() as string) || 0;
          return <span>${amount.toFixed(2)}</span>;
        },
        minSize: 200,
      },
    ],
    []
  );

  const table = useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: false,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Cuentas por cobrar</h1>
      </div>

      <div className="bg-base-alt shadow-md rounded-lg overflow-hidden">
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-secondary"
                >
                  No hay cuentas por cobrar registradas
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="h-10 even:bg-base">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="pl-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
