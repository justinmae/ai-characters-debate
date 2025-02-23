import { writeFileSync } from 'fs'
import path from 'path'
import { fetchTopPosts } from '../lib/reddit'
import { filterStories } from '../lib/story-filter'

async function populateNewsDatabase() {
  try {
    console.log('Fetching stories from Reddit...')
    const stories = await fetchTopPosts(30)
    
    console.log('Filtering and analyzing stories...')
    const filteredStories = await filterStories(stories, {
      minRelevanceScore: 7,
      maxStories: 10
    })

    const csvRows = filteredStories.map(story => {
      return `"${story.title.replace(/"/g, '""')}","${(story.summary || 'No summary available').replace(/"/g, '""')}"`
    })

    const csvContent = ['"title","content"', ...csvRows].join('\n')
    const filePath = path.join(process.cwd(), 'news_database.csv')
    
    writeFileSync(filePath, csvContent, 'utf-8')
    console.log(`Successfully wrote ${filteredStories.length} stories to news_database.csv`)
  } catch (error) {
    console.error('Failed to populate news database:', error)
    process.exit(1)
  }
}

populateNewsDatabase() 