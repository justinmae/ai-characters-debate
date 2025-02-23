import { useQuery } from '@tanstack/react-query'
import { fetchTopPosts } from '@/lib/reddit'
import type { NewsStory } from '@/types/reddit-types'

export const NEWS_STORIES_QUERY_KEY = ['news-stories'] as const

interface UseNewsStoriesOptions {
  limit?: number
  enabled?: boolean
}

export function useNewsStories({ 
  limit = 20,
  enabled = true 
}: UseNewsStoriesOptions = {}) {
  return useQuery<NewsStory[], Error>({
    queryKey: [...NEWS_STORIES_QUERY_KEY, limit],
    queryFn: () => fetchTopPosts(limit),
    enabled,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  })
} 