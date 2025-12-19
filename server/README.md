# Spur Take-Home — Backend (Express + TS + Prisma)

## Prerequisites
- Node.js (recommended: latest LTS)
- Postgres DB (Supabase Postgres is fine)
- OpenAI API key

## Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
DATABASE_URL="postgresql://..."
GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.1-8b-instant" # optional
CLIENT_URL="http://localhost:5173"
PORT=4000
NODE_ENV=development
```

## Database (Prisma)
Run migrations (dev):
```bash
npm run db:migrate:dev
```

Generate client (usually automatic, but safe to run):
```bash
npm run prisma:generate
```

## Run
```bash
npm run dev
```

Server will run on `http://localhost:4000`.

## API
- `GET /api/v1/health`
- `GET /api/v1/chat/history?sessionId=<uuid>`
- `POST /api/v1/chat/message` body: `{ "message": "hi", "sessionId": "<uuid?>"}`

## Architecture (quick)
- Routes live under `src/routes/*`
- Controllers in `src/controllers/*`
- LLM wrapper: `src/services/llm.service.ts`
- FAQ knowledge block: `src/services/faq.ts`
- Prisma client: `src/db/prisma.ts`

## LLM notes
- Provider: Groq (OpenAI-compatible API)
- Model: default `llama-3.1-8b-instant` (override via `GROQ_MODEL`)
- Prompt: system instructions + a small FAQ/policy block
- Context: last ~16 messages (capped)
- Timeout: ~20s, with a friendly fallback message on errors
