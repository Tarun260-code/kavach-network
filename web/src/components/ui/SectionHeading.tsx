"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "xl" | "lg" | "md" | "sm";
  align?: "left" | "center" | "right";
  as?: "h1" | "h2" | "h3" | "h4";
}

export function SectionHeading({
  className,
  size = "lg",
  align = "left",
  as: Comp = "h2",
  children,
  ...props
}: SectionHeadingProps) {
  const sizeClasses = {
    xl: "text-[38px] sm:text-[54px] md:text-display-xl leading-[1.08] tracking-tight",
    lg: "text-[32px] sm:text-[44px] md:text-display-lg leading-[1.12] tracking-tight",
    md: "text-[26px] sm:text-[34px] md:text-display-md leading-[1.18] tracking-tight",
    sm: "text-[22px] sm:text-heading-lg leading-[1.25] tracking-tight",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Comp
      className={cn(
        "font-serif font-normal text-ink [&_em]:font-serif [&_em]:italic [&_em]:font-normal [&_i]:font-serif [&_i]:italic",
        sizeClasses[size],
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export default SectionHeading;
