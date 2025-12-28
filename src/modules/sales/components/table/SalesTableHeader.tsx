import { SearchIcon } from "@/Icons";
import { Select, SelectItem } from "@heroui/react";

interface SalesTableHeaderProps {
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: string | null) => void;
  searchPlaceholder?: string;
  selectedStatus?: string | null;
}

/**
 * Componente de encabezado para la tabla de ventas
 * Incluye búsqueda por cliente y filtro por estado
 */
export const SalesTableHeader = ({
  onSearch,
  onStatusFilter,
  searchPlaceholder = "Buscar por cliente...",
  selectedStatus = null,
}: SalesTableHeaderProps) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleStatusChange = (keys: any) => {
    const selected = Array.from(keys)[0] as string;
    if (onStatusFilter) {
      onStatusFilter(selected === "all" ? null : selected);
    }
  };

  return (
    <div className="w-full flex gap-2 justify-end items-center">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center w-1/2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              id="sales-search"
              className="border border-border text-xs rounded-lg block w-full ps-10 p-2.5 h-10 bg-surface outline-none"
              placeholder={searchPlaceholder}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <Select
          selectedKeys={selectedStatus ? [selectedStatus] : ["all"]}
          onSelectionChange={handleStatusChange}
          placeholder="Filtrar por estado"
          className="max-w-48"
          radius="sm"
          classNames={{
            trigger:
              "bg-surface border border-border rounded-lg h-10 min-h-10 data-[hover=true]:bg-surface",
            value: "text-xs text-gray-700",
          }}
        >
          <SelectItem key="all" textValue="Todos">
            Todos los estados
          </SelectItem>
          <SelectItem key="COMPLETED" textValue="Completada">
            Completada
          </SelectItem>
          <SelectItem key="PENDING" textValue="Pendiente">
            Pendiente
          </SelectItem>
          <SelectItem key="CANCELLED" textValue="Cancelada">
            Cancelada
          </SelectItem>
          <SelectItem key="REFUNDED" textValue="Reembolsada">
            Reembolsada
          </SelectItem>
        </Select>
      </div>
    </div>
  );
};

