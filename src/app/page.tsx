"use client";

import { useRouter } from "next/navigation";
import { AppShell, useApp } from "@/components/AppShell";
import { ConciergeView } from "@/components/ConciergeView";
import { TAB_ROUTE_MAP } from "@/lib/routes";
import { NavTab } from "@/components/Navbar";

function ConciergeContent() {
  const router = useRouter();
  const { items, onOpenReview, onAddItem } = useApp();

  const handleNavigate = (tab: NavTab) => {
    const route = TAB_ROUTE_MAP[tab];
    if (route) {
      router.push(route);
    }
  };

  return (
    <ConciergeView
      items={items}
      onNavigateTab={handleNavigate}
      onOpenReviewModal={onOpenReview}
      onAddItem={onAddItem}
    />
  );
}

export default function HomePage() {
  return (
    <AppShell>
      <ConciergeContent />
    </AppShell>
  );
}
