import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kavach Network • Fraud Shared, Never Exposed";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#070B16",
          padding: "80px",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft Ambient Mesh Glow Orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,99,255,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "-120px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,178,107,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Top Eyebrow Badge & Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#3D63FF",
              color: "#FFFFFF",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            K
          </div>
          <span
            style={{
              fontSize: "32px",
              fontWeight: "600",
              color: "#EEF1FA",
              letterSpacing: "-0.02em",
            }}
          >
            Kavach Network
          </span>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#19C37D",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Consortium Protocol • DPDP Act (2023)
          </span>
        </div>

        {/* Main Serif Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            zIndex: 10,
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "68px",
              lineHeight: 1.1,
              fontWeight: 400,
              color: "#EEF1FA",
              letterSpacing: "-0.03em",
            }}
          >
            Fraud shared,{" "}
            <span style={{ fontStyle: "italic", color: "#D9B26B" }}>
              never exposed.
            </span>
          </div>
          <div
            style={{
              fontSize: "24px",
              lineHeight: 1.5,
              color: "#9AA4C2",
              fontFamily: "sans-serif",
            }}
          >
            Banks flag confirmed loan stacking as zero-knowledge commitments. Other institutions verify matches locally with Groth16 zk-SNARKs. Zero customer PII ever moves.
          </div>
        </div>

        {/* Footer Proof Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            zIndex: 10,
            fontFamily: "sans-serif",
            fontSize: "16px",
            color: "#5C6685",
          }}
        >
          <span>BN254 Scalar Field • Poseidon-T3 Commitments</span>
          <span style={{ color: "#D9B26B" }}>kavach.network</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
