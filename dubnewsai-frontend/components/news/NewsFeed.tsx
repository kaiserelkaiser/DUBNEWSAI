"use client"

import { Newspaper } from "lucide-react"

import { NewsCard } from "@/components/news/NewsCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useNews } from "@/lib/hooks/useNews"

export function NewsFeed() {
  const { data, isLoading, isError } = useNews({ page: 1, page_size: 6 })

  if (isLoading) {
    return (
      <section className="panel p-6">
        <LoadingSpinner />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="panel p-6">
        <p className="text-sm text-red-500">Unable to load the latest news right now.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-cyber-500">
            <Newspaper className="h-4 w-4" />
            Live Feed
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-950 dark:text-white">
            Intelligence Stream
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data?.articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
