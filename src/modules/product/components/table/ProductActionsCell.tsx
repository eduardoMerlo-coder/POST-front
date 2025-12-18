import { EyeIcon, TrashIcon } from "@/Icons";

interface ProductActionsCellProps {
  productId: number;
  onView?: (id: number) => void;
  onDelete?: (id: number) => void;
}
export const ProductActionsCell = ({
  productId,
  onView,
  onDelete,
}: ProductActionsCellProps) => {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <EyeIcon
          className="size-5 text-secondary cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={() => onView(productId)}
        />
      )}
      {onDelete && (
        <TrashIcon
          className="size-4 text-red-500 cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={() => onDelete(productId)}
        />
      )}
    </div>
  );
};
