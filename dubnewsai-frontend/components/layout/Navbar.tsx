"use client"

import { Bell, LogOut, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"

import { MobileNav } from "@/components/layout/MobileNav"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useAuth } from "@/lib/hooks/useAuth"
import { useWebSocket } from "@/lib/hooks/useWebSocket"

export function Navbar() {
  const { isConnected } = useWebSocket()
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-950/80">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 via-gold-400 to-cyber-500 text-sm font-black text-slate-950 shadow-gold">
              DN
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xl font-bold text-gradient-gold">DUBNEWSAI</div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Market Intelligence</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-300 md:flex">
            {isConnected ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
            )}
            <span>{isConnected ? "Live connected" : "Realtime offline"}</span>
          </div>
          {isAuthenticated ? (
            <>
              <Link
                href="/settings"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/70 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <div className="hidden rounded-full border border-white/10 bg-white/70 px-4 py-2 text-sm text-slate-700 dark:bg-slate-900/80 dark:text-slate-200 md:block">
                {user?.full_name || user?.email || "Operator"}
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/70 text-slate-700 transition hover:border-gold-400 hover:text-gold-500 dark:bg-slate-900/80 dark:text-slate-200"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-white/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyber-400 hover:text-cyber-500 dark:bg-slate-900/80 dark:text-slate-200 md:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-full bg-gradient-to-r from-gold-500 to-cyber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
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
