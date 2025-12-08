import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "../product.type";
import { ProductActionsCell } from "../components/ProductActionsCell";
import { COLUMN_MIN_SIZE } from "../constants/product.constants";
import { EditablePriceCell } from "../components/EditablePriceCell";

interface UseProductColumnsProps {
  onDelete?: (id: number) => void;
}

export const useProductColumns = ({
  onDelete,
}: UseProductColumnsProps): ColumnDef<Product, any>[] => {
  return useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        accessorKey: "name",
        cell: (info) => info.getValue(),
        header: () => <span>Nombre</span>,
        minSize: COLUMN_MIN_SIZE,
      },
      {
        accessorKey: "brand",
        header: "Marca",
        cell: (info) => info.getValue(),
        minSize: COLUMN_MIN_SIZE,
      },
      {
        accessorKey: "capacity_unit",
        header: "Capacidad",
        cell: (info) => (
          <span>
            {info.row.original.capacity} {info.row.original.unit}
          </span>
        ),
        minSize: COLUMN_MIN_SIZE,
      },
      {
        accessorKey: "price",
        cell: (info: any) => {
          const price = parseFloat(info.getValue() || "0");
          return (
            <EditablePriceCell product={info.row.original} price={price} />
          );
        },
        header: () => <span>Precio</span>,
        minSize: COLUMN_MIN_SIZE,
      },
      {
        accessorKey: "barcode",
        header: () => "Código de barras",
        cell: (info) => info.getValue(),
        minSize: COLUMN_MIN_SIZE,
      },
      {
        accessorKey: "status",
        header: () => "Estado",
        cell: (info) => {
          const status = info.getValue() as string;
          const isActive = status === "ACTIVE";
          return (
            <div className="flex items-center gap-2 ">
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="capitalize">{status.toLowerCase()}</span>
            </div>
          );
        },
        minSize: COLUMN_MIN_SIZE,
      },
      {
        accessorKey: "actions",
        header: () => "Acciones",
        cell: (info) => (
          <ProductActionsCell
            productId={info.row.original.id}
            onDelete={onDelete}
          />
        ),
        minSize: COLUMN_MIN_SIZE,
      },
    ],
    [onDelete]
  );
};
