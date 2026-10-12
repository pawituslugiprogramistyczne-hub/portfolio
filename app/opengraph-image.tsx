import { ImageResponse } from "next/og"
import { profile } from "@/lib/portfolio-data"

// Link-preview card shown when the site is shared on LinkedIn, Slack, X, etc.
// Rendered once at build time.
export const alt = "Pawel Pokorski - Software Engineer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const cyan = "#4fd1dc"
const blue = "#6b93ff"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(circle at 85% 15%, #0b3a4a 0%, #020617 55%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 40, fontWeight: 700 }}>
          <span style={{ color: cyan, marginRight: 14 }}>{"</>"}</span>
          <span style={{ color: blue }}>Paw</span>
          <span style={{ color: cyan, marginLeft: 4 }}>IT</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{profile.name}</div>
          <div style={{ marginTop: 28, fontSize: 38, color: "#94a3b8" }}>
            Software Engineer | Python | Full-stack | Data & Automation
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: cyan }}>{profile.siteUrl.replace("https://", "")}</div>
      </div>
    ),
    size,
  )
}
