import { Button, Input } from "@heroui/react";
import type { SelectedProduct } from "@/modules/sales/sales.type";
import { FaTrash } from "react-icons/fa";
import { ChevronDownIcon, ChevronUpIcon } from "@/Icons";

interface SelectedProductsPanelProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  selectedProducts: SelectedProduct[];
  onUpdatePrice: (variantId: number, newPrice: number) => void;
  onUpdateQuantity: (
    variantId: number,
    newQuantity: number,
    allowZero?: boolean
  ) => void;
  onRemoveProduct: (variantId: number) => void;
  roundUpToOneDecimal: (value: number) => number;
  totalItems: number;
  totalAmount: number;
  onPay: () => void;
}

export const SelectedProductsPanel = ({
  isExpanded,
  onToggleExpanded,
  selectedProducts,
  onUpdatePrice,
  onUpdateQuantity,
  onRemoveProduct,
  roundUpToOneDecimal,
  totalItems,
  totalAmount,
  onPay,
}: SelectedProductsPanelProps) => {
  return (
    <>
      <div
        className={`w-full z-50 lg:w-96 absolute right-0 lg:relative flex flex-col gap-4 rounded-lg p-4 overflow-hidden lg:min-h-0 lg:h-auto transition-all duration-300 ease-in-out ${
          isExpanded
            ? "top-0 bottom-0 max-h-[2000px] opacity-100 translate-y-0 lg:max-h-none lg:translate-y-0 bg-base-alt"
            : "max-lg:top-full bottom-0 max-h-[0px] opacity-0 max-lg:translate-y-full lg:max-h-none lg:opacity-100 bg-transparent pointer-events-none lg:pointer-events-auto"
        }`}
      >
        <div
          className={`flex-shrink-0 lg:block transition-opacity duration-300 delay-150 ${
            isExpanded ? "opacity-100" : "opacity-0 lg:opacity-100"
          }`}
        >
          <h2 className="text-lg font-semibold text-primary mb-2">
            Productos Seleccionados
          </h2>
        </div>

        <div
          className={`flex-1 overflow-y-auto min-h-0 max-h-full transition-opacity duration-300 delay-150 lg:block ${
            isExpanded ? "opacity-100" : "opacity-0 lg:opacity-100"
          }`}
        >
          {selectedProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-secondary text-center">
                No hay productos seleccionados
              </p>
            </div>
          ) : (
            <div className="flex flex-col pb-2">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-2 py-2 border-b-1 border-border bg-surface-alt rounded-t-lg">
                <div className="text-xs font-semibold text-secondary">
                  PRODUCTO
                </div>
                <div className="text-xs font-semibold text-secondary text-center">
                  P.UNIT.
                </div>
                <div className="text-xs font-semibold text-secondary text-center">
                  CANT.
                </div>
                <div className="text-xs font-semibold text-secondary text-center">
                  IMPORTE
                </div>
                <div className="w-6"></div>
              </div>

              <div className="flex flex-col">
                {selectedProducts.map((product, index) => (
                  <div
                    key={product.variant_id}
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-2 py-3 border-b-1 border-border hover:bg-surface-alt transition-colors ${
                      index === selectedProducts.length - 1
                        ? "rounded-b-lg"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-semibold text-sm text-primary line-clamp-2">
                        {product.name} - {product.capacity} {product.unit}
                      </h3>
                      {product.barcode && (
                        <p className="text-xs text-secondary mt-0.5">
                          {product.stock_quantity ?? 0} en stock
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.price.toFixed(2)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            onUpdatePrice(product.variant_id, value);
                          }
                        }}
                        classNames={{
                          base: "w-full",
                          input:
                            "text-sm text-center font-semibold text-primary",
                          inputWrapper:
                            "h-8 bg-surface border-1 border-border hover:border-accent focus-within:border-accent transition-colors px-1",
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={product.quantity.toString()}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === "" || inputValue === ".") {
                            return;
                          }
                          const value = parseFloat(inputValue);
                          if (!isNaN(value) && value >= 0) {
                            const roundedValue =
                              Math.round(value * 1000) / 1000;
                            onUpdateQuantity(
                              product.variant_id,
                              roundedValue,
                              true
                            );
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isNaN(value) || value <= 0) {
                            onRemoveProduct(product.variant_id);
                          } else {
                            const roundedValue =
                              Math.round(value * 1000) / 1000;
                            onUpdateQuantity(
                              product.variant_id,
                              roundedValue,
                              false
                            );
                          }
                        }}
                        classNames={{
                          base: "w-full",
                          input:
                            "text-sm text-center font-semibold text-primary",
                          inputWrapper:
                            "h-8 bg-surface border-1 border-border hover:border-accent focus-within:border-accent transition-colors px-1",
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-accent">
                        $
                        {roundUpToOneDecimal(
                          product.price * product.quantity
                        ).toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onRemoveProduct(product.variant_id)}
                        className="text-danger hover:text-danger-600 transition-colors p-1"
                        aria-label="Eliminar producto"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto lg:mt-4 pt-2 lg:pt-0 bg-base-alt">
          <button
            onClick={onToggleExpanded}
            className="lg:hidden flex items-center justify-center py-2 hover:bg-surface-alt rounded-lg transition-colors bg-surface size-10"
          >
            {isExpanded ? (
              <ChevronDownIcon className="text-secondary size-6 transition-transform duration-300" />
            ) : (
              <ChevronUpIcon className="text-secondary size-6 transition-transform duration-300" />
            )}
          </button>
          <Button
            className="flex-1 bg-accent font-semibold h-10"
            radius="sm"
            onPress={onPay}
            disabled={selectedProducts.length === 0}
          >
            {selectedProducts.length > 0
              ? `${totalItems} items =  S/${roundUpToOneDecimal(totalAmount).toFixed(2)}`
              : "Selecciona productos"}
          </Button>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 bg-base-alt w-full flex gap-2 py-4 px-4 transition-all duration-300 ease-in-out z-40 lg:hidden ${
          isExpanded
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto"
        }`}
      >
        <button
          onClick={onToggleExpanded}
          className="lg:hidden flex items-center justify-center py-2 hover:bg-surface-alt rounded-lg transition-colors bg-surface size-10"
          aria-label={isExpanded ? "Ocultar productos" : "Mostrar productos"}
        >
          {isExpanded ? (
            <ChevronDownIcon className="text-secondary size-6 transition-transform duration-300" />
          ) : (
            <ChevronUpIcon className="text-secondary size-6 transition-transform duration-300" />
          )}
        </button>
        <Button
          className="flex-1 bg-accent font-semibold h-10"
          radius="sm"
          onPress={onPay}
          disabled={selectedProducts.length === 0}
        >
          {selectedProducts.length > 0
            ? `${totalItems} items =  S/${roundUpToOneDecimal(totalAmount).toFixed(2)}`
            : "Selecciona productos"}
        </Button>
      </div>
    </>
  );
};
