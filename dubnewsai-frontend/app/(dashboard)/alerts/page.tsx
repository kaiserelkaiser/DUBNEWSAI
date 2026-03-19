"use client"

import { useState } from "react"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"
import { useAlerts } from "@/lib/hooks/useAlerts"
import { formatDateTime, titleCase } from "@/lib/utils/formatters"

const alertTypes = [
  "price_above",
  "price_below",
  "keyword_match",
  "sentiment_threshold",
  "new_article_category"
]

export default function AlertsPage() {
  const { data: alerts, isLoading, createAlert, deleteAlert, toggleAlert, isCreating } = useAlerts()
  const [name, setName] = useState("")
  const [alertType, setAlertType] = useState("keyword_match")
  const [symbol, setSymbol] = useState("")
  const [thresholdValue, setThresholdValue] = useState("")
  const [keywords, setKeywords] = useState("")
  const [category, setCategory] = useState("real_estate")

  return (
    <AuthGuard>
      <div className="space-y-8">
        <PremiumPageHero
          eyebrow="Alert engine"
          title="Alerts should feel like a private operator desk, not a settings form."
          description="Price, keyword, category, and sentiment triggers are now framed as a serious control surface with clearer hierarchy, stronger visual confidence, and better scanability while creating rules."
          chips={["Price triggers", "Keyword watch", "Category alerts", "Sentiment rules"]}
          stats={[
            {
              label: "Alert types",
              value: `${alertTypes.length}`,
              hint: "Price, story, and sentiment workflows ready to configure"
            },
            {
              label: "Active rules",
              value: `${alerts?.filter((alert) => alert.is_active).length ?? 0}`,
              hint: "Currently running in the automation layer"
            },
            {
              label: "Paused rules",
              value: `${alerts?.filter((alert) => !alert.is_active).length ?? 0}`,
              hint: "Saved rules waiting to be resumed"
            },
            {
              label: "Workflow",
              value: "Instant delivery",
              hint: "Built for near real-time operator response"
            }
          ]}
          tone="rose"
        />

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">Create rule</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Compose a new alert</h2>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Build price, keyword, category, and sentiment alerts that map directly to the backend automation engine.
            </p>
          </div>

          <form
            className="panel-premium grid gap-4 p-6 sm:p-8"
            onSubmit={async (event) => {
              event.preventDefault()
              await createAlert({
                name,
                alert_type: alertType,
                symbol: symbol || undefined,
                threshold_value: thresholdValue ? Number(thresholdValue) : undefined,
                keywords: keywords
                  ? keywords
                      .split(",")
                      .map((keyword) => keyword.trim())
                      .filter(Boolean)
                  : undefined,
                category: category || undefined,
                frequency: "instant",
                notification_enabled: true
              })

              setName("")
              setSymbol("")
              setThresholdValue("")
              setKeywords("")
            }}
          >
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alert name"
              className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/30"
            />

            <select
              value={alertType}
              onChange={(event) => setAlertType(event.target.value)}
              className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
            >
              {alertTypes.map((type) => (
                <option key={type} value={type} className="bg-slate-950">
                  {titleCase(type)}
                </option>
              ))}
            </select>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={symbol}
                onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                placeholder="Symbol (EMAAR)"
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/30"
              />
              <input
                value={thresholdValue}
                onChange={(event) => setThresholdValue(event.target.value)}
                placeholder="Threshold value"
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/30"
              />
            </div>

            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Keywords (comma separated)"
              className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/30"
            />

            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Category (real_estate)"
              className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/30"
            />

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/92 disabled:opacity-60"
            >
              {isCreating ? "Saving alert..." : "Create alert"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div>
            <p className="story-kicker">Active rules</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Your current automation layer</h2>
          </div>

          {isLoading ? (
            <div className="panel-deep p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {alerts?.map((alert) => (
                <article key={alert.id} className="panel-premium space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{alert.name}</h3>
                      <p className="mt-1 text-sm text-white/48">
                        {titleCase(alert.alert_type)} | {titleCase(alert.status)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${alert.is_active ? "bg-emerald-500/10 text-emerald-300" : "bg-white/10 text-white/62"}`}>
                      {alert.is_active ? "Active" : "Paused"}
                    </span>
                  </div>

                  <div className="grid gap-3 text-sm text-white/64 md:grid-cols-2">
                    <div>Symbol: {alert.symbol || "N/A"}</div>
                    <div>Threshold: {alert.threshold_value ?? "N/A"}</div>
                    <div>Triggers: {alert.trigger_count}</div>
                    <div>Created: {formatDateTime(alert.created_at)}</div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => toggleAlert(alert.id)}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/78 transition hover:text-white"
                    >
                      {alert.is_active ? "Pause" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAlert(alert.id)}
                      className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:border-red-400/50 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AuthGuard>
  )
}
