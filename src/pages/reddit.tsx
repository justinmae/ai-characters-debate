import { useNewsStories } from "@/hooks/use-news-stories"
import { StoriesList } from "@/components/stories-list"
import { Loader2 } from "lucide-react"

export default function RedditPage() {
  const { data: stories, isLoading, error } = useNewsStories()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-destructive">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="container py-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Top Stories</h1>
      {stories && <StoriesList stories={stories} />}
    </div>
  )
} 