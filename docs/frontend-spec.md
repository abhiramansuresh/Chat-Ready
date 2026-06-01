# ChatReady --- Frontend Specification

## Stack

-   Next.js
-   TypeScript
-   TailwindCSS
-   Hosted on Vercel

## Design Principles

-   Fast
-   Calm
-   Utility-first
-   Minimal
-   Trustworthy
-   Mobile responsive

## Pages

### Home Page

Sections: 1. Navbar 2. Hero 3. Upload Area 4. How it works 5. Privacy section
6. FAQ 7. Credit 8. Footer

### Hero

Headline: **Make your documents AI-ready**

Subheading: Convert PDFs, Docs, Slides, Sheets, Images, Videos and
webpages into clean Markdown for AI.

CTA: - Drag or upload a file - Paste a URL

Trust Text: - No AI processing - Auto-delete after conversion

## Upload Component

Supported: - Drag & drop - Click upload - Paste URL

Accepted formats: PDF, DOCX, TXT, MD, RTF, PPTX, XLSX, CSV, JSON, XML,
HTML, PNG, JPG, JPEG, WEBP

URL input: - Sits at the bottom of the main upload panel - YouTube -
webpage/article

Max upload: 25MB (configurable)

States: - idle - drag-hover - uploading - processing - success - error

Loading copy: "Preparing your document..."

## Result Page

Desktop: Single result panel

Main area: - Markdown preview - Syntax formatting - Scrollable viewer

Header: - Token savings percentage - Copy Markdown - Download .md

Tooltip: - Original token estimate - Markdown token estimate - Savings
calculation note

Actions: - Copy Markdown - Download .md - Convert another file

## Errors

Unsupported file: "That format is not supported yet."

File too large: "Please upload files smaller than 25MB."

Processing error: "Something went wrong while preparing your document."

YouTube transcript unavailable: "Could not convert this YouTube video. A
public transcript may not be available."

## Accessibility

-   Keyboard navigation
-   High contrast text
-   Responsive layout
-   Accessible buttons

---

## Current V1 Frontend State — June 2026

The frontend is implemented as a single App Router page at
`apps/frontend/app/page.tsx`, assembled through `components/HomePage.tsx`.
The page is a production landing page with the converter as the primary
interaction above the fold on desktop.

### Current Page Sections

1. **Navbar**  
   Sticky minimal header with the ChatReady logo and a "Powered by MarkItDown"
   badge. Header anchors link to Convert, How it works, Privacy, FAQ, and
   Credit.

2. **Hero**  
   Centered H1, subheadline, and two trust badges: "No AI processing" and
   "Auto-delete after conversion".

3. **UploadArea**  
   Main conversion surface. Supports file upload, URL conversion, page-level
   drag overlay, loading, error, and in-place result states.

4. **How it works**  
   Three-step explainer: Upload, Convert, Use with AI.

5. **Privacy and trust**  
   Four trust points covering no AI processing, no file storage, deletion after
   conversion, and no content logging.

6. **FAQ accordion**  
   Five accessible accordion items, closed by default.

7. **Credit**  
   Credits Abhiraman Suresh and links to `https://abhiraman.in`.

8. **Footer**  
   Minimal footer with copyright and placeholder Privacy / Terms links.

### Component Tree

```txt
HomePage
├─ Navbar
├─ HeroSection
├─ UploadArea
│  ├─ FileDropZone
│  ├─ UrlInput
│  ├─ LoadingState
│  ├─ ErrorState
│  ├─ ResultsPanel
│  └─ SessionHistory
├─ HowItWorks
├─ PrivacySection
├─ FaqAccordion
├─ CreditSection
└─ Footer
```

### UploadArea State Machine

```txt
idle
├─ file selected → idle with selected file preview
├─ valid URL submitted → loading
├─ Convert clicked for selected file → loading
├─ invalid URL → idle with inline URL error
└─ invalid file / too large → error

loading
├─ conversion succeeds → success
└─ conversion fails → error

success
└─ Convert another file → idle

error
└─ Try again → idle
```

### File Upload Behaviour

- Dragging a file anywhere over the page shows a full-page "Drop to convert"
  overlay with a transparent center area and dashed border.
- Dropping or browsing selects the file but does not auto-submit.
- Selected file state shows name, type, size, clear action, and a Convert CTA.
- Upload zone supports keyboard activation with Enter or Space.
- Max upload size is read from `NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB`.
- Supported format chips are compact and live under the main dropzone.

### URL Behaviour

- URL input is always visible at the bottom of the upload panel.
- URL input uses a controlled input and React event handlers only.
- No HTML `<form>` element is used.
- Client-side validation requires an `http:` or `https:` URL.
- Invalid URLs show inline errors without leaving the idle state.

### Results Behaviour

- Results render in place inside `UploadArea`; the page does not navigate or
  scroll away.
- Top row shows either `~{X}% fewer tokens` or `Markdown ready` when reduction
  is zero or negative.
- Original and converted token estimates appear only in the savings tooltip.
- Markdown preview is a scrollable monospace code block.
- Copy Markdown and Download `.md` sit in the Markdown preview header.
- Convert another file sits below the preview.
- Download filename is derived from the source filename or URL slug.

### Session History

- Successful conversions are stored in browser memory for the current page
  session only.
- The history list appears under the upload area after the first successful
  conversion.
- Users can download individual previous conversions.
- Users can download all session conversions as one combined Markdown file.
- History does not persist across refreshes and does not use a database.

### API Integration

All API calls go through `apps/frontend/lib/api.ts`.

Environment variable:

- `NEXT_PUBLIC_API_URL`: FastAPI backend base URL.
- `NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB`: client-side upload limit display and check.

Endpoints:

- `POST {NEXT_PUBLIC_API_URL}/convert` with multipart `file`.
- `POST {NEXT_PUBLIC_API_URL}/convert-url` with JSON `{ "url": "https://..." }`.

The frontend supports the current backend response shape:

```json
{
  "success": true,
  "markdown": "# Example",
  "rawTokenCount": 8000,
  "markdownTokenCount": 4500,
  "reductionPercent": 43,
  "fileType": "pdf",
  "processingTimeMs": 800
}
```

It also accepts the newer snake_case shape described in product briefs:

```json
{
  "markdown": "# Example",
  "original_tokens": 8000,
  "converted_tokens": 4500,
  "reduction_percentage": 43
}
```

### Error Handling

HTTP errors map to friendly UI messages:

- 400: check file or URL.
- 413: file too large.
- 415: unsupported file type.
- 429: converting too quickly.
- 500 or unknown: conversion failed.
- network failure: conversion service could not be reached.

Raw backend errors are not shown to users.

### Styling and Accessibility

- TailwindCSS utility classes only.
- Mobile-first responsive layout.
- Dark mode support through Tailwind `dark:` classes.
- Sticky navbar remains visible on scroll.
- FAQ uses `aria-expanded`.
- Error messages use `role="alert"`.
- Buttons and upload controls are keyboard accessible.

### Dependencies

No new UI dependencies were added for the redesign. Existing frontend runtime
dependencies are Next.js, React, React DOM, and Vercel Analytics.
