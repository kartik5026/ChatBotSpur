# Spur Take-Home — AI Live Chat Agent (Groq + Postgres)

Mini web app that simulates a customer support chat where an AI agent answers questions using a real LLM (Groq) and persists conversations to Postgres via Prisma.

## Tech stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + TypeScript + Express
- **DB**: PostgreSQL (Supabase compatible) via Prisma
- **LLM**: Groq (`groq-sdk`)

## Repo structure
- `client/` — React UI
- `server/` — Express API (MVC-ish)

## Local setup
### Prereqs
- Node.js (LTS recommended)
- A Postgres database (Supabase or local Postgres)
- A Groq API key

### 1) Backend
```bash
cd server
npm install
```

Create `server/.env` (do **not** commit secrets):
```env
NODE_ENV=development
PORT=4000
HOST=localhost
LOG_LEVEL=info

CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require

GROQ_API_KEY=gsk_...
# optional
GROQ_MODEL=llama-3.1-8b-instant
```

Run migrations:
```bash
npm run db:migrate:dev
```

Start backend:
```bash
npm run dev
```

Backend runs at `http://localhost:4000`.

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Production configuration
### Frontend → Backend URL
- Local dev uses Vite proxy (`/api/*` → `http://localhost:4000`)
- In production set:
  - `VITE_API_BASE_URL="https://your-backend-domain.com"`

### Render cold start note
If the backend is hosted on Render, the first request after inactivity can take **2–3 minutes** to wake up. If requests look stuck or time out, wait a bit, refresh, and try again.

## API
Base path: `/api/v1`
- `POST /chat/message` body: `{ "message": string, "sessionId"?: string }`
  - response: `{ "reply": string, "sessionId": string }`
- `GET /chat/history?sessionId=<uuid>`
  - response: `{ "sessionId": string, "messages": [{ id, sender, text, createdAt }] }`

## Data model
- `conversations`:
  - `id` (uuid)
  - `created_at`
- `messages`:
  - `id` (uuid)
  - `conversation_id` (fk)
  - `sender` (`user` | `ai`)
  - `text`
  - `created_at`

## Architecture overview (backend)
- **Routes**: `server/src/routes/*`
- **Controllers** (HTTP): `server/src/controllers/*`
- **Services** (business logic): `server/src/services/*`
- **Models** (DB access): `server/src/models/*`

Key files:
- LLM integration: `server/src/services/llm.service.ts`
- FAQ/policies: `server/src/services/faq.ts`
- Chat orchestration: `server/src/services/chat.service.ts`
- Prisma client: `server/src/models/prisma.model.ts`

## LLM notes
- **Provider**: Groq
- **Model**: defaults to `llama-3.1-8b-instant` (override via `GROQ_MODEL`)
- **Prompting**: system prompt + small store FAQ/policies block
- **Context**: last ~16 messages (bounded for cost)

## Trade-offs / If I had more time
- Streaming responses (SSE) for smoother UX
- Better retry/backoff + request ids for observability
- Conversation summarization for long histories
- Unit/integration tests for services + controllers
- Rate limiting per session/IP tuned for production
