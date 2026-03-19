"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect } from "react"

import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAuthStore } from "@/lib/store/authStore"

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { accessToken, hydrated } = useAuthStore()

  useEffect(() => {
    if (hydrated && !accessToken) {
      router.replace("/login")
    }
  }, [accessToken, hydrated, router])

  if (!hydrated || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="panel flex min-w-[280px] flex-col items-center gap-4 p-8">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 dark:text-slate-400">Securing your workspace...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
