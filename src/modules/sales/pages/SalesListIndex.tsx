import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useState, useEffect } from "react";
import { useGetUserSales } from "../hooks/useSales";
import { useAuth } from "@/setup/context/AuthContext";
import { useModal } from "@/setup/context/ModalContext";
import type { Sale } from "@/services/sale.service";
import { DEFAULT_PAGE_SIZE } from "../constants/sales.constants";
import { SaleDetailModal } from "../components/SaleDetailModal";
import { SalesTableHeader, SalesTablePagination } from "../components/table";
import { debounce } from "lodash";

export const SalesListIndex = () => {
  const { user_id } = useAuth();
  const { openModal } = useModal();
  const [mounted, setMounted] = useState(false);
  const [clientSearch, setClientSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // Esperar a que el componente esté montado y user_id esté disponible
  useEffect(() => {
    setMounted(true);
  }, []);

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setClientSearch(value), 400),
    []
  );

  const {
    data: { sales, total } = { sales: [], total: 0 },
    isLoading,
    error,
  } = useGetUserSales(
    mounted && user_id ? user_id : null,
    pagination.pageIndex + 1,
    pagination.pageSize,
    clientSearch,
    statusFilter
  );

  // Columnas de la tabla
  const columns = useMemo<ColumnDef<Sale>[]>(
    () => [
      {
        accessorKey: "document_number",
        header: () => <span>N° Documento</span>,
        cell: (info) => {
          const docNumber = info.getValue() as string | null;
          return <span>{docNumber || "N/A"}</span>;
        },
        minSize: 150,
      },
      {
        accessorKey: "document_type",
        header: () => <span>Tipo</span>,
        cell: (info) => {
          const type = info.getValue() as string;
          const typeLabels: Record<string, string> = {
            B: "Boleta",
            F: "Factura",
            NVT: "Nota de Venta",
          };
          return <span>{typeLabels[type] || type}</span>;
        },
        minSize: 120,
      },
      {
        accessorKey: "client_id",
        header: () => <span>Cliente</span>,
        cell: (info) => {
          const sale = info.row.original;
          if (sale.client) {
            const clientName = `${sale.client.name}${sale.client.last_name ? ` ${sale.client.last_name}` : ""}`.toUpperCase();
            return <span>{clientName}</span>;
          }
          return <span>CLIENTE GENÉRICO</span>;
        },
        minSize: 200,
      },
      {
        accessorKey: "total_amount",
        header: () => <span>Total</span>,
        cell: (info) => {
          const amount = parseFloat(String(info.getValue())) || 0;
          return <span className="font-semibold">S/ {amount.toFixed(2)}</span>;
        },
        minSize: 120,
      },
      {
        accessorKey: "status",
        header: () => <span>Estado</span>,
        cell: (info) => {
          const status = info.getValue() as string;
          const statusConfig: Record<string, { label: string; className: string }> = {
            COMPLETED: { label: "Completada", className: "text-green-500" },
            PENDING: { label: "Pendiente", className: "text-yellow-500" },
            CANCELLED: { label: "Cancelada", className: "text-red-500" },
            REFUNDED: { label: "Reembolsada", className: "text-orange-500" },
          };
          const config = statusConfig[status] || { label: status, className: "" };
          return <span className={config.className}>{config.label}</span>;
        },
        minSize: 120,
      },
      {
        accessorKey: "created_at",
        header: () => <span>Fecha</span>,
        cell: (info) => {
          const dateStr = info.getValue() as string;
          if (!dateStr) return <span>N/A</span>;
          const date = new Date(dateStr);
          // Formatear fecha con zona horaria de Perú (America/Lima)
          return (
            <span>
              {date.toLocaleString("es-PE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Lima", // Zona horaria de Perú
              })}
            </span>
          );
        },
        minSize: 150,
      },
    ],
    []
  );

  const table = useReactTable({
    data: sales,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-primary">Lista de Ventas</h1>
        <div className="bg-base-alt shadow-md rounded-lg p-4">
          <p className="text-danger">Error al cargar las ventas. Por favor, intenta nuevamente.</p>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    debouncedSetSearch(query);
    // Resetear a la primera página cuando se busca
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    // Resetear a la primera página cuando se filtra
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Lista de Ventas</h1>
      </div>

      <SalesTableHeader
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        selectedStatus={statusFilter}
      />

      <div className="bg-base-alt shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-secondary">
            <p>Cargando ventas...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-b-1 border-border min-w-[600px]">
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
                      No hay ventas registradas
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => {
                    const sale = row.original;
                    return (
                      <tr
                        key={row.id}
                        className="h-10 even:bg-base hover:bg-surface-alt transition-colors cursor-pointer"
                        onClick={() => {
                          openModal?.(SaleDetailModal, { saleId: sale.id });
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="pl-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>

            {/* Paginación */}
            {total > 0 && (
              <div className="p-4 border-t-1 border-border">
                <SalesTablePagination table={table} total={total} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

