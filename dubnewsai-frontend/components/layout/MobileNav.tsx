"use client"

import { AnimatePresence, motion } from "framer-motion"
import { LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { ReactNode } from "react"

import { useAuth } from "@/lib/hooks/useAuth"
import { routes } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="rounded-full border border-white/10 bg-white/70 p-2 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="container mx-auto p-6">
              <div className="mb-10 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-gradient-gold">DUBNEWSAI</h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-300">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-3">
                {routes.map((route) => (
                  <MobileNavLink
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </MobileNavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2 rounded-2xl border border-red-500/30 px-4 py-4 text-left text-lg font-medium text-red-400 transition hover:border-red-400/50 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileNavLink({
  href,
  children,
  onClick
}: {
  href: string
  children: ReactNode
  onClick: () => void
}) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-2xl border px-4 py-4 text-lg font-medium transition-colors",
        pathname === href
          ? "border-gold-400/40 bg-gold-500/10 text-gold-300"
          : "border-white/10 text-slate-300 hover:border-cyber-400/30 hover:text-cyber-300"
      )}
    >
      {children}
    </Link>
  )
}
