"use client";

import type {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  ReactElement,
} from "react";
import { useRef } from "react";

import { maxUploadSizeMb } from "@/lib/env";

import { MAX_FILES } from "./queue";

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
  { label: "Documents", formats: ["PDF", "DOCX", "TXT", "RTF"] },
  { label: "Slides & Spreadsheets", formats: ["PPTX", "XLSX", "CSV"] },
  { label: "Code & Web", formats: ["JSON", "XML", "HTML", "MD"] },
  { label: "Images", formats: ["PNG", "JPG", "JPEG", "WEBP"] },
];

interface FileDropZoneProps {
  readonly disabled: boolean;
  readonly isDragActive: boolean;
  readonly files: readonly File[];
  readonly notice: string | null;
  readonly onClearFile: (index: number) => void;
  readonly onClearAll: () => void;
  readonly onConvertFiles: () => void;
  readonly onFilesSelected: (files: readonly File[]) => void;
}

export function FileDropZone({
  disabled,
  isDragActive,
  files,
  notice,
  onClearFile,
  onClearAll,
  onConvertFiles,
  onFilesSelected,
}: FileDropZoneProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFull = files.length >= MAX_FILES;

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
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > 0) {
      onFilesSelected(selected);
    }
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer.files);
    if (dropped.length > 0) {
      onFilesSelected(dropped);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        id="file-input"
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES.join(",")}
        disabled={disabled}
        onChange={handleFileInput}
        className="sr-only"
      />

      {files.length > 0 ? (
        <SelectedFilesPanel
          files={files}
          disabled={disabled}
          isFull={isFull}
          onAddMore={openFilePicker}
          onClearAll={onClearAll}
          onClearFile={onClearFile}
          onConvertFiles={onConvertFiles}
        />
      ) : (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          aria-hidden="true"
          className={`flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed px-6 py-10 text-center transition sm:py-14 ${
            isDragActive
              ? "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/30"
              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50"
          }`}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition ${
              isDragActive
                ? "bg-teal-100 dark:bg-teal-900"
                : "bg-white shadow-sm dark:bg-slate-800"
            }`}
          >
            <UploadIcon active={isDragActive} />
          </div>

          <div>
            <p className="text-xl font-semibold text-slate-950 dark:text-white">
              {isDragActive ? "Drop to convert" : "Drop your files here"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or use the button below &mdash; up to {MAX_FILES} files, {maxUploadSizeMb}MB each
            </p>
          </div>

          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:scale-[1.03] hover:bg-slate-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
          >
            <FolderIcon />
            Choose files
          </button>
        </div>
      )}

      {notice ? (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-400">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

interface SelectedFilesPanelProps {
  readonly disabled: boolean;
  readonly files: readonly File[];
  readonly isFull: boolean;
  readonly onAddMore: () => void;
  readonly onClearAll: () => void;
  readonly onClearFile: (index: number) => void;
  readonly onConvertFiles: () => void;
}

function SelectedFilesPanel({
  disabled,
  files,
  isFull,
  onAddMore,
  onClearAll,
  onClearFile,
  onConvertFiles,
}: SelectedFilesPanelProps): ReactElement {
  const isBatch = files.length > 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {files.length} {files.length === 1 ? "file" : "files"} ready
        </p>
        {isBatch ? (
          <button
            type="button"
            onClick={onClearAll}
            disabled={disabled}
            className="inline-flex min-h-9 items-center rounded-md px-2 text-xs font-semibold text-slate-500 underline-offset-2 transition hover:text-slate-950 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:opacity-50 dark:text-slate-400 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
          >
            Remove all
          </button>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.size}`}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <FileIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {getFileExtension(file.name)} &middot; {formatBytes(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onClearFile(index)}
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
            >
              <XIcon />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
        <button
          type="button"
          onClick={onConvertFiles}
          disabled={disabled}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          <SparkleIcon />
          {isBatch ? `Make ${files.length} files AI-ready` : "Make it AI-ready"}
        </button>
        <button
          type="button"
          onClick={onAddMore}
          disabled={disabled || isFull}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-500 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          <PlusIcon />
          {isFull ? `Limit ${MAX_FILES} files` : "Add more"}
        </button>
      </div>
    </div>
  );
}

export function SupportedFormats(): ReactElement {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Supported formats
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {FORMAT_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.formats.map((format) => (
                <span
                  key={`${group.label}-${format}`}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadIcon({ active }: { active: boolean }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className={`h-8 w-8 transition ${
        active ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"
      }`}
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

function FolderIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
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

function XIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkleIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5-2 2m-7 7-2 2m0-11 2 2m7 7 2 2"
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
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
