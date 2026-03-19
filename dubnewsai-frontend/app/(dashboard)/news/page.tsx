import { NewsFeed } from "@/components/news/NewsFeed"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"

export default function NewsPage() {
  return (
    <div className="space-y-8">
      <PremiumPageHero
        eyebrow="News command"
        title="See what Dubai is talking about, and why it matters."
        description="Read deduped Dubai, UAE, property, and market coverage with source provenance, cross-source confirmation, and full on-platform context before you open the original publisher."
        chips={["Full article detail", "Source provenance", "Cross-source matches", "Readable metadata"]}
        stats={[
          {
            label: "Coverage",
            value: "Dubai + UAE + markets",
            hint: "A feed built around the topics this platform is made to watch"
          },
          {
            label: "Reading mode",
            value: "On-platform first",
            hint: "Understand the story before deciding whether to leave"
          },
          {
            label: "Source trust",
            value: "Multi-provider",
            hint: "Duplicates and provenance help separate noise from signal"
          },
          {
            label: "Reading flow",
            value: "Headline to detail",
            hint: "Move from scan mode into full story mode without friction"
          }
        ]}
        tone="cyan"
      />

      <NewsFeed pageSize={15} showBrowseLink={false} />
    </div>
  )
}
