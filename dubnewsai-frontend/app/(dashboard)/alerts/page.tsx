"use client"

import { useState } from "react"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
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
      <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyber-500">Alerts</p>
        <h1 className="text-3xl font-display font-semibold text-slate-950 dark:text-white">Automation & Alerts</h1>
      </div>

      <section className="panel grid gap-4 p-6 lg:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gold-500">Create Alert</p>
          <h2 className="mt-2 text-2xl font-display font-semibold text-slate-950 dark:text-white">Custom trigger</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Build price, keyword, category, and sentiment alerts that map directly to the backend automation engine.
          </p>
        </div>

        <form
          className="grid gap-4"
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
            className="rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-gold-500 dark:bg-slate-950/70"
          />

          <select
            value={alertType}
            onChange={(event) => setAlertType(event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-cyber-500 dark:bg-slate-950/70"
          >
            {alertTypes.map((type) => (
              <option key={type} value={type}>
                {titleCase(type)}
              </option>
            ))}
          </select>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value.toUpperCase())}
              placeholder="Symbol (EMAAR)"
              className="rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 dark:bg-slate-950/70"
            />
            <input
              value={thresholdValue}
              onChange={(event) => setThresholdValue(event.target.value)}
              placeholder="Threshold value"
              className="rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 dark:bg-slate-950/70"
            />
          </div>

          <input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="Keywords (comma separated)"
            className="rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-gold-500 dark:bg-slate-950/70"
          />

          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category (real_estate)"
            className="rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-cyber-500 dark:bg-slate-950/70"
          />

          <button
            type="submit"
            disabled={isCreating}
            className="rounded-2xl bg-gradient-to-r from-gold-500 to-cyber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {isCreating ? "Saving alert..." : "Create alert"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyber-500">Active Rules</p>
          <h2 className="mt-2 text-2xl font-display font-semibold text-slate-950 dark:text-white">Your current alerts</h2>
        </div>

        {isLoading ? (
          <div className="panel p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {alerts?.map((alert) => (
              <article key={alert.id} className="panel space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{alert.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {titleCase(alert.alert_type)} | {titleCase(alert.status)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${alert.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>
                    {alert.is_active ? "Active" : "Paused"}
                  </span>
                </div>

                <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                  <div>Symbol: {alert.symbol || "N/A"}</div>
                  <div>Threshold: {alert.threshold_value ?? "N/A"}</div>
                  <div>Triggers: {alert.trigger_count}</div>
                  <div>Created: {formatDateTime(alert.created_at)}</div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAlert(alert.id)}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-700 transition hover:border-cyber-400 hover:text-cyber-500 dark:text-slate-200"
                  >
                    {alert.is_active ? "Pause" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAlert(alert.id)}
                    className="rounded-2xl border border-red-500/30 px-4 py-2 text-sm text-red-500 transition hover:border-red-400 hover:text-red-400"
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
