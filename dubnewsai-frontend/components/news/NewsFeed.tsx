"use client"

import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { ArrowRight, Layers3, Newspaper, Sparkles } from "lucide-react"
import Link from "next/link"

import { NewsCard } from "@/components/news/NewsCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useNews } from "@/lib/hooks/useNews"

export function NewsFeed({
  pageSize = 8,
  showBrowseLink = true
}: {
  pageSize?: number
  showBrowseLink?: boolean
}) {
  const { data, isLoading, isError } = useNews({ page: 1, page_size: pageSize })

  if (isLoading) {
    return (
      <section className="panel-deep p-8">
        <LoadingSpinner />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="panel-deep p-8">
        <p className="text-sm text-red-300">Unable to load the latest news right now.</p>
      </section>
    )
  }

  const articles = data?.articles || []
  const [featured, ...remaining] = articles
  const railStories = remaining.slice(0, 4)
  const gridStories = remaining.slice(4)

  return (
    <section className="space-y-8">
      <div className="panel-premium relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_22%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/56">
              <Newspaper className="h-3.5 w-3.5 text-cyan-200" />
              Multi-source editorial stream
            </div>
            <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
              The feed now behaves like a publication front, not a generic news grid.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
              Lead story, secondary rail, deduped provider coverage, and richer metadata so users can evaluate importance before they click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/72">
              {data?.total || 0} indexed stories
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/72">
              {articles.filter((article) => (article.duplicate_count || 0) > 1).length} cross-source matches
            </div>
            {showBrowseLink ? (
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white/92"
              >
                Browse full feed
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {featured ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <NewsCard article={featured} featured />

          <div className="panel-premium overflow-hidden p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/42">Fast reads</p>
                <h3 className="mt-2 text-xl font-semibold text-white">What is moving now</h3>
              </div>
              <Sparkles className="h-4 w-4 text-amber-200/80" />
            </div>

            <div className="space-y-3">
              {railStories.map((article) => (
                <motion.div key={article.id} whileHover={{ x: 6 }} transition={{ duration: 0.2 }}>
                  <Link
                    href={`/news/${article.id}`}
                    className="group block rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                          {article.source_name || article.primary_provider || "Signal"}
                        </div>
                        <h4 className="mt-2 text-base font-semibold leading-6 text-white/92 group-hover:text-cyan-100">
                          {article.title}
                        </h4>
                      </div>
                      {article.duplicate_count && article.duplicate_count > 1 ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/56">
                          <Layers3 className="h-3 w-3" />
                          {article.duplicate_count}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 text-xs text-white/42">
                      {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {gridStories.length ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {gridStories.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: index * 0.04 }}
            >
              <NewsCard article={article} />
            </motion.div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
