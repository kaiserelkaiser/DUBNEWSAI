"use client"

import { motion } from "framer-motion"
import { Clock, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

import { SentimentBadge } from "./SentimentBadge"
import type { NewsArticle } from "@/types"
import { titleCase } from "@/lib/utils/formatters"

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow-xl shadow-slate-950/5 card-hover dark:bg-slate-900"
    >
      <Link href={`/news/${article.id}`}>
        {article.image_url ? (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-gold-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                {titleCase(article.category)}
              </span>
            </div>
            <div className="absolute right-3 top-3">
              <SentimentBadge sentiment={article.sentiment} score={article.sentiment_score} />
            </div>
          </div>
        ) : null}

        <div className="p-6">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-400">
            {article.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {article.description || "No description available for this article yet."}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.view_count}
              </span>
            </div>
            <span className="font-medium text-cyber-600 dark:text-cyber-400">
              {article.source_name || "DUBNEWSAI"}
            </span>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-gold-500/0 transition-all duration-300 group-hover:ring-gold-500/40" />
      </Link>
    </motion.div>
  )
}
