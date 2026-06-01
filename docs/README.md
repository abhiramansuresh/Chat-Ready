# ChatReady Docs

ChatReady V1 is a file, webpage, and video-to-Markdown conversion tool for
preparing cleaner inputs for AI tools like ChatGPT and Claude.

## Frontend V1 State

The frontend is a single responsive Next.js App Router page in
`apps/frontend`. It includes:

- Sticky minimal navbar.
- Centered hero with trust badges.
- In-place `UploadArea` for file and URL conversion.
- Full-page drag overlay for file drops.
- Loading, success, and error states inside the upload area.
- Token savings summary, Markdown preview, copy, and download actions.
- In-memory session history with individual and combined Markdown downloads.
- How-it-works, privacy, FAQ accordion, credit, and footer sections.
- Dark mode support through Tailwind `dark:` classes.

## Key Specs

- Product requirements: `docs/PRD.md`
- Frontend implementation details: `docs/frontend-spec.md`
- Backend API details: `docs/backend-spec.md`
- Engineering rules: `docs/CODING_RULES.md`
- UX decisions: `docs/ux-decisions.md`
