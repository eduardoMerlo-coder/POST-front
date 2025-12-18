import { Button } from "@heroui/react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface ProductActionsCellProps {
  productId: number;
  onDelete?: (id: number) => void;
}

export const ProductActionsCell = ({ productId }: ProductActionsCellProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-transparent text-secondary font-semibold min-w-4 group size-8 p-0"
        onPress={handleEdit}
      >
        <FaEdit className="w-5 h-5 group-hover:text-sky-500" />
      </Button>
      {/*onDelete && (
        <Button
          size="sm"
          radius="sm"
          className="bg-transparent text-secondary font-semibold min-w-4 group size-8 p-0"
          onPress={handleDelete}
        >
          <FaTrash className="w-5 h-5 group-hover:text-red-500" />
        </Button>
      )*/}
    </div>
  );
};
