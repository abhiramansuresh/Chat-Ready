import type { ChangeEvent, DragEvent, ReactElement } from "react";

import { maxUploadSizeMb } from "@/lib/env";
import type { ConversionStatus } from "@/types/conversion";

const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".rtf",
  ".pptx",
  ".xlsx",
  ".csv",
  ".json",
  ".xml",
  ".html",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

interface UploadDropzoneProps {
  readonly disabled: boolean;
  readonly status: ConversionStatus;
  readonly onDragHover: () => void;
  readonly onDragIdle: () => void;
  readonly onFileSelected: (file: File) => void;
}

export function UploadDropzone({
  disabled,
  status,
  onDragHover,
  onDragIdle,
  onFileSelected,
}: UploadDropzoneProps): ReactElement {
  const isDragHover = status === "drag-hover";

  function handleFileInput(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelected(file);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    onDragIdle();

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files.item(0);

    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <label
      htmlFor="file-input"
      onDragEnter={onDragHover}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={onDragIdle}
      onDrop={handleDrop}
      className={`flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition ${
        isDragHover
          ? "border-teal-700 bg-teal-50"
          : "border-slate-300 bg-slate-50 hover:border-slate-400"
      } focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2 ${
        disabled ? "cursor-not-allowed opacity-70" : ""
      }`}
    >
      <input
        id="file-input"
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        disabled={disabled}
        onChange={handleFileInput}
        className="sr-only"
      />
      <span className="text-base font-semibold text-slate-950">Drop file here</span>
      <span className="text-sm text-slate-600">or choose a file</span>
      <span className="text-xs text-slate-500">Max {maxUploadSizeMb}MB</span>
    </label>
  );
}
