import { useState } from "react";
import { Input, Button, Select, SelectItem, Textarea } from "@heroui/react";
import { useModal } from "@/setup/context/ModalContext";
import { FaTimes } from "react-icons/fa";
import { BsWindowSplit } from "react-icons/bs";
import { XIcon } from "@/Icons";

interface PaymentModalProps {
  totalAmount: number;
  onConfirm: (paymentData: PaymentData) => void;
}

export interface PaymentData {
  paymentMethod: string;
  amountPaid: number;
  change: number;
  clientEmail?: string;
  whatsappNumber?: string;
  employeeId?: number;
  comment?: string;
  documentType: string;
  clientName: string;
}

export const PaymentModal = ({ totalAmount, onConfirm }: PaymentModalProps) => {
  const { closeModal } = useModal();

  // Función para redondear hacia arriba a 1 decimal
  const roundUpToOneDecimal = (value: number): number => {
    const twoDecimals = Math.round((value + Number.EPSILON) * 100) / 100;
    return Math.ceil(twoDecimals * 10) / 10;
  };

  const roundedTotal = roundUpToOneDecimal(totalAmount);
  const [paymentMethods, setPaymentMethods] = useState<Set<string>>(
    new Set(["CONTADO"])
  );
  const [contadoAmount, setContadoAmount] = useState(roundedTotal);
  const [yapeAmount, setYapeAmount] = useState(0);
  const [transferenciaAmount, setTransferenciaAmount] = useState(0);
  const [clientName] = useState("CLIENTE GENÉRICO");
  const [documentType] = useState("Nota de venta");
  const [clientEmail, setClientEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [showReceiptSection, setShowReceiptSection] = useState(false);

  // Calcular total pagado sumando todos los métodos
  const totalPaid =
    (paymentMethods.has("CONTADO") ? contadoAmount : 0) +
    (paymentMethods.has("YAPE") ? yapeAmount : 0) +
    (paymentMethods.has("TRANSFERENCIA") ? transferenciaAmount : 0);

  const faltante = Math.max(0, roundedTotal - totalPaid);
  const change = Math.max(0, totalPaid - roundedTotal);
  const isPaymentInsufficient = totalPaid < roundedTotal;

  const handleConfirm = () => {
    // Validar que el pago sea suficiente
    if (isPaymentInsufficient) {
      return; // No proceder si el pago es insuficiente
    }

    // Para compatibilidad con la interfaz existente, usar el primer método como principal
    const primaryMethod = Array.from(paymentMethods)[0] || "CONTADO";

    const paymentData: PaymentData = {
      paymentMethod: primaryMethod,
      amountPaid: totalPaid,
      change,
      clientEmail: clientEmail || undefined,
      whatsappNumber: whatsappNumber || undefined,
      employeeId: employeeId || undefined,
      comment: comment || undefined,
      documentType,
      clientName,
    };
    onConfirm(paymentData);
    closeModal?.();
  };

  return (
    <div className="bg-base-alt rounded-lg p-6 w-[calc(100%-2rem)] md:w-[600px] md:max-w-[600px] max-h-[90vh] overflow-y-auto relative">
      {/* Contenedor principal */}
      {/* Botón para mostrar/ocultar sección de constancia */}
      <button
        onClick={() => setShowReceiptSection(!showReceiptSection)}
        className="absolute top-6 right-6 z-10 p-2 rounded-lg bg-surface hover:bg-surface-alt border-1 border-border transition-colors"
        aria-label={
          showReceiptSection
            ? "Ocultar constancia de pago"
            : "Mostrar constancia de pago"
        }
      >
        {!showReceiptSection ? (
          <BsWindowSplit className="text-primary" size={16} />
        ) : (
          <XIcon className="text-primary size-4" />
        )}
      </button>

      <div
        className={`grid grid-cols-1 gap-6 transition-all ${showReceiptSection ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
      >
        {/* Sección Izquierda: Detalles de Pago */}
        <div className="flex flex-col gap-4">
          {/* Monto a Cobrar */}
          <div className="border-b-1 border-b-border pb-4">
            <h2 className="text-sm font-bold text-primary mb-2">
              MONTO A COBRAR S/{roundedTotal.toFixed(2)}
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-secondary">
                Cliente:{" "}
                <span className="text-primary font-semibold">{clientName}</span>
              </p>
              <p className="text-secondary">
                Tipo de doc:{" "}
                <span className="text-primary font-semibold">
                  {documentType}
                </span>
              </p>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div>
            <label className="text-sm font-medium text-secondary mb-2 block">
              Métodos de pago
            </label>
            <div className="relative">
              <Select
                selectionMode="multiple"
                selectedKeys={paymentMethods}
                onSelectionChange={(keys) => {
                  const newMethods = keys as Set<string>;
                  // Asegurar que siempre haya al menos un método
                  if (newMethods.size === 0) {
                    setPaymentMethods(new Set(["CONTADO"]));
                  } else {
                    setPaymentMethods(newMethods);
                  }
                }}
                classNames={{
                  trigger: "bg-surface border-1 border-border",
                }}
                renderValue={() => {
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from(paymentMethods).map((method) => (
                        <div
                          key={method}
                          className="flex items-center gap-1 bg-accent/20 text-accent px-3 py-1 rounded-full"
                        >
                          <span className="text-sm font-semibold">
                            {method}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newMethods = new Set(paymentMethods);
                              newMethods.delete(method);
                              if (newMethods.size === 0) {
                                setPaymentMethods(new Set(["CONTADO"]));
                              } else {
                                setPaymentMethods(newMethods);
                              }
                            }}
                            className="ml-1 hover:text-danger"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                }}
              >
                <SelectItem key="CONTADO" textValue="CONTADO">
                  CONTADO
                </SelectItem>
                <SelectItem key="YAPE" textValue="YAPE">
                  YAPE
                </SelectItem>
              </Select>
            </div>
          </div>

          {/* Métodos de Pago Seleccionados */}
          {paymentMethods.size > 0 && (
            <div className="space-y-3">
              {/* CONTADO */}
              {paymentMethods.has("CONTADO") && (
                <div className="flex gap-2 items-center justify-between border-b-1 border-b-border pb-3">
                  <span className="text-sm font-medium text-secondary">
                    CONTADO:
                  </span>
                  <div className="flex flex-col gap-1 flex-1 max-w-24">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={contadoAmount.toString()}
                      onChange={(e) =>
                        setContadoAmount(parseFloat(e.target.value) || 0)
                      }
                      onFocus={(e) => e.target.select()}
                      classNames={{
                        base: "w-full",
                        inputWrapper: "bg-surface border-1 border-border",
                        input: "font-semibold",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* YAPE */}
              {paymentMethods.has("YAPE") && (
                <div className="flex gap-2 items-center justify-between border-b-1 border-b-border pb-3">
                  <span className="text-sm font-medium text-secondary">
                    YAPE:
                  </span>
                  <div className="flex flex-col gap-1 flex-1 max-w-24">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={yapeAmount.toString()}
                      onChange={(e) =>
                        setYapeAmount(parseFloat(e.target.value) || 0)
                      }
                      onFocus={(e) => e.target.select()}
                      classNames={{
                        base: "w-full",
                        inputWrapper: "bg-surface border-1 border-border",
                        input: "font-semibold",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TRANSFERENCIA */}
              {paymentMethods.has("TRANSFERENCIA") && (
                <div className="flex gap-2 items-center justify-between border-b-1 border-b-border pb-3">
                  <span className="text-sm font-medium text-secondary">
                    TRANSFERENCIA:
                  </span>
                  <div className="flex flex-col gap-1 flex-1 max-w-[200px]">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transferenciaAmount.toString()}
                      onChange={(e) =>
                        setTransferenciaAmount(parseFloat(e.target.value) || 0)
                      }
                      onFocus={(e) => e.target.select()}
                      classNames={{
                        base: "w-full",
                        inputWrapper: "bg-surface border-1 border-border",
                        input: "font-semibold",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Faltante (siempre visible) */}
              <div className="flex gap-2 items-center justify-between pt-3">
                <span className="text-sm font-medium text-secondary">
                  Faltante:
                </span>
                <div className="flex items-center gap-2 flex-1 max-w-24">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={faltante.toFixed(2)}
                    readOnly
                    classNames={{
                      base: "w-full",
                      inputWrapper: `!bg-[#828998] ${
                        isPaymentInsufficient
                          ? "border-1 border-danger"
                          : "border-1 border-border"
                      }`,
                      input: "font-semibold",
                    }}
                  />
                </div>
              </div>

              {/* Vuelto (siempre visible) */}
              <div className="flex gap-2 items-center justify-between pt-3">
                <span className="text-sm font-medium text-secondary">
                  Vuelto:
                </span>
                <div className="flex items-center gap-2 flex-1 max-w-24">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={change.toFixed(2)}
                    readOnly
                    classNames={{
                      base: "w-full",
                      inputWrapper: "!bg-[#828998] border-1 border-border",
                      input: "font-semibold",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección Derecha: Constancia de Pago */}
        {showReceiptSection && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-primary mb-4">
                ENVIAR CONSTANCIA DE PAGO
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-secondary mb-2 block">
                    Ingresar correo(s) del cliente
                  </label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    classNames={{
                      inputWrapper: "bg-surface border-1 border-border",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary mb-2 block">
                    Enviar via whatsapp
                  </label>
                  <Input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+51 999 999 999"
                    classNames={{
                      inputWrapper: "bg-surface border-1 border-border",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary mb-2 block">
                    Seleccione un empleado
                  </label>
                  <Select
                    placeholder="Seleccione un empleado"
                    selectedKeys={employeeId ? [employeeId.toString()] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setEmployeeId(selected ? parseInt(selected) : null);
                    }}
                    classNames={{
                      trigger: "bg-surface border-1 border-border",
                    }}
                  >
                    <SelectItem key="1">Empleado 1</SelectItem>
                    <SelectItem key="2">Empleado 2</SelectItem>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary mb-2 block">
                    Comentario
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Agregar comentario..."
                    minRows={3}
                    classNames={{
                      inputWrapper: "bg-surface border-1 border-border",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end mt-6 pt-4 border-t-1 border-border">
        <Button
          variant="bordered"
          className="border-border text-primary"
          onPress={closeModal}
        >
          Cancelar
        </Button>
        <Button
          className="bg-accent text-white font-semibold"
          onPress={handleConfirm}
          isDisabled={isPaymentInsufficient}
        >
          Crear
        </Button>
      </div>
    </div>
  );
};
