import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserProducts } from "../hooks/useProduct";
import { useProductColumns } from "../hooks/useProductColumns";
import {
  ProductTable,
  ProductTableHeader,
  ProductTablePagination,
} from "../components/table";
import { DEFAULT_PAGE_SIZE } from "../constants/product.constants";
import { debounce } from "lodash";

export const ProductIndex = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const user_id = localStorage.getItem("user_id");

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 400),
    []
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const {
    data: { products, total },
    isLoading,
    error,
  } = useGetUserProducts(
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchTerm,
    user_id
  );

  const handleDeleteProduct = (id: number) => {
    // TODO: Implementar lógica de eliminación
    console.log("Delete product:", id);
  };

  const handleNewProduct = () => {
    navigate("/product/new-product");
  };

  const handleSearch = (query: string) => {
    debouncedSetSearch(query);
  };

  const columns = useProductColumns({
    onDelete: handleDeleteProduct,
  });

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <ProductTableHeader
        onSearch={handleSearch}
        onNewProduct={handleNewProduct}
      />

      <ProductTable table={table} isLoading={isLoading} error={error} />

      <ProductTablePagination table={table} total={total} />
    </div>
  );
};
