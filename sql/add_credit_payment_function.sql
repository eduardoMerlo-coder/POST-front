-- =====================================================
-- FUNCIÓN: Agregar pago parcial de crédito
-- =====================================================
-- Esta función permite agregar pagos parciales a una venta a crédito
-- y actualiza automáticamente el estado cuando se completa el pago

CREATE OR REPLACE FUNCTION add_credit_payment(
    p_sale_id INTEGER,
    p_amount NUMERIC,
    p_payment_method "PaymentMethod" DEFAULT 'CONTADO',
    p_reference_number VARCHAR(100) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale RECORD;
    v_total_paid NUMERIC;
    v_result JSON;
BEGIN
    -- Verificar que la venta existe
    SELECT * INTO v_sale
    FROM "sale"
    WHERE "id" = p_sale_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Venta no encontrada';
    END IF;
    
    -- Verificar que la venta tiene crédito pendiente
    IF v_sale.status = 'COMPLETED' THEN
        RAISE EXCEPTION 'La venta ya está completada';
    END IF;
    
    IF v_sale.status = 'CANCELLED' THEN
        RAISE EXCEPTION 'No se pueden agregar pagos a una venta cancelada';
    END IF;
    
    -- Insertar el nuevo pago
    INSERT INTO "sale_payment" (
        "sale_id",
        "payment_method",
        "amount",
        "reference_number"
    )
    VALUES (
        p_sale_id,
        p_payment_method,
        p_amount,
        p_reference_number
    );
    
    -- Calcular el total pagado REAL (excluyendo crédito inicial, solo pagos parciales reales)
    -- El crédito inicial NO cuenta como dinero recibido, solo los pagos parciales posteriores
    SELECT COALESCE(SUM("amount"), 0)
    INTO v_total_paid
    FROM "sale_payment"
    WHERE "sale_id" = p_sale_id
      AND "payment_method" != 'CREDITO';
    
    -- Si el total pagado REAL es mayor o igual al total de la venta, marcar como completada
    -- Solo los pagos reales (CONTADO, YAPE, TRANSFERENCIA) cuentan para completar la venta
    IF v_total_paid >= v_sale.total_amount THEN
        UPDATE "sale"
        SET "status" = 'COMPLETED',
            "updated_at" = CURRENT_TIMESTAMP
        WHERE "id" = p_sale_id;
    END IF;
    
    -- Retornar la venta actualizada con sus pagos
    SELECT json_build_object(
        'id', s.id,
        'user_id', s.user_id,
        'client_id', s.client_id,
        'document_type', s.document_type,
        'document_number', s.document_number,
        'subtotal', s.subtotal,
        'tax_amount', s.tax_amount,
        'discount_amount', s.discount_amount,
        'total_amount', s.total_amount,
        'change_amount', s.change_amount,
        'status', s.status,
        'comments', s.comments,
        'created_at', s.created_at,
        'updated_at', s.updated_at,
        'total_paid', v_total_paid,
        'remaining', GREATEST(0, s.total_amount - v_total_paid),
        'total_paid_all', (
            SELECT COALESCE(SUM("amount"), 0)
            FROM "sale_payment"
            WHERE "sale_id" = s.id
        ),
        'payments', (
            SELECT COALESCE(
                json_agg(
                    json_build_object(
                        'id', p.id,
                        'payment_method', p.payment_method,
                        'amount', p.amount,
                        'reference_number', p.reference_number,
                        'created_at', p.created_at
                    )
                ),
                '[]'::json
            )
            FROM (
                SELECT 
                    id,
                    payment_method,
                    amount,
                    reference_number,
                    created_at
                FROM "sale_payment"
                WHERE sale_id = s.id
                ORDER BY created_at ASC
            ) p
        )
    )
    INTO v_result
    FROM "sale" s
    WHERE s.id = p_sale_id;
    
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION add_credit_payment IS 'Agrega un pago parcial a una venta a crédito y actualiza el estado si se completa el pago total';

