import { useState, useMemo, useRef, useEffect } from "react";
import {
  useGetUserProducts,
  useGetAllCategories,
} from "@/modules/product/hooks/useProduct";
import { useAuth } from "@/setup/context/AuthContext";
import { useModal } from "@/setup/context/ModalContext";
import type { Product } from "@/modules/product/product.type";
import type { SelectedProduct } from "../sales.type";
import { debounce } from "lodash";
import { PaymentModal, type PaymentData } from "../components/PaymentModal";
import { toast } from "react-toastify";
import { axiosPrivate } from "@/lib/axios";
import { CategoryBar } from "./venta-touch/components/CategoryBar";
import { SearchBar } from "./venta-touch/components/SearchBar";
import { ProductGrid } from "./venta-touch/components/ProductGrid";
import { SelectedProductsPanel } from "./venta-touch/components/SelectedProductsPanel";

export const VentaTouchIndex = () => {
  const { user_id } = useAuth();
  const { setContent } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");

  // Scanner (keyboard wedge) state
  const scanBufferRef = useRef<string>("");
  const scanFirstTimeRef = useRef<number>(0);
  const scanLastTimeRef = useRef<number>(0);
  const scanLooksLikeScannerRef = useRef<boolean>(false);
  const scanResetTimerRef = useRef<number | null>(null);
  const isProcessingScanRef = useRef<boolean>(false);
  const scanQueueRef = useRef<string[]>([]);

  // Debounce para la búsqueda
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // Obtener categorías
  const { data: categoriesData } = useGetAllCategories(user_id || null);
  const categories = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    const data = categoriesData as any;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.categories)) return data.categories;
    return [];
  }, [categoriesData]);

  // Obtener productos disponibles
  const {
    data: { products },
    isLoading,
  } = useGetUserProducts(1, 100, searchTerm, user_id || null);

  // Verificar si hay scroll en las categorías (solo desktop)
  useEffect(() => {
    const checkScroll = () => {
      if (categoriesScrollRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } =
          categoriesScrollRef.current;
        // Mostrar indicador si hay más contenido a la derecha
        setShowScrollIndicator(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    // Verificar después de que el DOM se actualice
    setTimeout(checkScroll, 0);
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  // Obtener productos disponibles (incluir todos, incluso los seleccionados para mostrar controles)
  const availableProducts = useMemo(() => {
    // TODO: Filtrar por categoría cuando los productos tengan información de categorías
    // Por ahora, mostrar todos los productos
    return products;
  }, [products]);

  // Función auxiliar para obtener la cantidad seleccionada de un producto
  const getSelectedQuantity = (variantId: number): number => {
    const selected = selectedProducts.find((p) => p.variant_id === variantId);
    return selected ? selected.quantity : 0;
  };

  // Agregar producto a la lista de seleccionados
  const handleAddProduct = useMemo(() => {
    return (product: Product) => {
      setSelectedProducts((prev) => {
        const existingProduct = prev.find(
          (p) => p.variant_id === product.variant_id
        );

        if (existingProduct) {
          // Si ya existe, incrementar cantidad
          return prev.map((p) =>
            p.variant_id === product.variant_id
              ? { ...p, quantity: p.quantity + 1 }
              : p
          );
        } else {
          // Si no existe, agregarlo
          const newProduct: SelectedProduct = {
            id: product.id,
            variant_id: product.variant_id,
            product_id: product.product_id,
            user_product_variant_id: product.user_product_variant_id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            quantity: 1,
            capacity: product.capacity,
            unit: product.unit,
            brand: product.brand,
            barcode: product.barcode,
            stock_quantity: product.stock_quantity,
          };
          return [...prev, newProduct];
        }
      });
    };
  }, []);

  // Función para validar si un texto parece código de barras
  const isBarcode = (text: string): boolean => {
    // Los códigos de barras típicamente son solo números y tienen al menos 8 caracteres
    return /^\d{8,}$/.test(text.trim());
  };

  // Función para buscar producto por código de barras
  const findProductByBarcode = useMemo(() => {
    return (barcode: string): Product | null => {
      // Buscar en productos disponibles
      const found = availableProducts.find(
        (p) => p.barcode && p.barcode.trim() === barcode.trim()
      );
      return found || null;
    };
  }, [availableProducts]);

  const fetchProductByBarcode = useMemo(() => {
    return async (barcode: string): Promise<Product | null> => {
      if (!user_id) return null;
      const res = await axiosPrivate.get<{
        products: Product[];
        total: number;
      }>("/user-products", {
        params: {
          page: 1,
          per_page: 10,
          searchTerm: barcode,
          sort: "name",
          order: "asc",
          user_id,
        },
      });

      // Compat: algunos callers tratan axiosPrivate como AxiosResponse, otros como "data" directo.
      const payload: any = (res as any)?.data ?? res;
      const list: Product[] = payload?.products ?? [];
      const exact = list.find(
        (p) => p.barcode && p.barcode.trim() === barcode.trim()
      );
      return exact || null;
    };
  }, [user_id]);

  const processScannedBarcode = useMemo(() => {
    const drainQueue = async () => {
      if (isProcessingScanRef.current) return;
      isProcessingScanRef.current = true;

      try {
        while (scanQueueRef.current.length > 0) {
          const next = scanQueueRef.current.shift()!;
          const trimmed = next.trim();
          if (!trimmed) continue;
          if (!isBarcode(trimmed)) continue;

          const local = findProductByBarcode(trimmed);
          if (local) {
            handleAddProduct(local);
            continue;
          }

          const remote = await fetchProductByBarcode(trimmed);
          if (remote) {
            handleAddProduct(remote);
            continue;
          }

          toast.error(`Producto con código ${trimmed} no encontrado`);
        }
      } catch (err: any) {
        toast.error(err?.message || "Error buscando el producto por código");
      } finally {
        isProcessingScanRef.current = false;
      }
    };

    return (barcode: string) => {
      scanQueueRef.current.push(barcode);
      void drainQueue();
    };
  }, [fetchProductByBarcode, findProductByBarcode, handleAddProduct]);

  // Listener global: captura escaneo (digits rápidos + Enter) sin tocar el search
  useEffect(() => {
    const resetScan = () => {
      scanBufferRef.current = "";
      scanFirstTimeRef.current = 0;
      scanLastTimeRef.current = 0;
      scanLooksLikeScannerRef.current = false;
      if (scanResetTimerRef.current) {
        window.clearTimeout(scanResetTimerRef.current);
        scanResetTimerRef.current = null;
      }
    };

    const scheduleReset = () => {
      if (scanResetTimerRef.current) {
        window.clearTimeout(scanResetTimerRef.current);
      }
      scanResetTimerRef.current = window.setTimeout(() => {
        resetScan();
      }, 120);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Enter finaliza el escaneo
      if (e.key === "Enter") {
        if (scanLooksLikeScannerRef.current && scanBufferRef.current) {
          e.preventDefault();
          e.stopPropagation();
          const code = scanBufferRef.current;
          resetScan();
          processScannedBarcode(code);
        }
        return;
      }

      // Solo capturamos dígitos para barcodes (ajustable si usas Code128 alfanumérico)
      if (!/^\d$/.test(e.key)) return;

      const now = Date.now();
      if (!scanFirstTimeRef.current) {
        scanFirstTimeRef.current = now;
      }

      const delta = scanLastTimeRef.current ? now - scanLastTimeRef.current : 0;
      scanLastTimeRef.current = now;

      // Si llegan muy rápido, parece lector
      if (delta > 0 && delta < 50) {
        scanLooksLikeScannerRef.current = true;
      }

      // Si ya parece lector, evitamos que “escriba” en inputs/search
      if (scanLooksLikeScannerRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }

      scanBufferRef.current += e.key;
      scheduleReset();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      resetScan();
    };
  }, [processScannedBarcode]);

  // Actualizar cantidad de un producto (permite decimales)
  const handleUpdateQuantity = (
    variantId: number,
    newQuantity: number,
    allowZero: boolean = false
  ) => {
    // Permitir 0 temporalmente mientras el usuario está escribiendo (ej: "0.5")
    if (newQuantity < 0) {
      return; // No permitir valores negativos
    }
    if (newQuantity === 0 && !allowZero) {
      // Solo eliminar si no estamos permitiendo 0 temporalmente
      handleRemoveProduct(variantId);
      return;
    }
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.variant_id === variantId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  // Actualizar precio de un producto
  const handleUpdatePrice = (variantId: number, newPrice: number) => {
    if (newPrice < 0) return;
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.variant_id === variantId ? { ...p, price: newPrice } : p
      )
    );
  };

  // Remover producto de la lista
  const handleRemoveProduct = (variantId: number) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.variant_id !== variantId)
    );
  };

  // Función para redondear hacia arriba a 1 decimal
  const roundUpToOneDecimal = (value: number): number => {
    // 1) Normalizar a 2 decimales para evitar errores de punto flotante (0.8 * 3 => 2.4000000004)
    // 2) Subir al siguiente décimo solo si el 2do decimal es > 0 (ej: 2.41 => 2.5, 2.40 => 2.4)
    const twoDecimals = Math.round((value + Number.EPSILON) * 100) / 100;
    return Math.ceil(twoDecimals * 10) / 10;
  };

  // Calcular total (soporta cantidades decimales)
  const totalAmount = useMemo(() => {
    return selectedProducts.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  }, [selectedProducts]);

  // Calcular total de items
  const totalItems = useMemo(() => {
    return selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
  }, [selectedProducts]);

  // Abrir modal de pago
  const handleOpenPaymentModal = () => {
    const roundedTotal = roundUpToOneDecimal(totalAmount);
    setContent?.(
      <PaymentModal
        totalAmount={roundedTotal}
        onConfirm={(paymentData: PaymentData) => {
          // Aquí puedes manejar la confirmación del pago
          console.log("Datos de pago:", paymentData);
          // TODO: Implementar lógica de procesamiento de venta
        }}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-0 max-h-full overflow-hidden relative  ">
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        categoriesScrollRef={categoriesScrollRef}
        showScrollIndicator={showScrollIndicator}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const { scrollWidth, clientWidth, scrollLeft } = target;
          setShowScrollIndicator(scrollLeft + clientWidth < scrollWidth - 10);
        }}
      />

      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Columna izquierda: Productos disponibles */}
        <div className="flex-1 flex flex-col gap-4 bg-base-alt rounded-lg px-1 py-4 overflow-hidden min-h-0">
          <SearchBar
            inputRef={searchInputRef}
            value={searchInputValue}
            onChange={(value) => {
              setSearchInputValue(value);
              debouncedSetSearch(value);
            }}
            onEnter={() => {
              const inputValue = searchInputValue.trim();
              setSearchTerm(inputValue);
              setSearchInputValue(inputValue);
            }}
          />

          <ProductGrid
            isLoading={isLoading}
            searchTerm={searchTerm}
            products={availableProducts}
            getSelectedQuantity={getSelectedQuantity}
            onAddProduct={handleAddProduct}
            onDecrement={(variantId, nextQuantity) =>
              handleUpdateQuantity(variantId, nextQuantity)
            }
          />
        </div>

        <SelectedProductsPanel
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          selectedProducts={selectedProducts}
          onUpdatePrice={handleUpdatePrice}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveProduct={handleRemoveProduct}
          roundUpToOneDecimal={roundUpToOneDecimal}
          totalItems={totalItems}
          totalAmount={totalAmount}
          onPay={handleOpenPaymentModal}
        />
      </div>
    </div>
  );
};
