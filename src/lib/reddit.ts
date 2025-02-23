import type { RedditApiResponse, NewsStory } from '@/types/reddit-types'

const REDDIT_API_BASE = 'https://www.reddit.com'

export class RedditApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'RedditApiError'
  }
}

export async function fetchTopPosts(limit = 20): Promise<NewsStory[]> {
  try {
    const response = await fetch(
      `${REDDIT_API_BASE}/r/popular.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'ai-news-discussion-bot/1.0.0'
        }
      }
    )

    if (!response.ok) {
      throw new RedditApiError('Failed to fetch from Reddit API', response.status)
    }

    const data: RedditApiResponse = await response.json()

    return data.data.children.map(child => ({
      id: child.data.id,
      title: child.data.title,
      summary: child.data.selftext,
      url: child.data.url,
      author: child.data.author,
      score: child.data.score,
      timestamp: new Date(child.data.created_utc * 1000),
      commentCount: child.data.num_comments,
      subreddit: child.data.subreddit,
      redditUrl: `${REDDIT_API_BASE}${child.data.permalink}`,
      isNsfw: child.data.over_18
    }))
  } catch (error) {
    if (error instanceof RedditApiError) {
      throw error
    }
    throw new RedditApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
} 