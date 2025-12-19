# Spur Take-Home — Frontend (React + Vite)

## Setup
```bash
cd client
npm install
```

## Run
```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Notes
- The frontend stores `sessionId` in `localStorage` so reload keeps the conversation.
- Vite is configured to proxy `/api/*` to `http://localhost:4000`, so you don’t need to set CORS manually in the browser.
- **API base URL**
  - **Local dev**: keep `VITE_API_BASE_URL` unset (uses Vite proxy)
  - **Production**: set `VITE_API_BASE_URL="https://your-backend-domain.com"`
- **Production (Render) cold starts**
  - If the backend is deployed on Render, the first request after inactivity can take **2–3 minutes** to wake up.
  - If chat requests look “stuck” or time out, **wait 2–3 minutes**, refresh the page, then try again.
