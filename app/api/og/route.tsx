import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { userProblemInteractions, problems, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    let title = "Tilt";
    let subtitle = "Scroll Smarter, Not Harder";
    let userName = "";
    let solved = false;

    if (code) {
      // This won't work in edge runtime with drizzle/postgres
      // In production, you'd use a different approach or fetch from an API
      // For now, we'll use default values
      title = "A Challenge Awaits";
      subtitle = "Can you solve this problem?";
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -100,
              left: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
            }}
          />

          {/* Status badge */}
          {code && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 999,
                background: solved
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(251, 191, 36, 0.2)",
                border: solved
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : "1px solid rgba(251, 191, 36, 0.3)",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  color: solved ? "#10b981" : "#fbbf24",
                  fontWeight: 600,
                }}
              >
                {solved ? "✓ Solved" : "🔥 Challenge"}
              </span>
            </div>
          )}

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 50%, #60a5fa 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 16,
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: 40,
              textAlign: "center",
              maxWidth: 700,
            }}
          >
            {subtitle}
          </div>

          {/* Tilt Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Tilt
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
