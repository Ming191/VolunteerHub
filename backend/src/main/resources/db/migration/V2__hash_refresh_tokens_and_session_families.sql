-- Existing browser sessions must log in again to receive HttpOnly cookies.
-- Hash old rows too so historical bearer values do not remain recoverable from SQL backups.
ALTER TABLE public.refresh_tokens ADD COLUMN family_id varchar(36);
UPDATE public.refresh_tokens
SET token = encode(sha256(convert_to(token, 'UTF8')), 'hex'),
    replaced_by_token = CASE WHEN replaced_by_token IS NULL THEN NULL
        ELSE encode(sha256(convert_to(replaced_by_token, 'UTF8')), 'hex') END,
    family_id = gen_random_uuid()::text,
    revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP);
ALTER TABLE public.refresh_tokens ALTER COLUMN family_id SET NOT NULL;
CREATE INDEX idx_refresh_tokens_family_id ON public.refresh_tokens(family_id);
