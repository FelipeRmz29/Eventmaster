CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id),
    asiento_id INT REFERENCES asientos(id),
    comprador_id INT REFERENCES usuarios(id),
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'valid' NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tickets_status_check CHECK (status IN ('valid', 'used', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_tickets_qr_token ON tickets(qr_token);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
