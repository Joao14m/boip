CREATE TABLE webhook_event (
    payment_id   VARCHAR(100) PRIMARY KEY,
    event_type   VARCHAR(50)  NOT NULL,
    processed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
