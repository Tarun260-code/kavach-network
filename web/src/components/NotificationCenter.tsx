"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  Vote,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { HashChip } from "./HashChip";
import { InvestigationDrawer, InvestigationData } from "./InvestigationDrawer";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface NotificationItem {
  id: string;
  category: "hits" | "appeals" | "system";
  title: string;
  summary: string;
  timestamp: string;
  unread: boolean;
  link?: string;
  investigationData?: InvestigationData;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "hits",
    title: "Syndicate Match on Flagged ID",
    summary: "An identity commitment you flagged was presented at Northgate Bank for credit underwriting.",
    timestamp: "4m ago",
    unread: true,
    investigationData: {
      leaf: "0x19a99ebe8c49e19d7dcfbe5b8426fa746cfa6701bbdfdb257850020bc4b92b60",
      nullifier: "0x2e8f192b678239a04cd821385920394857201928374659102938475610293847",
      category: "Loan Stacking",
      flaggerBank: "Meridian Bank",
      flaggedDate: "Today at 09:30 AM",
      distinctBankHits: 3,
      timeline: [
        { bank: "Meridian Bank", action: "Flagged commitment with 0.05 ETH stake", timestamp: "09:30 AM" },
        { bank: "Halcyon Bank", action: "Screened applicant (Velocity Hit 2)", timestamp: "09:52 AM" },
        { bank: "Northgate Bank", action: "Screened applicant (Velocity Hit 3)", timestamp: "10:14 AM" },
      ],
      appealStatus: "No active appeal",
    },
  },
  {
    id: "notif-2",
    category: "appeals",
    title: "Appeal #1 Quorum Reached",
    summary: "Appeal for leaf 0x2b4c... reached 80% supermajority threshold with 4/5 affirmative votes.",
    timestamp: "22m ago",
    unread: true,
    link: "/appeals",
  },
  {
    id: "notif-3",
    category: "system",
    title: "Consortium Tree Synchronized",
    summary: "Depth-20 Merkle tree root synchronized to block #369 across 5 validator nodes.",
    timestamp: "1h ago",
    unread: false,
    link: "/network",
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "hits" | "appeals" | "system">("all");
  const [selectedInvestigation, setSelectedInvestigation] = useState<InvestigationData | null>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark clicked item as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );

    if (item.investigationData) {
      setIsOpen(false);
      setSelectedInvestigation(item.investigationData);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.category === activeTab;
  });

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`Notifications (${unreadCount} unread)`}
          aria-expanded={isOpen}
          className="relative p-2 rounded-md hover:bg-surface border border-transparent hover:border-hairline text-muted hover:text-ink transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-semantic-flagged animate-pulse ring-2 ring-surface" />
          )}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-card glass border border-hairline shadow-elevated z-50 overflow-hidden animate-rise-in"
              role="region"
              aria-label="Notification center"
            >
              {/* Header */}
              <div className="p-4 border-b border-hairline flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-base font-semibold tracking-[-0.01em] text-ink">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-semantic-flagged-wash text-semantic-flagged">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-sapphire hover:underline flex items-center gap-1 min-h-[32px] px-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-hairline bg-surface/50 text-xs">
                {(["all", "hits", "appeals", "system"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 text-center capitalize transition-colors min-h-[36px]",
                      activeTab === tab
                        ? "font-semibold text-brand-sapphire border-b-2 border-brand-sapphire bg-surface"
                        : "text-muted hover:text-ink"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-hairline">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted">
                    No notifications in this category.
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={cn(
                        "p-3.5 hover:bg-muted/10 transition-colors cursor-pointer space-y-1 block text-left",
                        item.unread && "bg-brand-sapphire/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.category === "hits" && (
                            <ShieldAlert className="h-3.5 w-3.5 text-semantic-flagged shrink-0" />
                          )}
                          {item.category === "appeals" && (
                            <Vote className="h-3.5 w-3.5 text-semantic-review shrink-0" />
                          )}
                          {item.category === "system" && (
                            <Layers className="h-3.5 w-3.5 text-brand-sapphire shrink-0" />
                          )}
                          <span
                            className={cn(
                              "text-xs",
                              item.unread ? "font-semibold text-ink" : "text-ink/80"
                            )}
                          >
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted shrink-0">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-muted leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>

                      {item.investigationData && (
                        <span className="text-[11px] text-semantic-flagged hover:underline inline-flex items-center gap-0.5 pt-1 font-medium">
                          Open investigation file
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      )}

                      {!item.investigationData && item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] text-brand-sapphire hover:underline inline-flex items-center gap-0.5 pt-1"
                        >
                          View in protocol
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Investigation Drawer */}
      <InvestigationDrawer
        isOpen={selectedInvestigation !== null}
        onClose={() => setSelectedInvestigation(null)}
        data={selectedInvestigation}
      />
    </>
  );
}

