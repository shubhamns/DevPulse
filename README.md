# DevPulse AI

AI-powered production error monitoring and debugging for developers.

DevPulse is an AI-first incident-resolution platform. Teams install a lightweight JavaScript/TypeScript SDK, capture production errors, group duplicates with deterministic fingerprinting, and get root-cause analysis plus suggested fixes. GitHub issues can be created from DevPulse. This is not a Sentry clone.

<img width="1470" height="747" alt="image" src="https://github.com/user-attachments/assets/a6ac79f0-59d6-494c-9634-d88bba65c7de" />
<img width="1466" height="740" alt="image" src="https://github.com/user-attachments/assets/9b9ffd11-5d89-4ce5-a2de-9d7a802a2668" />
<img width="1146" height="146" alt="image" src="https://github.com/user-attachments/assets/3e0da0fa-865b-4381-a7fc-67cdb2bfa677" />




## Repository layout

Each package owns its own `node_modules` and `package-lock.json`. There is no npm workspace hoist.

```
DevPulse/
├── frontend/     React + Vite + TypeScript dashboard
├── backend/      Node.js + Express + TypeScript API
└── sdk/          @devpulse/sdk JavaScript/TypeScript client
```

| Package | Purpose | Dev URL |
| --- | --- | --- |
| `frontend` | Dashboard UI | http://localhost:5173 |
| `backend` | REST API | http://localhost:4000 |
| `sdk` | Browser/Node error capture SDK | published later as `@devpulse/sdk` |

## Prerequisites

- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Install

Install dependencies in each package separately:

```bash
npm --prefix frontend install
npm --prefix backend install
npm --prefix sdk install
```

Or from the repo root:

```bash
npm run install:all
```

Do not run a single root `npm install` expecting shared dependencies. Root `package.json` only provides convenience scripts.

## Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Required backend values for local development:

```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/devpulse
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:4000/api/v1/github/callback
```

`OPENAI_API_KEY` and `OPENAI_MODEL` enable AI root-cause analysis on new issues. `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL` enable GitHub OAuth. The frontend uses the Vite proxy to `/api`, so `VITE_API_URL` is optional during local development.

## Run locally

Start the API:

```bash
npm run dev:backend
```

Start the dashboard:

```bash
npm run dev:frontend
```

Health check:

```bash
curl http://localhost:4000/api/v1/health
```

Expected response when MongoDB is reachable:

```json
{
  "service": "devpulse-api",
  "status": "ok",
  "database": "connected"
}
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run install:all` | Install frontend, backend, and SDK independently |
| `npm run dev:frontend` | Vite dev server |
| `npm run dev:backend` | Express API with reload |
| `npm run typecheck` | TypeScript checks in all packages |
| `npm run lint` | ESLint in all packages |
| `npm run test` | Package tests |
| `npm run build` | Production builds |

You can also run the same scripts inside a package:

```bash
cd backend && npm run dev
cd frontend && npm run lint
cd sdk && npm test
```

## Current milestone

**M10 — Production hardening** is complete:

- Helmet, trust proxy, structured request logging, auth + ingestion rate limits
- Production environment guards for JWT and MongoDB URI
- Graceful shutdown and Docker support
- GitHub Actions CI and deployment configs for Vercel + Render + MongoDB Atlas

**M9 — GitHub integration** is complete:

- GitHub OAuth connect flow per organization (`GET /api/v1/github/connect`, `GET /api/v1/github/callback`)
- Encrypted storage of GitHub access tokens on the backend
- Repository selection for issue creation (`GET /api/v1/github/repositories`, `PUT /api/v1/github/repository`)
- `POST /api/v1/issues/:id/github-issue` creates a GitHub issue with error details, occurrences, AI analysis, and DevPulse link
- Integrations page for connect + repository setup
- Issue detail action: **Create GitHub Issue** (with link after creation)

**M8 — OpenAI integration** is complete:

- AI analysis stored per issue (`AiAnalysis` model)
- OpenAI chat completions with JSON-mode response validation (Zod)
- Auto-analyze **new** exception issues in the background (not on every duplicate)
- `POST /api/v1/issues/:id/analyze` for manual re-analysis
- Issue detail page shows summary, root cause, explanation, suggested fix, confidence, and test suggestions
- Recommendations are presented as guidance, not guaranteed truth

**M7 — Dashboard & issues UI** is complete:

- Dashboard with stat cards: total/critical issues, errors today, error rate, affected users, new issues
- Recharts visualizations: errors over time, severity mix, top fingerprints, errors by project/environment
- Issues table with search, project, severity, environment, status, and date filters
- Issue detail page: stack trace, context, breadcrumbs, timeline, resolve/ignore actions
- Analytics page for extended chart views
- TanStack Query for data fetching
- `GET /api/v1/analytics/overview` and `GET /api/v1/issues/:id/events`

**M6 — Fingerprinting & issue lifecycle** is complete.

**M5 — Error ingestion API** is complete.

Earlier milestones M1–M4 are also complete.

Later milestones (not implemented yet): none — core MVP milestones are complete.

## Production hardening (M10)

- **Helmet** secure HTTP headers on the API
- **Trust proxy** enabled in production (Render/Vercel-compatible)
- **Request logging** with `X-Request-Id` correlation
- **Auth rate limiting** on register/login/refresh (30 requests / 15 min per IP)
- **Event rate limiting** on ingestion (120 events / min per API key)
- **Production env validation** — strong `JWT_SECRET`, managed MongoDB URI required
- **Graceful shutdown** on `SIGTERM` / `SIGINT`
- **Docker** — `backend/Dockerfile` + root `docker-compose.yml`
- **CI** — GitHub Actions runs typecheck, lint, test, and build for all packages
- **Deploy targets** — Vercel (frontend), Render (backend), MongoDB Atlas (database)

### Docker (local)

```bash
docker compose up --build
```

API: http://localhost:4000/api/v1/health

### Deploy

**Backend (Render)**

1. Connect the repo and use `render.yaml`, or create a Web Service with root directory `backend`
2. Set `MONGODB_URI`, `FRONTEND_URL`, `CORS_ORIGIN`, and integration secrets
3. Set `GITHUB_CALLBACK_URL` to `https://<your-api-host>/api/v1/github/callback`

**Frontend (Vercel)**

1. Import the repo with root directory `frontend`
2. Set `VITE_API_URL=https://<your-api-host>`
3. `vercel.json` handles SPA routing

**Database (MongoDB Atlas)**

1. Create a free/paid cluster
2. Allow network access from Render (or `0.0.0.0/0` for early setup)
3. Copy the connection string into `MONGODB_URI`

## GitHub integration (M9)

1. Create a GitHub OAuth App with callback URL `http://localhost:4000/api/v1/github/callback`
2. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `backend/.env`
3. In the dashboard, open **Integrations**, connect GitHub, and select a target repository
4. On an issue detail page, click **Create GitHub Issue**

```bash
# Start OAuth (returns authorize URL)
curl "http://localhost:4000/api/v1/github/connect?organizationId=<orgId>" \
  -H "Authorization: Bearer <token>"

# Create GitHub issue from DevPulse issue
curl -X POST http://localhost:4000/api/v1/issues/<issueId>/github-issue \
  -H "Authorization: Bearer <token>"
```

## AI analysis (M8)

New exception issues are analyzed once in the background when `OPENAI_API_KEY` is set. You can also trigger or re-run analysis manually:

```bash
# Get issue with existing analysis
curl http://localhost:4000/api/v1/issues/<issueId> \
  -H "Authorization: Bearer <token>"

# Run or re-run AI analysis
curl -X POST http://localhost:4000/api/v1/issues/<issueId>/analyze \
  -H "Authorization: Bearer <token>"
```

## Issues API (M6)

```bash
# List issues
curl http://localhost:4000/api/v1/issues \
  -H "Authorization: Bearer <token>"

# Resolve an issue
curl -X POST http://localhost:4000/api/v1/issues/<issueId>/resolve \
  -H "Authorization: Bearer <token>"
```

## Event ingestion (M5)

```bash
curl -X POST http://localhost:4000/api/v1/events \
  -H "Authorization: Bearer dp_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "timestamp": "2026-08-17T12:00:00.000Z",
    "environment": "production",
    "release": "1.0.0",
    "message": "DevPulse test event",
    "level": "info",
    "sdk": { "name": "@devpulse/sdk", "version": "0.1.0" }
  }'
```

Success response:

```json
{ "accepted": true, "eventId": "..." }
```

## SDK usage (M4)

```typescript
import { DevPulse } from "@devpulse/sdk";

DevPulse.init({
  apiKey: "dp_live_xxxxx",
  environment: "production",
  release: "1.0.0",
});

DevPulse.setUser({ id: "user-123" });
DevPulse.setContext({ feature: "checkout", orderId: "123" });

DevPulse.captureException(new Error("Payment failed"));
DevPulse.captureMessage("Checkout started", "info");
```

Build the SDK package:

```bash
cd sdk && npm run build
```

## API keys (M3)

```bash
# List keys for a project
curl http://localhost:4000/api/v1/projects/<projectId>/api-keys \
  -H "Authorization: Bearer <token>"

# Generate key (full key returned once)
curl -X POST http://localhost:4000/api/v1/projects/<projectId>/api-keys \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"label":"Production"}'

# Revoke key
curl -X DELETE http://localhost:4000/api/v1/api-keys/<apiKeyId> \
  -H "Authorization: Bearer <token>"
```

## Auth API (M2)

```bash
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123","name":"Your Name"}'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123"}'

# Current user (Bearer token required)
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

## Tech stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Zod  
**SDK:** TypeScript, framework-agnostic npm package

## License

Private. All rights reserved.
