# Agregis

A mobile marketplace for buying and selling cattle. Sellers can list lots with detailed profiles, and buyers can browse, filter, and favorite listings.

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo Router (TypeScript) |
| Backend | Java 21 + Spring Boot 3 |
| Database | PostgreSQL 16 |
| Migrations | Flyway |
| Containers | Docker + Docker Compose |

## Project Structure

```
/
├── backend/          # Spring Boot API
├── frontend/
│   └── boi-app/      # Expo React Native app
├── .env.example      # Environment variable template
├── docker-compose.yml
├── Makefile
└── README.md
```

## Prerequisites

- [Git](https://git-scm.com/)
- [Java 21](https://adoptium.net/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/go) on your phone (for mobile testing)

```bash
# Verify installs
java -version
docker --version
node --version
git --version
```

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Joao14m/boip.git
cd boip
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
POSTGRES_DB=boip
POSTGRES_USER=boip_user
POSTGRES_PASSWORD=boip_pass

# Use localhost if testing in a browser/emulator on the same machine.
# Use your LAN IP (ipconfig on Windows) if testing on a physical phone.
PUBLIC_API_BASE=http://YOUR_IP:8080
```

### 3. Start the backend

**Option A — Docker Compose**
```bash
docker compose up --build
```

**Option B — Makefile**
```bash
make up
```

This starts PostgreSQL on port `5433` and the Spring Boot API on port `8080`. Flyway migrations run automatically on startup.

### 4. Start the frontend

```bash
cd frontend/boi-app
npm install
npx expo start
```

Then scan the QR code in the terminal with Expo Go on your phone, or press `a` for Android emulator / `i` for iOS simulator.

> **Note:** Make sure `PUBLIC_API_BASE` in your `.env` matches the machine running the backend. If testing on a physical device, use your computer's LAN IP — not `localhost`.

