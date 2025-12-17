import {
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useGetBrandsPaginated } from "../hooks/useProduct";
import type { BrandItem } from "../product.type";
import { useMemo, useState } from "react";
import { useModal } from "@/setup/context/ModalContext";
import { BrandForm } from "../components/BrandForm";
import { DataTable } from "../components/table/DataTable";
import { TablePagination } from "../components/table/TablePagination";
import { TableHeader } from "../components/table/TableHeader";
import { EditableBrandNameCell } from "../components/EditableBrandNameCell";
import { DEFAULT_PAGE_SIZE } from "../constants/product.constants";
import { debounce } from "lodash";

interface Brand extends BrandItem {
  name: string;
}

const columnHelper = createColumnHelper<Brand>();

const columns: ColumnDef<Brand, any>[] = [
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => {
      const brand = info.row.original;
      return <EditableBrandNameCell brand={brand} name={info.getValue()} />;
    },
  }),
];

export const BrandIndex = () => {
  const { openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const user_id = localStorage.getItem("user_id");

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 400),
    []
  );

  const {
    data: { brands, total },
    isLoading,
    error,
  } = useGetBrandsPaginated(
    pagination.pageIndex + 1,
    pagination.pageSize,
    user_id,
    searchTerm
  );

  // Convertir BrandItem[] a Brand[] para la tabla
  // Usar useMemo para evitar recrear el array en cada render
  // Mantener toda la información del BrandItem para poder editarlo
  const tableData: Brand[] = useMemo(
    () =>
      (brands || []).map((brand: BrandItem) => ({
        ...brand,
        name: brand.name,
      })),
    [brands]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const handleOpenModal = () => {
    openModal?.(BrandForm);
  };

  const handleSearch = (query: string) => {
    debouncedSetSearch(query);
    // Resetear a la primera página cuando se busca
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="flex flex-col gap-2">
      <TableHeader
        onSearch={handleSearch}
        onNewItem={handleOpenModal}
        searchPlaceholder="Buscar marca..."
        newItemLabel="Crear Nueva Marca"
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        error={error}
        emptyMessage="No hay marcas disponibles"
        loadingMessage="Cargando marcas..."
        errorMessage="Se produjo un error al cargar las marcas"
      />

      <TablePagination table={table} total={total} itemName="marcas" />
    </div>
  );
};
