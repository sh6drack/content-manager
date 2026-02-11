"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NavRail, type NavSection } from "@/components/nav-rail";
import { Sidebar } from "@/components/sidebar";
import { ComposeModal } from "@/components/compose-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCompose, setShowCompose] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const activeNav = pathname.startsWith("/analytics")
    ? "analytics"
    : pathname.startsWith("/media")
      ? "media"
      : pathname.startsWith("/settings")
        ? "settings"
        : "calendar";

  function handleNavChange(id: string) {
    if (id === "compose") {
      setShowCompose(true);
    } else if (id === "calendar") {
      router.push("/");
    } else {
      router.push(`/${id}`);
    }
  }

  return (
    <>
      <div className="noise-overlay" />
      <div className="ambient-layer" />

      <div className="grid grid-cols-[64px_240px_1fr] w-full h-screen">
        <NavRail
          active={activeNav as NavSection}
          onChange={handleNavChange}
        />
        <Sidebar />
        <main className="flex flex-col h-full overflow-hidden">{children}</main>
      </div>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
    </>
  );
}
