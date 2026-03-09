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
| Auth | Firebase Authentication |
| Storage | Firebase Storage |

## Project Structure

```
/
├── backend/          # Spring Boot API
├── frontend/
│   └── boi-app/      # Expo React Native app
├── secrets/          # Firebase service account key (git-ignored)
├── .env.example      # Backend env template
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
- A [Firebase](https://console.firebase.google.com/) project with **Authentication** and **Storage** enabled

```bash
# Verify installs
java -version
docker --version
node --version
git --version
```

## Firebase Setup

This project uses Firebase for user authentication and image storage. You need to configure it once before running locally.

### 1. Create a Firebase project

Go to [Firebase Console](https://console.firebase.google.com/) → **Add project** → follow the steps.

### 2. Enable Authentication

**Authentication** → **Sign-in method** → enable **Email/Password**.

### 3. Enable Storage

**Storage** → **Get started** → choose a region → start in production mode.

Then update the Storage rules to allow authenticated users:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Get the frontend config

**Project Settings** → **Your apps** → add a **Web app** if none exists → copy the config values for step 6 below.

### 5. Get the backend service account key

**Project Settings** → **Service accounts** → **Generate new private key** → download the JSON.

Rename the file to `firebase-service-account.json` and place it at:
```
secrets/firebase-service-account.json
```

> This file is git-ignored. Never commit it.

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Joao14m/boip.git
cd boip
```

### 2. Configure the backend

```bash
cp .env.example .env
```

Edit `.env`:
```env
POSTGRES_DB=boi_market
POSTGRES_USER=boi_user
POSTGRES_PASSWORD=your_password

# Use your LAN IP (ipconfig on Windows / ifconfig on Mac) for physical devices.
PUBLIC_API_BASE=http://YOUR_IP:8080
```

### 3. Configure the frontend

```bash
cp frontend/boi-app/.env.example frontend/boi-app/.env
```

Edit `frontend/boi-app/.env` with your Firebase project values:
```env
# Your LAN IP if testing on a physical phone; localhost for emulator/browser
EXPO_PUBLIC_API_BASE=http://YOUR_IP:8080

# From Firebase Console → Project Settings → Your apps
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Start the backend

**Option A — Docker Compose**
```bash
docker compose up --build
```

**Option B — Makefile**
```bash
make up
```

This starts PostgreSQL on port `5433` and the Spring Boot API on port `8080`. Flyway migrations run automatically on startup.

### 5. Start the frontend

```bash
cd frontend/boi-app
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## Common Issues

**Docker build fails with "parent snapshot does not exist"**
Docker Desktop cache is corrupted. Run:
```bash
docker builder prune
docker compose up --build
```

**403 on API requests**
Check that `EXPO_PUBLIC_API_BASE` points to the correct IP and the backend is running. Physical devices must use your LAN IP, not `localhost`.

**Firebase: service account not found**
Ensure `secrets/firebase-service-account.json` exists with that exact filename.

**Firebase Storage: permission denied**
Check your Storage rules allow authenticated reads/writes (see Firebase Setup step 3).
