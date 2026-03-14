CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150),
    fecha TIMESTAMP,
    recinto_id INT,
    FOREIGN KEY (recinto_id) REFERENCES recintos(id)
);