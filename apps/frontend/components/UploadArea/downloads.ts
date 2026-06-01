import type { ConversionResponse } from "@/types/conversion";

export interface MarkdownDownload {
  readonly markdown: string;
  readonly sourceLabel: string;
}

export function downloadMarkdownFile(download: MarkdownDownload): void {
  const blob = new Blob([download.markdown], {
    type: "text/markdown;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = getDownloadFileName(download.sourceLabel);
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}

export function downloadCombinedMarkdown(
  downloads: readonly MarkdownDownload[],
): void {
  const combinedMarkdown = downloads
    .map((download) => {
      const title = getMarkdownTitle(download.sourceLabel);
      return `# ${title}\n\n${download.markdown.trim()}`;
    })
    .join("\n\n---\n\n");

  downloadMarkdownFile({
    markdown: combinedMarkdown,
    sourceLabel: "chatready-session.md",
  });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(value)));
}

export function getSavingsLabel(result: ConversionResponse): string {
  if (result.reductionPercent <= 0) {
    return "Markdown ready";
  }

  return `~${Math.round(result.reductionPercent)}% fewer tokens`;
}

function getDownloadFileName(sourceLabel: string): string {
  const withoutQuery = sourceLabel.split("?")[0] ?? sourceLabel;
  const rawName = withoutQuery.includes("://")
    ? getNameFromUrl(withoutQuery)
    : withoutQuery;
  const baseName = rawName.replace(/\.[^/.]+$/, "") || "chatready-output";
  const safeName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeName || "chatready-output"}.md`;
}

function getMarkdownTitle(sourceLabel: string): string {
  return sourceLabel.replace(/^https?:\/\//, "").replace(/[#?].*$/, "");
}

function getNameFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathName = parsedUrl.pathname.split("/").filter(Boolean).pop();

    return pathName || parsedUrl.hostname;
  } catch {
    return "chatready-output";
  }
}
