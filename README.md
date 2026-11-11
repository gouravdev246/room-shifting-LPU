# LPU Room Shift (`room-shifting-LPU`)

A full-stack web application for Lovely Professional University (LPU) hostel students to browse, filter, and list hostel rooms available for room shifting and swapping.

---

## Features

- **Student Authentication**: Registration and login via LPU Registration ID or 10-digit phone number (`bcryptjs` password hashing + JWT delivered via `httpOnly` cookie and `Authorization: Bearer` token, with session revalidation via `/api/auth/me`).
- **Room Discovery & Multi-Criteria Filtering**: Browse available rooms in a responsive card grid and filter by **Hostel** (`BH-1`–`BH-5`, `GH-1`–`GH-4`, `Hostel 1`–`Hostel 3`), **Room Type** (`AC` / `Non-AC`), **Seater Capacity** (`1`–`5`), and **Block** (`A`–`D`), synced with URL query parameters (`/?hostel=...&type=...&seater=...&block=...`).
- **Redis Query Caching**: `GET /api/rooms` caches filter combinations in Redis for 10 minutes (`600s`), automatically invalidates `rooms:*` cache entries when listings are created or deleted, and falls back gracefully to PostgreSQL if Redis is unavailable.
- **Room Details & Photo Carousel**: Interactive multi-image gallery powered by Embla Carousel (`embla-carousel-react`) displaying room specifications, resident details, and shifting notes.
- **Privacy-Preserving Owner Contact**: Unauthenticated visitors see a masked owner phone number (e.g., `98******10`). Authenticated students can view the full phone number and open a pre-filled WhatsApp chat via `GET /api/rooms/:id/contact`.
- **Listing Management & Photo Uploads**: Logged-in students can publish new listings (`/add-room`) with up to 5 photos uploaded to Cloudinary (`POST /api/upload/photos`, with client-side preview fallback if upload is unavailable), and listing owners can delete their own listings (`DELETE /api/rooms/:id`).

> **Note:** The database schema also provisions a `find_roommate` table in [`server/src/common/db/schema.sql`](server/src/common/db/schema.sql) for future roommate-matching features; the active backend routes and frontend UI currently implement authentication, room listings, and photo uploads.

---

## Tech Stack

### Frontend (`client/`)
- **Framework & Build**: React 19, TypeScript, Vite 8
- **Styling & UI**: Tailwind CSS v4, Shadcn UI (`base-nova` / `@base-ui/react`), Lucide React
- **Routing & Carousel**: `react-router-dom` v7, `embla-carousel-react`

### Backend (`server/`)
- **Runtime & Web Framework**: Node.js (ES Modules), Express 5
- **Database**: PostgreSQL via `@neondatabase/serverless` (WebSocket transport via `ws`)
- **Cache**: Redis via `ioredis` (supports standard `REDIS_URL`, Upstash REST credentials, or `REDIS_HOST`/`REDIS_PORT`)
- **Auth & Uploads**: `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, `multer`, `cloudinary`

---

## Architecture Diagram

[![Architecture diagram of gouravdev246/room-shifting-lpu](./public/diagram.png)](https://gitdiagram.com/gouravdev246/room-shifting-lpu?utm_source=readme&utm_medium=picture)

[![Architecture diagram](https://gitdiagram.com/diagram-badge.svg)](https://gitdiagram.com/gouravdev246/room-shifting-lpu?utm_source=readme&utm_medium=badge)

---

## Project Structure

```text
room-shifting-LPU/
├── client/                         # Vite + React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn UI primitives (button, card, carousel, select, etc.)
│   │   │   ├── HomePage.tsx        # Main landing view
│   │   │   ├── HostelDetailsCard.tsx # Filter bar & room listings grid
│   │   │   ├── RoomDetail.tsx      # Detailed room view, image carousel, WhatsApp contact & delete
│   │   │   ├── RoomAdd.tsx         # Protected room creation & photo upload form
│   │   │   ├── Login.tsx           # Student login form (Reg ID or Phone)
│   │   │   ├── Register.tsx        # Student registration form
│   │   │   └── Navbar.tsx          # Responsive sticky navigation & filter shortcuts
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Auth state, token management, and session revalidation
│   │   ├── lib/
│   │   │   ├── api.ts              # Typed API client (authApi, roomApi, uploadApi, systemApi)
│   │   │   └── utils.ts
│   │   └── App.tsx                 # Routes: /, /add-room, /login, /register
│   ├── vite.config.ts              # Proxies /api and /health to http://localhost:5000
│   └── package.json
├── public/
│   └── diagram.png                 # System architecture diagram
├── server/                         # Express backend API
│   ├── src/
│   │   ├── common/
│   │   │   ├── config/             # env.js, db.js, redis.js, cloudinary.js
│   │   │   ├── db/
│   │   │   │   ├── schema.sql      # PostgreSQL DDL (users, rooms, room_photos, find_roommate)
│   │   │   │   └── migrate.js      # Drops & recreates schema tables
│   │   │   └── middlewares/        # authMiddleware.js (verifyToken), optionalAuth.js
│   │   ├── modules/
│   │   │   ├── auth/               # auth.routes.js, auth.controller.js, auth.model.js
│   │   │   ├── room/               # room.routes.js, room.controller.js, room.model.js
│   │   │   └── upload/             # upload.routes.js, upload.service.js (Cloudinary + Multer)
│   │   ├── app.js                  # Express app, CORS, JSON/cookie middleware, routes
│   │   └── server.js               # Server entrypoint (DB & Redis startup checks)
│   ├── .env.example                # Sample backend environment variables
│   ├── test-api.js                 # Automated 16-case integration test suite
│   ├── testing.http                # Manual REST client requests
│   └── package.json
└── complete-task.md                # Incremental development and verification log
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended for native `fetch` used in `test-api.js`) and **npm**
- A **PostgreSQL** database URL (configured for Neon Serverless PostgreSQL via `DATABASE_URL`)
- *(Optional)* **Redis** (standard `REDIS_URL` or Upstash credentials) for room query caching
- *(Optional)* **Cloudinary** account credentials for uploading room photos

### 1. Backend Setup (`server/`)

```bash
cd server
npm install
```

Create a `.env` file in `server/` based on [`server/.env.example`](server/.env.example):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require

# Optional Redis (Option A or Option B)
REDIS_URL=rediss://default:<password>@<endpoint>.upstash.io:6379
# UPSTASH_REDIS_REST_URL=https://<endpoint>.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here

JWT_SECRET=your_jwt_secret_key_here

# Optional Cloudinary for room photo uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> **Port Note:** [`client/vite.config.ts`](client/vite.config.ts) proxies `/api` and `/health` to `http://localhost:5000` (matching the default fallback in [`server/src/server.js`](server/src/server.js)). Note that [`server/.env.example`](server/.env.example) and [`server/testing.http`](server/testing.http) reference `5001`. If you run the backend on port `5001`, either change `PORT=5000` in `server/.env` or set `VITE_API_URL=http://localhost:5001` in `client/.env`.

Initialize the PostgreSQL tables (warning: [`migrate.js`](server/src/common/db/migrate.js) runs `DROP TABLE IF EXISTS ... CASCADE` before applying `schema.sql`):

```bash
node src/common/db/migrate.js
```

Start the backend development server:

```bash
npm run dev
# Or for standard execution:
npm start
```

### 2. Frontend Setup (`client/`)

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The React app will be served by Vite at `http://localhost:5173`.

---

## Available Scripts

### Backend (`server/`)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Express server with `node --watch src/server.js` |
| `npm start` | Starts Express server (`node src/server.js`) |
| `npm test` | Runs the end-to-end API test suite (`node test-api.js`) |

### Frontend (`client/`)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server |
| `npm run build` | Runs TypeScript check (`tsc -b`) and Vite production build (`vite build`) |
| `npm run lint` | Runs ESLint across the client codebase |
| `npm run preview` | Previews the production Vite build locally |

---

## API Reference

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Server health check (`{ status: "ok" }`) |
| `POST` | `/api/auth/register` | Public | Register a student (`name`, `reg_id`, `phone`, `hostel`, `password`) |
| `POST` | `/api/auth/login` | Public | Login via `reg_id` or `phone` + `password` |
| `POST` | `/api/auth/logout` | Public | Clears auth cookie |
| `GET` | `/api/auth/me` | Required | Returns the authenticated student profile |
| `GET` | `/api/rooms` | Public | List/filter rooms (`?hostel=&type=&seater=&block=`), Redis-cached (10 min TTL) |
| `GET` | `/api/rooms/:id` | Optional | Room details (`owner_phone` masked unless authenticated) |
| `POST` | `/api/rooms` | Required | Create a room listing (`hostel_name`, `room_number`, `block`, `room_type`, `seater`, optional `resident_name`, `description`, `photos`) |
| `GET` | `/api/rooms/:id/contact` | Required | Returns owner phone and pre-filled `whatsapp_url` |
| `DELETE` | `/api/rooms/:id` | Required (Owner) | Deletes a room listing and invalidates Redis room cache |
| `POST` | `/api/upload/photos` | Required | Uploads up to 5 images (`multipart/form-data` field `photos`, max 20 MB each) to Cloudinary |

---

## Testing & Verification

1. **Backend Integration Tests**:
   [`server/test-api.js`](server/test-api.js) spins up the Express app on an ephemeral port and tests all 16 endpoint workflows (health check, registration & duplicate conflict check, login via registration ID & phone, invalid password rejection, protected `/me`, room creation, Redis cache hit/miss, query filtering, public phone masking, authenticated contact retrieval, owner-only deletion, and logout), cleaning up the dummy user afterwards:
   ```bash
   cd server
   npm test
   ```

2. **Frontend Type Check & Production Build**:
   ```bash
   cd client
   npm run build
   ```
