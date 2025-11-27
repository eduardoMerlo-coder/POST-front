import { SearchIcon } from "@/Icons";

interface ProductTableHeaderProps {
    onSearch?: (query: string) => void;
    onNewProduct: () => void;
    searchPlaceholder?: string;
}

/**
 * Componente de encabezado para la tabla de productos
 * Incluye búsqueda y botón para crear nuevo producto
 */
export const ProductTableHeader = ({
    onSearch,
    onNewProduct,
    searchPlaceholder = "Buscar producto...",
}: ProductTableHeaderProps) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <div className="w-full flex gap-2 justify-end items-center">
            <form className="flex items-center w-1/2">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        id="product-search"
                        className="border border-border text-xs rounded-lg block w-full ps-10 p-2.5 h-10 bg-surface outline-none"
                        placeholder={searchPlaceholder}
                        onChange={handleSearchChange}
                    />
                </div>
            </form>
            <button
                type="button"
                className="text-primary bg-accent font-medium rounded-lg text-xs px-5 h-10 cursor-pointer hover:opacity-90 transition-colors"
                onClick={onNewProduct}
            >
                Nuevo Producto
            </button>
        </div>
    );
};
