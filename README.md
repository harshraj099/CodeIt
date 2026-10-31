# LLDPad

A low-level-design practice pad: browse design problems, write and run code in the browser,
verify solutions against test cases, and discuss approaches.

```
backend/    Spring Boot 3 (Java 21) REST API — auth, code storage, execution, discussions
frontend/   React 19 + Vite + Tailwind single-page app
```

## Prerequisites

- Java 21 and Maven 3.9+
- Node.js 20.19+ and npm
- MongoDB 4.4+ running as a replica set (any MongoDB Atlas cluster works; a standalone `mongod`
  does not, because voting uses multi-document transactions)

## Running locally

**Backend** (http://localhost:8080):

```bash
cd backend
cat > .env <<'ENV'
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
JWT_SECRET=change-me-to-a-long-random-string-of-32-plus-bytes
ENV
mvn spring-boot:run
```

`backend/.env` is read on startup and ignored by git, so it is the place for secrets.
Plain environment variables work too and take precedence.

**Frontend** (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to the backend, so the `auth-token` cookie stays same-origin.
Set `VITE_API_PROXY_TARGET` to point the proxy somewhere other than `http://localhost:8080`.

## Deploying (Render + Vercel)

The backend is a long-running Java server, so it goes on Render (Docker); the frontend is static and goes on Vercel.

1. **MongoDB Atlas**: under Network Access allow `0.0.0.0/0` (Render's free tier has no fixed IP).
2. **Backend on Render**: New > Blueprint, pick this repository; it reads `render.yaml`. Fill in
   `MONGODB_URI`, and `CORS_ALLOWED_ORIGINS` with your Vercel URL (e.g. `https://lldpad.vercel.app`).
   `JWT_SECRET` is generated for you. Note the service URL Render assigns.
3. **Frontend on Vercel**: import the repository with root directory `frontend` (framework: Vite).
   If Render's URL is not `https://lldpad-backend.onrender.com`, update it in `frontend/vercel.json`.

Vercel forwards `/api/*` to the backend, so the browser only ever talks to the Vercel domain and the
login cookie works without cross-site settings. Render's free tier sleeps when idle, so the first
request after a while can take up to a minute.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DATABASE` | `lldpad` | Database name; collections and unique indexes are created on startup |
| `JWT_SECRET` | dev placeholder | HS256 signing key, at least 32 bytes |
| `APP_ENV` | `development` | `production` enables secure cookies and hides OTPs in responses |
| `SMTP_HOST` / `SMTP_PORT` | `smtp.gmail.com` / `587` | Mail server for signup OTPs |
| `SMTP_USER` / `SMTP_PASS` | empty | When unset, OTPs are logged to the console instead of emailed |
| `PISTON_API_URL` | `https://emkc.org/api/v2/piston/execute` | Code execution backend |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Only needed when the frontend calls the API cross-origin |
| `PORT` | `8080` | Backend HTTP port |

## Data

Collections: `users`, `problems`, `user_codes`, `discussions`, `comments`, `votes`, `solved_problems`.
Unique indexes enforce one account per email and username, one saved solution and one solved
record per user and problem, and one vote per user per discussion or comment.

The Next.js version stored data in PostgreSQL through Prisma; that data is not migrated.
Password hashes are bcrypt in both versions, and login cookies are signed the same way, so a
migration script could carry accounts over unchanged.

## API

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/signup` | `step: "request-otp"` then `step: "verify-otp"` |
| POST | `/api/auth/login` · `/api/auth/logout` | Sets / clears the `auth-token` cookie |
| GET | `/api/auth/me` | Current user |
| GET | `/api/problems` · `/api/problems/{slug}` | Problem catalog (`backend/src/main/resources/problems.json`) |
| GET/POST | `/api/problems/{slug}/solved` | Solved status |
| GET | `/api/code/load?problemId=` · POST `/api/code/save` | Saved code per user and problem |
| POST | `/api/run` · `/api/verify` | Run with custom input (Run) / check against test cases (Submit) |
| GET/POST | `/api/discussions` · `/api/comments` | Discussions and threaded comments |
| POST | `/api/votes` | Up/down vote; repeating a vote removes it |
