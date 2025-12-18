import { memo } from "react";
import type { Product } from "@/modules/product/product.type";
import { FaPlus, FaMinus } from "react-icons/fa";

interface ProductGridProps {
  isLoading: boolean;
  searchTerm: string;
  products: Product[];
  getSelectedQuantity: (variantId: number) => number;
  onAddProduct: (product: Product) => void;
  onDecrement: (variantId: number, nextQuantity: number) => void;
}

export const ProductGrid = memo(
  ({
    isLoading,
    searchTerm,
    products,
    getSelectedQuantity,
    onAddProduct,
    onDecrement,
  }: ProductGridProps) => {
    return (
      <div className="flex-1 overflow-y-auto min-h-0 max-h-full p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-secondary">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-secondary">
              {searchTerm
                ? "No se encontraron productos"
                : "No hay productos disponibles"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-y-5 pb-2">
            {products.map((product) => {
              const quantity = getSelectedQuantity(product.variant_id);
              const isSelected = quantity > 0;

              return (
                <div
                  key={product.variant_id}
                  className={`relative bg-surface border-1 rounded-lg p-3 transition-colors ${
                    isSelected
                      ? "border-success bg-surface-alt"
                      : "border-border hover:border-accent hover:bg-surface-alt cursor-pointer"
                  }`}
                  onClick={
                    !isSelected ? () => onAddProduct(product) : undefined
                  }
                >
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDecrement(product.variant_id, quantity - 1);
                      }}
                      className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center bg-danger hover:bg-danger/80 text-white rounded-full transition-colors z-10 shadow-lg"
                      aria-label="Decrementar cantidad"
                    >
                      <FaMinus className="lg:size-4 size-3" />
                    </button>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 min-w-6 px-1.5 flex items-center justify-center bg-success text-[#202028] rounded-full text-xs font-bold z-10 shadow-lg border-2 border-[#202028]">
                      {quantity % 1 === 0 ? quantity : quantity.toFixed(2)}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <h3
                      className={`font-semibold text-sm line-clamp-2 ${
                        isSelected ? "text-success" : "text-primary"
                      }`}
                    >
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-xs text-secondary">{product.brand}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-success" : "text-accent"
                        }`}
                      >
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      {product.capacity && product.unit && (
                        <span className="text-xs text-secondary">
                          {product.capacity} {product.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddProduct(product);
                      }}
                      className="absolute inset-0 flex items-center justify-center rounded-lg bg-success/10 hover:bg-success/15 transition-colors z-0"
                      aria-label="Incrementar cantidad"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-success/20 backdrop-blur-sm shadow-lg">
                        <FaPlus className="text-success" size={20} />
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Solo re-renderizar si cambian las props relevantes
    return (
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.searchTerm === nextProps.searchTerm &&
      prevProps.products === nextProps.products &&
      prevProps.getSelectedQuantity === nextProps.getSelectedQuantity &&
      prevProps.onAddProduct === nextProps.onAddProduct &&
      prevProps.onDecrement === nextProps.onDecrement
    );
  }
);
