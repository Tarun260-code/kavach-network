import { type Variants, type Transition } from "framer-motion";

/**
 * Institutional Motion Design System for Kavach Network
 * Tokens:
 * - Durations: 120ms (fast), 200ms (normal), 320ms (deliberate)
 * - Easing: cubic-bezier(0.22, 1, 0.36, 1)
 * - Spring: tuned for sheet drawers and dialog overlays
 * - Stagger: 40ms (0.04s)
 * - prefers-reduced-motion: disables all spatial translation, keeping only 150ms opacity fade
 */

export const motionTokens = {
  duration: {
    fast: 0.12, // 120ms
    normal: 0.20, // 200ms
    slow: 0.32, // 320ms
  },
  easing: [0.22, 1, 0.36, 1] as const,
  stagger: 0.04, // 40ms
  spring: {
    type: "spring" as const,
    stiffness: 380,
    damping: 32,
    mass: 0.8,
  },
};

export const transitions = {
  instant: { duration: 0 },
  fast: { duration: motionTokens.duration.fast, ease: motionTokens.easing },
  normal: { duration: motionTokens.duration.normal, ease: motionTokens.easing },
  slow: { duration: motionTokens.duration.slow, ease: motionTokens.easing },
  spring: motionTokens.spring,
} satisfies Record<string, Transition>;

// Page-level transition (150ms fade)
export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.10, ease: "easeIn" },
  },
};

// Rise-in preset for cards, hero elements, sections (respects prefers-reduced-motion)
export const riseIn: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: (customDelay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.slow,
      delay: customDelay,
      ease: motionTokens.easing,
    },
  }),
};

// Fade-in preset
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (customDelay = 0) => ({
    opacity: 1,
    transition: {
      duration: motionTokens.duration.normal,
      delay: customDelay,
      ease: motionTokens.easing,
    },
  }),
};

// Stagger container for metric grids and lists (40ms stagger)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: motionTokens.stagger,
      delayChildren: 0.02,
    },
  },
};

// Sheet drawer spring animation
export const sheetVariants: Variants = {
  hidden: { x: "100%", opacity: 0.8 },
  visible: {
    x: "0%",
    opacity: 1,
    transition: motionTokens.spring,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: motionTokens.duration.fast, ease: "easeIn" },
  },
};

// Dialog modal spring animation
export const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: motionTokens.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: motionTokens.duration.fast, ease: "easeIn" },
  },
};

// Row highlight for newly inserted ledger events (1.2s soft highlight fade)
export const newRowHighlight: Variants = {
  initial: {
    opacity: 0,
    x: -8,
    backgroundColor: "rgba(51, 88, 244, 0.10)",
  },
  animate: {
    opacity: 1,
    x: 0,
    backgroundColor: "rgba(51, 88, 244, 0)",
    transition: {
      duration: 1.2,
      ease: "easeOut",
    },
  },
};

// Card pop / lift variant on hover
export const cardLift = {
  rest: { y: 0, transition: transitions.fast },
  hover: { y: -2, transition: transitions.fast },
};

// Pulsing indicator for active live events
export const livePulse: Variants = {
  pulse: {
    scale: [1, 1.08, 1],
    opacity: [1, 0.85, 1],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
