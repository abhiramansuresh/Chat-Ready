"use client";

import type {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  ReactElement,
} from "react";
import { useRef } from "react";

import { maxUploadSizeMb } from "@/lib/env";

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

const FORMAT_GROUPS = [
  {
    label: "Documents",
    formats: ["PDF", "DOCX", "TXT", "MD", "RTF"],
  },
  {
    label: "Slides & Sheets",
    formats: ["PPTX", "XLSX", "CSV"],
  },
  {
    label: "Structured",
    formats: ["JSON", "XML", "HTML"],
  },
  {
    label: "Images",
    formats: ["PNG", "JPG", "JPEG", "WEBP"],
  },
];

interface FileDropZoneProps {
  readonly disabled: boolean;
  readonly isDragActive: boolean;
  readonly selectedFile: File | null;
  readonly onClearFile: () => void;
  readonly onConvertFile: () => void;
  readonly onFileSelected: (file: File) => void;
}

export function FileDropZone({
  disabled,
  isDragActive,
  selectedFile,
  onClearFile,
  onConvertFile,
  onFileSelected,
}: FileDropZoneProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  function openFilePicker(): void {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelected(file);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files.item(0);

    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        id="file-input"
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        disabled={disabled}
        onChange={handleFileInput}
        className="sr-only"
      />

      {selectedFile ? (
        <SelectedFilePanel
          file={selectedFile}
          disabled={disabled}
          onClearFile={onClearFile}
          onConvertFile={onConvertFile}
        />
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openFilePicker}
          onKeyDown={handleKeyDown}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          aria-label="Upload a file"
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-5 py-7 text-center transition sm:px-8 ${
            isDragActive
              ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
          } focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-white dark:focus:ring-offset-slate-950 ${
            disabled ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          <UploadIcon />
          <div>
            <p className="text-xl font-semibold text-slate-950 dark:text-white">
              Drop your file here
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              or click to browse
            </p>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Max {maxUploadSizeMb}MB
          </p>
        </div>
      )}

      <FormatChips />
    </div>
  );
}

interface SelectedFilePanelProps {
  readonly disabled: boolean;
  readonly file: File;
  readonly onClearFile: () => void;
  readonly onConvertFile: () => void;
}

function SelectedFilePanel({
  disabled,
  file,
  onClearFile,
  onConvertFile,
}: SelectedFilePanelProps): ReactElement {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          <FileIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-950 dark:text-white">
            {file.name}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {getFileExtension(file.name)} · {formatBytes(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClearFile}
          disabled={disabled}
          aria-label="Clear selected file"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xl leading-none text-slate-500 hover:bg-slate-200 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          ×
        </button>
      </div>

      <button
        type="button"
        onClick={onConvertFile}
        disabled={disabled}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
      >
        Convert
      </button>
    </div>
  );
}

function FormatChips(): ReactElement {
  return (
    <div className="grid gap-2 text-left sm:grid-cols-2">
      {FORMAT_GROUPS.map((group) => (
        <div key={group.label} className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.formats.map((format) => (
              <span
                key={`${group.label}-${format}`}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UploadIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="h-9 w-9 text-teal-700 dark:text-teal-300"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M8 16H6.5A4.5 4.5 0 0 1 6 7a6 6 0 0 1 11.6 1.8A3.6 3.6 0 0 1 17 16h-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16V9m0 0 3 3m-3-3-3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h6l4 4v14H7V3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13 3v5h4M9 13h6M9 17h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop();

  return extension ? extension.toUpperCase() : "FILE";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
