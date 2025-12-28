-- =====================================================
-- MIGRACIÓN: Crear tablas para sistema de ventas
-- =====================================================
-- Este script crea las tablas necesarias para el módulo de ventas
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. Crear ENUMs para tipos de datos
-- =====================================================

-- Enum para métodos de pago
DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM (
        'CONTADO',
        'YAPE',
        'TRANSFERENCIA',
        'CREDITO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para estado de venta
DO $$ BEGIN
    CREATE TYPE "SaleStatus" AS ENUM (
        'COMPLETED',
        'PENDING',
        'CANCELLED',
        'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para tipo de documento
DO $$ BEGIN
    CREATE TYPE "DocumentType" AS ENUM (
        'B',      -- Boleta
        'F',      -- Factura
        'NVT'     -- Nota de Venta
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. Tabla: sale (Venta Principal)
-- =====================================================

CREATE TABLE IF NOT EXISTS "sale" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "client_id" INTEGER,
    "document_type" "DocumentType" NOT NULL DEFAULT 'NVT',
    "document_number" VARCHAR(50) UNIQUE,
    "subtotal" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "tax_amount" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "discount_amount" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "total_amount" NUMERIC(10,2) NOT NULL,
    "change_amount" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "status" "SaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "comments" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT "sale_user_id_fkey" 
        FOREIGN KEY ("user_id") 
        REFERENCES "profile"("id") 
        ON DELETE RESTRICT,
    
    CONSTRAINT "sale_client_id_fkey" 
        FOREIGN KEY ("client_id") 
        REFERENCES "client"("id") 
        ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT "sale_total_amount_check" 
        CHECK ("total_amount" >= 0),
    
    CONSTRAINT "sale_subtotal_check" 
        CHECK ("subtotal" >= 0),
    
    CONSTRAINT "sale_tax_amount_check" 
        CHECK ("tax_amount" >= 0),
    
    CONSTRAINT "sale_discount_amount_check" 
        CHECK ("discount_amount" >= 0)
);

-- Índices para la tabla sale
CREATE INDEX IF NOT EXISTS "idx_sale_user_id" ON "sale"("user_id");
CREATE INDEX IF NOT EXISTS "idx_sale_client_id" ON "sale"("client_id");
CREATE INDEX IF NOT EXISTS "idx_sale_created_at" ON "sale"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_sale_document_number" ON "sale"("document_number") WHERE "document_number" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_sale_status" ON "sale"("status");

-- =====================================================
-- 3. Tabla: sale_item (Items de la Venta)
-- =====================================================

CREATE TABLE IF NOT EXISTS "sale_item" (
    "id" SERIAL PRIMARY KEY,
    "sale_id" INTEGER NOT NULL,
    "user_product_variant_id" INTEGER NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "variant_name" VARCHAR(255),
    "quantity" NUMERIC(10,3) NOT NULL,
    "unit_price" NUMERIC(10,2) NOT NULL,
    "subtotal" NUMERIC(10,2) NOT NULL,
    "discount_amount" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT "sale_item_sale_id_fkey" 
        FOREIGN KEY ("sale_id") 
        REFERENCES "sale"("id") 
        ON DELETE CASCADE,
    
    CONSTRAINT "sale_item_user_product_variant_id_fkey" 
        FOREIGN KEY ("user_product_variant_id") 
        REFERENCES "user_product_variant"("id") 
        ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT "sale_item_quantity_check" 
        CHECK ("quantity" > 0),
    
    CONSTRAINT "sale_item_unit_price_check" 
        CHECK ("unit_price" >= 0),
    
    CONSTRAINT "sale_item_subtotal_check" 
        CHECK ("subtotal" >= 0),
    
    CONSTRAINT "sale_item_discount_amount_check" 
        CHECK ("discount_amount" >= 0)
);

-- Índices para la tabla sale_item
CREATE INDEX IF NOT EXISTS "idx_sale_item_sale_id" ON "sale_item"("sale_id");
CREATE INDEX IF NOT EXISTS "idx_sale_item_user_product_variant_id" ON "sale_item"("user_product_variant_id");

-- =====================================================
-- 4. Tabla: sale_payment (Pagos de la Venta)
-- =====================================================

CREATE TABLE IF NOT EXISTS "sale_payment" (
    "id" SERIAL PRIMARY KEY,
    "sale_id" INTEGER NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "amount" NUMERIC(10,2) NOT NULL,
    "reference_number" VARCHAR(100),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT "sale_payment_sale_id_fkey" 
        FOREIGN KEY ("sale_id") 
        REFERENCES "sale"("id") 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT "sale_payment_amount_check" 
        CHECK ("amount" > 0)
);

-- Índices para la tabla sale_payment
CREATE INDEX IF NOT EXISTS "idx_sale_payment_sale_id" ON "sale_payment"("sale_id");
CREATE INDEX IF NOT EXISTS "idx_sale_payment_method" ON "sale_payment"("payment_method");

-- =====================================================
-- 5. Función para actualizar updated_at automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_sale_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en sale
DROP TRIGGER IF EXISTS "trigger_update_sale_updated_at" ON "sale";
CREATE TRIGGER "trigger_update_sale_updated_at"
    BEFORE UPDATE ON "sale"
    FOR EACH ROW
    EXECUTE FUNCTION update_sale_updated_at();

-- =====================================================
-- 6. Función para generar número de documento
-- =====================================================

CREATE OR REPLACE FUNCTION generate_document_number(
    p_document_type "DocumentType",
    p_user_id UUID
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_prefix VARCHAR(3);
    v_date_prefix VARCHAR(8);
    v_sequence INTEGER;
    v_document_number VARCHAR(50);
BEGIN
    -- Determinar prefijo según tipo de documento
    CASE p_document_type
        WHEN 'B' THEN v_prefix := 'B';
        WHEN 'F' THEN v_prefix := 'F';
        WHEN 'NVT' THEN v_prefix := 'NVT';
    END CASE;
    
    -- Formato de fecha: YYYYMMDD
    v_date_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- Obtener el siguiente número de secuencia para este usuario y fecha
    SELECT COALESCE(MAX(CAST(SUBSTRING("document_number" FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO v_sequence
    FROM "sale"
    WHERE "user_id" = p_user_id
      AND "document_type" = p_document_type
      AND "document_number" LIKE v_prefix || '-' || v_date_prefix || '-%';
    
    -- Formatear número de documento: PREFIX-YYYYMMDD-XXXX
    v_document_number := v_prefix || '-' || v_date_prefix || '-' || LPAD(v_sequence::TEXT, 4, '0');
    
    RETURN v_document_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Función para crear una venta completa (RPC)
-- =====================================================

CREATE OR REPLACE FUNCTION create_sale(
    p_user_id UUID,
    p_client_id INTEGER,
    p_document_type "DocumentType",
    p_subtotal NUMERIC,
    p_total_amount NUMERIC,
    p_items JSONB,
    p_payments JSONB,
    p_tax_amount NUMERIC DEFAULT 0,
    p_discount_amount NUMERIC DEFAULT 0,
    p_change_amount NUMERIC DEFAULT 0,
    p_status "SaleStatus" DEFAULT 'COMPLETED',
    p_comments TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale_id INTEGER;
    v_document_number VARCHAR(50);
    v_result JSON;
    v_item JSONB;
    v_payment JSONB;
BEGIN
    -- Generar número de documento si es necesario
    IF p_document_type != 'NVT' THEN
        v_document_number := generate_document_number(p_document_type, p_user_id);
    END IF;
    
    -- Insertar la venta principal
    INSERT INTO "sale" (
        "user_id",
        "client_id",
        "document_type",
        "document_number",
        "subtotal",
        "tax_amount",
        "discount_amount",
        "total_amount",
        "change_amount",
        "status",
        "comments"
    )
    VALUES (
        p_user_id,
        p_client_id,
        p_document_type,
        v_document_number,
        p_subtotal,
        p_tax_amount,
        p_discount_amount,
        p_total_amount,
        p_change_amount,
        p_status,
        p_comments
    )
    RETURNING "id" INTO v_sale_id;
    
    -- Insertar items de la venta
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO "sale_item" (
            "sale_id",
            "user_product_variant_id",
            "product_name",
            "variant_name",
            "quantity",
            "unit_price",
            "subtotal",
            "discount_amount"
        )
        VALUES (
            v_sale_id,
            (v_item->>'user_product_variant_id')::INTEGER,
            v_item->>'product_name',
            v_item->>'variant_name',
            (v_item->>'quantity')::NUMERIC,
            (v_item->>'unit_price')::NUMERIC,
            (v_item->>'subtotal')::NUMERIC,
            COALESCE((v_item->>'discount_amount')::NUMERIC, 0)
        );
        
        -- Actualizar stock del producto
        UPDATE "user_product_variant"
        SET "stock_quantity" = "stock_quantity" - (v_item->>'quantity')::NUMERIC
        WHERE "id" = (v_item->>'user_product_variant_id')::INTEGER;
    END LOOP;
    
    -- Insertar pagos de la venta
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        INSERT INTO "sale_payment" (
            "sale_id",
            "payment_method",
            "amount",
            "reference_number"
        )
        VALUES (
            v_sale_id,
            (v_payment->>'payment_method')::"PaymentMethod",
            (v_payment->>'amount')::NUMERIC,
            v_payment->>'reference_number'
        );
    END LOOP;
    
    -- Retornar la venta creada con sus relaciones
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
        'items', (
            SELECT json_agg(
                json_build_object(
                    'id', si.id,
                    'product_name', si.product_name,
                    'variant_name', si.variant_name,
                    'quantity', si.quantity,
                    'unit_price', si.unit_price,
                    'subtotal', si.subtotal
                )
            )
            FROM "sale_item" si
            WHERE si.sale_id = s.id
        ),
        'payments', (
            SELECT json_agg(
                json_build_object(
                    'id', sp.id,
                    'payment_method', sp.payment_method,
                    'amount', sp.amount,
                    'reference_number', sp.reference_number
                )
            )
            FROM "sale_payment" sp
            WHERE sp.sale_id = s.id
        )
    )
    INTO v_result
    FROM "sale" s
    WHERE s.id = v_sale_id;
    
    RETURN v_result;
END;
$$;

-- =====================================================
-- 8. Comentarios en las tablas (documentación)
-- =====================================================

COMMENT ON TABLE "sale" IS 'Tabla principal que almacena la información de cada venta';
COMMENT ON TABLE "sale_item" IS 'Almacena los productos vendidos en cada venta';
COMMENT ON TABLE "sale_payment" IS 'Almacena los métodos de pago utilizados en cada venta';

COMMENT ON COLUMN "sale"."document_type" IS 'Tipo de documento: B (Boleta), F (Factura), NVT (Nota de Venta)';
COMMENT ON COLUMN "sale"."status" IS 'Estado de la venta: COMPLETED, PENDING, CANCELLED, REFUNDED';
COMMENT ON COLUMN "sale_item"."product_name" IS 'Nombre del producto al momento de la venta (snapshot para mantener historial)';
COMMENT ON COLUMN "sale_payment"."payment_method" IS 'Método de pago: CONTADO, YAPE, TRANSFERENCIA, CREDITO';

