CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    usuario_id INT,
    evento_id INT,
    asiento_id INT,
    precio DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'valido',

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (asiento_id) REFERENCES asientos(id)
);