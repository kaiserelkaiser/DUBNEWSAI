import type { ReactNode } from "react"

import { DashboardFeatureShell } from "@/components/layout/DashboardFeatureShell"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { WebSocketProvider } from "@/lib/hooks/useWebSocket"

export default function DashboardLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <WebSocketProvider>
      <div className="min-h-screen overflow-x-clip bg-[#050506] text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]" />
        <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:72px_72px]" />
        <Navbar />
        <div className="relative flex min-h-[calc(100vh-5rem)] min-w-0">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-x-hidden lg:ml-[18.5rem]">
            <div className="mx-auto min-w-0 max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
              <DashboardFeatureShell>{children}</DashboardFeatureShell>
            </div>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  )
}
