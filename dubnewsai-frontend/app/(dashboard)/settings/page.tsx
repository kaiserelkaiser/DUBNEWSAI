"use client"

import { useEffect } from "react"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"
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
      <div className="space-y-8">
        <PremiumPageHero
          eyebrow="Workspace settings"
          title="Identity, notifications, and control surfaces should feel calm and precise."
          description="Profile identity and live inbox behavior now sit inside the same premium interface as the rest of the product, so settings feel integrated instead of bolted on."
          chips={["Operator identity", "Realtime inbox", "Priority-aware", "Workspace control"]}
          stats={[
            {
              label: "Unread inbox",
              value: `${realtimeNotifications.filter((notification) => !notification.is_read).length}`,
              hint: "Live items waiting for review"
            },
            {
              label: "Notification stream",
              value: `${realtimeNotifications.length}`,
              hint: "Hydrated across API and realtime events"
            },
            {
              label: "Role",
              value: titleCase(user?.role || "user"),
              hint: "Current workspace permission level"
            },
            {
              label: "Workspace mode",
              value: "Live sync",
              hint: "Signals continue to update in the background"
            }
          ]}
          tone="violet"
        />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">Profile</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Operator identity</h2>
            <div className="mt-6 grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
              <ProfileRow label="Name" value={user?.full_name || "Not set"} />
              <ProfileRow label="Email" value={user?.email || "Unknown"} />
              <ProfileRow label="Role" value={titleCase(user?.role || "user")} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="story-kicker">Notifications</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Live inbox</h2>
              </div>
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={markingAllRead}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/76 transition hover:text-white disabled:opacity-60"
              >
                Mark all read
              </button>
            </div>

            {isLoading ? (
              <div className="panel-deep p-6">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-3">
                {realtimeNotifications.map((notification) => (
                  <article key={notification.id} className="panel-premium flex items-start justify-between gap-4 p-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{notification.title}</div>
                      <p className="mt-2 text-sm leading-7 text-white/56">{notification.message}</p>
                      <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/36">
                        {titleCase(notification.priority)} | {formatDateTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read ? (
                      <button
                        type="button"
                        onClick={() => markRead(notification.id)}
                        className="rounded-full border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/35"
                      >
                        Mark read
                      </button>
                    ) : null}
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

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.26em] text-white/38">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  )
}
