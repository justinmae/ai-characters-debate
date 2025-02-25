import csvtojson from 'csvtojson';

export interface NewsItem {
    id: number;
    title: string;
    description: string;
}

export class NewsQueue {
    private queue: NewsItem[] = [];
    private csvPath: string = '/news_database.csv';
    private jsonPath: string = '/news_database.json';
    private isLoading: boolean = false;
    public loadingPromise: Promise<void> | null = null;
    private usedNewsIds: Set<number>;
    private readonly STORAGE_KEY = 'newsQueue_usedIds';

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
            // Try JSON first (now preferred)
            console.log('NewsQueue: Attempting to load news from JSON:', this.jsonPath);
            const jsonNews = await this.loadJsonNews();
            
            // If JSON loading successful, use that data
            if (jsonNews.length > 0) {
                console.log('NewsQueue: Successfully loaded news from JSON');
                this.processNewsItems(jsonNews);
                return;
            }
            
            // Fallback to CSV format if JSON fails
            console.log('NewsQueue: Falling back to CSV format:', this.csvPath);
            const csvNews = await this.loadCsvNews();
            if (csvNews.length > 0) {
                console.log('NewsQueue: Successfully loaded news from CSV');
                this.processNewsItems(csvNews);
                return;
            }

            throw new Error('Failed to load news from both JSON and CSV sources');
        } catch (error) {
            console.error('NewsQueue: Error loading news:', error);
            this.queue = [
                {
                    id: 1,
                    title: "Breaking: Technical Difficulties at AI News Network",
                    description: "Our AI anchors are experiencing temporary issues."
                }
            ];
        } finally {
            this.isLoading = false;
        }
    }

    private async loadJsonNews(): Promise<NewsItem[]> {
        try {
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                console.log(`NewsQueue: JSON file not found or error (${response.status})`);
                return [];
            }

            // Verify the content is not HTML
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                console.error('NewsQueue: JSON response contains HTML instead of JSON data');
                return [];
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                console.log('NewsQueue: JSON data is not an array');
                return [];
            }

            return data.map((item, index) => ({
                id: index + 1,
                title: item.title || '',
                // Preserve empty descriptions as they appear in original data
                description: typeof item.description === 'string' ? item.description : ''
            })).filter(item => item.title);
        } catch (error) {
            console.log('NewsQueue: Error loading JSON:', error);
            return [];
        }
    }

    private async loadCsvNews(): Promise<NewsItem[]> {
        try {
            const response = await fetch(this.csvPath);
            if (!response.ok) {
                console.log(`NewsQueue: CSV file not found or error (${response.status})`);
                return [];
            }

            const csvText = await response.text();
            
            // Verify the content is not HTML (which would indicate an error page)
            if (csvText.trim().startsWith('<') || csvText.includes('<!DOCTYPE')) {
                console.error('NewsQueue: CSV file contains HTML instead of CSV data');
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
            console.log('NewsQueue: Error loading CSV:', error);
            return [];
        }
    }

    private processNewsItems(newsItems: NewsItem[]) {
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
            return null;
        }

        const currentNews = this.queue.shift() || null;
        if (currentNews) {
            this.usedNewsIds.add(currentNews.id);
            this.saveUsedIds();
        }

        // Don't start loading new news here since we want to use all items first
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