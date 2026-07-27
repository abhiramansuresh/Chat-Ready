import { ImageResponse } from "next/og";

export const alt = "ChatReady — Get your files ready for AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ponytail: satori has no text-gradient/bg-clip, so the accent is flat teal.
export default function OpengraphImage(): Response {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 32,
          padding: 80,
          background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#0f172a" />
            <path d="M15 11 H37 L49 23 V53 H15 Z" fill="#f1f5f9" />
            <path d="M37 11 L49 23 H37 Z" fill="#94a3b8" />
            <rect x="21" y="31" width="22" height="5" rx="2.5" fill="#0d9488" />
            <rect x="21" y="40" width="15" height="5" rx="2.5" fill="#0d9488" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#f1f5f9" }}>
            ChatReady
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: -2,
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex" }}>Get your files</div>
          <div style={{ display: "flex", color: "#2dd4bf" }}>ready for AI</div>
        </div>

        <div style={{ fontSize: 30, lineHeight: 1.4, color: "#cbd5e1" }}>
          PDFs, Word docs, spreadsheets, images and web pages into clean
          Markdown for ChatGPT, Claude and Gemini.
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#5eead4" }}>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "2px solid #134e4a",
              background: "#0f172a",
            }}
          >
            Free
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "2px solid #134e4a",
              background: "#0f172a",
            }}
          >
            No sign-up
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "2px solid #134e4a",
              background: "#0f172a",
            }}
          >
            Files never stored
          </div>
        </div>
      </div>
    ),
    size,
  );
}
