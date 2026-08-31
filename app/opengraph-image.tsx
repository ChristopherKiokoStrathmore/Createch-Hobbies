import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/lib/getSiteConfig";

// Generated at request/build time rather than committed as a binary, so the
// card always matches the brand tokens in site-config.json. WhatsApp, Facebook
// and X all read this; before it existed no og:image tag was emitted at all and
// every shared link rendered as a blank card.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Createch Hobbies — DIY assembly kits for kids in Nairobi";

export default async function OpengraphImage() {
  const cfg = await getSiteConfig();
  const { yellow, purple, dark } = cfg.tokens;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${dark} 0%, ${purple} 190%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: yellow,
            fontWeight: 600,
          }}
        >
          Build · Play · Learn
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 92,
            lineHeight: 1.05,
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          Createch Hobbies
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 38,
            lineHeight: 1.35,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 900,
          }}
        >
          DIY assembly kits that spark creativity and STEM learning. Ages 5–14.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", width: 64, height: 6, background: yellow }} />
          <div style={{ display: "flex", fontSize: 30, color: yellow, fontWeight: 600 }}>
            Delivered across Nairobi in 1–2 days
          </div>
        </div>
      </div>
    ),
    size,
  );
}
