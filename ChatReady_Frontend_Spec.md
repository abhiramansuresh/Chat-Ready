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

Sections: 1. Hero 2. Upload Area 3. Supported formats 4. Privacy section
5. FAQ

### Hero

Headline: **Make your documents AI-ready**

Subheading: Convert PDFs, Docs, Slides, Sheets, Images, Videos and
webpages into clean Markdown for AI.

CTA: - Upload File - Paste URL

Trust Text: - No AI processing - Auto-delete after conversion

## Upload Component

Supported: - Drag & drop - Click upload

Accepted formats: PDF, DOCX, TXT, MD, RTF, PPTX, XLSX, CSV, JSON, XML,
HTML, PNG, JPG, JPEG, WEBP

URL input: - YouTube - webpage/article

Max upload: 25MB (configurable)

States: - idle - drag-hover - uploading - processing - success - error

Loading copy: "Preparing your document..."

## Result Page

Desktop: 2-column layout

Left: - Markdown preview - Syntax formatting - Scrollable viewer

Right: Stats card

Stats: - Estimated tokens - Raw token count - Markdown token count -
Reduction % - File type - Processing time

Actions: - Copy Markdown - Download .md - Convert another file

## Errors

Unsupported file: "That format is not supported yet."

File too large: "Please upload files smaller than 25MB."

Processing error: "Something went wrong while preparing your document."

## Accessibility

-   Keyboard navigation
-   High contrast text
-   Responsive layout
-   Accessible buttons
