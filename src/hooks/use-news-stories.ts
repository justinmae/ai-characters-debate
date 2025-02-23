import { useQuery } from '@tanstack/react-query'
import { fetchTopPosts } from '@/lib/reddit'
import { filterStories } from '@/lib/story-filter'
import type { NewsStory, FilteredNewsStory } from '@/types/reddit-types'

export const NEWS_STORIES_QUERY_KEY = ['news-stories'] as const

interface UseNewsStoriesOptions {
  limit?: number
  enabled?: boolean
  filtering?: {
    enabled: boolean
    minRelevanceScore?: number
    maxStories?: number
  }
}

export function useNewsStories({ 
  limit = 20,
  enabled = true,
  filtering = { enabled: true }
}: UseNewsStoriesOptions = {}) {
  return useQuery<FilteredNewsStory[] | NewsStory[], Error>({
    queryKey: [...NEWS_STORIES_QUERY_KEY, limit, filtering],
    queryFn: async () => {
      const stories = await fetchTopPosts(limit)
      if (filtering.enabled) {
        return filterStories(stories, {
          minRelevanceScore: filtering.minRelevanceScore,
          maxStories: filtering.maxStories
        })
      }
      return stories
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  })
} 