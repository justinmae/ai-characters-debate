import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, MessageSquare, ExternalLink, Star } from "lucide-react"
import type { NewsStory, FilteredNewsStory } from "@/types/reddit-types"
import { useNewsStories } from "@/hooks/useNewsStories"

function isFilteredStory(story: NewsStory): story is FilteredNewsStory {
  return 'relevanceScore' in story
}

interface StoriesListProps {
  stories: (NewsStory | FilteredNewsStory)[]
}

export function StoriesList({ stories }: StoriesListProps) {
  const { data: filteredStories } = useNewsStories({
    filtering: {
      enabled: true,
      minRelevanceScore: 7,
      maxStories: 5
    }
  })

  return (
    <ScrollArea className="h-[calc(100vh-2rem)] pr-4">
      <div className="space-y-4">
        {filteredStories?.map((story) => (
          <Card key={story.id} className="hover:bg-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-start gap-2 group"
                >
                  {story.title}
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {story.summary && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {story.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowUpIcon className="h-4 w-4" />
                  {story.score.toLocaleString()}
                </span>

                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {story.commentCount.toLocaleString()}
                </span>

                {isFilteredStory(story) && (
                  <>
                    <span className="flex items-center gap-1" title="Relevance Score">
                      <Star className="h-4 w-4" />
                      {story.relevanceScore.toFixed(1)}
                    </span>
                    <div className="flex gap-1">
                      {story.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

                <a
                  href={story.redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  r/{story.subreddit}
                </a>

                <span>by {story.author}</span>

                <time dateTime={story.timestamp.toISOString()}>
                  {new Intl.RelativeTimeFormat().format(
                    Math.ceil((story.timestamp.getTime() - Date.now()) / (1000 * 60 * 60)),
                    'hours'
                  )}
                </time>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
} 