"use client";

import React, { useRef } from "react";
import { MeshBackground } from "./MeshBackground";
import { MerkleLattice } from "./MerkleLattice";
import {
  Header,
  type NavigationSection,
} from "./hero-01-utils/header";
import {
  Hero,
  type AvatarItem,
} from "./hero-01-utils/hero";
import {
  BrandSlider,
  type BrandItem,
} from "./hero-01-utils/brand-slider";

export interface Hero01Props {
  navigation?: NavigationSection[];
  avatars?: AvatarItem[];
  brands?: BrandItem[];
  eyebrowText?: string;
  title?: React.ReactNode;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  ratingText?: string;
  brandSliderTitle?: string;
  className?: string;
  withLocalBackground?: boolean;
}

export function Hero01({
  navigation,
  avatars,
  brands,
  eyebrowText,
  title,
  subtitle,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
  ratingText,
  brandSliderTitle,
  className,
  withLocalBackground = false,
}: Hero01Props) {
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={heroWrapperRef}
      className={`relative overflow-hidden ${
        withLocalBackground ? "bg-canvas" : "bg-transparent"
      } ${className || ""}`}
    >
      {/* Soft Aurora Mesh Background with Drifting Blobs & Vignette (if standalone) */}
      {withLocalBackground && <MeshBackground variant="hero" />}

      {/* Merkle Lattice Living Ledger Canvas Layer (if standalone) */}
      {withLocalBackground && <MerkleLattice containerRef={heroWrapperRef} />}

      {/* Header */}
      <Header
        navigation={navigation}
        ctaText={primaryCtaText || "Open console"}
        ctaHref={primaryCtaHref || "/bank/meridian"}
      />

      {/* Main Hero Showcase */}
      <Hero
        eyebrowText={eyebrowText}
        title={title}
        subtitle={subtitle}
        primaryCtaText={primaryCtaText}
        primaryCtaHref={primaryCtaHref}
        secondaryCtaText={secondaryCtaText}
        secondaryCtaHref={secondaryCtaHref}
        avatars={avatars}
        ratingText={ratingText}
      />

      {/* Infinite Brand Marquee */}
      <BrandSlider
        title={brandSliderTitle}
        brands={brands}
      />
    </div>
  );
}

export default Hero01;
export type { NavigationSection, AvatarItem, BrandItem };

