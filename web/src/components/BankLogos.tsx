import React from "react";

export function KavachShieldLogo({ className = "w-5 h-5", accent = "#3D63FF" }: { className?: string; accent?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L7 8.5V12C7 15 9.1 17.8 12 18.5C14.9 17.8 17 15 17 12V8.5L12 6Z"
        fill={accent}
        fillOpacity="0.12"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.5" fill={accent} />
    </svg>
  );
}

export function BankMark({
  bankId,
  className = "w-4 h-4",
  accent,
}: {
  bankId: string;
  className?: string;
  accent?: string;
}) {
  const id = bankId?.toLowerCase();

  if (id === "meridian") {
    // Meridian Bank: Deep Teal Interlocking M Chevrons
    const col = accent || "#0FA3A3";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 19V7L8 14L12 8L16 14L21 7V19"
          stroke={col}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="18" r="1.5" fill={col} />
      </svg>
    );
  }

  if (id === "kestrel") {
    // Kestrel Capital NBFC: Saffron Falcon Vector
    const col = accent || "#F28C28";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17L12 3L21 17L12 13L3 17Z"
          stroke={col}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={col}
          fillOpacity="0.1"
        />
        <path d="M12 13V21" stroke={col} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "aurum" || id === "sbi") {
    const col = accent || "#3358F4";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={col} strokeWidth="1.6" />
        <path d="M12 3V12" stroke={col} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="15" r="2.2" fill={col} />
      </svg>
    );
  }

  if (id === "halcyon" || id === "hdfc") {
    const col = accent || "#0B4A72";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke={col} strokeWidth="1.6" />
        <rect x="9" y="9" width="6" height="6" fill={col} fillOpacity="0.2" stroke={col} strokeWidth="1.4" />
      </svg>
    );
  }

  if (id === "northgate" || id === "icici") {
    const col = accent || "#881337";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20" stroke={col} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 8L16 12L12 16" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (id === "vantage" || id === "axis") {
    const col = accent || "#701A75";
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M4 20L12 4L20 20H15L12 13L9 20H4Z" stroke={col} strokeWidth="1.5" strokeLinejoin="round" fill={col} fillOpacity="0.1" />
      </svg>
    );
  }

  // Default fallback institutional seal
  const col = accent || "#19C37D";
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke={col} strokeWidth="1.6" />
      <path d="M4 10H20M10 4V20" stroke={col} strokeWidth="1.5" />
    </svg>
  );
}

