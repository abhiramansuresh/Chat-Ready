# ChatReady UX Decisions

## Current V1 Direction

ChatReady is a utility-first conversion page. The core experience is designed
around one action: give ChatReady a file or URL and receive Markdown that is
ready to paste into an AI tool.

## Key Decisions

### Converter Above the Fold

The upload area sits directly below the hero copy so users can act immediately
without scrolling on desktop. This supports the product promise of fast,
zero-friction preparation.

### In-Place Results

Conversion results replace the upload area instead of navigating to a separate
result section. This keeps context stable and avoids making users hunt for the
output after conversion.

### File Selection Before Conversion

Dragging or browsing selects a file first, then the user clicks Convert. This
prevents accidental uploads while still keeping the flow short.

### Unified File and URL Panel

The URL input now sits at the bottom of the drag-and-drop panel instead of
behind a separate tab. This keeps both conversion paths ready without causing
layout jumps when users switch modes.

### Full-Page Drag Overlay

Dragging a file anywhere over the page shows a large "Drop to convert" overlay.
This makes the entire page feel ready to receive files, not just a small target.
The center target keeps only the dashed outline so the overlay feels lighter and
does not become a second heavy card.

### Compact Format Chips

Supported file-type chips remain close to the upload action, but they are small
and secondary. The separate supported-format section was removed to keep the
page focused on converting.

### Session History

Converted files stay visible in a session history under the converter. Users can
download a single past conversion or export the whole session as one Markdown
bundle. This borrows the useful batch-download idea from converter tools while
staying within V1 constraints: no account, no database, no persistent storage.

### Header Anchors

The sticky header now includes section anchors. This gives the longer landing
page quick movement without adding a complex navigation system.

### Token Savings Language

The primary result metric is `~{X}% fewer tokens`. Raw token details are still
available in the tooltip, but the first read is plain language that
non-technical users can understand. Copy and download actions live in the
Markdown preview header so they stay close to the output.

### Markdown Ready Fallback

If calculated savings are zero or negative, the UI shows "Markdown ready"
instead of making a negative savings claim. The result still remains useful
because the Markdown is cleaner and easier to use with AI tools.

## Mobile-First Notes

- The upload panel is full-width on small screens.
- Result actions stack on mobile and sit side by side on larger screens.
- Markdown preview has a smaller max height on mobile to keep actions reachable.
- Trust grids collapse into single-column layouts on mobile.
- Header anchors wrap instead of forcing horizontal page overflow.

## Accessibility Decisions

- The upload zone is keyboard reachable and opens the file picker with Enter or
  Space.
- URL validation errors are inline and use `role="alert"`.
- FAQ items use native buttons with `aria-expanded`.
- Icon-only controls include `aria-label`.
- Focus rings are visible in light and dark mode.

## Visual Direction

The visual language is minimal and confident: restrained borders, simple cards,
clear spacing, and no decorative backgrounds. The page uses dark mode classes
for system-level dark preference support without adding a theme switch in V1.
