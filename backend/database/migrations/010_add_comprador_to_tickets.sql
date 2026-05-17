-- Hace nullable usuario_id ya que el flujo de compra no requiere cuenta registrada
ALTER TABLE tickets
  ALTER COLUMN usuario_id DROP NOT NULL;

-- Agrega información del comprador directamente en el ticket
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS nombre_comprador VARCHAR(150),
  ADD COLUMN IF NOT EXISTS email_comprador  VARCHAR(150);
