import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/site";

export const runtime = "edge";

export const alt = "ChessSim — Watch intelligence play.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#F6F4EF",
          color: "#17140F",
          padding: "72px",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        {/* decorative knight */}
        <div
          style={{
            position: "absolute",
            right: 48,
            top: -40,
            fontSize: 400,
            color: "rgba(23,20,15,0.05)",
          }}
        >
          ♞
        </div>

        {/* mini board motif */}
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 72,
            display: "flex",
            flexWrap: "wrap",
            width: 160,
            height: 160,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #D7CFBF",
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const dark = (row + col) % 2 === 0;
            return (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: dark ? "#8E7B5C" : "#EBE1CB",
                }}
              />
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Chess
          </span>
          <span style={{ fontSize: 96, fontWeight: 700, color: "#8A6A3B" }}>
            Sim
          </span>
        </div>

        <div
          style={{
            fontSize: 44,
            marginTop: 16,
            color: "#6C6458",
          }}
        >
          {SITE_TAGLINE}
        </div>

        <div
          style={{
            fontSize: 24,
            marginTop: 24,
            color: "#9B9386",
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size }
  );
}
