ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'publicado';

-- Marcar todos los eventos existentes como publicados
UPDATE eventos SET estado = 'publicado' WHERE estado IS NULL;
