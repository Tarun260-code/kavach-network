"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  maxWidth?: "sm" | "md" | "lg" | "xl" | string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size,
  maxWidth = "md",
  className,
}: ModalProps) {
  const chosenSize = (size || maxWidth) as "sm" | "md" | "lg" | "xl";

  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const resolvedMax = sizeClasses[chosenSize] || "max-w-lg";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("p-6 md:p-8", resolvedMax, className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
