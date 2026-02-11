"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(20, 16, 26, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "#fff",
            backdropFilter: "blur(10px)",
          },
        }}
      />
    </SessionProvider>
  );
}
