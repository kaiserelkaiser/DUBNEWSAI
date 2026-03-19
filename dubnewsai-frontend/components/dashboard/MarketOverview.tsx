"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { CloudSun, Landmark, TrendingDown, TrendingUp } from "lucide-react"

import { useMarketOverview } from "@/lib/hooks/useMarketData"
import { formatCompactCurrency, formatCompactNumber, titleCase } from "@/lib/utils/formatters"
import type { CurrencyRate, EconomicIndicator, MarketStock } from "@/types"

function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${positive ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(2)}%
    </span>
  )
}

function ProviderLabel({ provider, fallback }: { provider?: string | null; fallback?: boolean }) {
  if (fallback) {
    return (
      <span className="rounded-full border border-amber-300/15 bg-amber-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200/82">
        Watchlist fallback
      </span>
    )
  }

  if (!provider) {
    return null
  }

  return (
    <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100/82">
      {titleCase(provider)}
    </span>
  )
}

function SummaryTile({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">{title}</div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-white/46">{caption}</div>
    </div>
  )
}

function BoardRow({ stock }: { stock: MarketStock }) {
  const fallback = stock.is_live_data === false

  return (
    <Link
      href={`/market/${stock.symbol}`}
      className="group grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06] lg:grid-cols-[1.3fr_0.9fr_0.7fr]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-white">{stock.symbol}</span>
          <ProviderLabel provider={stock.primary_provider} fallback={fallback} />
        </div>
        <div className="mt-2 text-sm text-white/58">{stock.name}</div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-white/36">
          {stock.exchange ? <span>{stock.exchange}</span> : null}
          {stock.asset_class ? <span>{titleCase(stock.asset_class)}</span> : null}
          {stock.region ? <span>{stock.region}</span> : null}
        </div>
      </div>

      <div className="space-y-1 text-sm text-white/52">
        {fallback ? (
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-amber-200/82">Awaiting live quote</div>
        ) : (
          <>
            <div className="text-xl font-semibold text-white">{formatCompactCurrency(stock.price, stock.currency || "AED")}</div>
            <div>{formatCompactNumber(stock.volume)} volume</div>
            {stock.market_cap ? <div>{formatCompactNumber(stock.market_cap)} market cap</div> : null}
          </>
        )}
      </div>

      <div className="flex flex-col items-start gap-2 lg:items-end">
        {!fallback ? <ChangeBadge value={stock.change_percent} /> : null}
        {stock.data_quality_score !== undefined && stock.data_quality_score !== null ? (
          <span className="text-xs text-white/40">Quality {stock.data_quality_score.toFixed(0)}%</span>
        ) : null}
      </div>
    </Link>
  )
}

function BoardCard({
  title,
  subtitle,
  stocks
}: {
  title: string
  subtitle: string
  stocks: MarketStock[]
}) {
  return (
    <section className="panel-premium p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-white/42">{title}</div>
          <p className="mt-2 text-sm text-white/56">{subtitle}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/66">{stocks.length} symbols</div>
      </div>

      <div className="space-y-3">
        {stocks.map((stock) => (
          <BoardRow key={stock.symbol} stock={stock} />
        ))}
      </div>
    </section>
  )
}

function StackPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-premium p-5">
      <div className="text-[10px] uppercase tracking-[0.32em] text-white/42">{title}</div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function CurrencyGrid({ currencies }: { currencies: CurrencyRate[] }) {
  return (
    <StackPanel title="FX and currency">
      <div className="grid gap-3 sm:grid-cols-2">
        {currencies.map((currency) => (
          <div key={`${currency.from_currency}-${currency.to_currency}`} className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="text-sm font-semibold text-white">{currency.from_currency}/{currency.to_currency}</div>
            <div className="mt-2 text-sm text-white/56">{formatCompactNumber(currency.rate)}</div>
          </div>
        ))}
      </div>
    </StackPanel>
  )
}

function IndicatorList({ indicators }: { indicators: EconomicIndicator[] }) {
  return (
    <StackPanel title="Macro indicators">
      {indicators.map((indicator) => (
        <div key={indicator.indicator_code} className="flex items-start justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-white">{indicator.indicator_name}</div>
            <div className="mt-1 text-xs text-white/42">{indicator.country} | {indicator.source || "Macro feed"}</div>
          </div>
          <div className="text-right text-sm font-medium text-white">{formatCompactNumber(indicator.value)}</div>
        </div>
      ))}
    </StackPanel>
  )
}

export function MarketOverview() {
  const { data, isLoading } = useMarketOverview()
  const hasFallbackOnly = Boolean(data?.stocks.length) && Boolean(data?.stocks.every((stock) => stock.is_live_data === false))

  if (isLoading) {
    return <div className="panel-premium h-96 animate-pulse bg-white/[0.03]" />
  }

  return (
    <section className="space-y-6">
      <div className="panel-premium relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_22%)]" />
        <div className="relative">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/54">
                <Landmark className="h-3.5 w-3.5 text-cyan-200" />
                Market intelligence board
              </div>
              <h3 className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl">
                UAE boards, global real-estate context, macro pressure, FX, weather, and commodities in one view.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/56 sm:text-base">
                The market page now behaves like a command surface: live boards on the left, context rails on the right, and clear provider visibility when upstream coverage drops.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {data?.market_status?.uae_markets ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/72">
                  UAE {data.market_status.uae_markets}
                </span>
              ) : null}
              {data?.market_status?.us_markets ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/72">
                  US {data.market_status.us_markets}
                </span>
              ) : null}
              {data?.weather ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-100/82">
                  <CloudSun className="h-3.5 w-3.5" />
                  Dubai {data.weather.temperature_c.toFixed(0)}C
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryTile title="Tracked boards" value={`${data?.stocks.length || 0}`} caption="UAE symbols in the active board" />
            <SummaryTile title="Global context" value={`${data?.global_real_estate.length || 0}`} caption="Cross-market real-estate names" />
            <SummaryTile title="FX coverage" value={`${data?.currencies.length || 0}`} caption="AED and major cross pairs" />
            <SummaryTile title="Macro set" value={`${data?.economic_indicators.length || 0}`} caption="Economic indicators feeding context" />
          </div>
        </div>
      </div>

      {hasFallbackOnly ? (
        <div className="rounded-[1.6rem] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-200/82">
          Several local symbols are still in watchlist-fallback mode because an upstream provider is not returning a valid live quote.
        </div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <BoardCard title="UAE market board" subtitle="DFM and ADX coverage for developers, banks, and high-signal names" stocks={data?.stocks || []} />
          <BoardCard title="Global real-estate board" subtitle="REITs and homebuilders for international context" stocks={data?.global_real_estate || []} />
        </div>

        <div className="space-y-6">
          {data?.weather ? (
            <section className="panel-premium overflow-hidden p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.32em] text-white/42">Dubai market weather</div>
                  <div className="mt-3 text-4xl font-semibold text-white">{data.weather.temperature_c.toFixed(1)}C</div>
                  <div className="mt-2 text-sm text-white/56">{data.weather.weather_summary}</div>
                </div>
                <CloudSun className="h-8 w-8 text-amber-200" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <SummaryTile title="Feels like" value={`${data.weather.apparent_temperature_c?.toFixed(1) ?? "--"}C`} caption="Perceived temperature" />
                <SummaryTile title="Humidity" value={`${data.weather.humidity_percent ?? "--"}%`} caption="Current moisture" />
                <SummaryTile title="Wind" value={`${data.weather.wind_speed_kph?.toFixed(1) ?? "--"} km/h`} caption="Surface conditions" />
              </div>
            </section>
          ) : null}

          <StackPanel title="Indices">
            {(data?.indices || []).map((index) => (
              <div key={index.symbol} className="flex items-start justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-white">{index.symbol}</div>
                  <div className="mt-1 text-xs text-white/42">{index.name}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm font-medium text-white">{formatCompactCurrency(index.price, index.currency || "USD")}</div>
                  <ChangeBadge value={index.change_percent} />
                </div>
              </div>
            ))}
          </StackPanel>

          <CurrencyGrid currencies={data?.currencies || []} />
          <IndicatorList indicators={data?.economic_indicators || []} />

          <StackPanel title="Commodities">
            {(data?.commodities || []).length ? (
              (data?.commodities || []).map((commodity) => (
                <div key={commodity.symbol} className="flex items-start justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{commodity.name}</div>
                    <div className="mt-1 text-xs text-white/42">{commodity.symbol}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-sm font-medium text-white">{formatCompactCurrency(commodity.price, commodity.currency || "USD")}</div>
                    <ChangeBadge value={commodity.change_percent} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/56">
                Commodity feeds are configured, but no current rows were returned by the active providers.
              </div>
            )}
          </StackPanel>

          <StackPanel title="Coverage snapshot">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile title="Stored equities" value={`${(data?.stocks.length || 0) + (data?.global_real_estate.length || 0)}`} caption="Tracked across UAE and global boards" />
              <SummaryTile title="Macro + FX" value={`${(data?.economic_indicators.length || 0) + (data?.currencies.length || 0)}`} caption="Context modules active" />
            </div>
          </StackPanel>
        </div>
      </div>
    </section>
  )
}
