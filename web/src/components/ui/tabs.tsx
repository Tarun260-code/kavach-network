"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

type TabsVariant = "pill" | "underline";

const TabsVariantContext = React.createContext<TabsVariant>("pill");

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    variant?: TabsVariant;
  }
>(({ variant = "pill", className, ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.Root ref={ref} className={className} {...props} />
  </TabsVariantContext.Provider>
));
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
  }
>(({ className, variant: localVariant, ...props }, ref) => {
  const contextVariant = React.useContext(TabsVariantContext);
  const variant = localVariant || contextVariant;

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center",
        variant === "pill"
          ? "h-11 justify-center rounded-pill bg-subtle p-1 text-muted border border-hairline gap-1"
          : "h-11 w-full justify-start border-b border-hairline bg-transparent p-0 gap-6",
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant;
  }
>(({ className, variant: localVariant, ...props }, ref) => {
  const contextVariant = React.useContext(TabsVariantContext);
  const variant = localVariant || contextVariant;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-body-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire disabled:pointer-events-none disabled:opacity-50 select-none",
        variant === "pill"
          ? "rounded-pill px-4 py-1.5 min-h-[36px] data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-subtle hover:text-ink text-muted"
          : "relative h-11 rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-muted hover:text-ink data-[state=active]:border-brand-sapphire data-[state=active]:text-ink data-[state=active]:font-semibold",
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
