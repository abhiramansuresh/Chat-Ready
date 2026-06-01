# ChatReady --- Product Requirements Document (PRD)

## Vision

ChatReady converts files, webpages, videos and structured data into
clean, AI-ready Markdown for LLMs.

Core promise:

**Better AI inputs. Fewer tokens. Cleaner structure.**

ChatReady is not an AI assistant. It prepares content for AI.

## Hero Statement

**Make your documents AI-ready**

Subheading: Convert PDFs, Docs, Slides, Sheets, Images, Videos and
webpages into clean Markdown for ChatGPT, Claude, Gemini and local LLMs.

## Core Value Proposition

Users upload files or paste URLs and receive: - Clean Markdown - Better
formatting preservation - Lower token usage - Easier copy/paste into
LLMs - Downloadable `.md` files - Token reduction insights

## Target Users

### Primary

-   ChatGPT power users
-   Claude users
-   Researchers
-   Students
-   Office workers
-   Local LLM users

### Jobs to be done

-   "Help ChatGPT understand this better."
-   "Make this PDF usable in Claude."
-   "Reduce token waste."
-   "Turn this messy thing into structured context."

## Supported Formats (V1)

### Documents

-   PDF
-   DOCX
-   TXT
-   MD
-   RTF

### Slides

-   PPTX

### Spreadsheets

-   XLSX
-   CSV

### Structured Data

-   JSON
-   XML
-   HTML

### Images (OCR)

-   PNG
-   JPG
-   JPEG
-   WEBP

### URLs

-   YouTube URLs
-   Webpages / articles

## UX Flow

1.  User lands on homepage
2.  Uploads file or pastes URL
3.  Processing begins
4.  Result screen loads
5.  User sees:
    -   Markdown preview
    -   Token stats
    -   Reduction %
    -   Copy button
    -   Download markdown button
6.  Temporary file deleted after processing

## Trust & Privacy

-   No AI processing
-   No file storage
-   Files auto-delete after conversion
-   File contents never logged

## Success Metrics

Primary: - Successful conversions

Secondary: - Copy button usage - Markdown downloads - Repeat visits

## V1 Non-goals

-   Authentication
-   Accounts
-   AI chat
-   Summarization
-   Payments
-   Document history
-   Collaboration

## Current Frontend UX Update — June 2026

The V1 frontend is now a single responsive landing page. The converter is the
primary above-the-fold action and results render in place after conversion. The
upload area supports file tabs, URL tabs, selected-file confirmation before
conversion, full-page drag overlay, loading state, friendly error state, and a
Markdown result panel with token savings, preview, copy, and download actions.
The page also keeps a temporary in-browser session history so users can
download previous conversions individually or export the current session as one
combined Markdown file. This is not persistent document history and does not
use accounts or storage.
