-- para agregar columna
ALTER TABLE asientos
ADD COLUMN zona_id INT;

-- para que la zona por defecto  sea (General = 2)
UPDATE asientos
SET zona_id = 2;

-- hacer obligatoria la zona
ALTER TABLE asientos
ALTER COLUMN zona_id SET NOT NULL;

-- aqui se crea relación
ALTER TABLE asientos
ADD CONSTRAINT fk_asientos_zona
FOREIGN KEY (zona_id) REFERENCES zonas(id);