CREATE TABLE audit_event (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id     UUID,
    action       VARCHAR(50)  NOT NULL,
    target_id    UUID,
    payload_json TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_event_actor_id   ON audit_event(actor_id);
CREATE INDEX idx_audit_event_target_id  ON audit_event(target_id);
CREATE INDEX idx_audit_event_created_at ON audit_event(created_at DESC);
