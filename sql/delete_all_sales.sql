-- =====================================================
-- SCRIPT: Eliminar todas las ventas de prueba
-- =====================================================
-- Este script elimina todas las ventas y sus registros relacionados
-- (pagos e items) de la base de datos.
-- 
-- ⚠️ ADVERTENCIA: Este script eliminará TODAS las ventas.
-- Úsalo solo si estás seguro de que quieres eliminar todos los datos.
-- =====================================================

-- Eliminar todos los pagos de ventas
DELETE FROM "sale_payment";

-- Eliminar todos los items de ventas
DELETE FROM "sale_item";

-- Eliminar todas las ventas
DELETE FROM "sale";

-- Verificar que se eliminaron todos los registros
SELECT 
    (SELECT COUNT(*) FROM "sale") as total_ventas,
    (SELECT COUNT(*) FROM "sale_item") as total_items,
    (SELECT COUNT(*) FROM "sale_payment") as total_pagos;






