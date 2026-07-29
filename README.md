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
| Office & web formats | [Microsoft MarkItDown](https://github.com/microsoft/markitdown) |
| PDF text | Poppler (`pdftotext`) |
| OCR (images, scanned PDFs) | Tesseract, via Poppler page rendering |
| RTF | [striprtf](https://github.com/joshy/striprtf) |
| Token counting | [tiktoken](https://github.com/openai/tiktoken) (cl100k_base) |
| YouTube | [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) |

MarkItDown handles the formats it is genuinely best at — DOCX, PPTX, XLSX, HTML. PDFs and images route around it to Poppler and Tesseract, which are faster and hold far less memory than the `pdfminer`/`pdfplumber` path on a small instance.

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
- Tesseract OCR (images and scanned PDFs): `brew install tesseract` on macOS, `apt-get install tesseract-ocr` on Linux
- Poppler (PDF text extraction — provides `pdftotext`, `pdfinfo`, `pdftoppm`): `brew install poppler` on macOS, `apt-get install poppler-utils` on Linux

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
| `OCR_LANGUAGES` | `eng+fra+deu+spa+ita+por+nld` | Tesseract languages, joined with `+`. Missing packs are dropped with a warning instead of failing the conversion. The Docker image also ships `chi_sim`, `jpn`, `ara`, `hin`, `rus` |
| `LOG_ERROR_DETAIL` | `false` | Log the underlying library error message on failure, not just the exception type. Useful for QA; leave off in production |

---

## Deploying

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com), pointing to `apps/backend` as the root directory.
2. Choose **Docker** as the runtime. `apps/backend/Dockerfile` installs `tesseract-ocr` and `poppler-utils`, which the PDF and image pipelines shell out to — a plain Python runtime will not have them.
3. Add your environment variables in the Render dashboard (see table above). Set `ALLOWED_ORIGINS` to your deployed frontend URL.

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
  "rawTokenCount": 1200,
  "markdownTokenCount": 980,
  "reductionPercent": 18,
  "fileType": "pdf",
  "processingTimeMs": 340
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

`rawTokenCount` is the honest "before" for the format:

| Source | Baseline used |
|---|---|
| HTML, XML, RTF, web pages | The raw source text — what you'd otherwise paste in |
| PDF, images | The extracted text before cleanup |
| DOCX, PPTX, XLSX | Extracted text (a zip archive has no meaningful token count — the UI shows a file-size comparison instead) |
| TXT, MD, CSV, JSON | Same as the output, and reported as ~0% |

A plain text file legitimately shows no reduction. The value there is the format, not the size.

Savings come from two places:

1. **Markup removal** — HTML and RTF carry tags, styles, and control codes that mean nothing to a model. This is usually the biggest win.
2. **Page-furniture cleanup** — for PDFs, running headers, footers, page numbers, and the column padding left by layout-preserving extraction are stripped. This shrinks the output *and* removes text that interrupts a model mid-sentence at every page break.
3. **Table reconstruction** — space-aligned PDF tables are rebuilt as Markdown pipe tables, so a model reads the column a value belongs to instead of inferring it from character positions. Blocks that turn out to be side-by-side prose (two-column layouts) are deliberately left alone rather than given a false row structure.

Scanned pages and PDFs whose embedded text layer is damaged — letter-spaced output, replacement characters, symbol soup — fall back to OCR automatically, since rendering the page bypasses the broken text layer entirely.

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
4. Run the backend self-checks: `cd apps/backend && python test_conversion.py`
5. Open a pull request

See [`ChatReady_CODING_RULES.md`](ChatReady_CODING_RULES.md) for code style and conventions used in this project.

---

## License

MIT — see [LICENSE](LICENSE) for details.
