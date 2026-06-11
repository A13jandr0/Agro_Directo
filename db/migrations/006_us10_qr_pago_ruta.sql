-- ============================================================
-- MIGRACIÓN 006: Añadir campo qr_pago_ruta a perfil_productor
-- Fecha: 2026-06-10
-- Objetivo: Soportar la URL del código QR de cobro para productores.
-- ============================================================

ALTER TABLE perfil_productor
ADD qr_pago_ruta VARCHAR(500) NULL;
