"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <>
      <div className="noise-overlay" />
      <div className="ambient-layer" />

      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          {/* Brand mark */}
          <div
            className="w-12 h-12"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-cream), var(--accent-glow))",
              mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E\") no-repeat center",
              maskSize: "contain",
              WebkitMask:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E\") no-repeat center",
              WebkitMaskSize: "contain",
            }}
          />

          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">
              Content Manager
            </h1>
            <p className="text-text-secondary text-sm">
              Your personal social media command center
            </p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.08] text-text-primary px-6 py-3 rounded-xl font-medium text-[14px] cursor-pointer transition-all duration-200 hover:bg-white/[0.1] hover:border-white/[0.12] hover:-translate-y-px"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  );
}
