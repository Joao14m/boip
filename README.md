# BoiP

A mobile marketplace app for buying/selling cattle (“boi”). The frontend (mobile) is already in progress, and this repo contains (or will contain) the backend + database + deployment setup.

## Tech Stack

- **Mobile Frontend:** React Native
- **Backend:** Spring Boot
- **Database:** PostgreSQL
- **Migrations:** Flyway

## Repo Structure
/boip
  /backend
  /frontend
  .env.example
  docker-compose.yml
  Makefile
  README.md

## Quick Start (Local Dev)

### 1) Prerequisites

Install these first:

- **Git**
- **Java 21**
- **Docker Desktop** 
- **Postman**

Check versions:
```bash
java -version
docker --version
git --version
```

### 2) Clone the repo
git clone https://github.com/Joao14m/boip.git
cd boip

### 3) Set up .env in repo root
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boip
DB_USER=boip_user
DB_PASSWORD=boip_pass

# API Base URL 
- If running on the same machine: http://localhost:8080
- If testing on your phone: use your computer LAN IP (check by ipconfig in cmd)
PUBLIC_API_BASE=http://YOUR_IP:8080

### 4) Start project

1. Backend
  a) Start by Docker Compose
  cd boip
  docker compose up --build
  
  b) Start by Makefile
  cd boip
  make up

2. Frontend
   Open a terminal
   cd frontend
   npm install
   npm run start
   
   Download Expo Go
   Scan the QR Code in the terminal, which it will open Expo Go


