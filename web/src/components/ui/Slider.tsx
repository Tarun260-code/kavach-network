"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helperText?: string;
  unit?: string;
  showTooltip?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  helperText,
  unit = "",
  showTooltip = true,
  className,
  disabled = false,
  id,
}: SliderProps) {
  const [isHovering, setIsHovering] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn("w-full space-y-1.5 select-none text-left", className)}>
      {label && (
        <div className="flex items-center justify-between text-body-sm">
          <label htmlFor={id} className="font-medium text-ink">
            {label}
          </label>
          <span className="font-mono text-ink font-semibold text-xs">
            {value}
            {unit}
          </span>
        </div>
      )}

      <div
        className="relative flex items-center min-h-[44px] cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Track Background */}
        <div className="h-2 w-full rounded-pill bg-subtle relative overflow-hidden border border-hairline/60">
          {/* Active Fill */}
          <div
            className="h-full bg-primary transition-all duration-75 rounded-pill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Value Tooltip floating above thumb */}
        {showTooltip && (isHovering || isDragging) && (
          <div
            className="absolute -top-7 -translate-x-1/2 pointer-events-none px-2 py-0.5 rounded-pill bg-ink text-canvas text-[11px] font-mono font-medium shadow-subtle transition-all duration-75 z-10"
            style={{ left: `${percentage}%` }}
          >
            {value}
            {unit}
          </div>
        )}

        {/* Native Range Input (Transparent, accessible, full touch area) */}
        <input
          id={id}
          type="range"
          aria-label={label || "Slider control"}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />

        {/* Custom Visual Thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-surface border-2 border-primary shadow-subtle pointer-events-none transition-transform duration-75",
            (isHovering || isDragging) && "scale-125"
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {helperText && (
        <p className="text-[11px] text-muted">{helperText}</p>
      )}
    </div>
  );
}

export default Slider;
