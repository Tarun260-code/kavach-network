"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-[transform,opacity,background-color,border-color,box-shadow] duration-120 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 select-none relative",
  {
    variants: {
      variant: {
        "pill-dark":
          "bg-ink text-canvas shadow-subtle hover:bg-ink/90 active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill group",
        "pill-light":
          "bg-surface text-ink border border-hairline shadow-subtle hover:bg-subtle active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill",
        primary:
          "bg-ink text-canvas shadow-subtle hover:bg-ink/90 active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill group",
        secondary:
          "bg-surface text-ink border border-hairline shadow-subtle hover:bg-subtle active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill",
        outline:
          "bg-surface text-ink border border-hairline shadow-subtle hover:bg-subtle active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill",
        ghost:
          "text-muted hover:text-ink hover:bg-subtle active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill",
        "destructive-soft":
          "bg-semantic-flagged-wash text-semantic-flagged-text dark:text-semantic-flagged border border-semantic-flagged/25 hover:bg-semantic-flagged/20 active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill font-medium",
        destructive:
          "bg-semantic-flagged text-white shadow-subtle hover:bg-semantic-flagged/90 active:scale-[0.98] motion-reduce:active:scale-100 rounded-pill",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
        icon:
          "text-muted hover:text-ink hover:bg-subtle active:scale-[0.98] motion-reduce:active:scale-100 rounded-full p-2 min-h-[44px] min-w-[44px] flex items-center justify-center",
      },
      size: {
        default: "min-h-[44px] px-5 py-2 text-sm",
        md: "min-h-[44px] px-5 py-2 text-sm",
        sm: "min-h-[36px] px-3.5 py-1.5 text-xs",
        lg: "min-h-[48px] px-7 py-3 text-base",
        icon: "h-11 w-11 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  withOrb?: boolean;
  isLoading?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      asChild = false,
      withOrb,
      isLoading,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isSpinning = isLoading || loading;
    const Comp = asChild ? Slot : "button";

    // Show trailing arrow orb on pill-dark / primary buttons unless explicitly disabled or icon size
    const isDarkPill = variant === "pill-dark" || variant === "primary";
    const showOrb = withOrb ?? (isDarkPill && size !== "icon");
    const [magneticOffset, setMagneticOffset] = React.useState({ x: 0, y: 0 });

    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (asChild || disabled || isSpinning) return;
      if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Magnetic hover: max 6px pull towards cursor
        const pullX = Math.max(-6, Math.min(6, (e.clientX - centerX) * 0.14));
        const pullY = Math.max(-6, Math.min(6, (e.clientY - centerY) * 0.14));
        setMagneticOffset({ x: pullX, y: pullY });
      }
    };

    const handlePointerLeave = () => {
      setMagneticOffset({ x: 0, y: 0 });
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          showOrb && size === "default" && "pr-2 pl-5",
          showOrb && size === "md" && "pr-2 pl-5",
          showOrb && size === "lg" && "pr-2.5 pl-6",
          showOrb && size === "sm" && "pr-1.5 pl-3.5"
        )}
        ref={ref}
        disabled={disabled || isSpinning}
        aria-busy={isSpinning}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`,
          transition: "transform 0.15s ease-out",
          ...props.style,
        }}
        {...props}
      >
        {/* Loading Spinner Overlaid to Preserve Exact Button Width */}
        {isSpinning && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          </span>
        )}

        <span
          className={cn(
            "inline-flex items-center",
            isSpinning && "invisible pointer-events-none"
          )}
        >
          <span>{children}</span>
          {showOrb && (
            <span className="ml-2.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-ink shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[2] transition-transform duration-200 group-hover:rotate-45" />
            </span>
          )}
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
