"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import type { NewsArticle, NewsListResponse } from "@/types"

export function useNews(filters?: Record<string, string | number | undefined>) {
  return useQuery<NewsListResponse>({
    queryKey: ["news", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<NewsListResponse>("/news/", { params: filters })
      return data
    }
  })
}

export function useNewsDetail(id: number) {
  return useQuery<NewsArticle>({
    queryKey: ["news", id],
    queryFn: async () => {
      const { data } = await apiClient.get<NewsArticle>(`/news/${id}`)
      return data
    },
    enabled: Boolean(id)
  })
}
