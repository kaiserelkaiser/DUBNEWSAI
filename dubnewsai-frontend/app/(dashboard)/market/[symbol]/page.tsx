"use client"

import Link from "next/link"
import { ArrowLeft, Clock3, Layers3, ScanSearch } from "lucide-react"

import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"
import { useMarketSymbol } from "@/lib/hooks/useMarketData"
import { formatCompactCurrency, formatCompactNumber, formatDateTime, titleCase } from "@/lib/utils/formatters"

interface MarketSymbolPageProps {
  params: {
    symbol: string
  }
}

export default function MarketSymbolPage({ params }: MarketSymbolPageProps) {
  const symbol = params.symbol.toUpperCase()
  const { data, isLoading } = useMarketSymbol(symbol)

  if (isLoading) {
    return (
      <div className="panel-deep p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="panel-deep p-8">
        <p className="text-sm text-red-300">Symbol not found.</p>
      </div>
    )
  }

  const positive = data.change >= 0
  const hasLiveData = data.is_live_data !== false

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/market" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/76 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to market
        </Link>
        {!hasLiveData ? (
          <div className="inline-flex rounded-full border border-amber-300/15 bg-amber-300/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.22em] text-amber-200/82">
            Live pricing unavailable
          </div>
        ) : null}
      </div>

      <PremiumPageHero
        eyebrow="Symbol detail"
        title={`${data.symbol} is now framed as a brief, not just a quote.`}
        description={`${data.name}${data.exchange ? ` on ${data.exchange}` : ""} is presented with provider context, quality, confidence, and freshness so the user can judge whether the price is truly live or currently relying on watchlist coverage.`}
        chips={[
          data.exchange || "Exchange pending",
          data.region || "Region pending",
          data.asset_class ? titleCase(data.asset_class) : "Asset unclassified",
          data.primary_provider ? titleCase(data.primary_provider) : "Provider pending"
        ]}
        stats={[
          {
            label: "Current price",
            value: hasLiveData ? formatCompactCurrency(data.price, data.currency || "AED") : "Unavailable",
            hint: hasLiveData ? "Live or latest trusted quote" : "Awaiting upstream live coverage"
          },
          {
            label: "Change",
            value: hasLiveData ? `${data.change_percent.toFixed(2)}%` : "N/A",
            hint: positive ? "Positive session move" : "Negative session move"
          },
          {
            label: "Volume",
            value: formatCompactNumber(data.volume),
            hint: "Most recent volume field from the active feed"
          },
          {
            label: "Quality",
            value: data.data_quality_score !== null && data.data_quality_score !== undefined ? `${Math.round(data.data_quality_score)}%` : "N/A",
            hint: "Provider confidence and completeness"
          }
        ]}
        tone="amber"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Change" value={data.change.toFixed(2)} positive={positive} />
        <MetricCard label="Volume" value={formatCompactNumber(data.volume)} />
        <MetricCard label="Market Cap" value={data.market_cap ? formatCompactNumber(data.market_cap) : "N/A"} />
        <MetricCard label="Updated" value={formatDateTime(data.data_timestamp)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="panel-premium p-6 sm:p-8">
          <p className="story-kicker">Reading the signal</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">This symbol page explains the quote before it asks for trust.</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/58">
            Instead of dropping a bare number into a card, the page shows source context, freshness, confidence, and market classification so the operator can understand what kind of data they are looking at and how much conviction it deserves.
          </p>
        </div>

        <div className="space-y-4">
          <div className="panel-premium p-5">
            <div className="story-kicker">Feed context</div>
            <div className="mt-5 space-y-4 text-sm text-white/72">
              <InfoRow label="Provider" value={data.primary_provider ? titleCase(data.primary_provider) : "N/A"} />
              <InfoRow label="Quality" value={data.data_quality_score !== null && data.data_quality_score !== undefined ? `${Math.round(data.data_quality_score)}%` : "N/A"} />
              <InfoRow label="Confidence" value={data.confidence_level ? titleCase(data.confidence_level) : "N/A"} />
              <InfoRow label="Type" value={data.asset_class ? titleCase(data.asset_class) : "N/A"} />
            </div>
          </div>

          <div className="panel-premium p-5">
            <div className="story-kicker">Operator notes</div>
            <div className="mt-5 space-y-3 text-sm text-white/58">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/68">
                <ScanSearch className="h-3.5 w-3.5 text-cyan-200" />
                Provider-aware quote
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/68">
                <Layers3 className="h-3.5 w-3.5 text-amber-200" />
                Region + asset context
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/68">
                <Clock3 className="h-3.5 w-3.5 text-emerald-200" />
                Freshness visible
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MetricCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <article className="panel-premium p-5">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className={`mt-4 text-2xl font-semibold ${positive === undefined ? "text-white" : positive ? "text-emerald-300" : "text-red-300"}`}>{value}</p>
    </article>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-[0.28em] text-white/38">{label}</span>
      <span className="max-w-[60%] text-right text-sm text-white/82">{value}</span>
    </div>
  )
}

