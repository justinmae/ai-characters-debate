// Hardcoded news data for the app
// This ensures the data is bundled with the application code and always available
// Data sourced from Reddit r/popular - last updated on June 24, 2024

export interface NewsItem {
    id: number;
    title: string;
    description: string;
}

// Import the latest news data directly from public/news_database.json
// This approach ensures consistent data between the bundled version and API
import redditNews from '../../public/news_database.json';

export const NEWS_DATA: NewsItem[] = redditNews; 