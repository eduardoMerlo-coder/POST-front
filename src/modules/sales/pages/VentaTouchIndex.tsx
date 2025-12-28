import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useGetUserProducts } from "@/modules/product/hooks/useProduct";
import { useAuth } from "@/setup/context/AuthContext";
import { useModal } from "@/setup/context/ModalContext";
import type { Product } from "@/modules/product/product.type";
import type { SelectedProduct, Client } from "../sales.type";
import { debounce } from "lodash";
import { PaymentModal, type PaymentData } from "../components/PaymentModal";
import { toast } from "react-toastify";
import { productService } from "@/services/product.service";
import { useCreateSale, useGenericClient } from "../hooks/useSales";
import { SearchBar } from "./venta-touch/components/SearchBar";
import { ProductGrid } from "./venta-touch/components/ProductGrid";
import { SelectedProductsPanel } from "./venta-touch/components/SelectedProductsPanel";
import { ClientSearchBar } from "./venta-touch/components/ClientSearchBar";

export const VentaTouchIndex = () => {
  const { user_id } = useAuth();
  const { setContent } = useModal();
  const { mutate: createSale } = useCreateSale();
  const { data: genericClient } = useGenericClient(user_id || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [documentType, setDocumentType] = useState<"B" | "F" | "NVT">("NVT");
  // TODO: Usar cuando se implemente filtrado por categoría
  // const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  // TODO: Usar cuando se implemente el scroll de categorías
  // const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // TODO: Usar cuando se implemente el indicador de scroll
  // const [showScrollIndicator, setShowScrollIndicator] = useState(false);
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
  // TODO: Usar cuando se implemente el filtrado por categoría
  // const { data: categoriesData } = useGetAllCategories(user_id || null);
  // const categories = useMemo(() => {
  //   if (!categoriesData) return [];
  //   if (Array.isArray(categoriesData)) return categoriesData;
  //   const data = categoriesData as any;
  //   if (Array.isArray(data.data)) return data.data;
  //   if (Array.isArray(data.categories)) return data.categories;
  //   return [];
  // }, [categoriesData]);

  // Obtener productos disponibles
  const {
    data: { products },
    isLoading,
  } = useGetUserProducts(1, 100, searchTerm, user_id || null);

  // Verificar si hay scroll en las categorías (solo desktop)
  // TODO: Reactivar cuando se implemente el indicador de scroll
  // useEffect(() => {
  //   const checkScroll = () => {
  //     if (categoriesScrollRef.current) {
  //       const { scrollWidth, clientWidth, scrollLeft } =
  //         categoriesScrollRef.current;
  //       // Mostrar indicador si hay más contenido a la derecha
  //       setShowScrollIndicator(scrollLeft + clientWidth < scrollWidth - 10);
  //     }
  //   };
  //
  //   // Verificar después de que el DOM se actualice
  //   setTimeout(checkScroll, 0);
  //   window.addEventListener("resize", checkScroll);
  //   return () => window.removeEventListener("resize", checkScroll);
  // }, [categories]);

  // Obtener productos disponibles (incluir todos, incluso los seleccionados para mostrar controles)
  const availableProducts = useMemo(() => {
    // TODO: Filtrar por categoría cuando los productos tengan información de categorías
    // Por ahora, mostrar todos los productos
    return products;
  }, [products]);

  // Función auxiliar para obtener la cantidad seleccionada de un producto
  const getSelectedQuantity = useCallback(
    (variantId: number): number => {
      const selected = selectedProducts.find((p) => p.variant_id === variantId);
      return selected ? selected.quantity : 0;
    },
    [selectedProducts]
  );

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
      try {
        const result = await productService.getUserProducts(
          1,
          1000, // Get more products to search through
          user_id,
          barcode,
          "name",
          "asc"
        );
        
        const list: Product[] = result.products || [];
        const exact = list.find(
          (p) => p.barcode && p.barcode.trim() === barcode.trim()
        );
        return exact || null;
      } catch (error) {
        console.error("Error fetching product by barcode:", error);
        return null;
      }
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
  const handleRemoveProduct = useCallback((variantId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.variant_id !== variantId)
    );
  }, []);

  // Actualizar cantidad de un producto (permite decimales)
  const handleUpdateQuantity = useCallback(
    (variantId: number, newQuantity: number, allowZero: boolean = false) => {
      // Permitir 0 temporalmente mientras el usuario está escribiendo (ej: "0.5")
      if (newQuantity < 0) {
        return; // No permitir valores negativos
      }
      if (newQuantity === 0 && !allowZero) {
        // Solo eliminar si no estamos permitiendo 0 temporalmente
        handleRemoveProduct(variantId);
        return;
      }
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.variant_id === variantId ? { ...p, quantity: newQuantity } : p
        )
      );
    },
    [handleRemoveProduct]
  );

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
  const handleOpenPaymentModal = useCallback(() => {
    const roundedTotal = roundUpToOneDecimal(totalAmount);
    
    // Determinar el cliente a mostrar: seleccionado o genérico
    const clientToShow = selectedClient || genericClient;
    const clientName = clientToShow
      ? `${clientToShow.name}${clientToShow.last_name ? ` ${clientToShow.last_name}` : ""}`.toUpperCase()
      : "CLIENTE GENÉRICO";
    
    // Verificar si el cliente es genérico (no seleccionado o es el genérico)
    const isGenericClient =
      !selectedClient ||
      selectedClient.name?.toLowerCase() === "cliente generico" ||
      selectedClient.name?.toLowerCase() === "cliente genérico" ||
      (genericClient && selectedClient?.id === genericClient.id);
    
    setContent?.(
      <PaymentModal
        totalAmount={roundedTotal}
        isGenericClient={isGenericClient}
        clientName={clientName}
        onConfirm={(paymentData: PaymentData) => {
          if (!user_id) {
            toast.error("Error: No se encontró el usuario");
            return;
          }

          if (selectedProducts.length === 0) {
            toast.error("Error: No hay productos seleccionados");
            return;
          }

          // Calcular subtotal (suma de todos los productos)
          const subtotal = selectedProducts.reduce(
            (sum, product) => sum + product.price * product.quantity,
            0
          );

          // Preparar pagos desde paymentData
          // El PaymentModal ahora envía todos los métodos de pago utilizados
          const payments = paymentData.payments || [];

          // Determinar el client_id: usar el seleccionado o el genérico si no hay selección
          let finalClientId: number | null = null;
          if (selectedClient?.id) {
            finalClientId = Number(selectedClient.id);
          } else if (genericClient?.id) {
            // Si no hay cliente seleccionado, usar el cliente genérico
            finalClientId = Number(genericClient.id);
          }

          // Determinar el estado: si hay pago a crédito, la venta debe estar PENDING
          const hasCreditPayment = payments.some(
            (p) => p.payment_method === "CREDITO"
          );
          const finalStatus = hasCreditPayment ? "PENDING" : "COMPLETED";

          // Crear la venta
          createSale(
            {
              user_id,
              client_id: finalClientId,
              document_type: documentType,
              subtotal,
              total_amount: roundedTotal,
              items: selectedProducts,
              payments,
              tax_amount: 0, // Por ahora sin impuestos
              discount_amount: 0, // Por ahora sin descuentos
              change_amount: paymentData.change,
              status: finalStatus,
              comments: paymentData.comment || undefined,
            },
            {
              onSuccess: () => {
                // Limpiar productos seleccionados después de crear la venta
                setSelectedProducts([]);
                // Limpiar cliente seleccionado
                setSelectedClient(null);
                toast.success("Venta creada exitosamente");
              },
            }
          );
        }}
      />
    );
  }, [totalAmount, setContent, selectedClient, genericClient, user_id, documentType, selectedProducts, createSale]);

  // Callbacks para ClientSearchBar (memoizados para evitar re-renders)
  const handleClientTypeChange = useCallback((type: "B" | "F" | "NVT") => {
    setDocumentType(type);
  }, []);

  const handleClientSearch = useCallback((value: string) => {
    // TODO: Implementar búsqueda de clientes
    console.log("Buscando cliente:", value);
  }, []);

  const handleClientSelected = useCallback((client: Client | null) => {
    setSelectedClient(client);
  }, []);

  const handleIncognitoClick = useCallback(() => {
    // TODO: Implementar acción de incógnito
    console.log("Modo incógnito activado");
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full min-h-0 max-h-full overflow-hidden relative">
      <ClientSearchBar
        onClientTypeChange={handleClientTypeChange}
        onSearch={handleClientSearch}
        onIncognitoClick={handleIncognitoClick}
        onClientSelected={handleClientSelected}
        user_id={user_id}
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
            onDecrement={handleUpdateQuantity}
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
