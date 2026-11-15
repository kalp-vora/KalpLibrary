"use client";

import { AppShell, useApp } from "@/components/AppShell";
import { BookshelfView } from "@/components/BookshelfView";

function JourneyContent() {
  const { items, onOpenReview, onOpenDetail } = useApp();

  return (
    <BookshelfView
      items={items}
      onOpenReview={onOpenReview}
      onOpenDetail={onOpenDetail}
    />
  );
}

export default function JourneyPage() {
  return (
    <AppShell>
      <JourneyContent />
    </AppShell>
  );
}
