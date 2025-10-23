import { EyeIcon, SearchIcon, TrashIcon } from "@/Icons";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";

type ProductStatus = "active" | "inactive";

export type Product = {
  name: string;
  price: string;
  uom: string;
  internalCode: string;
  barcode: number;
  status: ProductStatus;
};

export const ProductIndex = () => {
  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        accessorKey: "name",
        cell: (info) => info.getValue(),
        header: () => <span>Nombre</span>,
        minSize: 200,
      },
      {
        accessorKey: "price",
        cell: (info) => info.getValue(),
        header: () => <span>Precio</span>,
        minSize: 200,
      },
      {
        accessorKey: "uom",
        header: "Unidad de medida",
        cell: (info) => info.getValue(),
        minSize: 200,
      },
      {
        accessorKey: "internalCode",
        header: () => "Código interno",
        cell: (info) => info.getValue(),
        minSize: 200,
      },
      {
        accessorKey: "barcode",
        header: () => "Código de barras",
        cell: (info) => info.getValue(),
        minSize: 200,
      },
      {
        accessorKey: "status",
        header: () => "Estado",
        cell: (info) => info.getValue(),
        minSize: 200,
      },
      {
        accessorKey: "actions",
        header: () => "Acciones",
        cell: () => (
          <div className="flex items-center gap-2">
            <EyeIcon className="size-5 text-sky-500" />{" "}
            <TrashIcon className="size-4 text-red-500" />
          </div>
        ),
        minSize: 200,
      },
    ],
    []
  );

  const table = useReactTable({
    data: [
      {
        name: "Producto 1",
        price: "100",
        uom: "1",
        internalCode: "1",
        barcode: 12121212,
        status: "active",
      } as Product,
    ],
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex gap-2 justify-end items-center">
        <form className="flex items-center w-1/2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              id="simple-search"
              className=" border border-gray-300 text-xs rounded-lg block w-full ps-10 p-2.5 h-10"
              placeholder="Buscar producto..."
              required
            />
          </div>
        </form>
        <button
          type="button"
          className="text-white bg-blue-700 font-medium rounded-lg text-xs px-5 h-10 cursor-pointer"
        >
          Nuevo Producto
        </button>
      </div>
      <table className="w-full overflow-x-auto text-xs">
        <thead className="bg-gray-200 h-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="relative font-semibold text-left pl-2 pr-3
             after:content-[''] after:absolute after:right-0 after:top-1/2 
             after:-translate-y-1/2 after:h-4 after:w-[1px] 
             after:bg-black/30 last:after:hidden"
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
            <tr key={row.id} className="border-b-1 border-gray-200 h-10 ">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="pl-2">
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
