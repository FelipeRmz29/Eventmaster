CREATE TABLE asientos (
    id SERIAL PRIMARY KEY,
    recinto_id INT,
    fila VARCHAR(10),
    numero INT,
    FOREIGN KEY (recinto_id) REFERENCES recintos(id)
);