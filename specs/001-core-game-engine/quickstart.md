# Quickstart: Core Game Engine

## Prerequisites

- Node.js 20+
- PostgreSQL 18+ (Running on localhost:5432 or Docker)
- Expo Go on Mobile Device (for Client testing)

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Database Setup**

   ```bash
   # Create Database
   createdb blue_marble

   # Run Migrations (Prisma)
   npx prisma migrate dev --name init
   ```

3. **Environment Variables**
   Create `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/blue_marble?schema=public"
   PORT=3000
   ```

## Running the Server

```bash
npm run start:dev
```

## Running the Client (Expo)

```bash
npx expo start
```

Scan the QR code with Expo Go app.

## Project Structure

- `src/server`: NestJS Backend
- `src/client`: Expo React Native Frontend
- `specs/001-core-game-engine/contracts`: Shared Types
