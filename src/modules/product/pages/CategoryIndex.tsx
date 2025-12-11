import {
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useGetCategories } from "../hooks/useProduct";
import type { CategoryItem } from "../product.type";
import { useMemo, useState } from "react";
import { useModal } from "@/setup/context/ModalContext";
import { CategoryForm } from "../components/CategoryForm";
import { DataTable } from "../components/table/DataTable";
import { TablePagination } from "../components/table/TablePagination";
import { TableHeader } from "../components/table/TableHeader";
import { EditableCategoryNameCell } from "../components/EditableCategoryNameCell";
import { EditableCategoryDescriptionCell } from "../components/EditableCategoryDescriptionCell";
import { DEFAULT_PAGE_SIZE } from "../constants/product.constants";
import { debounce } from "lodash";

interface Category extends CategoryItem {
  name: string;
  description: string;
}

const columnHelper = createColumnHelper<Category>();

const columns: ColumnDef<Category, any>[] = [
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => {
      const category = info.row.original;
      return (
        <EditableCategoryNameCell category={category} name={info.getValue()} />
      );
    },
  }),
  columnHelper.accessor("description", {
    header: "Descripción",
    cell: (info) => {
      const category = info.row.original;
      const description = info.getValue() || "";
      return (
        <EditableCategoryDescriptionCell
          category={category}
          description={description}
        />
      );
    },
  }),
];

export const CategoryIndex = () => {
  const { openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 400),
    []
  );

  const {
    data: { categories, total },
    isLoading,
    error,
  } = useGetCategories(
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchTerm
  );

  // Convertir CategoryItem[] a Category[] para la tabla
  // Usar useMemo para evitar recrear el array en cada render
  // Mantener toda la información del CategoryItem para poder editarlo
  const tableData: Category[] = useMemo(
    () =>
      (categories || []).map((cat: CategoryItem) => ({
        ...cat,
    name: cat.name,
    description: cat.description || "",
      })),
    [categories]
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
    openModal?.(CategoryForm);
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
        searchPlaceholder="Buscar categoría..."
        newItemLabel="Crear Nueva Categoría"
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        error={error}
        emptyMessage="No hay categorías disponibles"
        loadingMessage="Cargando categorías..."
        errorMessage="Se produjo un error al cargar las categorías"
      />

      <TablePagination table={table} total={total} itemName="categorías" />
    </div>
  );
};
