export const DESIGN_TOKENS = {
  colors: {
    canvas: {
      ink: "#070B16",
      surface: "#0D1326",
      elevated: "#141B35",
      border: "rgba(255, 255, 255, 0.07)",
    },
    text: {
      primary: "#EEF1FA",
      secondary: "#9AA4C2",
      tertiary: "#5C6685",
    },
    brand: {
      sapphire: "#3D63FF",
      cobalt: "#1B2B8F",
    },
    signal: {
      verified: "#19C37D", // emerald
      flagged: "#FF4D5E",  // coral-red
      pending: "#F5A524",  // amber
      consortium: "#D9B26B", // champagne gold
    },
    banks: {
      meridian: {
        accent: "#0FA3A3",
        name: "Meridian Bank",
      },
      kestrel: {
        accent: "#F28C28",
        name: "Kestrel Capital NBFC",
      },
    },
    velocity: {
      clean: {
        bg: "rgba(25, 195, 125, 0.08)",
        border: "rgba(25, 195, 125, 0.25)",
        text: "#19C37D",
        pill: "bg-[#19C37D]/10 text-[#19C37D] border-[#19C37D]/30",
        label: "Clean / Negative Match",
      },
      monitored: {
        bg: "rgba(245, 165, 36, 0.08)",
        border: "rgba(245, 165, 36, 0.25)",
        text: "#F5A524",
        pill: "bg-[#F5A524]/10 text-[#F5A524] border-[#F5A524]/30",
        label: "Flagged (Single Originator)",
      },
      critical: {
        bg: "rgba(255, 77, 94, 0.12)",
        border: "rgba(255, 77, 94, 0.35)",
        text: "#FF4D5E",
        pill: "bg-[#FF4D5E]/15 text-[#FF4D5E] border-[#FF4D5E]/40",
        label: "Syndicate Attack (Multi-Bank Hit)",
      },
    },
  },
} as const;

export function getVelocityStyle(velocity: number) {
  if (velocity === 0) return DESIGN_TOKENS.colors.velocity.clean;
  if (velocity === 1) return DESIGN_TOKENS.colors.velocity.monitored;
  return DESIGN_TOKENS.colors.velocity.critical;
}
