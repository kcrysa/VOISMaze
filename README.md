# VOISMaze

A React + Node.js + PostgreSQL maze challenge application.

## Prerequisites
- Node.js
- PostgreSQL

## Local Development Setup

### 1. Database Setup
Ensure PostgreSQL is running on your machine and create a database named `voismaze`.

### 2. Server Setup
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and adjust the variables if necessary:
```bash
cp .env.example .env
```
Start the server:
```bash
npm run dev
```

### 3. Client Setup
```bash
cd client
npm install
```
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Start the client:
```bash
npm run dev
```

## Environment Variables

### Server
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/voismaze`)
- `PORT`: The port the server will run on (default: `4000`)
- `NODE_ENV`: Should be `development` or `production`
- `CLIENT_URL`: URL of the client application (needed in production for CORS)

### Client
- `VITE_API_URL`: URL of the backend API (e.g., `http://localhost:4000`)

## Manual Render.com Deployment Steps

1. **Database:**
   - Create a new "PostgreSQL" free tier database.
   - Note the Internal Database URL.

2. **Web Service (Server):**
   - Create a new "Web Service" connected to your repository.
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Environment Variables:**
     - `DATABASE_URL`: (Set to the Internal Database URL from step 1)
     - `NODE_ENV`: `production`
     - `CLIENT_URL`: (Will be set after creating the Static Site in step 3)

3. **Static Site (Client):**
   - Create a new "Static Site".
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL`: (Set to the URL of the Web Service from step 2)

4. **Finalize Setup:**
   - Go back to the Server Web Service and update the `CLIENT_URL` environment variable with the URL of your newly created Static Site to allow CORS.
