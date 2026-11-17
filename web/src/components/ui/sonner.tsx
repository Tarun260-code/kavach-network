"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-ink group-[.toaster]:border-hairline group-[.toaster]:shadow-elevated group-[.toaster]:rounded-pill group-[.toaster]:px-4 group-[.toaster]:py-2.5",
          description: "group-[.toast]:text-muted text-body-sm",
          actionButton:
            "group-[.toast]:bg-ink group-[.toast]:text-white rounded-pill text-body-sm font-medium",
          cancelButton:
            "group-[.toast]:bg-subtle group-[.toast]:text-muted rounded-pill text-body-sm",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

