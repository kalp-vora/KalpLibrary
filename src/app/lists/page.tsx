"use client";

import { useRouter } from "next/navigation";
import { AppShell, useApp } from "@/components/AppShell";
import { QueueListView } from "@/components/QueueListView";

function ListsContent() {
  const router = useRouter();
  const {
    items,
    onMarkFinished,
    onStatusChange,
    onDeleteItem,
    onOpenDetail
  } = useApp();

  return (
    <QueueListView
      items={items}
      onMarkFinished={onMarkFinished}
      onStatusChange={onStatusChange}
      onDeleteItem={onDeleteItem}
      onOpenDetail={onOpenDetail}
      onNavigateToLibrary={() => router.push("/library")}
      onNavigateToTheatre={() => router.push("/theater")}
    />
  );
}

export default function ListsPage() {
  return (
    <AppShell>
      <ListsContent />
    </AppShell>
  );
}
