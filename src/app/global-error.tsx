"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("GameVault — kritická chyba root layoutu:", error);
  }, [error]);

  return (
    <html lang="cs">
      <body
        style={{
          background: "#08090d",
          color: "#f4f5f7",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>
          GameVault se nepodařilo načíst.
        </h1>
        <p style={{ color: "#8b8f9c", maxWidth: "420px", marginBottom: "24px" }}>
          Nastala kritická chyba. Zkus prosím obnovit stránku.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#7c5cff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Zkusit znovu
        </button>
      </body>
    </html>
  );
}