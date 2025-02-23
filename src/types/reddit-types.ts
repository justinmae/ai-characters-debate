export interface RedditPost {
  id: string
  title: string
  selftext: string
  url: string
  author: string
  score: number
  created_utc: number
  num_comments: number
  subreddit: string
  permalink: string
  over_18: boolean
}

export interface RedditApiResponse {
  kind: string
  data: {
    children: Array<{
      kind: string
      data: RedditPost
    }>
    after: string | null
    before: string | null
  }
}

export interface NewsStory {
  id: string
  title: string
  summary: string
  url: string
  author: string
  score: number
  timestamp: Date
  commentCount: number
  subreddit: string
  redditUrl: string
  isNsfw: boolean
}

export interface FilteredNewsStory extends NewsStory {
  relevanceScore: number
  topics: string[]
  isRelevant: boolean
}

export type StoryTopic = 'technology' | 'politics' | 'business' | 'science' | 'health' | 'entertainment' | 'sports' | 'other'

export interface StoryRelevanceScore {
  score: number
  topics: StoryTopic[]
  explanation: string
} 