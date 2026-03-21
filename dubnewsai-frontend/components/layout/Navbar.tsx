"use client"

import { Bell, LogOut, Sparkles, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"

import { MobileNav } from "@/components/layout/MobileNav"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useAuth } from "@/lib/hooks/useAuth"
import { useWebSocket } from "@/lib/hooks/useWebSocket"

export function Navbar() {
  const { isConnected } = useWebSocket()
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl dark:border-white/10 dark:bg-[#050506]/80">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white text-sm font-black text-slate-950 shadow-[0_12px_40px_-18px_rgba(255,255,255,0.6)]">
              DN
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-[0.14em] text-slate-900 dark:text-white">DUBNEWSAI</div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-white/42">Dubai market intelligence</div>
            </div>
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white/75 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/52 xl:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            Multi-source signal engine
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white/75 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/72 md:flex">
            {isConnected ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
            )}
            <span>{isConnected ? "Realtime connected" : "Realtime offline"}</span>
          </div>

          {isAuthenticated ? (
            <>
              <Link
                href="/settings"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white/75 text-slate-600 transition hover:border-cyan-300/30 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/72 dark:hover:text-white"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <div className="hidden rounded-full border border-slate-200/70 bg-white/75 px-4 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/78 lg:block">
                {user?.full_name || user?.email || "Operator"}
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white/75 text-slate-600 transition hover:border-amber-300/30 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/72 dark:hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/72 transition hover:text-white md:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white/92"
              >
                Get premium
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
