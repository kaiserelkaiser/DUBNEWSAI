"use client"

import { Crown, Radar, ShieldAlert, Sparkles, Target, TrendingUp } from "lucide-react"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { EmptyStatePanel } from "@/components/shared/EmptyStatePanel"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"
import { useExecutiveDashboard } from "@/lib/hooks/useEnterprise"
import { formatCompactCurrency, titleCase } from "@/lib/utils/formatters"

export default function ExecutivePage() {
  const { data } = useExecutiveDashboard()

  return (
    <AuthGuard>
      <div className="space-y-8">
        <PremiumPageHero
          eyebrow="Executive command"
          title="Turn platform activity into a board-level brief with risks, priorities, and growth angles already connected."
          description={data?.market_overview.headline || "The executive layer condenses the market graph, portfolio posture, competitive tension, and strategic priorities into one C-suite narrative."}
          chips={["Board summary", "Strategic priorities", "Risk dashboard", "Opportunity pipeline"]}
          stats={[
            { label: "Market health", value: `${data?.kpis.market_health_score ?? 0}`, hint: "Composite health score from the executive layer" },
            { label: "Portfolio return", value: `${data?.kpis.portfolio_performance.return_percent ?? 0}%`, hint: "Average tracked portfolio performance" },
            { label: "Competitive wins", value: `${data?.kpis.competitive_position.competitive_wins ?? 0}`, hint: "Reported in the command KPI stack" },
            { label: "Risk posture", value: titleCase(data?.risk_dashboard.overall_risk_rating || "pending"), hint: "Overall strategic risk rating" }
          ]}
          tone="amber"
        />

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">Executive summary</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">What leadership should know first</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(data?.summary.key_points || []).length ? (
                (data?.summary.key_points || []).map((point) => (
                  <div key={`${point.category}-${point.message}`} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">{point.category}</div>
                    <div className="mt-3 text-lg font-semibold text-white">{titleCase(point.status)}</div>
                    <p className="mt-3 text-sm leading-7 text-white/58">{point.message}</p>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2">
                  <EmptyStatePanel
                    title="Executive highlights will appear here."
                    description="As the executive layer gathers enough strategy, portfolio, and market context, it will summarize what leadership should care about first."
                  />
                </div>
              )}
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">Action items</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(data?.summary.action_items || []).length ? (
                  (data?.summary.action_items || []).map((item) => (
                    <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/62">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-white/48">Action items will populate once the summary engine has enough signal.</span>
                )}
              </div>
            </div>
          </article>

          <article className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">KPI tower</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Top-line strategic metrics</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <KpiTile label="Total return" value={formatCompactCurrency(data?.kpis.portfolio_performance.total_return || 0, "AED")} icon={TrendingUp} />
              <KpiTile label="Vs benchmark" value={`${data?.kpis.portfolio_performance.vs_benchmark ?? 0}%`} icon={Target} />
              <KpiTile label="Uptime" value={`${data?.kpis.operational_metrics.system_uptime ?? 0}%`} icon={Radar} />
              <KpiTile label="Risk level" value={titleCase(data?.kpis.risk_metrics.overall_risk_level || "medium")} icon={ShieldAlert} />
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
          <article className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">Strategic priorities</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">What leadership should push next</h2>
            <div className="mt-6 space-y-4">
              {(data?.strategic_priorities || []).length ? (
                (data?.strategic_priorities || []).map((item) => (
                  <div key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/58">P{item.priority}</div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/58">{item.rationale}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.key_actions.map((action) => (
                        <span key={action} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyStatePanel
                  title="Strategic priorities are still being assembled."
                  description="This panel will populate with ranked priorities once the executive service has enough portfolio, market, and competitive context."
                />
              )}
            </div>
          </article>

          <article className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">Risk dashboard</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">What could damage execution if ignored</h2>
            <div className="mt-6 space-y-4">
              {(data?.risk_dashboard.top_risks || []).length ? (
                (data?.risk_dashboard.top_risks || []).map((risk) => (
                  <div key={risk.category} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/38">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-200" />
                      {risk.severity}
                    </div>
                    <div className="mt-3 text-sm font-medium text-white">{risk.category}</div>
                    <p className="mt-2 text-sm leading-7 text-white/58">{risk.description}</p>
                    <div className="mt-4 grid gap-2 text-xs text-white/44">
                      <div>Probability: {risk.probability}</div>
                      <div>Impact: {risk.impact}</div>
                      <div>Owner: {risk.owner}</div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyStatePanel
                  title="No major executive risks are listed yet."
                  description="Once strategic risks are identified, this panel becomes the top-level risk dashboard instead of leaving empty space."
                />
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <article className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">Competitive landscape</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Leadership view of the playing field</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(data?.competitive_landscape.market_leaders || []).length ? (
                (data?.competitive_landscape.market_leaders || []).map((leader) => (
                  <div key={leader.name} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-sm font-medium text-white">{leader.name}</div>
                    <div className="mt-3 flex items-center justify-between gap-4 text-sm text-white/58">
                      <span>{leader.market_share ?? 0}% share</span>
                      <span>{titleCase(leader.threat_level)}</span>
                    </div>
                    <div className="mt-2 text-xs text-white/40">{leader.recent_activity}</div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2">
                  <EmptyStatePanel
                    title="Competitive landscape is still loading."
                    description="Market leaders and threat posture will appear here once competitive coverage is active for the current workspace."
                  />
                </div>
              )}
            </div>
          </article>

          <article className="panel-premium p-6 sm:p-8">
            <p className="story-kicker">Opportunity pipeline</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Where growth can be unlocked</h2>
            <div className="mt-6 space-y-4">
              {(data?.opportunity_pipeline || []).length ? (
                (data?.opportunity_pipeline || []).map((item) => (
                  <div key={item.opportunity} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/38">
                      <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                      {item.category}
                    </div>
                    <div className="mt-3 text-sm font-medium text-white">{item.opportunity}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{item.potential_value}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.key_requirements.map((requirement) => (
                        <span key={requirement} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                          {requirement}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyStatePanel
                  title="No executive opportunities are listed yet."
                  description="This pipeline will populate once the strategy layer has enough growth, partnership, and market expansion signal."
                />
              )}
            </div>
          </article>
        </section>
      </div>
    </AuthGuard>
  )
}

function KpiTile({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Crown }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/38">
        <Icon className="h-3.5 w-3.5 text-amber-200" />
        {label}
      </div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
    </div>
  )
}
