import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ASCND — Recovery Stack for Sleep, Jawline & Presence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(0,243,255,0.22) 0%, rgba(0,168,179,0.08) 32%, #010101 68%)",
          color: "#ffffff",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 14,
            color: "#00f3ff",
            textTransform: "uppercase",
          }}
        >
          The Recovery Stack
        </div>
        <div
          style={{
            fontSize: 160,
            fontWeight: 700,
            letterSpacing: 8,
            marginTop: 12,
            lineHeight: 1,
            textShadow: "0 0 60px rgba(0,243,255,0.6)",
          }}
        >
          ASCND
        </div>
        <div
          style={{
            fontSize: 40,
            color: "rgba(255,255,255,0.78)",
            marginTop: 28,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Sharper jawline. Deeper sleep. Taller presence.
        </div>
        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 56,
            fontSize: 24,
            color: "rgba(0,243,255,0.85)",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <span>Free shipping</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
          <span>30-day guarantee</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
          <span>Medical-grade</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
