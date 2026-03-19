import { NewsFeed } from "@/components/news/NewsFeed"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"

export default function NewsPage() {
  return (
    <div className="space-y-8">
      <PremiumPageHero
        eyebrow="News command"
        title="Every market signal deserves a front page, not a feed dump."
        description="Cross-provider Dubai, UAE, market, and property coverage is now framed as an editorial surface with stronger reading hierarchy, source visibility, and full on-platform context before the user ever leaves DUBNEWSAI."
        chips={["Full article detail", "Source provenance", "Cross-source matches", "Readable metadata"]}
        stats={[
          {
            label: "Story behavior",
            value: "Editorial front",
            hint: "Lead story, secondary rails, and deeper browse flow"
          },
          {
            label: "Reading mode",
            value: "On-platform first",
            hint: "Users understand the story before opening the source"
          },
          {
            label: "Coverage depth",
            value: "Dubai + UAE + market",
            hint: "Built for property and capital-market context"
          },
          {
            label: "Design tone",
            value: "Luxe newsroom",
            hint: "Sharper typography, motion, and deliberate spacing"
          }
        ]}
        tone="cyan"
      />

      <NewsFeed pageSize={18} showBrowseLink={false} />
    </div>
  )
}
