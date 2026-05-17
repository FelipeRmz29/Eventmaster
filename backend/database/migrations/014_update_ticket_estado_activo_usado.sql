-- Migración 014: Actualizar estado de tickets de 'valido' a 'activo'
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar tickets existentes con estado 'valido' → 'activo'
UPDATE tickets
SET estado = 'activo'
WHERE estado = 'valido';

-- 2. Asegurarse de que la columna usado_en existe (por si no estaba en la tabla)
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS usado_en TIMESTAMPTZ;
