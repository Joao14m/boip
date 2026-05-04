import subprocess
import signal
import sys
import time
import re
import os
import secrets
import tempfile
import requests

ENV_FILE = ".env"
BACKEND_PORT = 8080
FRONTEND_DIR = "frontend/boi-app"

# Track processes and state for cleanup
tunnel_proc = None
expo_proc = None
webhook_id = None


def cleanup(signum=None, frame=None):
    """Runs on Ctrl+C: delete webhook, kill processes, stop docker."""
    print("\nShutting down...")

    if webhook_id:
        print(f"Deleting Asaas webhook {webhook_id}...")
        try:
            requests.delete(
                f"http://localhost:{BACKEND_PORT}/api/webhooks/{webhook_id}",
                headers={"asaas-access-token": webhook_token},
                timeout=5,
            )
        except Exception:
            pass

    if expo_proc and expo_proc.poll() is None:
        expo_proc.terminate()

    if tunnel_proc and tunnel_proc.poll() is None:
        tunnel_proc.terminate()

    subprocess.run("docker compose down", shell=True, capture_output=True)

    print("All stopped.")
    sys.exit(0)


# Register Ctrl+C handler
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)


# ── 1. Start cloudflared tunnel ──
print(f"Starting cloudflared tunnel on port {BACKEND_PORT}...")
tunnel_log = tempfile.NamedTemporaryFile(
    mode="w", suffix=".log", delete=False
)  # creates a temporary file on disk to capture logs
tunnel_proc = subprocess.Popen(
    f"npx cloudflared tunnel --url http://localhost:{BACKEND_PORT}",
    shell=True,
    stdout=subprocess.DEVNULL,
    stderr=tunnel_log,
)

print("Waiting for tunnel URL...")
tunnel_url = None
for _ in range(30):
    tunnel_log.flush()  # makes sure any buffered log content is actually written to disk
    with open(tunnel_log.name, "r") as f:
        content = f.read()
    match = re.search(
        r"https://[a-z0-9-]+\.trycloudflare\.com", content
    )  # scan the text looking for an URL
    if match:
        tunnel_url = match.group(0)  # saves the URL
        break
    time.sleep(1)

if not tunnel_url:  # drops the log
    print("ERROR: Could not detect cloudflared tunnel URL after 30s.")
    with open(tunnel_log.name, "r") as f:
        print(f.read())
    cleanup()

print(f"Tunnel URL: {tunnel_url}")


# ── 2. Update .env with the new tunnel URL and a fresh auth token ──
webhook_url = f"{tunnel_url}/api/webhooks/asaas"  # cloudflare + endpoint
webhook_token = secrets.token_hex(
    16
)  # generates a random 32-char hex string (16 bytes = 32 hex chars)

with (
    open(ENV_FILE, "r") as f
):  # opens the .env file in read mode. with ensures the file is auto closed after reading
    env_content = f.read()

# Update or add APP_WEBHOOK_URL
if "APP_WEBHOOK_URL=" in env_content:
    env_content = re.sub(
        r"APP_WEBHOOK_URL=.*", f"APP_WEBHOOK_URL={webhook_url}", env_content
    )
else:
    env_content += f"\nAPP_WEBHOOK_URL={webhook_url}\n"

# Update or add APP_WEBHOOK_AUTH_TOKEN
if "APP_WEBHOOK_AUTH_TOKEN=" in env_content:
    env_content = re.sub(
        r"APP_WEBHOOK_AUTH_TOKEN=.*",
        f"APP_WEBHOOK_AUTH_TOKEN={webhook_token}",
        env_content,
    )
else:
    env_content += f"\nAPP_WEBHOOK_AUTH_TOKEN={webhook_token}\n"

with open(ENV_FILE, "w") as f:  # now we modify
    f.write(env_content)

print(f"Updated .env: APP_WEBHOOK_URL={webhook_url}")
print(f"Updated .env: APP_WEBHOOK_AUTH_TOKEN={webhook_token}")


# ── 3. Start docker compose ──
print("Starting docker compose...")
# is like Popen but it waits for the command to finish before moving on
subprocess.run("docker compose up -d --build", shell=True, check=True)

print("Waiting for backend to be ready...")
for _ in range(120):
    try:
        r = requests.get(f"http://localhost:{BACKEND_PORT}/api/webhooks", timeout=2)
        if r.status_code > 0:
            break
    except Exception:
        pass
    time.sleep(2)
else:
    print("ERROR: Backend did not start within 4 minutes.")
    print("Check logs with: docker compose logs backend")
    cleanup()

print("Backend is ready!")


# ── 4. Delete old webhooks and register a new one ──
admin_headers = {"asaas-access-token": webhook_token}

print("Cleaning up old Asaas webhooks...")
try:
    # makes the GET request and converts the raw json string into a python dict/list
    old_webhooks = requests.get(
        f"http://localhost:{BACKEND_PORT}/api/webhooks", headers=admin_headers, timeout=5
    ).json()
    for wh in old_webhooks.get("data", []):  # looping through and deleting each one
        wh_id = wh.get("id")
        if wh_id:  # if id is found, delete
            print(f"  Deleting old webhook: {wh_id}")
            requests.delete(
                f"http://localhost:{BACKEND_PORT}/api/webhooks/{wh_id}", headers=admin_headers, timeout=5
            )
except Exception as e:
    print(f"  Warning: could not clean old webhooks: {e}")

print("Registering new Asaas webhook...")
try:
    r = requests.post(
        f"http://localhost:{BACKEND_PORT}/api/webhooks/register", headers=admin_headers, timeout=10
    )
    data = r.json()
    webhook_id = data.get("id")
    if webhook_id:
        print(f"Webhook registered: {webhook_id}")
    else:
        print(f"WARNING: Unexpected response: {data}")
except Exception as e:
    print(f"WARNING: Could not register webhook: {e}")


# ── 5. Start frontend ──
print("Starting frontend...")
expo_proc = subprocess.Popen(
    "npx expo start",
    shell=True,
    cwd=FRONTEND_DIR,
)

print()
print("=========================================")
print("  All services running!")
print(f"  Backend:  http://localhost:{BACKEND_PORT}")
print(f"  Tunnel:   {tunnel_url}")
print(f"  Webhook:  {webhook_url}")
print("=========================================")
print("Press Ctrl+C to stop everything.")
print()

# Keep alive until Ctrl+C
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    cleanup()
