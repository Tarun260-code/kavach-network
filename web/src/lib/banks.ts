export interface BankSkin {
  accentColor: string;      // Primary brand accent
  accentGlow: string;       // 25% focus/halo glow
  badgeBg: string;          // 12% tint for status badges
  badgeTextLight: string;   // High-contrast text on light canvas (>= 4.5:1)
  badgeTextDark: string;    // High-contrast text on dark canvas (>= 4.5:1)
  tintBg: string;           // 4% background tint for selected cards/rows
  monogramBg: string;       // Surface background for monogram pill
  monogramColor: string;    // Monogram initials color
}

export interface BankConfig {
  id: string;
  name: string;
  code: string;
  accountIndex: number;
  address: string;
  privateKey?: string;
  tagline: string;
  branchCity: string;
  category: "Public Sector" | "Private Sector" | "NBFC";
  skin: BankSkin;
  // Direct legacy accessors for backward compatibility
  accentColor: string;
  accentGlow: string;
  badgeBg: string;
  badgeText: string;
  logoType: "meridian" | "aurum" | "halcyon" | "northgate" | "vantage" | "kestrel" | string;
}

export const CONSORTIUM_BANKS: Record<string, BankConfig> = {
  meridian: {
    id: "meridian",
    name: "Meridian Bank",
    code: "MBNK",
    accountIndex: 1,
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    tagline: "Institutional Commercial & Corporate Underwriting",
    branchCity: "Mumbai Financial District",
    category: "Private Sector",
    skin: {
      accentColor: "#0E9F9F",
      accentGlow: "rgba(14, 159, 159, 0.25)",
      badgeBg: "rgba(14, 159, 159, 0.12)",
      badgeTextLight: "#087A7A",
      badgeTextDark: "#38D8D8",
      tintBg: "rgba(14, 159, 159, 0.04)",
      monogramBg: "#065F63",
      monogramColor: "#FFFFFF",
    },
    accentColor: "#0E9F9F",
    accentGlow: "rgba(14, 159, 159, 0.25)",
    badgeBg: "rgba(14, 159, 159, 0.12)",
    badgeText: "#38D8D8",
    logoType: "meridian",
  },
  aurum: {
    id: "aurum",
    name: "Aurum Bank",
    code: "AURUM",
    accountIndex: 1,
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    tagline: "Premier Consortium Retail Underwriting",
    branchCity: "Bengaluru Central Financial Hub",
    category: "Public Sector",
    skin: {
      accentColor: "#3358F4",
      accentGlow: "rgba(51, 88, 244, 0.25)",
      badgeBg: "rgba(51, 88, 244, 0.12)",
      badgeTextLight: "#1E3DB8",
      badgeTextDark: "#8FA6FF",
      tintBg: "rgba(51, 88, 244, 0.04)",
      monogramBg: "#1E3DB8",
      monogramColor: "#FFFFFF",
    },
    accentColor: "#3358F4",
    accentGlow: "rgba(51, 88, 244, 0.25)",
    badgeBg: "rgba(51, 88, 244, 0.12)",
    badgeText: "#8FA6FF",
    logoType: "aurum",
  },
  halcyon: {
    id: "halcyon",
    name: "Halcyon Bank",
    code: "HALCYON",
    accountIndex: 2,
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    tagline: "Corporate & Investment Credit Line Facility",
    branchCity: "Mumbai Underwriting Division",
    category: "Private Sector",
    skin: {
      accentColor: "#0B4A72",
      accentGlow: "rgba(11, 74, 114, 0.25)",
      badgeBg: "rgba(11, 74, 114, 0.12)",
      badgeTextLight: "#0B4A72",
      badgeTextDark: "#60A5FA",
      tintBg: "rgba(11, 74, 114, 0.04)",
      monogramBg: "#0B4A72",
      monogramColor: "#FFFFFF",
    },
    accentColor: "#0B4A72",
    accentGlow: "rgba(11, 74, 114, 0.25)",
    badgeBg: "rgba(11, 74, 114, 0.12)",
    badgeText: "#60A5FA",
    logoType: "halcyon",
  },
  northgate: {
    id: "northgate",
    name: "Northgate Bank",
    code: "NORTHGATE",
    accountIndex: 3,
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    tagline: "Enterprise Commercial Lending & Treasury",
    branchCity: "New Delhi Commercial Hub",
    category: "Private Sector",
    skin: {
      accentColor: "#881337",
      accentGlow: "rgba(136, 19, 55, 0.25)",
      badgeBg: "rgba(136, 19, 55, 0.12)",
      badgeTextLight: "#881337",
      badgeTextDark: "#FB7185",
      tintBg: "rgba(136, 19, 55, 0.04)",
      monogramBg: "#881337",
      monogramColor: "#FFFFFF",
    },
    accentColor: "#881337",
    accentGlow: "rgba(136, 19, 55, 0.25)",
    badgeBg: "rgba(136, 19, 55, 0.12)",
    badgeText: "#FB7185",
    logoType: "northgate",
  },
  vantage: {
    id: "vantage",
    name: "Vantage Bank",
    code: "VANTAGE",
    accountIndex: 4,
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    tagline: "Agile Digital Microcredit & SME Lines",
    branchCity: "Hyderabad Corporate Hub",
    category: "Private Sector",
    skin: {
      accentColor: "#701A75",
      accentGlow: "rgba(112, 26, 117, 0.25)",
      badgeBg: "rgba(112, 26, 117, 0.12)",
      badgeTextLight: "#701A75",
      badgeTextDark: "#E879F9",
      tintBg: "rgba(112, 26, 117, 0.04)",
      monogramBg: "#701A75",
      monogramColor: "#FFFFFF",
    },
    accentColor: "#701A75",
    accentGlow: "rgba(112, 26, 117, 0.25)",
    badgeBg: "rgba(112, 26, 117, 0.12)",
    badgeText: "#E879F9",
    logoType: "vantage",
  },
  kestrel: {
    id: "kestrel",
    name: "Kestrel Capital NBFC",
    code: "KESTREL",
    accountIndex: 5,
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    tagline: "Digital Credit Lines & MSME Syndicate Screening",
    branchCity: "Bengaluru FinTech Hub",
    category: "NBFC",
    skin: {
      accentColor: "#E8851A",
      accentGlow: "rgba(232, 133, 26, 0.25)",
      badgeBg: "rgba(232, 133, 26, 0.12)",
      badgeTextLight: "#A85400",
      badgeTextDark: "#FFA858",
      tintBg: "rgba(232, 133, 26, 0.04)",
      monogramBg: "#9A3412",
      monogramColor: "#FFFFFF",
    },
    accentColor: "#E8851A",
    accentGlow: "rgba(232, 133, 26, 0.25)",
    badgeBg: "rgba(232, 133, 26, 0.12)",
    badgeText: "#FFA858",
    logoType: "kestrel",
  },
};

// Aliases for backward-compatibility with tests and seeded links
CONSORTIUM_BANKS.sbi = { ...CONSORTIUM_BANKS.aurum, id: "sbi" };
CONSORTIUM_BANKS.hdfc = { ...CONSORTIUM_BANKS.halcyon, id: "hdfc" };
CONSORTIUM_BANKS.icici = { ...CONSORTIUM_BANKS.northgate, id: "icici" };
CONSORTIUM_BANKS.axis = { ...CONSORTIUM_BANKS.vantage, id: "axis" };
CONSORTIUM_BANKS.pnb = { ...CONSORTIUM_BANKS.kestrel, id: "pnb" };

export function getBankById(id: string): BankConfig | undefined {
  return CONSORTIUM_BANKS[id?.toLowerCase()];
}

export function getBankSkin(id: string): BankSkin | undefined {
  return CONSORTIUM_BANKS[id?.toLowerCase()]?.skin;
}

export function getBankByAddress(address: string): BankConfig | undefined {
  if (!address) return undefined;
  const lower = address.toLowerCase();
  return Object.values(CONSORTIUM_BANKS).find((b) => b.address.toLowerCase() === lower);
}

export function getAllBanks(): BankConfig[] {
  return [
    CONSORTIUM_BANKS.meridian,
    CONSORTIUM_BANKS.aurum,
    CONSORTIUM_BANKS.halcyon,
    CONSORTIUM_BANKS.northgate,
    CONSORTIUM_BANKS.vantage,
    CONSORTIUM_BANKS.kestrel,
  ];
}

export function getDemoBanks(): BankConfig[] {
  return [
    CONSORTIUM_BANKS.meridian,
    CONSORTIUM_BANKS.aurum,
    CONSORTIUM_BANKS.halcyon,
    CONSORTIUM_BANKS.northgate,
    CONSORTIUM_BANKS.vantage,
  ];
}
