"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import type { MarketStock } from "@/types"

export function useMarketData(limit = 12) {
  return useQuery<MarketStock[]>({
    queryKey: ["market", "stocks", limit],
    queryFn: async () => {
      const { data } = await apiClient.get<MarketStock[]>("/market/stocks", { params: { limit } })
      return data
    }
  })
}

export function useMarketSymbol(symbol: string) {
  return useQuery<MarketStock>({
    queryKey: ["market", "symbol", symbol],
    queryFn: async () => {
      const { data } = await apiClient.get<MarketStock>(`/market/symbol/${symbol}`)
      return data
    },
    enabled: Boolean(symbol)
  })
}
