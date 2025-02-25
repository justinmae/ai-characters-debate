import csvtojson from 'csvtojson';
import { NEWS_DATA, type NewsItem } from '../data/news-data';

export class NewsQueue {
    private queue: NewsItem[] = [];
    private csvPath: string = '/news_database.csv';
    private jsonPath: string = '/news_database.json';
    private isLoading: boolean = false;
    public loadingPromise: Promise<void> | null = null;
    private usedNewsIds: Set<number>;
    private readonly STORAGE_KEY = 'newsQueue_usedIds';
    // Directly use imported NEWS_DATA
    private readonly FALLBACK_NEWS: NewsItem[] = NEWS_DATA;

    constructor() {
        console.log('NewsQueue: Initializing...');
        // Load used IDs from localStorage
        const savedIds = localStorage.getItem(this.STORAGE_KEY);
        this.usedNewsIds = new Set(savedIds ? JSON.parse(savedIds) : []);
        this.loadingPromise = this.loadNews();
    }

    private saveUsedIds() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.usedNewsIds]));
    }

    private clearUsedIds() {
        this.usedNewsIds.clear();
        localStorage.removeItem(this.STORAGE_KEY);
    }

    private shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private async loadNews() {
        if (this.isLoading) return;
        this.isLoading = true;

        console.log('NewsQueue: Starting to load news...');
        try {
            // Always use the imported data as the primary source
            console.log('NewsQueue: Using imported news data');
            this.processNewsItems(NEWS_DATA);
            
            // In development mode, we still try loading from files
            // but only for testing purposes - we don't actually use the results
            if (import.meta.env.DEV) {
                await this.testFileLoading();
            }
        } catch (error) {
            console.error('NewsQueue: Error loading news:', error);
            this.queue = this.FALLBACK_NEWS;
            console.log('NewsQueue: Using fallback data after error');
        } finally {
            this.isLoading = false;
        }
    }
    
    // This method is only used for testing file loading in development
    private async testFileLoading() {
        // Try JSON file for development testing
        console.log('NewsQueue: In development mode, also checking JSON file:', this.jsonPath);
        try {
            const jsonNews = await this.loadJsonNews();
            if (jsonNews.length > 0) {
                console.log('NewsQueue: Successfully loaded news from JSON file (dev only, not using)');
            }
        } catch (jsonError) {
            console.error('NewsQueue: JSON loading error (dev only):', jsonError);
        }
        
        // Try CSV file for development testing
        console.log('NewsQueue: In development mode, also checking CSV file:', this.csvPath);
        try {
            const csvNews = await this.loadCsvNews();
            if (csvNews.length > 0) {
                console.log('NewsQueue: Successfully loaded news from CSV file (dev only, not using)');
            }
        } catch (csvError) {
            console.error('NewsQueue: CSV loading error (dev only):', csvError);
        }
    }

    private async loadJsonNews(): Promise<NewsItem[]> {
        try {
            const startTime = performance.now();
            const response = await fetch(this.jsonPath);
            const endTime = performance.now();
            console.log(`NewsQueue: JSON fetch took ${endTime - startTime}ms with status ${response.status}`);
            
            if (!response.ok) {
                console.error(`NewsQueue: JSON file error - Status: ${response.status}`);
                return [];
            }

            // Log response headers for debugging
            const contentType = response.headers.get('content-type');
            console.log(`NewsQueue: JSON response content-type: ${contentType}`);
            
            // Check for HTML content
            if (contentType && contentType.includes('text/html')) {
                console.error('NewsQueue: JSON response contains HTML instead of JSON data');
                // Try to log part of the response to see what we're getting
                const text = await response.text();
                console.error(`NewsQueue: First 100 characters of response: ${text.substring(0, 100)}...`);
                return [];
            }

            const responseClone = response.clone();
            
            try {
                const data = await response.json();
                if (!Array.isArray(data)) {
                    console.error('NewsQueue: JSON data is not an array');
                    return [];
                }

                return data.map((item, index) => ({
                    id: index + 1,
                    title: item.title || '',
                    // Preserve empty descriptions as they appear in original data
                    description: typeof item.description === 'string' ? item.description : ''
                })).filter(item => item.title);
            } catch (jsonParseError) {
                // If JSON parsing fails, check if the content is HTML
                const text = await responseClone.text();
                if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
                    console.error('NewsQueue: JSON response contains HTML content (detected in parsing)');
                } else {
                    console.error('NewsQueue: JSON parse error', jsonParseError);
                }
                console.error(`NewsQueue: First 100 characters: ${text.substring(0, 100)}...`);
                return [];
            }
        } catch (error) {
            console.error('NewsQueue: Error loading JSON:', error);
            return [];
        }
    }

    private async loadCsvNews(): Promise<NewsItem[]> {
        try {
            const startTime = performance.now();
            const response = await fetch(this.csvPath);
            const endTime = performance.now();
            console.log(`NewsQueue: CSV fetch took ${endTime - startTime}ms with status ${response.status}`);
            
            if (!response.ok) {
                console.error(`NewsQueue: CSV file error - Status: ${response.status}`);
                return [];
            }

            // Log response headers for debugging
            const contentType = response.headers.get('content-type');
            console.log(`NewsQueue: CSV response content-type: ${contentType}`);
            
            const csvText = await response.text();
            
            // Log a sample of the response for debugging
            console.log(`NewsQueue: First 100 characters of CSV: ${csvText.substring(0, 100)}...`);
            
            // Verify the content is not HTML (which would indicate an error page)
            if (csvText.trim().startsWith('<') || csvText.includes('<!DOCTYPE')) {
                console.error('NewsQueue: CSV file contains HTML instead of CSV data');
                return [];
            }

            // If the CSV is empty or very short, it's probably not valid
            if (csvText.trim().length < 10) {
                console.error('NewsQueue: CSV file appears to be empty or too short');
                return [];
            }

            const jsonArray = await csvtojson({
                noheader: true,
                headers: ['title', 'description']
            }).fromString(csvText);

            return jsonArray
                .filter(item => item && typeof item.title === 'string')
                .map((item, index) => ({
                    id: index + 1,
                    title: item.title.replace(/^"|"$/g, ''),
                    description: typeof item.description === 'string' 
                        ? item.description.replace(/^"|"$/g, '') 
                        : '' // Preserve empty descriptions as they appear in original data
                }));
        } catch (error) {
            console.error('NewsQueue: Error loading CSV:', error);
            return [];
        }
    }

    private processNewsItems(newsItems: NewsItem[]) {
        console.log(`NewsQueue: Processing ${newsItems.length} news items`);
        
        if (newsItems.length === 0) {
            console.error('NewsQueue: No valid news items to process');
            this.queue = this.FALLBACK_NEWS;
            return;
        }
        
        const filteredItems = newsItems.filter(item => !this.usedNewsIds.has(item.id));

        if (filteredItems.length === 0) {
            this.clearUsedIds();
            this.queue = this.shuffleArray(newsItems);
        } else {
            this.queue = this.shuffleArray(filteredItems);
        }

        console.log('NewsQueue: Successfully loaded news items:', this.queue.length);
    }

    getCurrentNews = async (): Promise<NewsItem | null> => {
        // If queue is empty, wait for news to load
        if (this.queue.length === 0) {
            await this.loadNews();
        }

        if (this.queue.length === 0) {
            console.error('NewsQueue: Still no news available after attempt to load');
            // Last resort fallback - directly use NEWS_DATA for consistency
            this.queue = [...NEWS_DATA];
            console.log('NewsQueue: Using last resort fallback news');
        }

        const currentNews = this.queue.shift() || null;
        if (currentNews) {
            this.usedNewsIds.add(currentNews.id);
            this.saveUsedIds();
        }

        return currentNews;
    };

    public removeCurrentNews() {
        if (this.queue.length > 0) {
            console.log('NewsQueue: Removing current news:', this.queue[0]);
            this.queue.shift();
        }
    }
}

export const newsQueue = new NewsQueue(); 