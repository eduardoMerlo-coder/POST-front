import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

interface ProductActionsCellProps {
    productId: number;
    onView: (id: number) => void;
    onDelete?: (id: number) => void;
}

export const ProductActionsCell = ({
    productId,
    onView,
    onDelete,
}: ProductActionsCellProps) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/product/${productId}`);
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(productId);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={handleEdit}
            >
                Editar
            </Button>
            {onDelete && (
                <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={handleDelete}
                >
                    Eliminar
                </Button>
            )}
        </div>
    );
};
