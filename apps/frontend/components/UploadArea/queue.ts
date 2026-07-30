// One request at a time, capped low: the free host runs a single small worker,
// so a big batch would hold it for minutes and time out the later files.
export const MAX_FILES = 5;

export interface QueueMergeResult {
  readonly files: File[];
  readonly notice: string | null;
}

/**
 * Adds files to the pending queue, skipping duplicates, oversized files and
 * anything past MAX_FILES. Returns the first reason something was skipped so
 * the user is told rather than silently losing a file they dropped.
 */
export function mergeIntoQueue(
  current: readonly File[],
  incoming: readonly File[],
  maxSizeBytes: number,
): QueueMergeResult {
  const files = [...current];
  const notices: string[] = [];

  for (const file of incoming) {
    if (file.size > maxSizeBytes) {
      const maxSizeMb = Math.round(maxSizeBytes / 1024 / 1024);
      notices.push(`"${file.name}" is over ${maxSizeMb}MB and was skipped.`);
      continue;
    }

    if (files.some((queued) => queued.name === file.name && queued.size === file.size)) {
      continue;
    }

    if (files.length >= MAX_FILES) {
      notices.push(
        `Only ${MAX_FILES} files at a time — convert these first, then add more.`,
      );
      break;
    }

    files.push(file);
  }

  return { files, notice: notices[0] ?? null };
}
