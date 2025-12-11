import { SearchIcon } from "@/Icons";
import { Button } from "@heroui/react";
import { useState } from "react";

interface TableHeaderProps {
  onSearch?: (query: string) => void;
  onNewItem: () => void;
  searchPlaceholder?: string;
  newItemLabel?: string;
  searchValue?: string;
}

/**
 * Componente de encabezado genérico para tablas
 * Incluye búsqueda y botón para crear nuevo ítem
 */
export const TableHeader = ({
  onSearch,
  onNewItem,
  searchPlaceholder = "Buscar...",
  newItemLabel = "Nuevo",
  searchValue,
}: TableHeaderProps) => {
  // Estado local para el valor del input cuando no se proporciona searchValue
  const [localSearchValue, setLocalSearchValue] = useState<string>("");

  // Usar searchValue si se proporciona, sino usar el estado local
  const inputValue = searchValue !== undefined ? searchValue : localSearchValue;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Si no se proporciona searchValue, actualizar el estado local
    if (searchValue === undefined) {
      setLocalSearchValue(value);
    }

    // Llamar al callback de búsqueda
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="w-full flex gap-2 justify-end items-center">
      <div className="flex items-center w-1/2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            className="border border-border text-xs rounded-lg block w-full ps-10 p-2.5 h-10 bg-surface outline-none"
            placeholder={searchPlaceholder}
            onChange={handleSearchChange}
            value={inputValue}
          />
        </div>
      </div>
      <Button
        radius="sm"
        onPress={onNewItem}
        className="bg-accent font-semibold"
        color="primary"
      >
        {newItemLabel}
      </Button>
    </div>
  );
};
