# ChatReady --- CODING_RULES.md

## Purpose

This document defines engineering rules for ChatReady.

Goal: - predictable code - maintainable architecture - AI-friendly code
generation - minimal technical debt - fast shipping

Guiding principle:

**Do not overengineer.**

Build for V1 only.

------------------------------------------------------------------------

# Engineering Philosophy

Optimize for: - clarity - simplicity - readability - maintainability -
shipping speed

Avoid: - premature abstraction - enterprise architecture - unnecessary
libraries - clever code

Rule:

Prefer boring code over smart code.

------------------------------------------------------------------------

# Repository Structure

/apps /frontend /backend

/docs PRD.md frontend-spec.md backend-spec.md CODING_RULES.md

------------------------------------------------------------------------

# Frontend Rules

Stack: - Next.js - TypeScript - TailwindCSS

Use: - functional components only - strict TypeScript - reusable UI
components

Do not use: - Redux - MobX - global state libraries

Use local component state whenever possible.

Use Context API only if absolutely necessary.

------------------------------------------------------------------------

# Frontend Folder Structure

/frontend

/app /components /lib /types /hooks /styles

Example:

/components UploadDropzone.tsx MarkdownPreview.tsx StatsCard.tsx
Header.tsx Footer.tsx

------------------------------------------------------------------------

# Component Rules

Keep components: - small - focused - reusable

One responsibility per component.

Bad: Mega component handling upload + loading + preview + stats.

Good: Separate components.

Example:

UploadDropzone ProcessingLoader MarkdownPreview StatsPanel

------------------------------------------------------------------------

# TypeScript Rules

Always use explicit types.

Avoid: any

Prefer: interfaces or typed objects

Bad:

const data: any

Good:

interface ConversionResponse { success: boolean markdown: string
rawTokenCount: number markdownTokenCount: number reductionPercent:
number fileType: string processingTimeMs: number }

------------------------------------------------------------------------

# Styling Rules

Use: Tailwind utility classes

Avoid: large CSS files

Keep styling: minimal clean utility-first

Visual language: - calm - lightweight - modern - trustworthy

Avoid: - flashy animations - gradients everywhere - heavy
glassmorphism - visual clutter

Spacing: consistent

Responsive: mobile-first

------------------------------------------------------------------------

# API Rules

Never hardcode URLs.

Use environment variables.

Example:

NEXT_PUBLIC_API_URL

All API calls should go through:

/lib/api.ts

Do not call fetch directly inside components.

Bad:

fetch(...)

Good:

convertFile()

------------------------------------------------------------------------

# Error Handling

Always show friendly messages.

Never expose raw backend errors.

Bad:

500 internal server error

Good:

"Something went wrong while preparing your document."

All API failures must be gracefully handled.

------------------------------------------------------------------------

# Loading States

Every async action must include:

-   loading
-   success
-   error

Example upload flow:

idle uploading processing success error

Never leave user without feedback.

------------------------------------------------------------------------

# Accessibility

All buttons: - keyboard accessible - proper aria labels

Inputs: - accessible labels

Color contrast: AA minimum

------------------------------------------------------------------------

# Backend Rules

Stack: - FastAPI - Python - MarkItDown

Single service architecture only.

No microservices.

No queue systems.

No database.

No auth.

------------------------------------------------------------------------

# Backend Folder Structure

/backend

/api /services /models /utils

Example:

/services converter.py token_estimator.py url_processor.py

------------------------------------------------------------------------

# Backend Design Rules

Business logic goes into services.

Routes should stay thin.

Bad:

Route contains conversion logic.

Good:

Route calls service.

Example:

route -\> service -\> response

------------------------------------------------------------------------

# File Handling Rules

Always: - validate MIME type - sanitize filename - use temporary
storage - auto-delete after processing

Never persist user files.

Never cache uploads.

------------------------------------------------------------------------

# Logging Rules

Allowed logs: - file type - duration - success/failure

Never log: - document contents - markdown output - user text

Privacy first.

------------------------------------------------------------------------

# Security Rules

Must implement: - rate limiting - upload size limits - MIME validation

Reject unsupported formats.

Fail safely.

------------------------------------------------------------------------

# Naming Rules

Use descriptive names.

Bad: x data2 tmp123

Good: markdownContent processingDuration tokenReduction

Component names: PascalCase

Functions: camelCase

Constants: UPPER_SNAKE_CASE

------------------------------------------------------------------------

# Code Quality Rules

Keep files under \~300 lines when possible.

Extract reusable logic.

Avoid deep nesting.

Prefer early returns.

Bad:

if a: if b: if c:

Good:

if not a: return

if not b: return

------------------------------------------------------------------------

# Dependency Rules

Do not add libraries without clear need.

Before installing package:

Ask: Can native JS/Python do this?

Keep dependencies minimal.

------------------------------------------------------------------------

# Git Rules

Commit frequently.

Use descriptive commits.

Examples:

feat: add markdown preview fix: handle invalid pdf uploads refactor:
move token estimation to service

------------------------------------------------------------------------

# V1 Constraints

Build only what exists in spec.

Do not add: - auth - payments - analytics SDKs - dashboards - document
history - AI summarization - notifications - user profiles

Ship first.

Then iterate.
