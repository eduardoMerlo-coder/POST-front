import { useState, useRef, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useUpdateCategory } from "../hooks/useProduct";
import type { CategoryItem } from "../product.type";

interface EditableCategoryDescriptionCellProps {
  category: CategoryItem;
  description: string;
}

export const EditableCategoryDescriptionCell = ({
  category,
  description,
}: EditableCategoryDescriptionCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef<number>(0);
  const updateCategoryMutation = useUpdateCategory();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(description || "");
  }, [description]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTouchStart = () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;

    if (tapLength < 300 && tapLength > 0) {
      // Doble tap detectado
      setIsEditing(true);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = currentTime;
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSave = () => {
    const newDescription = editValue.trim();

    // Validaciones
    if (!category.id) {
      toast.error("Error: Categoría no encontrada");
      setEditValue(description || "");
      setIsEditing(false);
      return;
    }

    // La descripción es opcional, así que no validamos longitud mínima
    // Solo actualizar si el valor cambió
    if (newDescription === (description || "")) {
      setIsEditing(false);
      return;
    }

    updateCategoryMutation.mutate(
      {
        id: category.id,
        data: {
          name: category.name,
          description: newDescription,
        },
      },
      {
        onSuccess: () => {
          toast.success("Descripción actualizada exitosamente");
          setIsEditing(false);
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.data?.message ??
            error?.response?.data?.message ??
            error?.data?.data?.message ??
            error?.data?.message ??
            "Error al actualizar la descripción";
          toast.error(message);
          // Revertir al valor original en caso de error
          setEditValue(description || "");
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditValue(description || "");
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
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-xs border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={updateCategoryMutation.isPending}
          placeholder="Descripción (opcional)"
        />
        <button
          onClick={handleSave}
          disabled={updateCategoryMutation.isPending}
          className="p-1 text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Guardar"
        >
          <FaCheck className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          disabled={updateCategoryMutation.isPending}
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
      onTouchStart={handleTouchStart}
      className="cursor-pointer hover:border-1 hover:border-primary px-2 py-1 rounded transition-colors touch-manipulation"
      title="Doble clic o doble tap para editar"
    >
      {description || "-"}
    </span>
  );
};
