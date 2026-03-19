"use client"

import { useEffect } from "react"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAuth } from "@/lib/hooks/useAuth"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { useNotificationStore } from "@/lib/store/notificationStore"
import { formatDateTime, titleCase } from "@/lib/utils/formatters"

export default function SettingsPage() {
  const { user } = useAuth()
  const { data: notifications, isLoading, markRead, markAllRead, markingAllRead } = useNotifications()
  const realtimeNotifications = useNotificationStore((state) => state.items)
  const hydrateNotifications = useNotificationStore((state) => state.hydrate)

  useEffect(() => {
    if (notifications?.length) {
      hydrateNotifications(notifications)
    }
  }, [hydrateNotifications, notifications])

  return (
    <AuthGuard>
      <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyber-500">Settings</p>
        <h1 className="text-3xl font-display font-semibold text-slate-950 dark:text-white">Workspace Settings</h1>
      </div>

      <section className="panel grid gap-6 p-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gold-500">Profile</p>
            <h2 className="mt-2 text-2xl font-display font-semibold text-slate-950 dark:text-white">Operator identity</h2>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/5 p-5 dark:bg-white/5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</div>
              <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{user?.full_name || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</div>
              <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{user?.email || "Unknown"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</div>
              <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{titleCase(user?.role || "user")}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-500">Notifications</p>
              <h2 className="mt-2 text-2xl font-display font-semibold text-slate-950 dark:text-white">Live inbox</h2>
            </div>
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={markingAllRead}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-700 transition hover:border-gold-400 hover:text-gold-500 disabled:opacity-60 dark:text-slate-200"
            >
              Mark all read
            </button>
          </div>

          {isLoading ? (
            <div className="panel p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {realtimeNotifications.map((notification) => (
                <article key={notification.id} className="panel flex items-start justify-between gap-4 p-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">{notification.title}</div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {titleCase(notification.priority)} | {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className="rounded-2xl border border-cyber-500/20 px-3 py-2 text-xs font-medium text-cyber-500 transition hover:border-cyber-400 hover:text-cyber-400"
                    >
                      Mark read
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
    </AuthGuard>
  )
}
