import { useState, useRef, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useUpdateUserProductPrice } from "../hooks/useProduct";
import type { Product } from "../product.type";

interface EditablePriceCellProps {
  product: Product;
  price: number;
}

export const EditablePriceCell = ({
  product,
  price,
}: EditablePriceCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(price.toFixed(2));
  const inputRef = useRef<HTMLInputElement>(null);
  const updatePriceMutation = useUpdateUserProductPrice();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(price.toFixed(2));
  }, [price]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSave = () => {
    const newPrice = parseFloat(editValue);
    const user_id = localStorage.getItem("user_id");

    // Permitir 0 como valor válido, solo validar que sea un número y no negativo
    if (!isNaN(newPrice) && newPrice >= 0 && user_id && product.variant_id) {
      // Solo actualizar si el valor cambió
      if (newPrice !== price) {
        updatePriceMutation.mutate(
          {
            variant_id: product.variant_id,
            user_id,
            price: newPrice,
          },
          {
            onSuccess: () => {
              toast.success("Precio actualizado!!");
              setIsEditing(false);
            },
            onError: () => {
              // Revertir al valor original en caso de error
              setEditValue(price.toFixed(2));
              setIsEditing(false);
            },
          }
        );
      } else {
        // Si el valor no cambió, solo cancelar edición
        setIsEditing(false);
      }
    } else {
      // Si el valor es inválido, revertir y cancelar edición
      setEditValue(price.toFixed(2));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(price.toFixed(2));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <div className="relative flex items-center">
          <span className="absolute left-2 text-secondary">$</span>
          <input
            ref={inputRef}
            type="number"
            step="0.01"
            min="0"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-24 pl-6 pr-2 py-1 text-xs border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={updatePriceMutation.isPending}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={updatePriceMutation.isPending}
          className="p-1 text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Guardar"
        >
          <FaCheck className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          disabled={updatePriceMutation.isPending}
          className="p-1 text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Cancelar"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer hover:border-1 hover:border-primary px-2 py-1 rounded transition-colors"
      title="Doble clic para editar"
    >
      ${price.toFixed(2)}
    </span>
  );
};
