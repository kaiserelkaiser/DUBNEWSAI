"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect } from "react"

import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAuthStore } from "@/lib/store/authStore"

export function PublicOnly({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { accessToken, hydrated } = useAuthStore()

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/dashboard")
    }
  }, [accessToken, hydrated, router])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (accessToken) {
    return null
  }

  return <>{children}</>
}
