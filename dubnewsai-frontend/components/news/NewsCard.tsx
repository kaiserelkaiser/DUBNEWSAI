"use client"

import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { ArrowUpRight, Clock3, Eye, Layers3, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { SentimentBadge } from "./SentimentBadge"
import type { NewsArticle } from "@/types"
import { titleCase } from "@/lib/utils/formatters"

function estimateReadTime(article: NewsArticle) {
  const text = article.content || article.description || article.title
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.ceil(words / 220))
}

export function NewsCard({
  article,
  featured = false
}: {
  article: NewsArticle
  featured?: boolean
}) {
  const readTime = estimateReadTime(article)
  const hasImage = Boolean(article.image_url)

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080b10]/92 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-2xl ${
        featured ? "min-h-[34rem]" : "min-h-[24rem]"
      }`}
    >
      <Link href={`/news/${article.id}`} className="flex h-full flex-col">
        <div className={`relative overflow-hidden ${featured ? "h-80" : hasImage ? "h-52" : "h-32"}`}>
          {hasImage ? (
            <>
              <Image
                src={article.image_url || ""}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,10,0.08),rgba(5,6,10,0.68)_72%,rgba(5,6,10,0.94)_100%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.2),transparent_24%),linear-gradient(135deg,#0b1220,#07090d)]" />
          )}

          <div className="absolute inset-x-5 top-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-white/78 backdrop-blur-md">
              {titleCase(article.category)}
            </span>
            {article.primary_provider ? (
              <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-cyan-100/80">
                {titleCase(article.primary_provider)}
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SentimentBadge sentiment={article.sentiment} score={article.sentiment_score} />
              {article.duplicate_count && article.duplicate_count > 1 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/78 backdrop-blur-md">
                  <Layers3 className="h-3 w-3" />
                  {article.duplicate_count} sources
                </span>
              ) : null}
            </div>
            {article.quality_score !== undefined ? (
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                Quality {Math.round(article.quality_score)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/42">
            <span>{article.source_name || "DUBNEWSAI"}</span>
            <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
          </div>

          <h3 className={`text-balance text-white transition-colors group-hover:text-cyan-100 ${featured ? "text-3xl font-semibold leading-[1.08]" : "text-xl font-semibold leading-[1.18]"}`}>
            {article.title}
          </h3>

          <p className={`mt-4 text-white/58 ${featured ? "line-clamp-4 text-base leading-8" : "line-clamp-3 text-sm leading-7"}`}>
            {article.description || article.content || "No description available for this article yet."}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-white/46">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {readTime} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {article.view_count}
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-white/64 transition group-hover:text-white">
              Read story
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute bottom-5 right-5 opacity-0 transition duration-500 group-hover:opacity-100">
          <Sparkles className="h-4 w-4 text-amber-200/80" />
        </div>
      </Link>
    </motion.article>
  )
}
