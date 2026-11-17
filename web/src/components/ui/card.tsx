"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "subtle" | "card" | "elevated";
  variant?: "default" | "elevated" | "subtle";
  interactive?: boolean;
  tilt?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      elevation,
      variant = "default",
      interactive = false,
      tilt = false,
      children,
      onPointerMove,
      onPointerLeave,
      ...props
    },
    ref
  ) => {
    const chosenElevation =
      elevation ||
      (variant === "subtle" ? "subtle" : variant === "elevated" ? "elevated" : "card");

    const enableTilt = (interactive || tilt);
    const [tiltStyle, setTiltStyle] = React.useState<{
      rotX: number;
      rotY: number;
      lightX: number;
      lightY: number;
      active: boolean;
    }>({
      rotX: 0,
      rotY: 0,
      lightX: 0,
      lightY: 0,
      active: false,
    });

    const handleTiltMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (enableTilt && typeof window !== "undefined") {
        const finePointer = window.matchMedia("(pointer: fine)").matches;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (finePointer && !reduced) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Max 3deg tilt
          const rotX = Math.max(-3, Math.min(3, -((y - rect.height / 2) / (rect.height / 2)) * 3));
          const rotY = Math.max(-3, Math.min(3, ((x - rect.width / 2) / (rect.width / 2)) * 3));
          setTiltStyle({ rotX, rotY, lightX: x, lightY: y, active: true });
        }
      }
      onPointerMove?.(e);
    };

    const handleTiltLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      if (enableTilt) {
        setTiltStyle((prev) => ({ ...prev, rotX: 0, rotY: 0, active: false }));
      }
      onPointerLeave?.(e);
    };

    return (
      <div
        ref={ref}
        onPointerMove={handleTiltMove}
        onPointerLeave={handleTiltLeave}
        className={cn(
          "rounded-card border border-hairline bg-surface transition-all duration-150 relative overflow-hidden",
          chosenElevation === "subtle" && "shadow-subtle bg-surface/80",
          chosenElevation === "card" && "shadow-card",
          chosenElevation === "elevated" && "shadow-elevated",
          interactive &&
            "hover:-translate-y-[1px] hover:shadow-elevated active:translate-y-0 cursor-pointer motion-reduce:hover:translate-y-0",
          className
        )}
        style={{
          transform: enableTilt && tiltStyle.active
            ? `perspective(800px) rotateX(${tiltStyle.rotX}deg) rotateY(${tiltStyle.rotY}deg)`
            : undefined,
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease",
          ...props.style,
        }}
        {...props}
      >
        {/* Dynamic Specular Pointer Highlight */}
        {enableTilt && tiltStyle.active && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 240px at ${tiltStyle.lightX}px ${tiltStyle.lightY}px, rgba(255, 255, 255, 0.14), transparent 70%)`,
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
Card.displayName = "Card";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "bordered";
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-panel p-4 transition-all duration-150",
        variant === "default" && "bg-subtle/60 border border-hairline text-ink",
        variant === "subtle" && "bg-subtle/30 border border-hairline/60 text-ink",
        variant === "bordered" && "bg-surface border border-hairline shadow-subtle text-ink",
        className
      )}
      {...props}
    />
  )
);
Panel.displayName = "Panel";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 md:p-8", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-sans text-xl font-semibold leading-snug tracking-[-0.01em] text-ink",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-sm text-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 md:p-8 md:pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 md:p-8 md:pt-0 border-t border-hairline", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  Panel,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
