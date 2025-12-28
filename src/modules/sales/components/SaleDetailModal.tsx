import { useState } from "react";
import { useGetSaleById, useAddCreditPayment } from "../hooks/useSales";
import { useModal } from "@/setup/context/ModalContext";
import { Button, Input, Select, SelectItem, Accordion, AccordionItem } from "@heroui/react";
import { FaTimes } from "react-icons/fa";

interface SaleDetailModalProps {
  saleId: number;
}

export const SaleDetailModal = ({ saleId }: SaleDetailModalProps) => {
  const { closeModal } = useModal();
  const { data: sale, isLoading, error, refetch } = useGetSaleById(saleId);
  const { mutate: addCreditPayment, isPending: isAddingPayment } = useAddCreditPayment();
  
  // Estado para el formulario de pago parcial
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CONTADO" | "YAPE" | "TRANSFERENCIA">("CONTADO");
  const [referenceNumber, setReferenceNumber] = useState("");

  if (isLoading) {
    return (
      <div className="bg-base-alt rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center items-center h-64">
          <p className="text-secondary">Cargando detalles de la venta...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="bg-base-alt rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <p className="text-danger">Error al cargar los detalles de la venta</p>
        </div>
        <div className="flex justify-end mt-4">
          <Button onPress={closeModal} variant="light">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  // Formatear fecha correctamente (ajustar a zona horaria de Perú)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // Convertir a zona horaria de Perú (America/Lima)
    return date.toLocaleString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima", // Zona horaria de Perú
    });
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: "Completada", className: "text-green-500" },
    PENDING: { label: "Pendiente", className: "text-yellow-500" },
    CANCELLED: { label: "Cancelada", className: "text-red-500" },
    REFUNDED: { label: "Reembolsada", className: "text-orange-500" },
  };

  const documentTypeLabels: Record<string, string> = {
    B: "Boleta",
    F: "Factura",
    NVT: "Nota de Venta",
  };

  const paymentMethodLabels: Record<string, string> = {
    CONTADO: "Contado",
    YAPE: "Yape",
    TRANSFERENCIA: "Transferencia",
    CREDITO: "Crédito",
  };

  const status = statusConfig[sale.status] || { label: sale.status, className: "" };

  // Verificar si tiene algún pago a crédito
  const hasCreditPayment = sale.payments?.some(
    (p) => p.payment_method === "CREDITO"
  ) || false;
  
  // Calcular total pagado REAL (excluyendo crédito inicial, solo pagos parciales reales)
  // El crédito inicial no cuenta como "pagado", solo los pagos parciales posteriores
  const totalPaidReal = sale.payments
    ? sale.payments
        .filter((p) => p.payment_method !== "CREDITO")
        .reduce((sum, payment) => sum + payment.amount, 0)
    : 0;
  
  // Si hay crédito, el faltante es el total menos lo pagado realmente
  // Si no hay crédito, el faltante es el total menos todos los pagos
  const remaining = hasCreditPayment
    ? Math.max(0, sale.total_amount - totalPaidReal)
    : Math.max(0, sale.total_amount - (sale.payments?.reduce((sum, p) => sum + p.amount, 0) || 0));
  
  // Verificar si es una venta a crédito pendiente
  // Mostrar el botón si está pendiente y tiene crédito (independientemente del remaining)
  const isCreditPending = sale.status === "PENDING" && hasCreditPayment;

  // Manejar agregar pago parcial
  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    if (amount > remaining) {
      return; // No permitir pagar más de lo que falta
    }

    addCreditPayment(
      {
        saleId: sale.id,
        amount,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          // Limpiar formulario
          setPaymentAmount("");
          setReferenceNumber("");
          setShowPaymentForm(false);
          // Refrescar los datos de la venta
          refetch();
        },
      }
    );
  };

  return (
    <div className="bg-base-alt rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b-1 border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Detalles de la Venta</h2>
          <p className="text-sm text-secondary mt-1">
            {sale.document_number || `Venta #${sale.id}`}
          </p>
        </div>
        <Button
          isIconOnly
          variant="light"
          onPress={closeModal}
          className="min-w-0 w-8 h-8"
        >
          <FaTimes size={16} />
        </Button>
      </div>

      {/* Accordion para Información General y Totales */}
      <Accordion
        defaultExpandedKeys={[]}
        selectionMode="multiple"
        className="mt-6"
        itemClasses={{
          base: "bg-base-alt rounded-lg border-1 border-border mb-2",
          title: "text-lg font-semibold text-primary",
          trigger: "px-4 py-3",
          content: "px-4 pb-4",
        }}
      >
        {/* Información General */}
        <AccordionItem
          key="informacion"
          aria-label="Información General"
          title="Información General"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary">Tipo de Documento</p>
              <p className="text-primary font-medium">
                {documentTypeLabels[sale.document_type] || sale.document_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary">Número de Documento</p>
              <p className="text-primary font-medium">
                {sale.document_number || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary">Cliente</p>
              <p className="text-primary font-medium">
                {sale.client
                  ? `${sale.client.name}${sale.client.last_name ? ` ${sale.client.last_name}` : ""}`.toUpperCase()
                  : "CLIENTE GENÉRICO"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary">Estado</p>
              <p className={`font-medium ${status.className}`}>{status.label}</p>
            </div>
            <div>
              <p className="text-sm text-secondary">Fecha</p>
              <p className="text-primary font-medium">{formatDate(sale.created_at)}</p>
            </div>
          </div>
        </AccordionItem>

        {/* Totales */}
        <AccordionItem
          key="totales"
          aria-label="Totales"
          title="Totales"
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-sm text-secondary">Subtotal</p>
              <p className="text-primary font-medium">S/ {sale.subtotal.toFixed(2)}</p>
            </div>
            {sale.tax_amount > 0 && (
              <div className="flex justify-between">
                <p className="text-sm text-secondary">IGV (18%)</p>
                <p className="text-primary font-medium">S/ {sale.tax_amount.toFixed(2)}</p>
              </div>
            )}
            {sale.discount_amount > 0 && (
              <div className="flex justify-between">
                <p className="text-sm text-secondary">Descuento</p>
                <p className="text-primary font-medium text-red-500">
                  -S/ {sale.discount_amount.toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex justify-between border-t-1 border-border pt-2">
              <p className="text-sm font-semibold text-primary">Total</p>
              <p className="text-primary font-bold text-lg">S/ {sale.total_amount.toFixed(2)}</p>
            </div>
            {sale.change_amount > 0 && (
              <div className="flex justify-between">
                <p className="text-sm text-secondary">Vuelto</p>
                <p className="text-primary font-medium">S/ {sale.change_amount.toFixed(2)}</p>
              </div>
            )}
          </div>
        </AccordionItem>
      </Accordion>

      {/* Accordion para Productos e Historial de Pagos */}
      <Accordion
        defaultExpandedKeys={["pagos"]}
        selectionMode="multiple"
        className="mt-6"
        itemClasses={{
          base: "bg-base-alt rounded-lg border-1 border-border mb-2",
          title: "text-lg font-semibold text-primary",
          trigger: "px-4 py-3",
          content: "px-4 pb-4",
        }}
      >
        {/* Productos */}
        {sale.items && sale.items.length > 0 && (
          <AccordionItem
            key="productos"
            aria-label="Productos"
            title={`Productos (${sale.items.length})`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b-2 border-border">
                  <tr>
                    <th className="text-left p-2 text-secondary font-semibold">Producto</th>
                    <th className="text-right p-2 text-secondary font-semibold">Cantidad</th>
                    <th className="text-right p-2 text-secondary font-semibold">Precio Unit.</th>
                    <th className="text-right p-2 text-secondary font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => (
                    <tr key={item.id} className="border-b-1 border-border even:bg-base">
                      <td className="p-2 text-primary">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          {item.variant_name && (
                            <p className="text-xs text-secondary">{item.variant_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-right text-primary">{item.quantity}</td>
                      <td className="p-2 text-right text-primary">S/ {item.unit_price.toFixed(2)}</td>
                      <td className="p-2 text-right text-primary font-medium">
                        S/ {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionItem>
        )}

        {/* Historial de Pagos */}
        {sale.payments && sale.payments.length > 0 && (
          <AccordionItem
            key="pagos"
            aria-label="Historial de Pagos"
            title={`Historial de Pagos (${sale.payments.length})`}
          >
            <div className="space-y-2">
              {sale.payments
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-3 bg-surface rounded-lg border-1 border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-primary">
                          {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                        </p>
                        <span className="text-xs text-secondary">
                          {formatDate(payment.created_at)}
                        </span>
                      </div>
                      {payment.reference_number && (
                        <p className="text-xs text-secondary mt-1">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-primary">S/ {payment.amount.toFixed(2)}</p>
                  </div>
                ))}
            </div>

            {/* Botón y Formulario de Nuevo Pago (solo para créditos pendientes) */}
            {isCreditPending && hasCreditPayment && (
              <div className="mt-4 pt-4 border-t-1 border-border">
                {!showPaymentForm ? (
                  <Button
                    onPress={() => setShowPaymentForm(true)}
                    className="bg-accent text-white font-semibold w-full"
                  >
                    Nuevo Pago
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-primary">Registrar Nuevo Pago</h4>
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => {
                          setShowPaymentForm(false);
                          setPaymentAmount("");
                          setReferenceNumber("");
                        }}
                        isDisabled={isAddingPayment}
                      >
                        Cancelar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-primary">Monto a Pagar *</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={paymentAmount}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Permitir escribir cualquier valor mientras se escribe
                            // La validación se hará al enviar
                            setPaymentAmount(value);
                          }}
                          placeholder={`Máximo: S/ ${remaining.toFixed(2)}`}
                          classNames={{
                            inputWrapper: "bg-base-alt border-1 border-border !h-12",
                          }}
                          radius="sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-primary">Método de Pago *</label>
                        <Select
                          selectedKeys={[paymentMethod]}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;
                            setPaymentMethod(selected as "CONTADO" | "YAPE" | "TRANSFERENCIA");
                          }}
                          classNames={{
                            trigger: "bg-base-alt border-1 border-border !h-12",
                          }}
                          radius="sm"
                        >
                          <SelectItem key="CONTADO" textValue="CONTADO">
                            Contado
                          </SelectItem>
                          <SelectItem key="YAPE" textValue="YAPE">
                            Yape
                          </SelectItem>
                          <SelectItem key="TRANSFERENCIA" textValue="TRANSFERENCIA">
                            Transferencia
                          </SelectItem>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-primary">Número de Referencia (Opcional)</label>
                      <Input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Ej: Operación YAPE, Transferencia, etc."
                        classNames={{
                          inputWrapper: "bg-base-alt border-1 border-border !h-12",
                        }}
                        radius="sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="light"
                        onPress={() => {
                          setPaymentAmount("");
                          setReferenceNumber("");
                        }}
                        isDisabled={isAddingPayment}
                      >
                        Limpiar
                      </Button>
                      <Button
                        onPress={handleAddPayment}
                        isLoading={isAddingPayment}
                        isDisabled={
                          !paymentAmount ||
                          isNaN(parseFloat(paymentAmount)) ||
                          parseFloat(paymentAmount) <= 0 ||
                          parseFloat(paymentAmount) > remaining ||
                          isAddingPayment
                        }
                        className="bg-accent text-white font-semibold"
                      >
                        Registrar Pago
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(totalPaidReal > 0 || hasCreditPayment) && (
              <div className="mt-4 pt-4 border-t-1 border-border">
                {totalPaidReal > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-primary">Total Pagado</p>
                    <p className="text-lg font-bold text-primary">S/ {totalPaidReal.toFixed(2)}</p>
                  </div>
                )}
                {hasCreditPayment && (
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-secondary">Crédito Inicial</p>
                    <p className="text-sm font-semibold text-primary">
                      S/ {sale.payments?.find((p) => p.payment_method === "CREDITO")?.amount.toFixed(2) || "0.00"}
                    </p>
                  </div>
                )}
                {remaining > 0 && (
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-semibold text-danger">Faltante</p>
                    <p className="text-lg font-bold text-danger">S/ {remaining.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
          </AccordionItem>
        )}
      </Accordion>

      {/* Comentarios */}
      {sale.comments && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-primary border-b-1 border-border pb-2 mb-4">
            Comentarios
          </h3>
          <p className="text-primary bg-surface p-3 rounded-lg border-1 border-border">
            {sale.comments}
          </p>
        </div>
      )}

      {/* Botón Cerrar */}
      <div className="flex justify-end mt-6 pt-4 border-t-1 border-border">
        <Button onPress={closeModal} className="bg-accent text-white font-semibold">
          Cerrar
        </Button>
      </div>
    </div>
  );
};

