# ChatReady

**Get your documents ready for AI.**

ChatReady converts PDFs, Word docs, spreadsheets, presentations, images, and web pages into clean [Markdown](https://www.markdownguide.org/getting-started/) — the format that AI tools like ChatGPT, Claude, and Gemini read most accurately.

Upload a file or paste a link. Copy the result. Paste it into any AI chat.

> Built by [Abhiraman Suresh](https://abhiraman.in) · Powered by [Microsoft MarkItDown](https://github.com/microsoft/markitdown)

---

## What it does

AI tools work best when you give them clean, structured text. PDFs, Word documents, and spreadsheets store a lot of invisible formatting overhead — binary encoding, XML tags, style metadata — that wastes AI context and can cause the AI to misread your content.

ChatReady strips that noise and converts your file into Markdown: plain text with simple formatting symbols that AI tools understand natively.

**No AI ever reads your files.** Conversion is done entirely by Microsoft's open-source `markitdown` library. Files are deleted immediately after conversion.

---

## Supported formats

| Category | Formats |
|---|---|
| Documents | PDF, DOCX, TXT, RTF, MD |
| Slides & Spreadsheets | PPTX, XLSX, CSV |
| Code & Web | HTML, XML, JSON |
| Images (OCR) | PNG, JPG, JPEG, WEBP |
| Links | Any webpage URL, YouTube video |

File size limit: **25 MB** (configurable).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js 16](https://nextjs.org/) · TypeScript · Tailwind CSS |
| Backend | [FastAPI](https://fastapi.tiangolo.com/) · Python 3.13 |
| Conversion | [Microsoft MarkItDown](https://github.com/microsoft/markitdown) |
| Token counting | [tiktoken](https://github.com/openai/tiktoken) (cl100k_base) |
| YouTube | [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) |

---

## Project structure

```
chatready/
├── apps/
│   ├── frontend/          # Next.js app
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React components
│   │   │   └── UploadArea/  # Core upload + conversion UI
│   │   ├── lib/           # API client, env helpers
│   │   ├── styles/        # Global CSS
│   │   └── types/         # Shared TypeScript types
│   └── backend/           # FastAPI app
│       └── app/
│           ├── api/       # Route handlers
│           ├── core/      # Config, errors, rate limiting
│           ├── models/    # Pydantic request/response models
│           ├── services/  # Conversion, validation, token estimation
│           └── utils/     # Filename helpers
└── docs/                  # PRD, specs, coding rules
```

---

## Running locally

### Prerequisites

- Node.js 20+
- Python 3.13
- `pip` and `venv`

### 1. Clone the repo

```bash
git clone https://github.com/your-username/chatready.git
cd chatready
```

### 2. Start the backend

```bash
cd apps/backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`.  
Interactive API docs are available at `http://localhost:8000/docs`.

### 3. Start the frontend

Open a new terminal:

```bash
cd apps/frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

---

## Environment variables

### Frontend (`apps/frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL of the backend API |
| `NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB` | `25` | Max upload size shown in the UI |

### Backend (`apps/backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | Runtime environment name |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |
| `MAX_UPLOAD_SIZE_MB` | `25` | Maximum accepted file size |
| `RATE_LIMIT_REQUESTS` | `60` | Max requests per window per IP |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Rate limit window duration |

---

## Deploying

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com), pointing to `apps/backend` as the root directory.
2. Set the build and start commands:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add your environment variables in the Render dashboard (see table above).
4. The repo includes `apps/backend/.python-version` (`3.13.3`) so Render picks up the correct Python version automatically.

> **Note:** The free Render tier spins down after inactivity. The first request after a period of no traffic takes ~30 seconds to wake the server. Subsequent requests are fast. The frontend detects this and shows a friendly message to users.

### Frontend — Vercel

1. Import the repo into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `apps/frontend`.
3. Add `NEXT_PUBLIC_API_URL` pointing to your deployed Render backend URL.

---

## API reference

### `POST /convert`

Converts an uploaded file to Markdown.

**Request:** `multipart/form-data` with a `file` field.

**Response:**
```json
{
  "success": true,
  "markdown": "# Document title\n\n...",
  "original_tokens": 1200,
  "converted_tokens": 980,
  "reduction_percentage": 18,
  "file_type": "pdf",
  "processing_time_ms": 340
}
```

### `POST /convert-url`

Converts a webpage or YouTube URL to Markdown.

**Request:**
```json
{ "url": "https://example.com/article" }
```

**Response:** Same shape as `/convert`.

### `GET /health`

Returns `{ "status": "ok" }`. Used to check if the server is alive.

---

## How the token savings work

The `original_tokens` count is the number of tokens in the **raw text extracted** from your file — not the binary file size. For a plain text file, this will be similar to the `converted_tokens` count, and that is correct. The value of conversion for plain text is the format, not the size.

For HTML pages, DOCX, and PPTX files, the savings can be significant because markup tags and XML structure add a lot of tokens that carry no meaning for an AI.

Token counts use OpenAI's `cl100k_base` tokenizer (compatible with GPT-4 and Claude). Actual savings vary by model.

---

## Privacy

- **No AI processes your files.** Conversion uses `markitdown`, a deterministic document-parsing library.
- **No storage.** Uploaded files are written to a temporary path and deleted immediately after conversion.
- **No logs.** File contents and Markdown output are never written to application logs.
- **No account required.**

---

## Contributing

Contributions are welcome. Please open an issue before submitting a large pull request so we can discuss the approach first.

1. Fork the repo
2. Create a branch: `git checkout -b my-feature`
3. Make your changes
4. Open a pull request

See [`ChatReady_CODING_RULES.md`](ChatReady_CODING_RULES.md) for code style and conventions used in this project.

---

## License

MIT — see [LICENSE](LICENSE) for details.
