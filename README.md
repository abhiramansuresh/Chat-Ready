# ChatReady

ChatReady converts files, webpages, and videos into clean AI-ready Markdown for LLMs.

Primary promise: **Better AI inputs. Fewer tokens.**

## Project Structure

```text
apps/
  frontend/  Next.js, TypeScript, TailwindCSS
  backend/   FastAPI, Python
docs/
  PRD.md
  frontend-spec.md
  backend-spec.md
  CODING_RULES.md
```

## Local Development

### Frontend

```bash
cd apps/frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Backend

```bash
cd apps/backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`.

## Deployment

### Backend on Render

Use `apps/backend` as the Render root directory. The backend includes
`apps/backend/.python-version` so Render installs Python `3.13.3`, which is
compatible with the pinned MarkItDown dependencies.

Render settings:

- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Environment Variables

Frontend:

- `NEXT_PUBLIC_API_URL`: FastAPI base URL. Defaults to `http://localhost:8000`.

Backend:

- `ENVIRONMENT`: Runtime environment name.
- `ALLOWED_ORIGINS`: Comma-separated CORS origins. Defaults to `http://localhost:3000`.
- `MAX_UPLOAD_SIZE_MB`: Upload size limit. Defaults to `25`.

## V1 Scope

No auth, database, payments, analytics SDKs, AI chat, or summarization.
