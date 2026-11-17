import * as React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-md border border-hairline bg-subtle px-1.5 font-mono text-[11px] font-medium text-muted shadow-[0_1px_0_1px_rgba(0,0,0,0.04)] select-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export default Kbd;

