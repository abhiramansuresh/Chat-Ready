import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

import "../styles/globals.css";

export const metadata: Metadata = {
  // Canonical host is www — the apex 307-redirects there, and scrapers cache per-URL.
  metadataBase: new URL("https://www.chatready.online"),
  title: "ChatReady — Get your files ready for AI",
  description:
    "Convert PDFs, Word docs, spreadsheets, images, and web pages into clean Markdown for ChatGPT, Claude, Gemini and other AI tools. Free, private, no sign-up.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  // LinkedIn requires og:url and og:type; Next does not emit them by default.
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ChatReady",
  },
  twitter: { card: "summary_large_image" },
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
