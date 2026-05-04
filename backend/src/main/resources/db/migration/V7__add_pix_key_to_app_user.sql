CREATE TABLE user_payout_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES app_user(id),
    transfer_type VARCHAR(3) NOT NULL,
    pix_key VARCHAR(100),
    pix_key_type VARCHAR(10),
    bank_code VARCHAR(10),
    agency VARCHAR(10),
    account VARCHAR(20),
    account_digit VARCHAR(2),
    bank_account_type VARCHAR(20),
    ispb VARCHAR(8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
