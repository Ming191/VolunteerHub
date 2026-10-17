"""Generate a disposable, nonfunctional service account for local E2E startup only."""
import argparse
import json
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

parser = argparse.ArgumentParser()
parser.add_argument("output", type=Path, help="Temporary file OUTSIDE the Git repository")
args = parser.parse_args()
out = args.output.expanduser().resolve()
if out.exists():
    parser.error("Refusing to overwrite existing credentials")
key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
pem = key.private_bytes(
    serialization.Encoding.PEM,
    serialization.PrivateFormat.PKCS8,
    serialization.NoEncryption(),
).decode()
data = {
    "type": "service_account",
    "project_id": "vh220-disposable-e2e",
    "private_key_id": "test-only-temporary-key",
    "private_key": pem,
    "client_email": "vh220-e2e@vh220-disposable-e2e.iam.gserviceaccount.com",
    "client_id": "100000000000000000001",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/vh220-e2e%40vh220-disposable-e2e.iam.gserviceaccount.com",
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(data), encoding="utf-8")
print("Generated local fake cloud credentials. Never use for real cloud access.")
