"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";

export function ThemeToggle(): ReactElement {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle(): void {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  if (!mounted) {
    return <div className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700" />;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-white dark:focus:ring-offset-slate-950 ${
        isDark ? "bg-slate-700" : "bg-slate-200"
      }`}
    >
      {/* Sliding thumb */}
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full shadow transition-transform duration-300 ease-in-out ${
          isDark
            ? "translate-x-6 bg-slate-900"
            : "translate-x-1 bg-white"
        }`}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}

function SunIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-2.5 w-2.5 text-slate-300" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-7.5-1.5 1.5m-10 10L4.5 19.5m0-15 1.5 1.5m10 10 1.5 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-2.5 w-2.5 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  );
}
